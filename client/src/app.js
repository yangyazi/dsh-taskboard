// dsh-taskboard client: lightweight Jira-like task board.
// - LEFT-SIDEBAR entry + full center-column view
// - views: 概览 (workspace dashboard) / 看板 (kanban) / 列表 (list)
// - task = shared context pool: new conversations get seeded context,
//   linked conversations get it injected; detail shows live shared context
// - labels, filters (repo/priority/status/label/search), session links + resume
// Pure vanilla DOM. Talks to /taskboard/api/*.
(() => {
	if (window.__dshTaskboardLoaded) return;
	window.__dshTaskboardLoaded = true;

	const API = "/taskboard/api";
	const STATUS_META = {
		todo: { label: "待办", color: "#8b949e" },
		in_progress: { label: "进行中", color: "#3478f6" },
		in_review: { label: "评审中", color: "#bc8cff" },
		blocked: { label: "已阻塞", color: "#f85149" },
		done: { label: "已完成", color: "#3fb950" }
	};
	const STATUS_ORDER = ["todo", "in_progress", "in_review", "blocked", "done"];
	const PRIORITY_META = {
		low: { label: "低", color: "#8b949e" },
		medium: { label: "中", color: "#d29922" },
		high: { label: "高", color: "#e3862e" },
		urgent: { label: "紧急", color: "#f85149" }
	};
	const REVIEW_META = { none: "—", pending: "评审待处理", approved: "评审通过", rejected: "评审驳回" };
	const TEST_META = { none: "—", pending: "测试待处理", passed: "测试通过", failed: "测试失败" };
	const LABEL_COLORS = ["#79c0ff", "#d2a8ff", "#7ee787", "#ffa657", "#ff7b72", "#f2cc60", "#a5d6ff", "#ffd7a8"];

	const ACTIVE_ATTR = "data-dsh-taskboard-active";
	const ENTRY_ATTR = "data-dsh-taskboard-entry";
	const VIEW_ATTR = "data-dsh-taskboard-view";
	const SSH_ACTIVE_ATTR = "data-dsh-ssh-active";
	const ICON = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>`;

	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
	const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
	const repoShort = (p) => { const parts = String(p || "").split("/").filter(Boolean); return parts.length ? parts[parts.length - 1] : String(p || ""); };
	const labelColor = (label) => {
		let h = 0;
		for (const ch of String(label)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
		return LABEL_COLORS[h % LABEL_COLORS.length];
	};
	const fmtTime = (ts) => {
		if (!ts) return "";
		const d = new Date(ts);
		const diff = Date.now() - ts;
		if (diff < 60_000) return "刚刚";
		if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
		if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
		return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
	};

	let tasks = [];
	let sessions = [];
	let workspaces = [];
	let allLabels = [];
	let filter = { q: "", repo: "", priority: "", status: "", label: "" };
	let view = "overview";
	const gitState = {}; // workspacePath -> {branch, dirty} | null

	async function api(path, opts = {}) {
		const res = await fetch(API + path, {
			headers: { "content-type": "application/json" },
			...opts
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
		return data;
	}

	// ---- styles ------------------------------------------------------------
	const STYLE = `
<style>
/* 只在任务看板打开时才把对话列设为定位锚点；正常对话时不干预新版布局，
   避免绝对定位浮层（含输入区相关）的包含块被改变导致输入被遮挡 */
html[${ACTIVE_ATTR}] [data-pane='conversation'],
html[${ACTIVE_ATTR}] [class*='centerCol'] { position: relative; }
[${VIEW_ATTR}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${ACTIVE_ATTR}]:not([${SSH_ACTIVE_ATTR}]) [data-pane='conversation'] > div[${VIEW_ATTR}],
html[${ACTIVE_ATTR}]:not([${SSH_ACTIVE_ATTR}]) [class*='centerCol'] > div[${VIEW_ATTR}] {
  display: flex !important; flex-direction: column;
}
html[${ACTIVE_ATTR}]:not([${SSH_ACTIVE_ATTR}]) [data-pane='conversation'] > :not([${VIEW_ATTR}]),
html[${ACTIVE_ATTR}]:not([${SSH_ACTIVE_ATTR}]) [class*='centerCol'] > :not([${VIEW_ATTR}]) {
  display: none !important;
}
[${ENTRY_ATTR}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap; transition: background .15s, color .15s;
}
[${ENTRY_ATTR}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${ENTRY_ATTR}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${ENTRY_ATTR}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${ENTRY_ATTR}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${ENTRY_ATTR}][data-icon-only] > span:not(:first-child) { display: none; }

/* 侧边栏「最新对话」常驻小组件（钉在 New Session 下方、会话列表之上） */
#dsh-recent { border-top: 1px solid var(--dsw-alias-border-l2,#2a3138); }
.dsh-recent-head{display:flex;align-items:center;gap:6px;padding:5px 10px;font-size:11.5px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);cursor:pointer;letter-spacing:.2px;user-select:none}
.dsh-recent-head .arrow{font-size:8px;transition:transform .15s;color:#768390}
.dsh-recent.collapsed .dsh-recent-head .arrow{transform:rotate(-90deg)}
.dsh-recent-head .title{flex:1}
.dsh-recent-head .cnt{font-weight:600;font-size:10.5px;color:#79c0ff;background:#79c0ff14;border-radius:9px;padding:0 7px;flex:none}
.dsh-recent-refresh{background:transparent;border:0;color:var(--dsw-alias-label-secondary,#9aa7b4);cursor:pointer;font-size:12px;padding:0 2px;line-height:1;display:inline-flex}
.dsh-recent-refresh:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-recent-body{display:flex;flex-direction:column;gap:1px;padding:0 6px 6px;overflow:hidden}
/* 单个会话行：对齐原生会话行高度/内边距，标题行 + 下方灰色预览行 */
.dsh-recent-row{display:flex;flex-direction:column;gap:1px;padding:5px 8px;border-radius:8px;cursor:pointer;min-width:0;transition:background .12s}
.dsh-recent-row:hover{background:var(--dsw-alias-bg-layer-2,#1b2127)}
.dsh-recent-row .lbl{display:flex;align-items:center;gap:6px;min-width:0;font-size:13px;color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-recent-row .icn{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#768390);width:10px;text-align:center}
.dsh-recent-row .dot{flex:none;width:8px;height:8px;border-radius:50%}
.dsh-recent-row .dot.run{background:#f2cc60;box-shadow:0 0 5px #f2cc60aa;animation:dsh-tb-blink 1.4s ease-in-out infinite}
.dsh-recent-row .dot.idle{background:#3fb950;box-shadow:0 0 4px #3fb95066}
/* 当前打开的会话：去掉状态点，行用与原生「选中」一致的轻微底色（无边框、无缩放） */
.dsh-recent-row.cur{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06))}
.dsh-recent-row .t{flex:1;min-width:0;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-recent-row .meta{display:flex;align-items:center;gap:6px;min-width:0;padding-left:16px}
.dsh-recent-row .prev{flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#768390);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-recent-row .repo{flex:none;font-size:10px;color:#79c0ffb3;background:#79c0ff12;border-radius:6px;padding:0 6px;max-width:90px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-recent-row .tm{flex:none;font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-recent-empty{padding:6px 8px 8px;font-size:11px;color:var(--dsw-alias-label-tertiary,#768390);text-align:center}

#dsh-tb-view ::-webkit-scrollbar, .dsh-tb-modal ::-webkit-scrollbar { width: 8px; height: 8px; }
#dsh-tb-view ::-webkit-scrollbar-thumb, .dsh-tb-modal ::-webkit-scrollbar-thumb { background: #2c3440; border-radius: 4px; }
#dsh-tb-view ::-webkit-scrollbar-thumb:hover, .dsh-tb-modal ::-webkit-scrollbar-thumb:hover { background: #3d4653; }
#dsh-tb-view ::-webkit-scrollbar-track, .dsh-tb-modal ::-webkit-scrollbar-track { background: transparent; }

#dsh-tb-view{height:100%;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary,#e6edf3);font-size:12.5px}
.dsh-tb-head{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);flex:none;gap:10px;background:linear-gradient(180deg,rgba(52,120,246,.05),transparent)}
.dsh-tb-title{font-size:15px;font-weight:700;flex:none;letter-spacing:.2px;display:flex;align-items:center;gap:8px}
.dsh-tb-title::before{content:"";width:4px;height:16px;border-radius:2px;background:linear-gradient(180deg,#3478f6,#bc8cff)}
.dsh-tb-tabs{display:flex;gap:4px;flex:1;min-width:0;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;padding:2px;width:fit-content}
.dsh-tb-tab{background:transparent;border:0;color:var(--dsw-alias-label-secondary,#9aa7b4);padding:5px 14px;font-size:12.5px;cursor:pointer;border-radius:7px;transition:all .15s}
.dsh-tb-tab:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-tab.dsh-tb-tab-on{background:var(--dsw-alias-button-primary-bg,#3478f6);color:#fff;font-weight:600;box-shadow:0 1px 4px rgba(52,120,246,.4)}
.dsh-tb-head-actions{display:flex;gap:6px;flex:none}
.dsh-tb-head-actions button,.dsh-tb-toolbar select,.dsh-tb-toolbar input{background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer;transition:border-color .15s,background .15s}
.dsh-tb-head-actions button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-head-actions #dsh-tb-refresh{font-size:13px}
.dsh-tb-toolbar{display:flex;gap:8px;align-items:center;padding:9px 18px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);flex:none;flex-wrap:wrap;background:var(--dsw-alias-bg-layer-2,#1b2127)}
.dsh-tb-toolbar #dsh-tb-search{flex:1;min-width:140px}
.dsh-tb-toolbar #dsh-tb-search:focus{outline:none;border-color:#3478f6}
.dsh-tb-newbtn{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;font-weight:600;flex:none;margin-left:auto}
.dsh-tb-newbtn:hover{filter:brightness(1.1);border-color:transparent}
.dsh-tb-count{color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:11.5px}
.dsh-tb-body{flex:1;min-height:0;overflow:auto}
.dsh-tb-columns{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:12px 16px;height:100%;box-sizing:border-box}
.dsh-tb-col{background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2,#1b2127),var(--dsw-alias-bg-layer-1,#14181d));border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:11px;display:flex;flex-direction:column;min-height:100%;min-width:150px}
.dsh-tb-col-head{padding:9px 11px;font-weight:600;font-size:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-tb-col-head b{color:var(--dsw-alias-label-primary,#e6edf3);background:var(--dsw-alias-bg-base,#0d1117);border-radius:8px;padding:1px 7px;font-size:11px}
.dsh-tb-col-body{padding:7px;display:flex;flex-direction:column;gap:7px;overflow-y:auto}
.dsh-tb-card{background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:10px;padding:10px 11px;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
.dsh-tb-card:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.35)}
.dsh-tb-card-title{font-size:12.5px;font-weight:600;line-height:1.4;word-break:break-all}
.dsh-tb-card-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px;align-items:center}
.dsh-tb-pill{font-size:10.5px;padding:1px 7px;border-radius:9px;border:1px solid;line-height:1.6;background:color-mix(in srgb,currentColor 10%,transparent)}
.dsh-tb-bar{height:4px;border-radius:3px;background:var(--dsw-alias-bg-layer-2,#1b2127);margin-top:8px;overflow:hidden}
.dsh-tb-bar>i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#3478f6,#7c5cf0)}
.dsh-tb-card-foot{display:flex;justify-content:space-between;margin-top:7px;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:10.5px}
.dsh-tb-empty{color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:center;padding:14px 4px;font-size:11.5px}
.dsh-tb-table{width:100%;border-collapse:collapse;font-size:12px}
.dsh-tb-table th{position:sticky;top:0;background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:left;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);font-weight:600;white-space:nowrap;z-index:1}
.dsh-tb-table td{padding:7px 12px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);vertical-align:middle}
.dsh-tb-table tr{cursor:pointer;transition:background .12s}
.dsh-tb-table tr:hover td{background:rgba(52,120,246,.07)}
.dsh-tb-ov{padding:16px 18px;height:100%;box-sizing:border-box;overflow:auto}
.dsh-tb-ov-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.dsh-tb-ov-stat{flex:1;min-width:100px;background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2,#1b2127),var(--dsw-alias-bg-layer-1,#14181d));border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:11px;padding:11px 13px;position:relative;overflow:hidden;transition:border-color .15s}
.dsh-tb-ov-stat:hover{border-color:var(--dsw-alias-border-l2,#3a434d)}
.dsh-tb-ov-stat::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.35}
.dsh-tb-ov-stat .n{font-size:25px;font-weight:700;line-height:1.1}
.dsh-tb-ov-stat .l{font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-top:3px}
.dsh-tb-ov-stat .mini{height:5px;border-radius:3px;background:var(--dsw-alias-bg-base,#0d1117);margin-top:9px;overflow:hidden}
.dsh-tb-ov-stat .mini i{display:block;height:100%;border-radius:3px}
.dsh-tb-ov-add{border:1.5px dashed #3d4653;display:flex;align-items:center;justify-content:center;cursor:pointer;min-width:118px;transition:border-color .15s,background .15s}
.dsh-tb-ov-add:hover{border-color:#3478f6;background:rgba(52,120,246,.06)}
.dsh-tb-ov-add::before{display:none}
.dsh-tb-ov-addbtn{font-size:13px;font-weight:600;color:#9aa7b4;display:flex;align-items:center;gap:6px;transition:color .15s;white-space:nowrap}
.dsh-tb-ov-add:hover .dsh-tb-ov-addbtn{color:#e6edf3}
.dsh-tb-ov-stat-click{cursor:pointer}
.dsh-tb-ov-stat-click:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.3)}
.dsh-tb-ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:11px;margin-bottom:16px}
.dsh-tb-ov-ws{background:linear-gradient(180deg,var(--dsw-alias-bg-layer-2,#1b2127),var(--dsw-alias-bg-layer-1,#14181d));border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:12px;padding:12px 14px;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
.dsh-tb-ov-ws:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.35)}
.dsh-tb-ov-ws .ws-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-tb-ov-ws h4{margin:0;font-size:13.5px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tb-ov-ws .ws-total{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;padding:1px 8px;background:var(--dsw-alias-bg-base,#0d1117)}
.dsh-tb-ov-ws .path{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);word-break:break-all;margin:4px 0 9px}
.dsh-tb-ov-ws .stack{display:flex;height:8px;border-radius:5px;overflow:hidden;background:var(--dsw-alias-bg-base,#0d1117);margin-bottom:8px;gap:1px}
.dsh-tb-ov-ws .stack i{display:block;height:100%}
.dsh-tb-ov-ws .ws-stats{display:flex;flex-wrap:wrap;gap:9px;font-size:11px;margin-bottom:9px}
.dsh-tb-ov-ws .ws-stats .st{display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-tb-ov-ws .ws-stats .st b{color:var(--dsw-alias-label-primary,#e6edf3);font-weight:700}
.dsh-tb-ov-ws .ws-stats .dot{width:8px;height:8px;border-radius:50%;display:inline-block;box-shadow:0 0 4px currentColor}
.dsh-tb-ov-ws .comp{display:flex;align-items:center;gap:8px;margin-bottom:2px}
.dsh-tb-ov-ws .comp .track{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-bg-base,#0d1117);overflow:hidden}
.dsh-tb-ov-ws .comp .track i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#2ea043,#56d364)}
.dsh-tb-ov-ws .comp .pct{font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);flex:none;font-weight:600}
.dsh-tb-ov-ws .meta{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:6px}
.dsh-tb-ov-ws .branch{font-size:10.5px;color:#79c0ff;border:1px solid #79c0ff4d;border-radius:8px;padding:1px 7px;background:#79c0ff12}
.dsh-tb-ov-ws .dirty{color:#f85149}
.dsh-tb-ov-ws .sess{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-left:auto}
.dsh-tb-ov-ws .sesslist{margin-top:8px;border-top:1px dashed var(--dsw-alias-border-l3,#232a31);padding-top:6px;display:flex;flex-direction:column;gap:3px}
.dsh-tb-ov-ws .sesslist .s{font-size:10.5px;color:#79c0ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;padding:1px 4px;border-radius:5px;transition:background .12s}
.dsh-tb-ov-ws .sesslist .s:hover{background:#79c0ff12;text-decoration:underline}
.dsh-tb-ov-sec{font-size:12px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);margin:16px 0 9px;letter-spacing:.3px}
.dsh-tb-ov-recent{display:flex;flex-direction:column;gap:6px}
.dsh-tb-ov-item{display:flex;align-items:center;gap:9px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;padding:7px 11px;cursor:pointer;transition:border-color .15s,transform .12s}
.dsh-tb-ov-item:hover{border-color:var(--dsw-alias-border-accent,#bc8cff);transform:translateX(2px)}
.dsh-tb-ov-item .dot{width:8px;height:8px;border-radius:50%;flex:none}
.dsh-tb-ov-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.dsh-tb-ov-item .r{font-size:10.5px;color:#79c0ff;flex:none}
.dsh-tb-ov-item .tm{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);flex:none}
.dsh-tb-modal-mask{position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.dsh-tb-modal{width:min(640px,92vw);max-height:88vh;overflow:auto;background:var(--dsw-alias-bg-layer-1,#14181d);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:14px;padding:18px 20px;color:var(--dsw-alias-label-primary,#e6edf3);box-shadow:0 16px 50px rgba(0,0,0,.55);animation:dsh-tb-pop .18s ease}
@keyframes dsh-tb-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.dsh-tb-modal h3{margin:0 0 14px;font-size:15.5px;font-weight:700;display:flex;align-items:center;gap:8px}
.dsh-tb-modal h3::before{content:"";width:4px;height:17px;border-radius:2px;background:linear-gradient(180deg,#3478f6,#bc8cff)}
.dsh-tb-field{margin-bottom:11px}
.dsh-tb-field label{display:block;font-size:11.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-bottom:5px;font-weight:600}
.dsh-tb-field input,.dsh-tb-field select,.dsh-tb-field textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#0d1117);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:7px 10px;font-size:12.5px;font-family:inherit;transition:border-color .15s}
.dsh-tb-field input:focus,.dsh-tb-field select:focus,.dsh-tb-field textarea:focus{outline:none;border-color:#3478f6}
.dsh-tb-field textarea{min-height:70px;resize:vertical}
.dsh-tb-field input.err,.dsh-tb-field select.err,.dsh-tb-field textarea.err{border-color:#f85149}
.dsh-tb-hint{color:#f85149;font-size:11px;margin-top:4px}
.dsh-tb-created-title{font-size:14.5px;font-weight:700;margin:2px 0}
.dsh-tb-created-meta{font-size:11.5px;color:#79c0ff;margin-bottom:14px;word-break:break-all}
.dsh-tb-created-next{font-size:12px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-bottom:9px;font-weight:600}
.dsh-tb-created-actions{display:flex;flex-direction:column;gap:8px}
.dsh-tb-big{padding:11px 16px !important;font-size:13.5px !important;text-align:center}
.dsh-tb-created-actions .dsh-tb-big{width:100%}
.dsh-tb-ctx{border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;background:var(--dsw-alias-bg-base,#0d1117);overflow:hidden}
.dsh-tb-ctx-body{max-height:180px;overflow:auto;padding:8px 10px;font-size:11.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);white-space:pre-wrap;word-break:break-all}
.dsh-tb-ctx-actions{display:flex;gap:6px;padding:5px 8px;border-top:1px solid var(--dsw-alias-border-l3,#232a31)}
.dsh-tb-ctx-actions button{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer}
.dsh-tb-ctx-actions button:hover{border-color:#3478f6}
.dsh-tb-row{display:flex;gap:10px}
.dsh-tb-row .dsh-tb-field{flex:1}
.dsh-tb-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.dsh-tb-actions button{padding:7px 16px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#2a3138);background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);cursor:pointer;font-size:12.5px;transition:all .15s}
.dsh-tb-actions button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-actions button.dsh-tb-primary{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff;font-weight:600}
.dsh-tb-actions button.dsh-tb-primary:hover{filter:brightness(1.1)}
.dsh-tb-actions button.dsh-tb-danger{color:#f85149}
.dsh-tb-actions button.dsh-tb-danger:hover{background:#f8514914}
.dsh-tb-actions button.dsh-tb-grow{flex:1}
.dsh-tb-statusline{display:flex;flex-direction:column;gap:7px}
.dsh-tb-statusbadge{display:inline-flex;align-items:center;font-size:12px;font-weight:700;border:1px solid;border-radius:8px;padding:3px 11px;width:fit-content}
.dsh-tb-statusactions{display:flex;gap:6px;flex-wrap:wrap}
.dsh-tb-statusbtn{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:7px;padding:4px 11px;font-size:11.5px;cursor:pointer;transition:all .13s}
.dsh-tb-statusbtn:hover{border-color:#3478f6;color:#fff}
.dsh-tb-statusbtn.primary{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff;font-weight:600}
.dsh-tb-statusbtn.primary:hover{filter:brightness(1.1)}
.dsh-tb-statusbtn.ghost{opacity:.7}
.dsh-tb-note{border-left:2px solid var(--dsw-alias-border-l2,#2a3138);padding:2px 0 2px 11px;margin:9px 0;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:12px;white-space:pre-wrap;word-break:break-all;border-image:linear-gradient(180deg,#3478f6,#bc8cff) 1}
.dsh-tb-note .dsh-tb-note-time{font-size:10.5px;font-weight:600;color:#79c0ff}
.dsh-tb-sess{display:flex;justify-content:space-between;align-items:center;background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:6px 9px;margin-bottom:6px;gap:8px;transition:border-color .12s}
.dsh-tb-sess:hover{border-color:var(--dsw-alias-border-l2,#3a434d)}
.dsh-tb-sess .dsh-tb-sess-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}
.dsh-tb-sess button{flex:none;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:6px;padding:3px 9px;font-size:11px;cursor:pointer;transition:all .12s}
.dsh-tb-sess button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-sess button.dsh-tb-open{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff}
.dsh-tb-sess button.dsh-tb-open:hover{filter:brightness(1.1)}
.dsh-tb-run{color:#f2cc60;font-size:10px;border:1px solid #f2cc6066;border-radius:8px;padding:0 6px;margin-left:6px;flex:none;animation:dsh-tb-blink 1.2s ease-in-out infinite}
@keyframes dsh-tb-blink{0%,100%{opacity:1}50%{opacity:.45}}
.dsh-tb-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;background:#1b2127;border:1px solid #3478f6;color:#e6edf3;border-radius:9px;padding:9px 20px;font-size:12.5px;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.5);animation:dsh-tb-toast .18s ease;pointer-events:none}
@keyframes dsh-tb-toast{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.dsh-tb-picklist{display:flex;flex-direction:column;gap:10px;max-height:48vh;overflow-y:auto;margin-top:10px}
.dsh-tb-pick-group{border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:9px;overflow:hidden}
.dsh-tb-pick-grouphead{display:flex;justify-content:space-between;align-items:center;background:var(--dsw-alias-bg-layer-2,#1b2127);padding:6px 11px;font-size:11.5px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);letter-spacing:.3px}
.dsh-tb-pick-grouphead b{color:#bc8cff}
.dsh-tb-pick-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 11px;border-top:1px solid var(--dsw-alias-border-l2,#2a3138);cursor:pointer;transition:background .12s}
.dsh-tb-pick-item:hover{background:var(--dsw-alias-bg-layer-2,#1b2127)}
.dsh-tb-pick-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.dsh-tb-pick-item .m{flex:none;font-size:10.5px;color:var(--dsw-alias-label-tertiary,#768390)}
.dsh-tb-empty{padding:14px;text-align:center;color:var(--dsw-alias-label-tertiary,#768390);font-size:12px}
</style>`;

	document.documentElement.insertAdjacentHTML("beforeend", STYLE);

	// ---- view container ----------------------------------------------------
	const VIEW_HTML = `
<div id="dsh-tb-view" ${VIEW_ATTR}="">
  <div class="dsh-tb-head">
    <div class="dsh-tb-title">任务面板</div>
    <div class="dsh-tb-tabs">
      <button class="dsh-tb-tab" data-tb-view="overview">概览</button>
      <button class="dsh-tb-tab" data-tb-view="kanban">看板</button>
      <button class="dsh-tb-tab" data-tb-view="list">列表</button>
    </div>
    <div class="dsh-tb-head-actions">
      <button id="dsh-tb-refresh" title="刷新">⟳</button>
    </div>
  </div>
  <div class="dsh-tb-toolbar" id="dsh-tb-toolbar">
    <input id="dsh-tb-search" placeholder="搜索标题/仓库/feature/标签…" />
    <select id="dsh-tb-repo-filter"><option value="">全部仓库</option></select>
    <select id="dsh-tb-priority-filter"><option value="">全部优先级</option></select>
    <select id="dsh-tb-status-filter"><option value="">全部状态</option></select>
    <select id="dsh-tb-label-filter"><option value="">全部标签</option></select>
    <span id="dsh-tb-count" class="dsh-tb-count"></span>
    <button id="dsh-tb-new" title="新建任务" class="dsh-tb-newbtn">＋ 新建任务</button>
  </div>
  <div class="dsh-tb-body" id="dsh-tb-body"></div>
</div>`;

	// ---- sidebar entry -----------------------------------------------------
	function sidebarRoot() {
		const column = document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');
		if (column === null) return undefined;
		const logoOwner = column.querySelector('[class*="logoRow"]')?.parentElement;
		return logoOwner ?? column.firstElementChild;
	}
	function newSessionButton(root) {
		const nested = root.querySelector('button[class*="newSession"]');
		if (nested !== null) return nested;
		for (const child of root.children) if (child.tagName === "BUTTON") return child;
		return undefined;
	}
	function conversationColumn() {
		return document.querySelector('[data-pane="conversation"]') ?? document.querySelector('[class*="centerCol"]') ?? undefined;
	}
	function sidebarIsCollapsed(root) {
		return [...root.classList].some((n) => /collapsed/i.test(n));
	}

	let entryEl = null;
	let viewEl = null;

	function isOpen() {
		return document.documentElement.hasAttribute(ACTIVE_ATTR);
	}
	function refreshEntryState() {
		if (entryEl === null) return;
		if (isOpen()) entryEl.setAttribute("data-active", "");
		else entryEl.removeAttribute("data-active");
	}
	function toggle(force) {
		const next = force !== undefined ? force : !isOpen();
		if (next) document.documentElement.removeAttribute(SSH_ACTIVE_ATTR);
		if (next) document.documentElement.setAttribute(ACTIVE_ATTR, "");
		else document.documentElement.removeAttribute(ACTIVE_ATTR);
		refreshEntryState();
		if (next) refreshAll();
	}

	function mountView() {
		if (viewEl !== null) return;
		const column = conversationColumn();
		if (column === undefined) return;
		viewEl = document.createElement("div");
		viewEl.setAttribute(VIEW_ATTR, "");
		viewEl.innerHTML = VIEW_HTML;
		column.appendChild(viewEl);
		bindViewEvents();
	}

	function placeEntry() {
		const root = sidebarRoot();
		if (root === undefined) return;
		if (entryEl === null) {
			entryEl = document.createElement("button");
			entryEl.type = "button";
			entryEl.setAttribute(ENTRY_ATTR, "");
			entryEl.innerHTML = `<span>${ICON}</span><span>任务看板</span>`;
			entryEl.title = "任务看板";
			entryEl.addEventListener("click", () => toggle());
			refreshEntryState();
		}
		if (entryEl.parentElement === root) return;
		const button = newSessionButton(root);
		const row = button?.closest('[class*="logoRow"]');
		const base = row !== null && row !== undefined && row.parentElement === root ? row : button;
		root.insertBefore(entryEl, base?.nextElementSibling ?? null);
		const syncCollapsed = () => {
			if (entryEl === null) return;
			if (sidebarIsCollapsed(root)) entryEl.setAttribute("data-icon-only", "");
			else entryEl.removeAttribute("data-icon-only");
		};
		syncCollapsed();
	}

	// ---- 侧边栏「最新对话」常驻小组件 -------------------------------------
	// 不依赖任务看板是否打开：作为一个独立块钉在左侧栏顶部（New Session /
	// 任务看板入口之下、会话/工作区树之上），跨工作区列出最近活跃的会话，
	// 点击任意一条即打开并继续。数据取自 taskboard 的 /sessions 索引。
	const RECENT_LIMIT = 15;
	let recentEl = null;       // 外层容器（含头 + 列表体）
	let recentBody = null;
	let recentCollapsed = false;
	let recentRefreshTimer = null;

	function recentData() {
		return api("/sessions").then((s) => s.sessions || []).catch(() => sessions);
	}
	function recentList(all) {
		return [...(all || [])]
			.filter((s) => s && s.updatedAt)
			.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
			.slice(0, RECENT_LIMIT);
	}
	function currentSessionId() {
		try {
			const v = JSON.parse(localStorage.getItem("dsh.sessions.current") || "null");
			return v && v.sessionId ? v.sessionId : null;
		} catch { return null; }
	}
	// 已读游标：记录每个会话「我看到哪了」。存 localStorage（key 前缀 dsh-tb-read）。
	// 语义：绿点 = 该会话已产生完成回复(未运行) 且 最新更新时间晚于已读时间 → 有新内容没看。
	// 点开该会话时把已读时间推进到当前，绿点即消失；切到别的会话不影响它的已读状态。
	function readCursorKey(sid) { return `dsh-tb-read:${sid}`; }
	function readCursorOf(sid) {
		try { return Number(localStorage.getItem(readCursorKey(sid))) || 0; } catch { return 0; }
	}
	function markSessionRead(sid) {
		try { localStorage.setItem(readCursorKey(sid), String(Date.now())); } catch { /* ignore */ }
	}
	function renderRecent(all) {
		if (recentBody === null) return;
		const list = recentList(all);
		const countEl = $("#dsh-recent-cnt");
		if (countEl) countEl.textContent = String(list.length);
		if (!list.length) {
			recentBody.innerHTML = '<div class="dsh-recent-empty">（暂无最近会话）</div>';
			return;
		}
		const curId = currentSessionId();
		const now = Date.now();
		recentBody.innerHTML = list.map((s) => {
			const title = s.title && String(s.title).trim() ? s.title : s.id;
			const isCur = s.id === curId;
			// 点号语义：
			//   运行中 → 黄（模型正在生成）
			//   已完成(未运行) 且 updatedAt > 已读游标 → 绿（有一轮回复还没看）
			//   已读 或 无新内容 → 无点
			let dot = "";
			let state = "";
			if (s.running) {
				dot = `<span class="dot run"></span>`;
				state = "run";
			} else if (s.updatedAt && s.updatedAt > readCursorOf(s.id)) {
				dot = `<span class="dot idle"></span>`;
				state = "idle";
			}
			return `<div class="dsh-recent-row${isCur ? " cur" : ""}" data-sid="${esc(s.id)}" title="打开并继续：${esc(title)}">
				<span class="lbl">
					${dot}
					<span class="t">${esc(title)}</span>
				</span>
				<span class="meta">
					${s.preview ? `<span class="prev">${esc(s.preview)}</span>` : ""}
					${s.repo ? `<span class="repo">${esc(repoShort(s.repo))}</span>` : ""}
					<span class="tm">${fmtTime(s.updatedAt)}</span>
				</span>
			</div>`;
		}).join("");
		$$(".dsh-recent-row", recentBody).forEach((el) => el.addEventListener("click", () => {
			openSession(el.dataset.sid);
		}));
	}
	function refreshRecent() {
		recentData().then((all) => renderRecent(all)).catch(() => renderRecent(sessions));
	}

	function mountRecent() {
		const root = sidebarRoot();
		if (root === undefined) return;
		if (recentEl === null) {
			recentEl = document.createElement("div");
			recentEl.id = "dsh-recent";
			recentEl.className = "dsh-recent";
			recentEl.innerHTML = `
				<div class="dsh-recent-head" id="dsh-recent-head">
					<span class="arrow">▼</span><span class="title">最新对话</span>
					<span class="cnt" id="dsh-recent-cnt">0</span>
					<button class="dsh-recent-refresh" id="dsh-recent-refresh" title="刷新">⟳</button>
				</div>
				<div class="dsh-recent-body" id="dsh-recent-body"></div>`;
			recentBody = $("#dsh-recent-body", recentEl);
			$("#dsh-recent-head", recentEl).addEventListener("click", () => {
				recentCollapsed = !recentCollapsed;
				if (recentEl) recentEl.classList.toggle("collapsed", recentCollapsed);
				if (recentBody) recentBody.style.display = recentCollapsed ? "none" : "";
			});
			$("#dsh-recent-refresh", recentEl).addEventListener("click", (e) => {
				e.stopPropagation();
				refreshRecent();
			});
			renderRecent(sessions);
			refreshRecent();
		}
		if (recentEl.parentElement === root) return;
		// 插到 任务看板 入口（或 New Session 按钮）之后、会话树之前
		const anchor = entryEl ?? newSessionButton(root);
		root.insertBefore(recentEl, anchor?.nextElementSibling ?? null);
		// 列表超高时内部滚动，避免把会话树挤出可视区
		if (recentBody) {
			recentBody.style.maxHeight = "46vh";
			recentBody.style.overflowY = "auto";
		}
		const applyCollapse = () => {
			if (recentBody) recentBody.style.display = recentCollapsed ? "none" : "";
			if (recentEl) recentEl.classList.toggle("collapsed", recentCollapsed);
		};
		applyCollapse();
		// 侧边栏收起为图标栏时隐藏整个小组件
		const syncCollapsed = () => {
			if (!recentEl) return;
			if (sidebarIsCollapsed(root)) recentEl.style.display = "none";
			else recentEl.style.display = "";
		};
		syncCollapsed();
	}
	function startRecentRefresher() {
		if (recentRefreshTimer !== null) return;
		recentRefreshTimer = setInterval(() => {
			if (document.hidden) return;
			refreshRecent();
		}, 60000);
	}

	function bindViewEvents() {
		$("#dsh-tb-new")?.addEventListener("click", openCreate);
		$("#dsh-tb-refresh")?.addEventListener("click", () => refreshAll());
		$("#dsh-tb-search")?.addEventListener("input", () => { filter.q = $("#dsh-tb-search").value.trim(); refreshTasks(); });
		$("#dsh-tb-repo-filter")?.addEventListener("change", () => { filter.repo = $("#dsh-tb-repo-filter").value; refreshTasks(); });
		$("#dsh-tb-priority-filter")?.addEventListener("change", () => { filter.priority = $("#dsh-tb-priority-filter").value; refreshTasks(); });
		$("#dsh-tb-status-filter")?.addEventListener("change", () => { filter.status = $("#dsh-tb-status-filter").value; refreshTasks(); });
		$("#dsh-tb-label-filter")?.addEventListener("change", () => { filter.label = $("#dsh-tb-label-filter").value; refreshTasks(); });
		$$(".dsh-tb-tab").forEach((tab) => tab.addEventListener("click", () => {
			view = tab.dataset.tbView;
			render();
		}));
	}

	// ---- data --------------------------------------------------------------
	async function refreshTasks() {
		const params = new URLSearchParams();
		for (const k of ["q", "repo", "priority", "status", "label"]) if (filter[k]) params.set(k, filter[k]);
		const data = await api(`/tasks?${params}`);
		tasks = data.tasks || [];
		render();
	}
	async function refreshMeta() {
		try {
			const [s, w] = await Promise.all([api("/sessions"), api("/workspaces")]);
			sessions = s.sessions || [];
			workspaces = w.workspaces || [];
			const sel = $("#dsh-tb-repo-filter");
			if (sel) {
				const cur = sel.value;
				sel.innerHTML = '<option value="">全部仓库</option>' + workspaces.map((x) => `<option value="${esc(x.path)}" title="${esc(x.path)}">${esc(repoShort(x.path))}</option>`).join("");
				if (cur && [...sel.options].some((o) => o.value === cur)) sel.value = cur;
			}
			const all = await api("/tasks").catch(() => ({ tasks: [] }));
			const labels = new Set();
			for (const t of all.tasks || []) for (const l of t.labels || []) labels.add(l);
			allLabels = [...labels].sort();
			const lsel = $("#dsh-tb-label-filter");
			if (lsel) {
				const cur = lsel.value;
				lsel.innerHTML = '<option value="">全部标签</option>' + allLabels.map((l) => `<option value="${esc(l)}">${esc(l)}</option>`).join("");
				if (cur && [...lsel.options].some((o) => o.value === cur)) lsel.value = cur;
			}
			const psel = $("#dsh-tb-priority-filter");
			if (psel && !psel.options.length) {
				psel.innerHTML = '<option value="">全部优先级</option>' + Object.entries(PRIORITY_META).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
			}
			const ssel = $("#dsh-tb-status-filter");
			if (ssel && !ssel.options.length) {
				ssel.innerHTML = '<option value="">全部状态</option>' + Object.entries(STATUS_META).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
			}
		} catch { /* meta optional */ }
	}
	async function loadGitStates() {
		for (const w of workspaces) {
			if (!w.path || gitState[w.path] !== undefined) continue;
			try {
				const r = await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(w.path)}`).then((x) => x.json());
				gitState[w.path] = r.git ? { branch: r.branch?.name || "(detached)", dirty: (r.files || []).length } : null;
			} catch { gitState[w.path] = null; }
		}
	}
	function refreshAll() {
		return refreshMeta().then(() => loadGitStates()).then(refreshTasks).catch(refreshTasks);
	}

	// ---- shared bits -------------------------------------------------------
	function labelPills(t) {
		return (t.labels || []).map((l) => `<span class="dsh-tb-pill" style="color:${labelColor(l)}">${esc(l)}</span>`).join("");
	}
	function statusPill(t) {
		const st = STATUS_META[t.status] || STATUS_META.todo;
		return `<span class="dsh-tb-pill" style="color:${st.color}">${st.label}</span>`;
	}
	function priPill(t) {
		const pr = PRIORITY_META[t.priority] || PRIORITY_META.medium;
		return `<span class="dsh-tb-pill" style="color:${pr.color}">${pr.label}</span>`;
	}
	// 状态行动按钮：AI 自动流转，用户只在"评审中"时操作
	function statusActionsHTML(task) {
		const btn = (to, label, cls) => `<button type="button" class="dsh-tb-statusbtn ${cls || ""}" data-status="${to}">${label}</button>`;
		switch (task.status) {
			case "todo": return `${btn("in_progress", "▶ 开始执行")} ${btn("blocked", "⛔ 阻塞", "ghost")}`;
			case "in_progress": return `${btn("in_review", "提交评审")} ${btn("blocked", "⛔ 阻塞", "ghost")}`;
			case "in_review": return `${btn("done", "✅ 确认完成", "primary")} ${btn("in_progress", "↩ 退回修改")}`;
			case "done": return `${btn("in_progress", "↩ 重新打开", "ghost")}`;
			case "blocked": return `${btn("in_progress", "▶ 恢复进行")}`;
			default: return "";
		}
	}
	// 打开/继续一个会话。
	// 优先走宿主原生「会话列表」的 in-app 切换（`open(id)`），这样不会整页 reload，
	// 也就不会先闪一下「新建对话」页再跳到目标会话。原生 open 会同步更新
	// dsh.sessions.current 持久化，因此刷新后仍停留在该会话。
	// 若拿不到原生 open（结构变了/未渲染），回退到 localStorage + load 的老方式。
	function findNativeSessionOpen() {
		// 从 DOM 里任一会话行向上找「会话列表」所有者组件的 fiber，取其 props.open。
		// memoizedProps 里同时具备 open + startSession 的就是该所有者（与原生侧边栏一致）。
		const candidates = document.querySelectorAll('[class*="sessionRow"], [class*="root"]');
		for (const el of candidates) {
			let fiberKey = null;
			for (const k of Object.keys(el)) if (k.startsWith("__reactFiber$")) { fiberKey = k; break; }
			if (fiberKey === null) continue;
			let f = el[fiberKey];
			for (let i = 0; i < 30 && f !== null; i++) {
				const mp = f.memoizedProps;
				if (mp !== null && typeof mp === "object" && typeof mp.open === "function" && typeof mp.startSession === "function") {
					return mp.open;
				}
				f = f.return;
			}
		}
		return null;
	}
	function openSession(sid) {
		// 点开即视为已读：推进该会话的已读游标，使它的绿点(有新回复没看)消失。
		markSessionRead(sid);
		try {
			const open = findNativeSessionOpen();
			if (typeof open === "function") {
				// 先同步写入目标会话，保证「最新对话」能立即把该行标为当前。
				// 原生 open() 之后也会持久化同一值，二者一致。
				try { localStorage.setItem("dsh.sessions.current", JSON.stringify({ sessionId: sid })); } catch { /* ignore */ }
				open(sid);
				// 原位切换后：关掉任务看板（含打开的详情弹窗），让对话重新可见。
				if (isOpen()) toggle(false);
				$$(".dsh-tb-modal-mask").forEach((m) => m.remove());
				// 立即重绘「最新对话」：被打开的会话行去掉绿点、加上当前高亮。
				refreshRecent();
				return;
			}
		} catch { /* fall through to reload */ }
		// 回退：持久化后整页加载
		try { localStorage.setItem("dsh.sessions.current", JSON.stringify({ sessionId: sid })); } catch { /* ignore */ }
		location.reload();
	}
	// 轻量操作反馈提示
	function toast(text) {
		const el = document.createElement("div");
		el.className = "dsh-tb-toast";
		el.textContent = text;
		document.body.appendChild(el);
		setTimeout(() => el.remove(), 1600);
	}

	// ---- render: overview --------------------------------------------------
	function renderOverview() {
		const stats = {};
		for (const s of STATUS_ORDER) stats[s] = 0;
		const byRepo = {};
		for (const t of tasks) {
			if (stats[t.status] !== undefined) stats[t.status]++;
			const r = t.repo || "（未指定）";
			(byRepo[r] ||= []).push(t);
		}
		const total = tasks.length;
		const doneN = stats.done || 0;
		const pct = total ? Math.round((doneN / total) * 100) : 0;
		const sessionsByRepo = {};
		for (const s of sessions) if (s.repo) (sessionsByRepo[s.repo] ||= []).push(s);
		const recent = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);

		const addCard = `<div class="dsh-tb-ov-stat dsh-tb-ov-add" id="dsh-tb-ov-new" title="新建任务"><div class="dsh-tb-ov-addbtn">＋ 新建任务</div></div>`;
		const statEls = addCard + [
			["全部任务", total, "#e6edf3", ""],
			...STATUS_ORDER.map((s) => [STATUS_META[s].label, stats[s] || 0, STATUS_META[s].color, s]),
			["完成率", `${pct}%`, "#3fb950", null]
		].map(([label, n, color, status]) => {
			const bar = label === "完成率" ? pct : total ? Math.round((n / total) * 100) : 0;
			const clickable = status !== null ? " dsh-tb-ov-stat-click" : "";
			const title = status === "" ? "查看全部任务" : status ? `查看「${label}」的任务` : "";
			return `<div class="dsh-tb-ov-stat${clickable}" ${status !== null ? `data-status="${status}"` : ""} title="${title}"><div class="n" style="color:${color}">${n}</div><div class="l">${label}</div><div class="mini"><i style="width:${bar}%;background:${color}"></i></div></div>`;
		}).join("");

		let wsCards;
		if (!workspaces.length) {
			wsCards = '<div class="dsh-tb-empty">（暂无工作区）</div>';
		} else {
			wsCards = workspaces.map((w) => {
				const tlist = byRepo[w.path] || byRepo[w.title] || [];
				const counts = STATUS_ORDER.map((s) => tlist.filter((t) => t.status === s).length);
				const n = tlist.length;
				const doneCnt = counts[STATUS_ORDER.indexOf("done")] || 0;
				const wsPct = n ? Math.round((doneCnt / n) * 100) : 0;
				const stack = n ? STATUS_ORDER.map((s, i) => counts[i] ? `<i style="width:${Math.round((counts[i] / n) * 100)}%;background:${STATUS_META[s].color}" title="${STATUS_META[s].label} ${counts[i]}"></i>` : "").join("") : "";
				const statLine = STATUS_ORDER.map((s, i) => counts[i] ? `<span class="st"><i class="dot" style="background:${STATUS_META[s].color}"></i>${STATUS_META[s].label} <b>${counts[i]}</b></span>` : "").join("");
				const sessN = (sessionsByRepo[w.path] || sessionsByRepo[w.title] || []).length;
				const g = gitState[w.path];
				const branch = g ? `<span class="branch">⎇ ${esc(g.branch)}</span>${g.dirty ? `<span class="branch dirty" title="${g.dirty} 个未提交文件">●${g.dirty}</span>` : ""}` : "";
				const sessList = (sessionsByRepo[w.path] || sessionsByRepo[w.title] || []).slice(0, 3).map((s) => `<div class="s" data-sid="${esc(s.id)}" title="打开会话 ${esc(s.id)}">▸ ${esc(s.title)}</div>`).join("");
				return `<div class="dsh-tb-ov-ws" data-repo="${esc(w.path)}">
					<div class="ws-head"><h4>${esc(w.title)}</h4><span class="ws-total">${n} 个任务</span></div>
					<div class="path">${esc(w.path || "")}</div>
					${n ? `<div class="stack">${stack}</div><div class="ws-stats">${statLine}</div>` : '<div class="ws-stats" style="color:var(--dsw-alias-label-secondary,#9aa7b4)">暂无任务，点「＋ 新建」创建</div>'}
					<div class="comp"><span class="pct">完成率 ${wsPct}%</span><div class="track"><i style="width:${wsPct}%"></i></div></div>
					<div class="meta">${branch}<span class="sess">会话 ${sessN}</span></div>
					${sessList ? `<div class="sesslist">${sessList}</div>` : ""}
				</div>`;
			}).join("");
		}

		const recentEls = recent.length ? recent.map((t) => {
			const st = STATUS_META[t.status] || STATUS_META.todo;
			return `<div class="dsh-tb-ov-item" data-id="${esc(t.id)}">
				<span class="dot" style="background:${st.color}"></span>
				<span class="t">${esc(t.title)}</span>
				${t.repo ? `<span class="r">${esc(repoShort(t.repo))}</span>` : ""}
				<span class="tm">${fmtTime(t.updatedAt)}</span>
			</div>`;
		}).join("") : '<div class="dsh-tb-empty">（暂无任务）</div>';

		const body = $("#dsh-tb-body");
		if (!body) return;
		body.innerHTML = `<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${statEls}</div>
			<div class="dsh-tb-ov-sec">工作区内容</div>
			<div class="dsh-tb-ov-grid">${wsCards}</div>
			<div class="dsh-tb-ov-sec">最近更新</div>
			<div class="dsh-tb-ov-recent">${recentEls}</div>
		</div>`;
		$("#dsh-tb-ov-new")?.addEventListener("click", openCreate);
		$$(".dsh-tb-ov-stat[data-status]").forEach((el) => el.addEventListener("click", () => {
			filter.status = el.dataset.status; // ""=全部
			view = "list";
			render();
			refreshTasks();
		}));
		$$(".dsh-tb-ov-ws").forEach((el) => el.addEventListener("click", () => {
			filter.repo = el.dataset.repo;
			const sel = $("#dsh-tb-repo-filter");
			if (sel) sel.value = filter.repo;
			view = "kanban";
			render();
			refreshTasks();
		}));
		$$(".dsh-tb-ov-ws .s").forEach((el) => el.addEventListener("click", (e) => {
			e.stopPropagation();
			openSession(el.dataset.sid);
		}));
		$$(".dsh-tb-ov-item").forEach((el) => el.addEventListener("click", () => { if (el.dataset.id) openDetail(el.dataset.id); }));
	}

	// ---- render: kanban ----------------------------------------------------
	function cardHTML(t) {
		const st = STATUS_META[t.status] || STATUS_META.todo;
		const pr = PRIORITY_META[t.priority] || PRIORITY_META.medium;
		const badges = [];
		badges.push(priPill(t));
		if (t.status === "in_review") badges.push(`<span class="dsh-tb-pill" style="color:#bc8cff;font-weight:600">◉ 待 review</span>`);
		if (t.repo) badges.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${esc(repoShort(t.repo))}</span>`);
		if (t.feature) badges.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${esc(t.feature)}</span>`);
		badges.push(labelPills(t));
		if (t.review && t.review !== "none") badges.push(`<span class="dsh-tb-pill" style="color:${t.review === "approved" ? "#3fb950" : t.review === "rejected" ? "#f85149" : "#d29922"}">${REVIEW_META[t.review]}</span>`);
		if (t.test && t.test !== "none") badges.push(`<span class="dsh-tb-pill" style="color:${t.test === "passed" ? "#3fb950" : t.test === "failed" ? "#f85149" : "#d29922"}">${TEST_META[t.test]}</span>`);
		const foot = [];
		if (t.sessionIds?.length) foot.push(`<span>会话 ${t.sessionIds.length}</span>`);
		if (t.notes?.length) foot.push(`<span>评论 ${t.notes.length}</span>`);
		foot.push(`<span>${fmtTime(t.updatedAt)}</span>`);
		return `<div class="dsh-tb-card" data-id="${esc(t.id)}" style="border-left:3px solid ${st.color}">
			<div class="dsh-tb-card-title">${esc(t.title)}</div>
			<div class="dsh-tb-card-meta">${badges.join("")}</div>
			${t.displayProgress > 0 ? `<div class="dsh-tb-bar"><i style="width:${Math.min(100, t.displayProgress)}%"></i></div>` : ""}
			<div class="dsh-tb-card-foot">${foot.join(" · ")}</div>
		</div>`;
	}

	function renderKanban() {
		const body = $("#dsh-tb-body");
		const countEl = $("#dsh-tb-count");
		if (!body) return;
		body.innerHTML = `<div class="dsh-tb-columns"></div>`;
		const columnsEl = $(".dsh-tb-columns", body);
		if (countEl) countEl.textContent = `${tasks.length} 个任务`;
		for (const [status, meta] of Object.entries(STATUS_META)) {
			const col = document.createElement("div");
			col.className = "dsh-tb-col";
			const list = tasks.filter((t) => t.status === status);
			col.innerHTML = `<div class="dsh-tb-col-head">${meta.label} <b>${list.length}</b></div><div class="dsh-tb-col-body"></div>`;
			const colBody = $(".dsh-tb-col-body", col);
			if (!list.length) colBody.innerHTML = '<div class="dsh-tb-empty">—</div>';
			else list.forEach((t) => colBody.insertAdjacentHTML("beforeend", cardHTML(t)));
			columnsEl.appendChild(col);
		}
		$$(".dsh-tb-card", columnsEl).forEach((el) => el.addEventListener("click", () => openDetail(el.dataset.id)));
	}

	// ---- render: list ------------------------------------------------------
	function renderList() {
		const body = $("#dsh-tb-body");
		const countEl = $("#dsh-tb-count");
		if (!body) return;
		if (countEl) countEl.textContent = `${tasks.length} 个任务`;
		if (!tasks.length) {
			body.innerHTML = '<div class="dsh-tb-ov"><div class="dsh-tb-empty">（暂无任务，点「＋ 新建」创建）</div></div>';
			return;
		}
		const rows = tasks.map((t) => `<tr data-id="${esc(t.id)}">
			<td>${statusPill(t)}</td>
			<td>${priPill(t)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.title)}</div></td>
			<td>${t.repo ? `<span class="dsh-tb-pill" style="color:#79c0ff">${esc(repoShort(t.repo))}</span>` : ""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.feature || "")}</div></td>
			<td>${labelPills(t)}</td>
			<td style="min-width:90px">${t.displayProgress > 0 ? `<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100, t.displayProgress)}%"></i></div>` : ""}</td>
			<td>${t.review !== "none" ? `<span class="dsh-tb-pill" style="color:${t.review === "approved" ? "#3fb950" : t.review === "rejected" ? "#f85149" : "#d29922"}">${REVIEW_META[t.review]}</span>` : ""}</td>
			<td>${t.test !== "none" ? `<span class="dsh-tb-pill" style="color:${t.test === "passed" ? "#3fb950" : t.test === "failed" ? "#f85149" : "#d29922"}">${TEST_META[t.test]}</span>` : ""}</td>
			<td style="white-space:nowrap">${fmtTime(t.updatedAt)}</td>
		</tr>`).join("");
		body.innerHTML = `<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>状态</th><th>优先级</th><th>任务</th><th>仓库</th><th>分支/feature</th><th>标签</th><th>进度</th><th>Review</th><th>测试</th><th>更新</th></tr></thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`;
		$$("tr[data-id]", body).forEach((el) => el.addEventListener("click", () => openDetail(el.dataset.id)));
	}

	function render() {
		$$(".dsh-tb-tab").forEach((tab) => {
			if (tab.dataset.tbView === view) tab.classList.add("dsh-tb-tab-on");
			else tab.classList.remove("dsh-tb-tab-on");
		});
		const toolbar = $("#dsh-tb-toolbar");
		if (toolbar) toolbar.style.display = view === "overview" ? "none" : "flex";
		if (view === "kanban") renderKanban();
		else if (view === "list") renderList();
		else renderOverview();
	}

	// ---- create modal ------------------------------------------------------
	function openCreate() {
		const mask = document.createElement("div");
		mask.className = "dsh-tb-modal-mask";
		const repoOptions = workspaces.map((w) => `<option value="${esc(w.path)}" title="${esc(w.path)}">${esc(w.path)}</option>`).join("");
		const markErr = (sel, hint) => {
			$(sel, mask)?.classList.add("err");
			if (hint) $(hint, mask).hidden = false;
		};
		const renderForm = () => {
			mask.innerHTML = `<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>新建任务</h3>
				<div class="dsh-tb-field">
					<label for="tb-f-title">标题 *</label>
					<input id="tb-f-title" placeholder="一句话说明要做什么" />
					<div class="dsh-tb-hint" id="tb-hint-title" hidden>请填写任务标题</div>
				</div>
				<div class="dsh-tb-row">
					<div class="dsh-tb-field">
						<label for="tb-f-repo">仓库目录 *</label>
						<select id="tb-f-repo"><option value="" disabled selected>请选择工作区目录（新建的对话会挂到这个工作区）</option>${repoOptions}</select>
						<div class="dsh-tb-hint" id="tb-hint-repo" hidden>请选择任务所属的工作区目录</div>
					</div>
					<div class="dsh-tb-field">
						<label for="tb-f-feature">分支 / feature</label>
						<input id="tb-f-feature" placeholder="如 feat-xxx" />
					</div>
				</div>
				<div class="dsh-tb-field">
					<label for="tb-f-desc">描述</label>
					<textarea id="tb-f-desc" placeholder="需求背景 / 实现方式 / 验收标准…"></textarea>
				</div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">取消</button>
					<button data-act="save" class="dsh-tb-primary">创建任务</button>
				</div>
			</div>`;
			$("#tb-f-title", mask).addEventListener("input", () => { $("#tb-f-title", mask).classList.remove("err"); $("#tb-hint-title", mask).hidden = true; });
			$("#tb-f-repo", mask).addEventListener("change", () => { $("#tb-f-repo", mask).classList.remove("err"); $("#tb-hint-repo", mask).hidden = true; });
			$('[data-act="cancel"]', mask).addEventListener("click", close);
			$('[data-act="save"]', mask).addEventListener("click", async () => {
				const title = $("#tb-f-title", mask).value.trim();
				const repo = $("#tb-f-repo", mask).value;
				$("#tb-hint-title", mask).hidden = true;
				$("#tb-hint-repo", mask).hidden = true;
				$$(".err", mask).forEach((el) => el.classList.remove("err"));
				let ok = true;
				if (!title) { markErr("#tb-f-title", "#tb-hint-title"); ok = false; }
				if (!repo) { markErr("#tb-f-repo", "#tb-hint-repo"); ok = false; }
				if (!ok) return;
				try {
					const { task } = await api("/tasks", { method: "POST", body: JSON.stringify({
						title,
						repo,
						feature: $("#tb-f-feature", mask).value.trim(),
						description: $("#tb-f-desc", mask).value
					}) });
					refreshAll();
					showSuccess(task);
				} catch (err) { alert(`创建失败：${err.message}`); }
			});
			$("#tb-f-title", mask).focus();
		};
		const showSuccess = (task) => {
			mask.innerHTML = `<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>✅ 任务已创建</h3>
				<div class="dsh-tb-created-title">${esc(task.title)}</div>
				<div class="dsh-tb-created-meta">${esc(task.repo)}${task.feature ? ` · ${esc(task.feature)}` : ""}</div>
				<div class="dsh-tb-created-next">接下来做什么？</div>
				<div class="dsh-tb-created-actions">
					<button data-act="newsess" class="dsh-tb-primary dsh-tb-big">➕ 新建对话开始干活</button>
					<button data-act="bind" class="dsh-tb-big">🔗 绑定已有会话</button>
					<button data-act="detail" class="dsh-tb-big">进入任务详情</button>
				</div>
				<div class="dsh-tb-actions" style="margin-top:12px">
					<button data-act="close">关闭</button>
				</div>
			</div>`;
			$('[data-act="newsess"]', mask).addEventListener("click", async () => {
				try {
					const { sessionId } = await api(`/tasks/${task.id}/session`, { method: "POST", body: "{}" });
					openSession(sessionId);
				} catch (err) { alert(`新建会话失败：${err.message}`); }
			});
			$('[data-act="bind"]', mask).addEventListener("click", () => { mask.remove(); openDetail(task.id); });
			$('[data-act="detail"]', mask).addEventListener("click", () => { mask.remove(); openDetail(task.id); });
			$('[data-act="close"]', mask).addEventListener("click", () => mask.remove());
		};
		const close = () => mask.remove();
		mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
		document.body.appendChild(mask);
		renderForm();
	}

	// ---- detail modal ------------------------------------------------------
	// 选择会话关联：搜索 + 按工作区分组 + 按更新时间排序
	function openSessionPicker(taskId, onLinked) {
		api("/sessions").then((fresh) => {
			const pickMask = document.createElement("div");
			pickMask.className = "dsh-tb-modal-mask";
			pickMask.innerHTML = `<div class="dsh-tb-modal" style="width:min(600px,92vw)">
				<h3>选择会话关联</h3>
				<div class="dsh-tb-field"><input id="tb-pick-search" placeholder="搜索会话标题…" /></div>
				<div class="dsh-tb-picklist" id="tb-pick-list">加载中…</div>
				<div class="dsh-tb-actions"><button data-act="cancel">取消</button></div>
			</div>`;
			document.body.appendChild(pickMask);
			const allSessions = fresh.sessions || sessions;
			const listEl = $("#tb-pick-list", pickMask);
			const render = (q) => {
				const ql = String(q || "").trim().toLowerCase();
				const list = allSessions.filter((s) => !ql || String(s.title || "").toLowerCase().includes(ql));
				const groups = {};
				for (const s of list) { const k = s.repo || "（未指定）"; (groups[k] ||= []).push(s); }
				const html = Object.entries(groups)
					.sort((a, b) => b[1].length - a[1].length)
					.map(([repo, items]) => {
						items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
						return `<div class="dsh-tb-pick-group">
							<div class="dsh-tb-pick-grouphead">${esc(repoShort(repo))} <b>${items.length}</b></div>
							${items.map((s) => `<div class="dsh-tb-pick-item" data-sid="${esc(s.id)}">
								<div class="t">${esc(s.title || s.id)}${s.running ? ` <span class="dsh-tb-run">● 运行中</span>` : ""}</div>
								<div class="m">${s.updatedAt ? fmtTime(s.updatedAt) : ""}</div>
							</div>`).join("")}
						</div>`;
					}).join("");
				listEl.innerHTML = html || '<div class="dsh-tb-empty">（无匹配会话）</div>';
				$$(".dsh-tb-pick-item", pickMask).forEach((el) => el.addEventListener("click", async () => {
					const sid = el.dataset.sid;
					try {
						const { task: lk, injected, injectionNote } = await api(`/tasks/${taskId}/sessions`, { method: "POST", body: JSON.stringify({ sessionId: sid, action: "link" }) });
						pickMask.remove();
						await refreshTasks();
						onLinked(lk);
						toast(injected ? "✓ 已关联会话（已注入任务上下文）" : (injectionNote || "已关联会话"));
					} catch (err) { alert(`关联失败：${err.message}`); }
				}));
			};
			render("");
			$("#tb-pick-search", pickMask).addEventListener("input", () => render($("#tb-pick-search", pickMask).value));
			$('[data-act="cancel"]', pickMask).addEventListener("click", () => pickMask.remove());
			pickMask.addEventListener("click", (e) => { if (e.target === pickMask) pickMask.remove(); });
			$("#tb-pick-search", pickMask).focus();
		}).catch(() => alert("获取会话列表失败"));
	}

	async function openDetail(id) {
		const { task } = await api(`/tasks/${id}`);
		buildDetail(task);
	}

	function buildDetail(task) {
		const id = task.id;
		const mask = document.createElement("div");
		mask.className = "dsh-tb-modal-mask";
		const sessOptions = sessions.map((s) => `<option value="${esc(s.id)}">${esc(s.title || s.id)}${s.repo ? ` · ${esc(repoShort(s.repo))}` : ""}</option>`).join("");
		mask.innerHTML = `<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${esc(task.title)}</h3>
			<div class="dsh-tb-field"><label>仓库目录（工作区路径）</label><input id="tb-d-repo" placeholder="/root/projects/…" value="${esc(task.repo)}" /><input id="tb-d-feature" value="${esc(task.feature)}" placeholder="feature/分支" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>状态（AI 自动流转，你只需在"评审中"时处理）</label>
					<div class="dsh-tb-statusline">
						<span class="dsh-tb-statusbadge" style="color:${STATUS_META[task.status].color};border-color:${STATUS_META[task.status].color}55;background:${STATUS_META[task.status].color}14">${STATUS_META[task.status].label}</span>
						<div class="dsh-tb-statusactions">${statusActionsHTML(task)}</div>
					</div>
				</div>
				<div class="dsh-tb-field"><label>优先级</label><select id="tb-d-priority">${Object.entries(PRIORITY_META).map(([k, v]) => `<option value="${k}" ${k === task.priority ? "selected" : ""}>${v.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>进度 ${task.displayProgress ?? task.progress}%（自动派生）</label><input id="tb-d-progress" type="range" min="0" max="100" value="${task.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(REVIEW_META).map(([k, v]) => `<option value="${k}" ${k === task.review ? "selected" : ""}>${v}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>测试</label><select id="tb-d-test">${Object.entries(TEST_META).map(([k, v]) => `<option value="${k}" ${k === task.test ? "selected" : ""}>${v}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>标签</label><input id="tb-d-labels" value="${esc((task.labels || []).join(", "))}" placeholder="逗号分隔" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${allLabels.map((l) => `<option value="${esc(l)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>描述</label><textarea id="tb-d-desc">${esc(task.description || "")}</textarea></div>
			<div class="dsh-tb-field"><label>共享上下文（池内会话可访问：新对话自动带、关联会话自动注入、也可复制随时取最新版）</label>
				<div class="dsh-tb-ctx">
					<div class="dsh-tb-ctx-body" id="tb-d-ctx-body">加载中…</div>
					<div class="dsh-tb-ctx-actions">
						<button id="tb-d-ctx-copy" title="复制最新上下文到剪贴板">📋 复制</button>
						<button id="tb-d-ctx-refresh" title="重新获取最新上下文">⟳ 刷新</button>
					</div>
				</div>
			</div>
			<div class="dsh-tb-field"><label>进展记录（${(task.notes || []).length}）</label>
				<div id="tb-d-notes">${(task.notes || []).map((n) => `<div class="dsh-tb-note"><span class="dsh-tb-note-time">${fmtTime(n.at)}</span><br/>${esc(n.text)}</div>`).join("") || '<div class="dsh-tb-note">（暂无记录）</div>'}</div>
				<textarea id="tb-d-note" placeholder="添加进展/完成情况…（Ctrl+Enter 提交）" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>池内会话（共享上下文可访问者；点击打开可继续）</label>
				<div id="tb-d-sessions">${(task.sessionIds || []).map((sid) => {
					const s = sessions.find((x) => x.id === sid);
					return `<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${esc(sid)}">${esc(s ? s.title : sid)}${s && s.running ? ` <span class="dsh-tb-run">● 运行中</span>` : ""}</span><button data-sid="${esc(sid)}" data-act="open" class="dsh-tb-open">打开</button><button data-sid="${esc(sid)}" data-act="unlink">解除</button></div>`;
				}).join("") || '<div class="dsh-tb-note">（未关联会话）</div>'}</div>
				<div class="dsh-tb-row" style="margin-top:6px">
					<button id="tb-d-sess-open" style="flex:1" title="按工作区分组、按更新时间排序、可搜索">🔍 选择会话关联</button>
					<button id="tb-d-sess-new" title="新建一个绑定到此任务的对话">＋ 新对话</button>
				</div>
			</div>
			<div class="dsh-tb-actions">
				<button data-act="del" class="dsh-tb-danger">删除</button>
				<button data-act="copyctx" title="复制任务上下文（可粘到任意对话里带上背景）">📋 复制上下文</button>
				<button data-act="split" title="大任务拆成多个小任务">✂ 拆分</button>
				<button data-act="cancel">关闭</button>
				<button data-act="save" class="dsh-tb-primary dsh-tb-grow">保存</button>
			</div>
		</div>`;
		document.body.appendChild(mask);

		// 共享上下文：加载最新版 + 复制 + 刷新
		const loadCtx = async () => {
			const bodyEl = $("#tb-d-ctx-body", mask);
			if (!bodyEl) return;
			try {
				const { context } = await api(`/tasks/${id}/context`);
				bodyEl.textContent = context || "（暂无共享上下文）";
			} catch {
				bodyEl.textContent = "（获取失败）";
			}
		};
		const copyCtx = async () => {
			try {
				const { context } = await api(`/tasks/${id}/context`);
				await navigator.clipboard.writeText(context || "");
				toast("✓ 已复制最新共享上下文");
			} catch {
				try {
					const { context } = await api(`/tasks/${id}/context`);
					const ta = document.createElement("textarea");
					ta.value = context || "";
					document.body.appendChild(ta);
					ta.select();
					document.execCommand("copy");
					ta.remove();
					toast("✓ 已复制最新共享上下文");
				} catch (err) { alert(`复制失败：${err.message}`); }
			}
		};
		void loadCtx();
		$("#tb-d-ctx-refresh", mask)?.addEventListener("click", loadCtx);
		$("#tb-d-ctx-copy", mask)?.addEventListener("click", copyCtx);

		const state = () => ({
			repo: $("#tb-d-repo", mask).value.trim(),
			feature: $("#tb-d-feature", mask).value.trim(),
			priority: $("#tb-d-priority", mask).value,
			progress: Number($("#tb-d-progress", mask).value),
			review: $("#tb-d-review", mask).value,
			test: $("#tb-d-test", mask).value,
			labels: $("#tb-d-labels", mask).value.split(",").map((s) => s.trim()).filter(Boolean),
			description: $("#tb-d-desc", mask).value
		});
		const close = () => mask.remove();
		// 原地重建弹窗（用变更接口返回的最新任务，不重新请求）
		const rerender = (t) => { mask.remove(); buildDetail(t); };
		const patch = async (body) => { const { task: t } = await api(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }); await refreshTasks(); return t; };

		mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
		$('[data-act="cancel"]', mask).addEventListener("click", close);
		$('[data-act="save"]', mask).addEventListener("click", async () => {
			try {
				// 保存表单字段
				const updated = await patch(state());
				rerender(updated);
				toast("✓ 已保存");
			} catch (err) { alert(`保存失败：${err.message}`); }
		});
		$('[data-act="del"]', mask).addEventListener("click", async () => {
			if (!confirm(`删除任务「${task.title}」？`)) return;
			try { await api(`/tasks/${id}`, { method: "DELETE" }); close(); await refreshAll(); } catch (err) { alert(`删除失败：${err.message}`); }
		});
		$('[data-act="copyctx"]', mask)?.addEventListener("click", copyCtx);
		$("#tb-d-note", mask).addEventListener("keydown", async (e) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				const text = $("#tb-d-note", mask).value.trim();
				if (!text) return;
				try {
					const { task: nt } = await api(`/tasks/${id}/notes`, { method: "POST", body: JSON.stringify({ text }) });
					await refreshTasks();
					rerender(nt);
					toast("✓ 进展已记录");
				} catch (err) { alert(`记录失败：${err.message}`); }
			}
		});
		// 🔍 选择会话关联：搜索 + 按工作区分组 + 按更新时间排序
		$("#tb-d-sess-open", mask)?.addEventListener("click", () => {
			openSessionPicker(id, (lk) => { mask.remove(); buildDetail(lk); });
		});
		$$("#tb-d-sessions [data-act]", mask).forEach((btn) => btn.addEventListener("click", async () => {
			const sid = btn.dataset.sid;
			if (btn.dataset.act === "open") openSession(sid);
			else {
				const { task: ul } = await api(`/tasks/${id}/sessions`, { method: "POST", body: JSON.stringify({ sessionId: sid, action: "unlink" }) });
				await refreshTasks();
				rerender(ul);
				toast("已解除会话");
			}
		}));
		// ＋ 新对话：创建一个绑定到此任务的新会话并打开
		$("#tb-d-sess-new", mask)?.addEventListener("click", async () => {
			try {
				const { sessionId } = await api(`/tasks/${id}/session`, { method: "POST", body: "{}" });
				openSession(sessionId);
			} catch (err) { alert(`新建会话失败：${err.message}`); }
		});
		// 状态行动按钮：AI 自动流转；用户只处理评审/确认
		$$(".dsh-tb-statusbtn", mask).forEach((btn) => btn.addEventListener("click", async () => {
			try {
				const updated = await patch({ status: btn.dataset.status });
				rerender(updated);
				toast("✓ 状态已更新");
			} catch (err) { alert(`状态流转失败：${err.message}`); }
		}));
		// ✂ 拆分：把大任务拆成多个小任务
		$('[data-act="split"]', mask)?.addEventListener("click", () => {
			const splitMask = document.createElement("div");
			splitMask.className = "dsh-tb-modal-mask";
			splitMask.innerHTML = `<div class="dsh-tb-modal">
				<h3>拆分任务：${esc(task.title)}</h3>
				<div class="dsh-tb-field"><label>子任务标题（每行一个，拆分后自动继承仓库/优先级/标签/关联会话）</label>
					<textarea id="tb-split-titles" style="min-height:120px" placeholder="例如：&#10;实现功能 A&#10;实现功能 B&#10;联调与测试"></textarea></div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">取消</button>
					<button data-act="do" class="dsh-tb-primary">拆分</button>
				</div>
			</div>`;
			document.body.appendChild(splitMask);
			const close = () => splitMask.remove();
			$('[data-act="cancel"]', splitMask).addEventListener("click", close);
			splitMask.addEventListener("click", (e) => { if (e.target === splitMask) close(); });
			$('[data-act="do"]', splitMask).addEventListener("click", async () => {
				const titles = $("#tb-split-titles", splitMask).value.split("\n").map((s) => s.trim()).filter(Boolean);
				if (!titles.length) { $("#tb-split-titles", splitMask).focus(); return; }
				try {
					const { tasks: children } = await api(`/tasks/${id}/split`, { method: "POST", body: JSON.stringify({ titles }) });
					close();
					await refreshAll();
					toast(`✓ 已拆分为 ${children.length} 个子任务`);
					if (children?.[0]) openDetail(children[0].id);
				} catch (err) { alert(`拆分失败：${err.message}`); }
			});
			$("#tb-split-titles", splitMask).focus();
		});
	}

	// ---- bootstrap ---------------------------------------------------------
	mountView();
	placeEntry();
	mountRecent();
	startRecentRefresher();
	new MutationObserver(() => { mountView(); placeEntry(); mountRecent(); })
		.observe(document.body, { childList: true, subtree: true });
	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.shiftKey && (e.key === "B" || e.key === "b")) {
			e.preventDefault();
			toggle();
		}
	});
	// When the board is open, any click on a left-sidebar item other than the
	// taskboard entry itself switches back to the conversation.
	document.addEventListener("click", (e) => {
		if (!isOpen()) return;
		const target = e.target;
		if (!(target instanceof Element)) return;
		if (target.closest(`[${ENTRY_ATTR}]`)) return;
		if (target.closest('[data-pane="sidebar"], [class*="sidebarCol"]')) toggle(false);
	});

	// —— 会话切换后的输入区恢复 ——
	// 从任务看板"新建对话/打开会话"走 localStorage + location.reload()。新版
	// Harness 在 reload 恢复会话后，输入区停留在未正确初始化的状态：点输入框
	// 没反应，必须手动左右拖拽（真实改变面板宽度）后才可输入。
	// 原因：GUI 用 ResizeObserver 监听真实几何变化，单纯派发 window resize 事件
	// 不会改变任何元素尺寸，Observer 不触发。这里把对话列宽度真实改小 1px 再
	// 还原——触发一次真实尺寸变化（同帧还原，无视觉闪烁），等价于用户拖拽。
	function forceRealReflow() {
		const col = conversationColumn();
		if (!col || col.clientWidth === 0) return;
		const prev = col.style.width;
		try {
			col.style.width = `${col.clientWidth - 1}px`;
			void col.offsetWidth; // 强制同步回流，确保 ResizeObserver 回调执行
			col.style.width = prev || "";
		} catch { /* ignore */ }
	}
	const nudgeTimers = [300, 800, 1600];
	const runNudges = () => { for (const t of nudgeTimers) setTimeout(forceRealReflow, t); };
	if (document.readyState === "loading") window.addEventListener("load", runNudges);
	else runNudges();
})();

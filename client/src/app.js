// dsh-taskboard client: lightweight Jira-like task board.
// - LEFT-SIDEBAR entry + full center-column view
// - views: 概览 (workspace dashboard) / 看板 (kanban) / 列表 (list)
// - labels, filters (repo/priority/status/label/search), session links
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
[data-pane='conversation'],
[class*='centerCol'] { position: relative; }
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
  font-size: 13px; white-space: nowrap;
}
[${ENTRY_ATTR}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${ENTRY_ATTR}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${ENTRY_ATTR}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${ENTRY_ATTR}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${ENTRY_ATTR}][data-icon-only] > span:not(:first-child) { display: none; }

#dsh-tb-view{height:100%;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary,#e6edf3);font-size:12.5px}
.dsh-tb-head{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);flex:none;gap:10px}
.dsh-tb-title{font-size:15px;font-weight:600;flex:none}
.dsh-tb-tabs{display:flex;gap:2px;flex:1;min-width:0}
.dsh-tb-tab{background:transparent;border:0;border-bottom:2px solid transparent;color:var(--dsw-alias-label-secondary,#9aa7b4);padding:4px 12px;font-size:13px;cursor:pointer}
.dsh-tb-tab:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-tab.dsh-tb-tab-on{border-bottom-color:#3478f6;color:var(--dsw-alias-label-primary,#e6edf3);font-weight:600}
.dsh-tb-head-actions{display:flex;gap:6px;flex:none}
.dsh-tb-head-actions button,.dsh-tb-toolbar select,.dsh-tb-toolbar input{background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer}
.dsh-tb-head-actions #dsh-tb-new{background:var(--dsw-alias-button-primary-bg,#3478f6);border-color:transparent}
.dsh-tb-toolbar{display:flex;gap:8px;align-items:center;padding:8px 16px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);flex:none;flex-wrap:wrap}
.dsh-tb-toolbar #dsh-tb-search{flex:1;min-width:140px}
.dsh-tb-count{color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:11.5px}
.dsh-tb-body{flex:1;min-height:0;overflow:auto}
.dsh-tb-columns{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:10px 14px;height:100%;box-sizing:border-box}
.dsh-tb-col{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;display:flex;flex-direction:column;min-height:100%;min-width:150px}
.dsh-tb-col-head{padding:7px 9px;font-weight:600;font-size:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);color:var(--dsw-alias-label-secondary,#9aa7b4)}
.dsh-tb-col-head b{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-col-body{padding:6px;display:flex;flex-direction:column;gap:6px;overflow-y:auto}
.dsh-tb-card{background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:7px;padding:8px 9px;cursor:pointer;transition:border-color .12s}
.dsh-tb-card:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-card-title{font-size:12.5px;font-weight:500;line-height:1.35;word-break:break-all}
.dsh-tb-card-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;align-items:center}
.dsh-tb-pill{font-size:10.5px;padding:1px 6px;border-radius:9px;border:1px solid currentColor;line-height:1.5}
.dsh-tb-bar{height:3px;border-radius:2px;background:var(--dsw-alias-bg-layer-2,#1b2127);margin-top:7px;overflow:hidden}
.dsh-tb-bar>i{display:block;height:100%;background:var(--dsw-alias-button-primary-bg,#3478f6)}
.dsh-tb-card-foot{display:flex;justify-content:space-between;margin-top:6px;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:10.5px}
.dsh-tb-empty{color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:center;padding:14px 4px;font-size:11.5px}
/* list view */
.dsh-tb-table{width:100%;border-collapse:collapse;font-size:12px}
.dsh-tb-table th{position:sticky;top:0;background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-secondary,#9aa7b4);text-align:left;padding:7px 10px;border-bottom:1px solid var(--dsw-alias-border-l2,#2a3138);font-weight:600;white-space:nowrap;z-index:1}
.dsh-tb-table td{padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l3,#232a31);vertical-align:middle}
.dsh-tb-table tr{cursor:pointer}
.dsh-tb-table tr:hover td{background:var(--dsw-alias-bg-layer-2,#1b2127)}
/* overview */
.dsh-tb-ov{padding:14px 16px;height:100%;box-sizing:border-box;overflow:auto}
.dsh-tb-ov-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.dsh-tb-ov-stat{flex:1;min-width:110px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:10px 12px}
.dsh-tb-ov-stat .n{font-size:22px;font-weight:700;line-height:1.1}
.dsh-tb-ov-stat .l{font-size:11px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-top:2px}
.dsh-tb-ov-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px;margin-bottom:16px}
.dsh-tb-ov-ws{background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;padding:10px 12px;cursor:pointer;transition:border-color .12s}
.dsh-tb-ov-ws:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-ov-ws h4{margin:0 0 2px;font-size:13.5px}
.dsh-tb-ov-ws .path{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);word-break:break-all;margin-bottom:7px}
.dsh-tb-ov-ws .meta{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.dsh-tb-ov-ws .branch{font-size:10.5px;color:#79c0ff;border:1px solid #79c0ff66;border-radius:8px;padding:1px 6px}
.dsh-tb-ov-ws .dirty{color:#f85149}
.dsh-tb-ov-ws .sess{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-left:auto}
.dsh-tb-ov-ws .sesslist{margin-top:7px;border-top:1px dashed var(--dsw-alias-border-l3,#232a31);padding-top:5px;display:flex;flex-direction:column;gap:2px}
.dsh-tb-ov-ws .sesslist .s{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:#79c0ff}
.dsh-tb-ov-ws .sesslist .s:hover{text-decoration:underline}
.dsh-tb-ov-sec{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#9aa7b4);margin:14px 0 8px}
.dsh-tb-ov-recent{display:flex;flex-direction:column;gap:5px}
.dsh-tb-ov-item{display:flex;align-items:center;gap:8px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:6px 10px;cursor:pointer}
.dsh-tb-ov-item:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-ov-item .dot{width:8px;height:8px;border-radius:50%;flex:none}
.dsh-tb-ov-item .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-tb-ov-item .r{font-size:10.5px;color:#79c0ff;flex:none}
.dsh-tb-ov-item .tm{font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);flex:none}
.dsh-tb-modal-mask{position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}
.dsh-tb-modal{width:min(640px,92vw);max-height:88vh;overflow:auto;background:var(--dsw-alias-bg-layer-1,#14181d);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:10px;padding:16px 18px;color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-tb-modal h3{margin:0 0 12px;font-size:15px}
.dsh-tb-field{margin-bottom:10px}
.dsh-tb-field label{display:block;font-size:11.5px;color:var(--dsw-alias-label-secondary,#9aa7b4);margin-bottom:4px}
.dsh-tb-field input,.dsh-tb-field select,.dsh-tb-field textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#0d1117);color:var(--dsw-alias-label-primary,#e6edf3);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:6px 9px;font-size:12.5px;font-family:inherit}
.dsh-tb-field textarea{min-height:70px;resize:vertical}
.dsh-tb-row{display:flex;gap:10px}
.dsh-tb-row .dsh-tb-field{flex:1}
.dsh-tb-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.dsh-tb-actions button{padding:6px 14px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2,#2a3138);background:var(--dsw-alias-bg-layer-2,#1b2127);color:var(--dsw-alias-label-primary,#e6edf3);cursor:pointer;font-size:12.5px}
.dsh-tb-actions button.dsh-tb-primary{background:var(--dsw-alias-button-primary-bg,#3478f6);border-color:transparent;color:#fff}
.dsh-tb-actions button.dsh-tb-danger{color:#f85149}
.dsh-tb-actions button.dsh-tb-grow{flex:1}
.dsh-tb-note{border-left:2px solid var(--dsw-alias-border-l2,#2a3138);padding:2px 0 2px 10px;margin:8px 0;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:12px;white-space:pre-wrap;word-break:break-all}
.dsh-tb-note .dsh-tb-note-time{font-size:10.5px}
.dsh-tb-sess{display:flex;justify-content:space-between;align-items:center;background:var(--dsw-alias-bg-base,#0d1117);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:6px;padding:5px 8px;margin-bottom:5px;gap:8px}
.dsh-tb-sess .dsh-tb-sess-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}
.dsh-tb-sess button{flex:none;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:5px;padding:2px 8px;font-size:11px;cursor:pointer}
.dsh-tb-sess button.dsh-tb-open{background:var(--dsw-alias-button-primary-bg,#3478f6);border-color:transparent}
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
      <button id="dsh-tb-new" title="新建任务">＋ 新建</button>
    </div>
  </div>
  <div class="dsh-tb-toolbar" id="dsh-tb-toolbar">
    <input id="dsh-tb-search" placeholder="搜索标题/仓库/feature/标签…" />
    <select id="dsh-tb-repo-filter"><option value="">全部仓库</option></select>
    <select id="dsh-tb-priority-filter"><option value="">全部优先级</option></select>
    <select id="dsh-tb-status-filter"><option value="">全部状态</option></select>
    <select id="dsh-tb-label-filter"><option value="">全部标签</option></select>
    <span id="dsh-tb-count" class="dsh-tb-count"></span>
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
				sel.innerHTML = '<option value="">全部仓库</option>' + workspaces.map((x) => `<option value="${esc(x.title)}">${esc(x.title)}</option>`).join("");
				if (cur && [...sel.options].some((o) => o.value === cur)) sel.value = cur;
			}
			// label options from all tasks
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
	function openSession(sid) {
		try { localStorage.setItem("dsh.sessions.current", JSON.stringify({ sessionId: sid })); } catch { /* ignore */ }
		location.reload();
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
		const sessionsByRepo = {};
		for (const s of sessions) if (s.repo) (sessionsByRepo[s.repo] ||= []).push(s);
		const recent = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);

		const statEls = [
			["全部", total, "#e6edf3"],
			...STATUS_ORDER.map((s) => [STATUS_META[s].label, stats[s] || 0, STATUS_META[s].color])
		].map(([label, n, color]) => `<div class="dsh-tb-ov-stat"><div class="n" style="color:${color}">${n}</div><div class="l">${label}</div></div>`).join("");

		let wsCards;
		if (!workspaces.length) {
			wsCards = '<div class="dsh-tb-empty">（暂无工作区）</div>';
		} else {
			wsCards = workspaces.map((w) => {
				const tlist = byRepo[w.title] || [];
				const counts = STATUS_ORDER.map((s) => tlist.filter((t) => t.status === s).length);
				const pills = STATUS_ORDER.map((s, i) => counts[i] ? `<span class="dsh-tb-pill" style="color:${STATUS_META[s].color}">${STATUS_META[s].label} ${counts[i]}</span>` : "").join("");
				const sessN = (sessionsByRepo[w.title] || []).length;
				const g = gitState[w.path];
				const branch = g ? `<span class="branch">⎇ ${esc(g.branch)}</span>${g.dirty ? `<span class="branch dirty" title="${g.dirty} 个未提交文件">●${g.dirty}</span>` : ""}` : "";
				const sessList = (sessionsByRepo[w.title] || []).slice(0, 3).map((s) => `<div class="s" data-sid="${esc(s.id)}" title="打开会话 ${esc(s.id)}">▸ ${esc(s.title)}</div>`).join("");
				return `<div class="dsh-tb-ov-ws" data-repo="${esc(w.title)}">
					<h4>${esc(w.title)}</h4>
					<div class="path">${esc(w.path || "")}</div>
					<div class="meta">${pills || '<span class="dsh-tb-empty" style="padding:0">无任务</span>'}${branch}<span class="sess">会话 ${sessN}</span></div>
					${sessList ? `<div class="sesslist">${sessList}</div>` : ""}
				</div>`;
			}).join("");
		}

		const recentEls = recent.length ? recent.map((t) => {
			const st = STATUS_META[t.status] || STATUS_META.todo;
			return `<div class="dsh-tb-ov-item" data-id="${esc(t.id)}">
				<span class="dot" style="background:${st.color}"></span>
				<span class="t">${esc(t.title)}</span>
				${t.repo ? `<span class="r">${esc(t.repo)}</span>` : ""}
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
		$$(".dsh-tb-ov-item").forEach((el) => el.addEventListener("click", () => openDetail(el.dataset.id)));
	}

	// ---- render: kanban ----------------------------------------------------
	function cardHTML(t) {
		const st = STATUS_META[t.status] || STATUS_META.todo;
		const pr = PRIORITY_META[t.priority] || PRIORITY_META.medium;
		const badges = [];
		badges.push(priPill(t));
		if (t.repo) badges.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${esc(t.repo)}</span>`);
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
			${t.progress > 0 ? `<div class="dsh-tb-bar"><i style="width:${Math.min(100, t.progress)}%"></i></div>` : ""}
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
			body.innerHTML = '<div class="dsh-tb-ov"><div class="dsh-tb-empty">（暂无任务，点右上角「＋ 新建」）</div></div>';
			return;
		}
		const rows = tasks.map((t) => `<tr data-id="${esc(t.id)}">
			<td>${statusPill(t)}</td>
			<td>${priPill(t)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.title)}</div></td>
			<td>${t.repo ? `<span class="dsh-tb-pill" style="color:#79c0ff">${esc(t.repo)}</span>` : ""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.feature || "")}</div></td>
			<td>${labelPills(t)}</td>
			<td style="min-width:90px">${t.progress > 0 ? `<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100, t.progress)}%"></i></div>` : ""}</td>
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
	function fieldRow(id, label, control) {
		return `<div class="dsh-tb-field"><label for="${id}">${label}</label>${control}</div>`;
	}

	function openCreate() {
		const mask = document.createElement("div");
		mask.className = "dsh-tb-modal-mask";
		const repoOptions = workspaces.map((w) => `<option value="${esc(w.title)}">${esc(w.title)}</option>`).join("");
		mask.innerHTML = `<div class="dsh-tb-modal">
			<h3>新建任务</h3>
			${fieldRow("tb-f-title", "标题 *", '<input id="tb-f-title" placeholder="任务标题" />')}
			<div class="dsh-tb-row">
				${fieldRow("tb-f-repo", "仓库", `<select id="tb-f-repo"><option value="">（无）</option>${repoOptions}</select>`)}
				${fieldRow("tb-f-feature", "分支/feature", '<input id="tb-f-feature" placeholder="如 feat-xxx" />')}
			</div>
			<div class="dsh-tb-row">
				${fieldRow("tb-f-priority", "优先级", `<select id="tb-f-priority">${Object.entries(PRIORITY_META).map(([k, v]) => `<option value="${k}" ${k === "medium" ? "selected" : ""}>${v.label}</option>`).join("")}</select>`)}
				${fieldRow("tb-f-status", "状态", `<select id="tb-f-status">${Object.entries(STATUS_META).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("")}</select>`)}
			</div>
			${fieldRow("tb-f-labels", "标签（逗号分隔）", `<input id="tb-f-labels" placeholder="如 bug, 后端, P1" list="tb-labels-datalist" /><datalist id="tb-labels-datalist">${allLabels.map((l) => `<option value="${esc(l)}"></option>`).join("")}</datalist>`)}
			${fieldRow("tb-f-desc", "描述", '<textarea id="tb-f-desc" placeholder="需求/实现方式/验收标准…"></textarea>')}
			<div class="dsh-tb-actions">
				<button data-act="cancel">取消</button>
				<button data-act="save" class="dsh-tb-primary">创建</button>
			</div>
		</div>`;
		document.body.appendChild(mask);
		const close = () => mask.remove();
		$('[data-act="cancel"]', mask).addEventListener("click", close);
		mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
		$('[data-act="save"]', mask).addEventListener("click", async () => {
			const payload = {
				title: $("#tb-f-title", mask).value,
				repo: $("#tb-f-repo", mask).value,
				feature: $("#tb-f-feature", mask).value.trim(),
				priority: $("#tb-f-priority", mask).value,
				status: $("#tb-f-status", mask).value,
				labels: $("#tb-f-labels", mask).value.split(",").map((s) => s.trim()).filter(Boolean),
				description: $("#tb-f-desc", mask).value
			};
			if (!payload.title.trim()) { $("#tb-f-title", mask).focus(); return; }
			try {
				const { task } = await api("/tasks", { method: "POST", body: JSON.stringify(payload) });
				close();
				refreshAll();
				openDetail(task.id);
			} catch (err) { alert(`创建失败：${err.message}`); }
		});
		$("#tb-f-title", mask).focus();
	}

	// ---- detail modal ------------------------------------------------------
	async function openDetail(id) {
		const { task } = await api(`/tasks/${id}`);
		const mask = document.createElement("div");
		mask.className = "dsh-tb-modal-mask";
		const sessOptions = sessions.map((s) => `<option value="${esc(s.id)}">${esc(s.title || s.id)}${s.repo ? ` · ${esc(s.repo)}` : ""}</option>`).join("");
		mask.innerHTML = `<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${esc(task.title)}</h3>
			<div class="dsh-tb-field"><label>仓库 / 分支</label><input id="tb-d-repo" value="${esc(task.repo)}" /><input id="tb-d-feature" value="${esc(task.feature)}" placeholder="feature/分支" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>状态</label><select id="tb-d-status">${Object.entries(STATUS_META).map(([k, v]) => `<option value="${k}" ${k === task.status ? "selected" : ""}>${v.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>优先级</label><select id="tb-d-priority">${Object.entries(PRIORITY_META).map(([k, v]) => `<option value="${k}" ${k === task.priority ? "selected" : ""}>${v.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>进度 ${task.progress}%</label><input id="tb-d-progress" type="range" min="0" max="100" value="${task.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(REVIEW_META).map(([k, v]) => `<option value="${k}" ${k === task.review ? "selected" : ""}>${v}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>测试</label><select id="tb-d-test">${Object.entries(TEST_META).map(([k, v]) => `<option value="${k}" ${k === task.test ? "selected" : ""}>${v}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>标签</label><input id="tb-d-labels" value="${esc((task.labels || []).join(", "))}" placeholder="逗号分隔" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${allLabels.map((l) => `<option value="${esc(l)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>描述</label><textarea id="tb-d-desc">${esc(task.description || "")}</textarea></div>
			<div class="dsh-tb-field"><label>进展记录（${(task.notes || []).length}）</label>
				<div id="tb-d-notes">${(task.notes || []).map((n) => `<div class="dsh-tb-note"><span class="dsh-tb-note-time">${fmtTime(n.at)}</span><br/>${esc(n.text)}</div>`).join("") || '<div class="dsh-tb-note">（暂无记录）</div>'}</div>
				<textarea id="tb-d-note" placeholder="添加进展/完成情况…（Ctrl+Enter 提交）" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>关联会话（点击打开可继续）</label>
				<div id="tb-d-sessions">${(task.sessionIds || []).map((sid) => {
					const s = sessions.find((x) => x.id === sid);
					return `<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${esc(sid)}">${esc(s ? s.title : sid)}</span><button data-sid="${esc(sid)}" data-act="open" class="dsh-tb-open">打开</button><button data-sid="${esc(sid)}" data-act="unlink">解除</button></div>`;
				}).join("") || '<div class="dsh-tb-note">（未关联会话）</div>'}</div>
				<div class="dsh-tb-row" style="margin-top:6px">
					<select id="tb-d-sess-pick" style="flex:1">${sessOptions || '<option value="">（暂无会话）</option>'}</select>
					<button id="tb-d-sess-link">关联</button>
				</div>
			</div>
			<div class="dsh-tb-actions">
				<button data-act="del" class="dsh-tb-danger">删除</button>
				<button data-act="cancel">关闭</button>
				<button data-act="save" class="dsh-tb-primary dsh-tb-grow">保存</button>
			</div>
		</div>`;
		document.body.appendChild(mask);

		const state = () => ({
			repo: $("#tb-d-repo", mask).value.trim(),
			feature: $("#tb-d-feature", mask).value.trim(),
			status: $("#tb-d-status", mask).value,
			priority: $("#tb-d-priority", mask).value,
			progress: Number($("#tb-d-progress", mask).value),
			review: $("#tb-d-review", mask).value,
			test: $("#tb-d-test", mask).value,
			labels: $("#tb-d-labels", mask).value.split(",").map((s) => s.trim()).filter(Boolean),
			description: $("#tb-d-desc", mask).value
		});
		const close = () => mask.remove();
		const reload = async () => { close(); await openDetail(id); };
		const patch = async (body) => { const { task: t } = await api(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }); await refreshTasks(); return t; };

		mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
		$('[data-act="cancel"]', mask).addEventListener("click", close);
		$('[data-act="save"]', mask).addEventListener("click", async () => {
			try { await patch(state()); refreshAll(); reload(); } catch (err) { alert(`保存失败：${err.message}`); }
		});
		$('[data-act="del"]', mask).addEventListener("click", async () => {
			if (!confirm(`删除任务「${task.title}」？`)) return;
			try { await api(`/tasks/${id}`, { method: "DELETE" }); close(); await refreshAll(); } catch (err) { alert(`删除失败：${err.message}`); }
		});
		$("#tb-d-note", mask).addEventListener("keydown", async (e) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				const text = $("#tb-d-note", mask).value.trim();
				if (!text) return;
				await api(`/tasks/${id}/notes`, { method: "POST", body: JSON.stringify({ text }) });
				await refreshTasks();
				reload();
			}
		});
		$("#tb-d-sess-link", mask).addEventListener("click", async () => {
			const sid = $("#tb-d-sess-pick", mask).value;
			if (!sid) return;
			await api(`/tasks/${id}/sessions`, { method: "POST", body: JSON.stringify({ sessionId: sid, action: "link" }) });
			await refreshTasks();
			reload();
		});
		$$("#tb-d-sessions [data-act]", mask).forEach((btn) => btn.addEventListener("click", async () => {
			const sid = btn.dataset.sid;
			if (btn.dataset.act === "open") openSession(sid);
			else {
				await api(`/tasks/${id}/sessions`, { method: "POST", body: JSON.stringify({ sessionId: sid, action: "unlink" }) });
				await refreshTasks();
				reload();
			}
		}));
	}

	// ---- bootstrap ---------------------------------------------------------
	mountView();
	placeEntry();
	new MutationObserver(() => { mountView(); placeEntry(); })
		.observe(document.body, { childList: true, subtree: true });
	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.shiftKey && (e.key === "B" || e.key === "b")) {
			e.preventDefault();
			toggle();
		}
	});
	// When the board is open, any click on a left-sidebar item other than the
	// taskboard entry itself switches back to the conversation (no need to
	// click the entry again to collapse).
	document.addEventListener("click", (e) => {
		if (!isOpen()) return;
		const target = e.target;
		if (!(target instanceof Element)) return;
		if (target.closest(`[${ENTRY_ATTR}]`)) return;
		if (target.closest('[data-pane="sidebar"], [class*="sidebarCol"]')) toggle(false);
	});
})();

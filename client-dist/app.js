(()=>{(()=>{if(window.__dshTaskboardLoaded)return;window.__dshTaskboardLoaded=!0;let zt="/taskboard/api",x={todo:{label:"\u5F85\u529E",color:"#8b949e"},in_progress:{label:"\u8FDB\u884C\u4E2D",color:"#3478f6"},in_review:{label:"\u8BC4\u5BA1\u4E2D",color:"#bc8cff"},blocked:{label:"\u5DF2\u963B\u585E",color:"#f85149"},done:{label:"\u5DF2\u5B8C\u6210",color:"#3fb950"}},P=["todo","in_progress","in_review","blocked","done"],N={low:{label:"\u4F4E",color:"#8b949e"},medium:{label:"\u4E2D",color:"#d29922"},high:{label:"\u9AD8",color:"#e3862e"},urgent:{label:"\u7D27\u6025",color:"#f85149"}},st={none:"\u2014",pending:"\u8BC4\u5BA1\u5F85\u5904\u7406",approved:"\u8BC4\u5BA1\u901A\u8FC7",rejected:"\u8BC4\u5BA1\u9A73\u56DE"},at={none:"\u2014",pending:"\u6D4B\u8BD5\u5F85\u5904\u7406",passed:"\u6D4B\u8BD5\u901A\u8FC7",failed:"\u6D4B\u8BD5\u5931\u8D25"},lt=["#79c0ff","#d2a8ff","#7ee787","#ffa657","#ff7b72","#f2cc60","#a5d6ff","#ffd7a8"],C="data-dsh-taskboard-active",A="data-dsh-taskboard-entry",_="data-dsh-taskboard-view",Y="data-dsh-ssh-active",jt='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>',r=(t,e=document)=>e.querySelector(t),y=(t,e=document)=>[...e.querySelectorAll(t)],l=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),H=t=>{let e=String(t||"").split("/").filter(Boolean);return e.length?e[e.length-1]:String(t||"")},At=t=>{let e=0;for(let s of String(t))e=e*31+s.charCodeAt(0)>>>0;return lt[e%lt.length]},R=t=>{if(!t)return"";let e=new Date(t),s=Date.now()-t;return s<6e4?"\u521A\u521A":s<36e5?`${Math.floor(s/6e4)} \u5206\u949F\u524D`:s<864e5?`${Math.floor(s/36e5)} \u5C0F\u65F6\u524D`:`${e.getMonth()+1}/${e.getDate()} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},z=[],M=[],q=[],ot=[],T={q:"",repo:"",priority:"",status:"",label:""},I="overview",W={};async function g(t,e={}){let s=await fetch(zt+t,{headers:{"content-type":"application/json"},...e}),a=await s.json().catch(()=>({}));if(!s.ok)throw new Error(a.error||`HTTP ${s.status}`);return a}let Mt=`
<style>
/* \u53EA\u5728\u4EFB\u52A1\u770B\u677F\u6253\u5F00\u65F6\u624D\u628A\u5BF9\u8BDD\u5217\u8BBE\u4E3A\u5B9A\u4F4D\u951A\u70B9\uFF1B\u6B63\u5E38\u5BF9\u8BDD\u65F6\u4E0D\u5E72\u9884\u65B0\u7248\u5E03\u5C40\uFF0C
   \u907F\u514D\u7EDD\u5BF9\u5B9A\u4F4D\u6D6E\u5C42\uFF08\u542B\u8F93\u5165\u533A\u76F8\u5173\uFF09\u7684\u5305\u542B\u5757\u88AB\u6539\u53D8\u5BFC\u81F4\u8F93\u5165\u88AB\u906E\u6321 */
html[${C}] [data-pane='conversation'],
html[${C}] [class*='centerCol'] { position: relative; }
[${_}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${C}]:not([${Y}]) [data-pane='conversation'] > div[${_}],
html[${C}]:not([${Y}]) [class*='centerCol'] > div[${_}] {
  display: flex !important; flex-direction: column;
}
html[${C}]:not([${Y}]) [data-pane='conversation'] > :not([${_}]),
html[${C}]:not([${Y}]) [class*='centerCol'] > :not([${_}]) {
  display: none !important;
}
[${A}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap; transition: background .15s, color .15s;
}
[${A}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${A}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${A}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${A}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${A}][data-icon-only] > span:not(:first-child) { display: none; }

/* \u4FA7\u8FB9\u680F\u300C\u6700\u65B0\u5BF9\u8BDD\u300D\u5E38\u9A7B\u5C0F\u7EC4\u4EF6\uFF08\u9489\u5728 New Session \u4E0B\u65B9\u3001\u4F1A\u8BDD\u5217\u8868\u4E4B\u4E0A\uFF09 */
#dsh-recent { border-top: 1px solid var(--dsw-alias-border-l2,#2a3138); }
.dsh-recent-head{display:flex;align-items:center;gap:6px;padding:5px 10px;font-size:11.5px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);cursor:pointer;letter-spacing:.2px;user-select:none}
.dsh-recent-head .arrow{font-size:8px;transition:transform .15s;color:#768390}
.dsh-recent.collapsed .dsh-recent-head .arrow{transform:rotate(-90deg)}
.dsh-recent-head .title{flex:1}
.dsh-recent-head .cnt{font-weight:600;font-size:10.5px;color:#79c0ff;background:#79c0ff14;border-radius:9px;padding:0 7px;flex:none}
.dsh-recent-refresh{background:transparent;border:0;color:var(--dsw-alias-label-secondary,#9aa7b4);cursor:pointer;font-size:12px;padding:0 2px;line-height:1;display:inline-flex}
.dsh-recent-refresh:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-recent-body{display:flex;flex-direction:column;gap:1px;padding:0 6px 6px;overflow:hidden}
/* \u5355\u4E2A\u4F1A\u8BDD\u884C\uFF1A\u5BF9\u9F50\u539F\u751F\u4F1A\u8BDD\u884C \u2014\u2014 \u5355\u884C [\u72B6\u6001\u70B9][\u6807\u9898(\u5355\u884C ellipsis)][\u65F6\u95F4] */
.dsh-recent-row{display:flex;align-items:center;gap:8px;height:32px;box-sizing:border-box;padding:5px 8px;border-radius:8px;cursor:pointer;min-width:0;transition:background .12s}
.dsh-recent-row:hover{background:var(--dsw-alias-bg-layer-2,#1b2127)}
/* \u72B6\u6001\u70B9\uFF08slot\uFF09\uFF1A\u8FD0\u884C\u4E2D\u9EC4(\u547C\u5438) / \u6709\u672A\u8BFB\u5B8C\u6210\u7684\u56DE\u590D\u7EFF(\u67D4\u548C\u5149\u6655) / \u5DF2\u8BFB\u6216\u65E0\u65B0\u5185\u5BB9\u65E0\u70B9 */
.dsh-recent-row .slot{flex:none;width:10px;display:flex;align-items:center;justify-content:center}
.dsh-recent-row .dot{width:8px;height:8px;border-radius:50%}
.dsh-recent-row .dot.run{background:#f2cc60;box-shadow:0 0 5px #f2cc60aa;animation:dsh-tb-blink 1.4s ease-in-out infinite}
.dsh-recent-row .dot.idle{background:#3fb950;box-shadow:0 0 4px #3fb95066}
.dsh-recent-row .title{flex:1;min-width:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary,#e6edf3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-recent-row .sid{flex:none;font-size:9.5px;color:var(--dsw-alias-label-tertiary,#768390);letter-spacing:.2px}
.dsh-recent-row .time{flex:none;font-size:10.5px;color:var(--dsw-alias-label-secondary,#9aa7b4)}
/* \u5F53\u524D\u6253\u5F00\u7684\u4F1A\u8BDD\uFF1A\u53BB\u6389\u72B6\u6001\u70B9\uFF0C\u884C\u7528\u4E0E\u539F\u751F\u300C\u9009\u4E2D\u300D\u4E00\u81F4\u7684\u8F7B\u5FAE\u5E95\u8272\uFF08\u65E0\u8FB9\u6846\u3001\u65E0\u7F29\u653E\uFF09 */
.dsh-recent-row.cur{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06))}
.dsh-recent-row.cur .dot{display:none}
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
</style>`;document.documentElement.insertAdjacentHTML("beforeend",Mt);let Ot=`
<div id="dsh-tb-view" ${_}="">
  <div class="dsh-tb-head">
    <div class="dsh-tb-title">\u4EFB\u52A1\u9762\u677F</div>
    <div class="dsh-tb-tabs">
      <button class="dsh-tb-tab" data-tb-view="overview">\u6982\u89C8</button>
      <button class="dsh-tb-tab" data-tb-view="kanban">\u770B\u677F</button>
      <button class="dsh-tb-tab" data-tb-view="list">\u5217\u8868</button>
    </div>
    <div class="dsh-tb-head-actions">
      <button id="dsh-tb-refresh" title="\u5237\u65B0">\u27F3</button>
    </div>
  </div>
  <div class="dsh-tb-toolbar" id="dsh-tb-toolbar">
    <input id="dsh-tb-search" placeholder="\u641C\u7D22\u6807\u9898/\u4ED3\u5E93/feature/\u6807\u7B7E\u2026" />
    <select id="dsh-tb-repo-filter"><option value="">\u5168\u90E8\u4ED3\u5E93</option></select>
    <select id="dsh-tb-priority-filter"><option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option></select>
    <select id="dsh-tb-status-filter"><option value="">\u5168\u90E8\u72B6\u6001</option></select>
    <select id="dsh-tb-label-filter"><option value="">\u5168\u90E8\u6807\u7B7E</option></select>
    <span id="dsh-tb-count" class="dsh-tb-count"></span>
    <button id="dsh-tb-new" title="\u65B0\u5EFA\u4EFB\u52A1" class="dsh-tb-newbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</button>
  </div>
  <div class="dsh-tb-body" id="dsh-tb-body"></div>
</div>`;function ct(){let t=document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');return t===null?void 0:t.querySelector('[class*="logoRow"]')?.parentElement??t.firstElementChild}function bt(t){let e=t.querySelector('button[class*="newSession"]');if(e!==null)return e;for(let s of t.children)if(s.tagName==="BUTTON")return s}function pt(){return document.querySelector('[data-pane="conversation"]')??document.querySelector('[class*="centerCol"]')??void 0}function ht(t){return[...t.classList].some(e=>/collapsed/i.test(e))}let m=null,V=null;function F(){return document.documentElement.hasAttribute(C)}function ft(){m!==null&&(F()?m.setAttribute("data-active",""):m.removeAttribute("data-active"))}function U(t){let e=t!==void 0?t:!F();e&&document.documentElement.removeAttribute(Y),e?document.documentElement.setAttribute(C,""):document.documentElement.removeAttribute(C),ft(),e&&B()}function ut(){if(V!==null)return;let t=pt();t!==void 0&&(V=document.createElement("div"),V.setAttribute(_,""),V.innerHTML=Ot,t.appendChild(V),Dt())}function vt(){let t=ct();if(t===void 0||(m===null&&(m=document.createElement("button"),m.type="button",m.setAttribute(A,""),m.innerHTML=`<span>${jt}</span><span>\u4EFB\u52A1\u770B\u677F</span>`,m.title="\u4EFB\u52A1\u770B\u677F",m.addEventListener("click",()=>U()),ft()),m.parentElement===t))return;let e=bt(t),s=e?.closest('[class*="logoRow"]'),a=s!=null&&s.parentElement===t?s:e;t.insertBefore(m,a?.nextElementSibling??null),(()=>{m!==null&&(ht(t)?m.setAttribute("data-icon-only",""):m.removeAttribute("data-icon-only"))})()}let _t=15,w=null,L=null,D=!1,gt=null;function It(){return g("/sessions").then(t=>t.sessions||[]).catch(()=>M)}function xt(t){return t.title&&String(t.title).trim()?String(t.title).trim():String(t.id)}function Pt(t){return String(t).replace(/^session-/,"").slice(0,8)}function Nt(t){let e=new Set,s=[];for(let a of[...t||[]].filter(i=>i&&i.updatedAt).sort((i,d)=>(d.updatedAt||0)-(i.updatedAt||0)))if(!e.has(a.id)&&(e.add(a.id),s.push(a),s.length>=_t))break;return s}function wt(t){return`dsh-tb-read:${t}`}function Ht(t){try{return Number(localStorage.getItem(wt(t)))||0}catch{return 0}}function Rt(t){try{localStorage.setItem(wt(t),String(Date.now()))}catch{}}function rt(t){if(L===null)return;let e=Nt(t),s=r("#dsh-recent-cnt");if(s&&(s.textContent=String(e.length)),!e.length){L.innerHTML='<div class="dsh-recent-empty">\uFF08\u6682\u65E0\u6700\u8FD1\u4F1A\u8BDD\uFF09</div>';return}let a=Q(),i=new Map;for(let d of e){let c=xt(d);i.set(c,(i.get(c)||0)+1)}L.innerHTML=e.map(d=>{let c=xt(d),v=(i.get(c)||0)>1,b=d.id===a,h="";return d.running?h='<span class="dot run"></span>':d.updatedAt&&d.updatedAt>Ht(d.id)&&(h='<span class="dot idle"></span>'),`<div class="dsh-recent-row${b?" cur":""}" data-sid="${l(d.id)}" title="\u6253\u5F00\u5E76\u7EE7\u7EED\uFF1A${l(c)}\uFF08${l(d.id)}\uFF09">
				<span class="slot">${h}</span>
				<span class="title">${l(c)}</span>
				${v?`<span class="sid">${l(Pt(d.id))}</span>`:""}
				<span class="time">${R(d.updatedAt)}</span>
			</div>`}).join(""),y(".dsh-recent-row",L).forEach(d=>d.addEventListener("click",()=>{Z(d.dataset.sid)}))}function X(){It().then(t=>rt(t)).catch(()=>rt(M))}function mt(){let t=ct();if(t===void 0||(w===null&&(w=document.createElement("div"),w.id="dsh-recent",w.className="dsh-recent",w.innerHTML=`
				<div class="dsh-recent-head" id="dsh-recent-head">
					<span class="arrow">\u25BC</span><span class="title">\u6700\u65B0\u5BF9\u8BDD</span>
					<span class="cnt" id="dsh-recent-cnt">0</span>
					<button class="dsh-recent-refresh" id="dsh-recent-refresh" title="\u5237\u65B0">\u27F3</button>
				</div>
				<div class="dsh-recent-body" id="dsh-recent-body"></div>`,L=r("#dsh-recent-body",w),r("#dsh-recent-head",w).addEventListener("click",()=>{D=!D,w&&w.classList.toggle("collapsed",D),L&&(L.style.display=D?"none":"")}),r("#dsh-recent-refresh",w).addEventListener("click",i=>{i.stopPropagation(),X()}),rt(M),X()),w.parentElement===t))return;let e=m??bt(t);t.insertBefore(w,e?.nextElementSibling??null),L&&(L.style.maxHeight="46vh",L.style.overflowY="auto"),(()=>{L&&(L.style.display=D?"none":""),w&&w.classList.toggle("collapsed",D)})(),(()=>{w&&(ht(t)?w.style.display="none":w.style.display="")})()}function qt(){gt===null&&(gt=setInterval(()=>{document.hidden||X()},6e4))}function Dt(){r("#dsh-tb-new")?.addEventListener("click",St),r("#dsh-tb-refresh")?.addEventListener("click",()=>B()),r("#dsh-tb-search")?.addEventListener("input",()=>{T.q=r("#dsh-tb-search").value.trim(),k()}),r("#dsh-tb-repo-filter")?.addEventListener("change",()=>{T.repo=r("#dsh-tb-repo-filter").value,k()}),r("#dsh-tb-priority-filter")?.addEventListener("change",()=>{T.priority=r("#dsh-tb-priority-filter").value,k()}),r("#dsh-tb-status-filter")?.addEventListener("change",()=>{T.status=r("#dsh-tb-status-filter").value,k()}),r("#dsh-tb-label-filter")?.addEventListener("change",()=>{T.label=r("#dsh-tb-label-filter").value,k()}),y(".dsh-tb-tab").forEach(t=>t.addEventListener("click",()=>{I=t.dataset.tbView,tt()}))}async function k(){let t=new URLSearchParams;for(let s of["q","repo","priority","status","label"])T[s]&&t.set(s,T[s]);z=(await g(`/tasks?${t}`)).tasks||[],tt()}async function Bt(){try{let[t,e]=await Promise.all([g("/sessions"),g("/workspaces")]);M=t.sessions||[],q=e.workspaces||[];let s=r("#dsh-tb-repo-filter");if(s){let b=s.value;s.innerHTML='<option value="">\u5168\u90E8\u4ED3\u5E93</option>'+q.map(h=>`<option value="${l(h.path)}" title="${l(h.path)}">${l(H(h.path))}</option>`).join(""),b&&[...s.options].some(h=>h.value===b)&&(s.value=b)}let a=await g("/tasks").catch(()=>({tasks:[]})),i=new Set;for(let b of a.tasks||[])for(let h of b.labels||[])i.add(h);ot=[...i].sort();let d=r("#dsh-tb-label-filter");if(d){let b=d.value;d.innerHTML='<option value="">\u5168\u90E8\u6807\u7B7E</option>'+ot.map(h=>`<option value="${l(h)}">${l(h)}</option>`).join(""),b&&[...d.options].some(h=>h.value===b)&&(d.value=b)}let c=r("#dsh-tb-priority-filter");c&&!c.options.length&&(c.innerHTML='<option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>'+Object.entries(N).map(([b,h])=>`<option value="${b}">${h.label}</option>`).join(""));let v=r("#dsh-tb-status-filter");v&&!v.options.length&&(v.innerHTML='<option value="">\u5168\u90E8\u72B6\u6001</option>'+Object.entries(x).map(([b,h])=>`<option value="${b}">${h.label}</option>`).join(""))}catch{}}async function Jt(){for(let t of q)if(!(!t.path||W[t.path]!==void 0))try{let e=await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(t.path)}`).then(s=>s.json());W[t.path]=e.git?{branch:e.branch?.name||"(detached)",dirty:(e.files||[]).length}:null}catch{W[t.path]=null}}function B(){return Bt().then(()=>Jt()).then(k).catch(k)}function yt(t){return(t.labels||[]).map(e=>`<span class="dsh-tb-pill" style="color:${At(e)}">${l(e)}</span>`).join("")}function Yt(t){let e=x[t.status]||x.todo;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function $t(t){let e=N[t.priority]||N.medium;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function Vt(t){let e=(s,a,i)=>`<button type="button" class="dsh-tb-statusbtn ${i||""}" data-status="${s}">${a}</button>`;switch(t.status){case"todo":return`${e("in_progress","\u25B6 \u5F00\u59CB\u6267\u884C")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_progress":return`${e("in_review","\u63D0\u4EA4\u8BC4\u5BA1")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_review":return`${e("done","\u2705 \u786E\u8BA4\u5B8C\u6210","primary")} ${e("in_progress","\u21A9 \u9000\u56DE\u4FEE\u6539")}`;case"done":return`${e("in_progress","\u21A9 \u91CD\u65B0\u6253\u5F00","ghost")}`;case"blocked":return`${e("in_progress","\u25B6 \u6062\u590D\u8FDB\u884C")}`;default:return""}}let G=null;function Kt(){let t=new Set,e=document.querySelectorAll('[class*="centerCol"], [class*="sidebarCol"], [class*="frame"], [class*="App"], body > div');for(let s of e){for(let a of Object.keys(s)){if(!a.startsWith("__reactFiber$")&&!a.startsWith("__reactContainer$"))continue;let i=s[a];for(;i&&i.return;)i=i.return;i&&t.add(i)}if(t.size>0)break}return[...t]}function kt(){if(G&&G.open)return G;let t={open:null,startSession:null},e=Kt(),s=0;for(;e.length>0&&s++<4e4;){let a=e.shift(),i=a.memoizedProps;if(i!==null&&typeof i=="object"){t.open===null&&typeof i.open=="function"&&(t.open=i.open),t.startSession===null&&typeof i.startSession=="function"&&(t.startSession=i.startSession);let d=i.sessions??i.sessionService;if(d!==null&&typeof d=="object"&&(t.open===null&&typeof d.open=="function"&&(t.open=d.open),t.startSession===null&&typeof d.start=="function"&&(t.startSession=d.start)),t.open!==null&&t.startSession!==null)break}a.child&&e.push(a.child),a.sibling&&e.push(a.sibling)}return G=t,t}function Wt(){return kt().open}function Q(){try{let t=localStorage.getItem("dsh.sessions.current");if(t===null)return null;let e=JSON.parse(t);return typeof e?.sessionId=="string"?e.sessionId:null}catch{return null}}function Ft(t,e=4e3){let s=Date.now()+e;return new Promise(a=>{let i=()=>{let d=Q();if(d!==null&&d!==t)return a(d);if(Date.now()>s)return a(null);setTimeout(i,120)};i()})}function Ut(){let t=kt();if(typeof t.startSession=="function")try{return t.startSession(),!0}catch{}let e=document.querySelector('button[class*="newSession"]');return e!==null?(e.click(),!0):!1}function Et(){let t=[...document.querySelectorAll('[class*="_handle"], [class*="handle"]')].find(b=>b.offsetParent!==null&&getComputedStyle(b).cursor==="col-resize");if(!t)return!1;let e=t.getBoundingClientRect(),s=Math.round(e.left+e.width/2),a=Math.round(e.top+Math.min(200,e.height/2)),i=Element.prototype,d=i.setPointerCapture,c=i.hasPointerCapture,v=i.releasePointerCapture;try{i.setPointerCapture=function(){},i.hasPointerCapture=function(){return!0},i.releasePointerCapture=function(){};let b=(h,o)=>new PointerEvent(h,{bubbles:!0,cancelable:!0,composed:!0,pointerId:1,pointerType:"mouse",isPrimary:!0,buttons:1,clientX:o,clientY:a});return t.dispatchEvent(b("pointerdown",s)),t.dispatchEvent(b("pointermove",s+1)),t.dispatchEvent(b("pointerup",s+1)),!0}catch{return!1}finally{i.setPointerCapture=d,i.hasPointerCapture=c,i.releasePointerCapture=v}}function Z(t){Rt(t);try{let e=Wt();if(typeof e=="function"){try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}e(t),F()&&U(!1),y(".dsh-tb-modal-mask").forEach(s=>s.remove()),X();return}}catch{}try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t})),localStorage.setItem("dsh-taskboard.unstick",String(Date.now()))}catch{}location.reload()}async function Lt(t){let e=Q();if(Ut()){let s=await Ft(e,4500);if(s!==null){try{await g(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:s,action:"link"})})}catch{}return await B(),j("\u2713 \u5DF2\u65B0\u5EFA\u5BF9\u8BDD\u5E76\u7ED1\u5B9A\u5230\u8BE5\u4EFB\u52A1"),!0}}try{let{sessionId:s}=await g(`/tasks/${t}/session`,{method:"POST",body:"{}"});return Z(s),!0}catch(s){return alert(`\u65B0\u5EFA\u5BF9\u8BDD\u5931\u8D25\uFF1A${s.message}`),!1}}function j(t){let e=document.createElement("div");e.className="dsh-tb-toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.remove(),1600)}function Xt(){var u;let t={};for(let n of P)t[n]=0;let e={};for(let n of z){t[n.status]!==void 0&&t[n.status]++;let f=n.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(e[f]||(e[f]=[])).push(n)}let s=z.length,a=t.done||0,i=s?Math.round(a/s*100):0,d={};for(let n of M)n.repo&&(d[u=n.repo]||(d[u]=[])).push(n);let c=[...z].sort((n,f)=>f.updatedAt-n.updatedAt).slice(0,10),b='<div class="dsh-tb-ov-stat dsh-tb-ov-add" id="dsh-tb-ov-new" title="\u65B0\u5EFA\u4EFB\u52A1"><div class="dsh-tb-ov-addbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</div></div>'+[["\u5168\u90E8\u4EFB\u52A1",s,"#e6edf3",""],...P.map(n=>[x[n].label,t[n]||0,x[n].color,n]),["\u5B8C\u6210\u7387",`${i}%`,"#3fb950",null]].map(([n,f,E,$])=>{let it=n==="\u5B8C\u6210\u7387"?i:s?Math.round(f/s*100):0,et=$!==null?" dsh-tb-ov-stat-click":"",dt=$===""?"\u67E5\u770B\u5168\u90E8\u4EFB\u52A1":$?`\u67E5\u770B\u300C${n}\u300D\u7684\u4EFB\u52A1`:"";return`<div class="dsh-tb-ov-stat${et}" ${$!==null?`data-status="${$}"`:""} title="${dt}"><div class="n" style="color:${E}">${f}</div><div class="l">${n}</div><div class="mini"><i style="width:${it}%;background:${E}"></i></div></div>`}).join(""),h;q.length?h=q.map(n=>{let f=e[n.path]||e[n.title]||[],E=P.map(S=>f.filter(O=>O.status===S).length),$=f.length,it=E[P.indexOf("done")]||0,et=$?Math.round(it/$*100):0,dt=$?P.map((S,O)=>E[O]?`<i style="width:${Math.round(E[O]/$*100)}%;background:${x[S].color}" title="${x[S].label} ${E[O]}"></i>`:"").join(""):"",ae=P.map((S,O)=>E[O]?`<span class="st"><i class="dot" style="background:${x[S].color}"></i>${x[S].label} <b>${E[O]}</b></span>`:"").join(""),oe=(d[n.path]||d[n.title]||[]).length,K=W[n.path],re=K?`<span class="branch">\u2387 ${l(K.branch)}</span>${K.dirty?`<span class="branch dirty" title="${K.dirty} \u4E2A\u672A\u63D0\u4EA4\u6587\u4EF6">\u25CF${K.dirty}</span>`:""}`:"",Ct=(d[n.path]||d[n.title]||[]).slice(0,3).map(S=>`<div class="s" data-sid="${l(S.id)}" title="\u6253\u5F00\u4F1A\u8BDD ${l(S.id)}">\u25B8 ${l(S.title)}</div>`).join("");return`<div class="dsh-tb-ov-ws" data-repo="${l(n.path)}">
					<div class="ws-head"><h4>${l(n.title)}</h4><span class="ws-total">${$} \u4E2A\u4EFB\u52A1</span></div>
					<div class="path">${l(n.path||"")}</div>
					${$?`<div class="stack">${dt}</div><div class="ws-stats">${ae}</div>`:'<div class="ws-stats" style="color:var(--dsw-alias-label-secondary,#9aa7b4)">\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA</div>'}
					<div class="comp"><span class="pct">\u5B8C\u6210\u7387 ${et}%</span><div class="track"><i style="width:${et}%"></i></div></div>
					<div class="meta">${re}<span class="sess">\u4F1A\u8BDD ${oe}</span></div>
					${Ct?`<div class="sesslist">${Ct}</div>`:""}
				</div>`}).join(""):h='<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5DE5\u4F5C\u533A\uFF09</div>';let o=c.length?c.map(n=>{let f=x[n.status]||x.todo;return`<div class="dsh-tb-ov-item" data-id="${l(n.id)}">
				<span class="dot" style="background:${f.color}"></span>
				<span class="t">${l(n.title)}</span>
				${n.repo?`<span class="r">${l(H(n.repo))}</span>`:""}
				<span class="tm">${R(n.updatedAt)}</span>
			</div>`}).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF09</div>',p=r("#dsh-tb-body");p&&(p.innerHTML=`<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${b}</div>
			<div class="dsh-tb-ov-sec">\u5DE5\u4F5C\u533A\u5185\u5BB9</div>
			<div class="dsh-tb-ov-grid">${h}</div>
			<div class="dsh-tb-ov-sec">\u6700\u8FD1\u66F4\u65B0</div>
			<div class="dsh-tb-ov-recent">${o}</div>
		</div>`,r("#dsh-tb-ov-new")?.addEventListener("click",St),y(".dsh-tb-ov-stat[data-status]").forEach(n=>n.addEventListener("click",()=>{T.status=n.dataset.status,I="list",tt(),k()})),y(".dsh-tb-ov-ws").forEach(n=>n.addEventListener("click",()=>{T.repo=n.dataset.repo;let f=r("#dsh-tb-repo-filter");f&&(f.value=T.repo),I="kanban",tt(),k()})),y(".dsh-tb-ov-ws .s").forEach(n=>n.addEventListener("click",f=>{f.stopPropagation(),Z(n.dataset.sid)})),y(".dsh-tb-ov-item").forEach(n=>n.addEventListener("click",()=>{n.dataset.id&&J(n.dataset.id)})))}function Gt(t){let e=x[t.status]||x.todo,s=N[t.priority]||N.medium,a=[];a.push($t(t)),t.status==="in_review"&&a.push('<span class="dsh-tb-pill" style="color:#bc8cff;font-weight:600">\u25C9 \u5F85 review</span>'),t.repo&&a.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${l(H(t.repo))}</span>`),t.feature&&a.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${l(t.feature)}</span>`),a.push(yt(t)),t.review&&t.review!=="none"&&a.push(`<span class="dsh-tb-pill" style="color:${t.review==="approved"?"#3fb950":t.review==="rejected"?"#f85149":"#d29922"}">${st[t.review]}</span>`),t.test&&t.test!=="none"&&a.push(`<span class="dsh-tb-pill" style="color:${t.test==="passed"?"#3fb950":t.test==="failed"?"#f85149":"#d29922"}">${at[t.test]}</span>`);let i=[];return t.sessionIds?.length&&i.push(`<span>\u4F1A\u8BDD ${t.sessionIds.length}</span>`),t.notes?.length&&i.push(`<span>\u8BC4\u8BBA ${t.notes.length}</span>`),i.push(`<span>${R(t.updatedAt)}</span>`),`<div class="dsh-tb-card" data-id="${l(t.id)}" style="border-left:3px solid ${e.color}">
			<div class="dsh-tb-card-title">${l(t.title)}</div>
			<div class="dsh-tb-card-meta">${a.join("")}</div>
			${t.displayProgress>0?`<div class="dsh-tb-bar"><i style="width:${Math.min(100,t.displayProgress)}%"></i></div>`:""}
			<div class="dsh-tb-card-foot">${i.join(" \xB7 ")}</div>
		</div>`}function Qt(){let t=r("#dsh-tb-body"),e=r("#dsh-tb-count");if(!t)return;t.innerHTML='<div class="dsh-tb-columns"></div>';let s=r(".dsh-tb-columns",t);e&&(e.textContent=`${z.length} \u4E2A\u4EFB\u52A1`);for(let[a,i]of Object.entries(x)){let d=document.createElement("div");d.className="dsh-tb-col";let c=z.filter(b=>b.status===a);d.innerHTML=`<div class="dsh-tb-col-head">${i.label} <b>${c.length}</b></div><div class="dsh-tb-col-body"></div>`;let v=r(".dsh-tb-col-body",d);c.length?c.forEach(b=>v.insertAdjacentHTML("beforeend",Gt(b))):v.innerHTML='<div class="dsh-tb-empty">\u2014</div>',s.appendChild(d)}y(".dsh-tb-card",s).forEach(a=>a.addEventListener("click",()=>J(a.dataset.id)))}function Zt(){let t=r("#dsh-tb-body"),e=r("#dsh-tb-count");if(!t)return;if(e&&(e.textContent=`${z.length} \u4E2A\u4EFB\u52A1`),!z.length){t.innerHTML='<div class="dsh-tb-ov"><div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA\uFF09</div></div>';return}let s=z.map(a=>`<tr data-id="${l(a.id)}">
			<td>${Yt(a)}</td>
			<td>${$t(a)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l(a.title)}</div></td>
			<td>${a.repo?`<span class="dsh-tb-pill" style="color:#79c0ff">${l(H(a.repo))}</span>`:""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l(a.feature||"")}</div></td>
			<td>${yt(a)}</td>
			<td style="min-width:90px">${a.displayProgress>0?`<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100,a.displayProgress)}%"></i></div>`:""}</td>
			<td>${a.review!=="none"?`<span class="dsh-tb-pill" style="color:${a.review==="approved"?"#3fb950":a.review==="rejected"?"#f85149":"#d29922"}">${st[a.review]}</span>`:""}</td>
			<td>${a.test!=="none"?`<span class="dsh-tb-pill" style="color:${a.test==="passed"?"#3fb950":a.test==="failed"?"#f85149":"#d29922"}">${at[a.test]}</span>`:""}</td>
			<td style="white-space:nowrap">${R(a.updatedAt)}</td>
		</tr>`).join("");t.innerHTML=`<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>\u72B6\u6001</th><th>\u4F18\u5148\u7EA7</th><th>\u4EFB\u52A1</th><th>\u4ED3\u5E93</th><th>\u5206\u652F/feature</th><th>\u6807\u7B7E</th><th>\u8FDB\u5EA6</th><th>Review</th><th>\u6D4B\u8BD5</th><th>\u66F4\u65B0</th></tr></thead>
				<tbody>${s}</tbody>
			</table>
		</div>`,y("tr[data-id]",t).forEach(a=>a.addEventListener("click",()=>J(a.dataset.id)))}function tt(){y(".dsh-tb-tab").forEach(e=>{e.dataset.tbView===I?e.classList.add("dsh-tb-tab-on"):e.classList.remove("dsh-tb-tab-on")});let t=r("#dsh-tb-toolbar");t&&(t.style.display=I==="overview"?"none":"flex"),I==="kanban"?Qt():I==="list"?Zt():Xt()}function St(){let t=document.createElement("div");t.className="dsh-tb-modal-mask";let e=q.map(c=>`<option value="${l(c.path)}" title="${l(c.path)}">${l(c.path)}</option>`).join(""),s=(c,v)=>{r(c,t)?.classList.add("err"),v&&(r(v,t).hidden=!1)},a=()=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>\u65B0\u5EFA\u4EFB\u52A1</h3>
				<div class="dsh-tb-field">
					<label for="tb-f-title">\u6807\u9898 *</label>
					<input id="tb-f-title" placeholder="\u4E00\u53E5\u8BDD\u8BF4\u660E\u8981\u505A\u4EC0\u4E48" />
					<div class="dsh-tb-hint" id="tb-hint-title" hidden>\u8BF7\u586B\u5199\u4EFB\u52A1\u6807\u9898</div>
				</div>
				<div class="dsh-tb-row">
					<div class="dsh-tb-field">
						<label for="tb-f-repo">\u4ED3\u5E93\u76EE\u5F55 *</label>
						<select id="tb-f-repo"><option value="" disabled selected>\u8BF7\u9009\u62E9\u5DE5\u4F5C\u533A\u76EE\u5F55\uFF08\u65B0\u5EFA\u7684\u5BF9\u8BDD\u4F1A\u6302\u5230\u8FD9\u4E2A\u5DE5\u4F5C\u533A\uFF09</option>${e}</select>
						<div class="dsh-tb-hint" id="tb-hint-repo" hidden>\u8BF7\u9009\u62E9\u4EFB\u52A1\u6240\u5C5E\u7684\u5DE5\u4F5C\u533A\u76EE\u5F55</div>
					</div>
					<div class="dsh-tb-field">
						<label for="tb-f-feature">\u5206\u652F / feature</label>
						<input id="tb-f-feature" placeholder="\u5982 feat-xxx" />
					</div>
				</div>
				<div class="dsh-tb-field">
					<label for="tb-f-desc">\u63CF\u8FF0</label>
					<textarea id="tb-f-desc" placeholder="\u9700\u6C42\u80CC\u666F / \u5B9E\u73B0\u65B9\u5F0F / \u9A8C\u6536\u6807\u51C6\u2026"></textarea>
				</div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="save" class="dsh-tb-primary">\u521B\u5EFA\u4EFB\u52A1</button>
				</div>
			</div>`,r("#tb-f-title",t).addEventListener("input",()=>{r("#tb-f-title",t).classList.remove("err"),r("#tb-hint-title",t).hidden=!0}),r("#tb-f-repo",t).addEventListener("change",()=>{r("#tb-f-repo",t).classList.remove("err"),r("#tb-hint-repo",t).hidden=!0}),r('[data-act="cancel"]',t).addEventListener("click",d),r('[data-act="save"]',t).addEventListener("click",async()=>{let c=r("#tb-f-title",t).value.trim(),v=r("#tb-f-repo",t).value;r("#tb-hint-title",t).hidden=!0,r("#tb-hint-repo",t).hidden=!0,y(".err",t).forEach(h=>h.classList.remove("err"));let b=!0;if(c||(s("#tb-f-title","#tb-hint-title"),b=!1),v||(s("#tb-f-repo","#tb-hint-repo"),b=!1),!!b)try{let{task:h}=await g("/tasks",{method:"POST",body:JSON.stringify({title:c,repo:v,feature:r("#tb-f-feature",t).value.trim(),description:r("#tb-f-desc",t).value})});B(),i(h)}catch(h){alert(`\u521B\u5EFA\u5931\u8D25\uFF1A${h.message}`)}}),r("#tb-f-title",t).focus()},i=c=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>\u2705 \u4EFB\u52A1\u5DF2\u521B\u5EFA</h3>
				<div class="dsh-tb-created-title">${l(c.title)}</div>
				<div class="dsh-tb-created-meta">${l(c.repo)}${c.feature?` \xB7 ${l(c.feature)}`:""}</div>
				<div class="dsh-tb-created-next">\u63A5\u4E0B\u6765\u505A\u4EC0\u4E48\uFF1F</div>
				<div class="dsh-tb-created-actions">
					<button data-act="newsess" class="dsh-tb-primary dsh-tb-big">\u2795 \u65B0\u5EFA\u5BF9\u8BDD\u5F00\u59CB\u5E72\u6D3B</button>
					<button data-act="bind" class="dsh-tb-big">\u{1F517} \u7ED1\u5B9A\u5DF2\u6709\u4F1A\u8BDD</button>
					<button data-act="detail" class="dsh-tb-big">\u8FDB\u5165\u4EFB\u52A1\u8BE6\u60C5</button>
				</div>
				<div class="dsh-tb-actions" style="margin-top:12px">
					<button data-act="close">\u5173\u95ED</button>
				</div>
			</div>`,r('[data-act="newsess"]',t).addEventListener("click",async()=>{t.remove(),await Lt(c.id)}),r('[data-act="bind"]',t).addEventListener("click",()=>{t.remove(),J(c.id)}),r('[data-act="detail"]',t).addEventListener("click",()=>{t.remove(),J(c.id)}),r('[data-act="close"]',t).addEventListener("click",()=>t.remove())},d=()=>t.remove();t.addEventListener("click",c=>{c.target===t&&d()}),document.body.appendChild(t),a()}function te(t,e){g("/sessions").then(s=>{let a=document.createElement("div");a.className="dsh-tb-modal-mask",a.innerHTML=`<div class="dsh-tb-modal" style="width:min(600px,92vw)">
				<h3>\u9009\u62E9\u4F1A\u8BDD\u5173\u8054</h3>
				<div class="dsh-tb-field"><input id="tb-pick-search" placeholder="\u641C\u7D22\u4F1A\u8BDD\u6807\u9898\u2026" /></div>
				<div class="dsh-tb-picklist" id="tb-pick-list">\u52A0\u8F7D\u4E2D\u2026</div>
				<div class="dsh-tb-actions"><button data-act="cancel">\u53D6\u6D88</button></div>
			</div>`,document.body.appendChild(a);let i=s.sessions||M,d=r("#tb-pick-list",a),c=v=>{let b=String(v||"").trim().toLowerCase(),h=i.filter(u=>!b||String(u.title||"").toLowerCase().includes(b)),o={};for(let u of h){let n=u.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(o[n]||(o[n]=[])).push(u)}let p=Object.entries(o).sort((u,n)=>n[1].length-u[1].length).map(([u,n])=>(n.sort((f,E)=>(E.updatedAt||0)-(f.updatedAt||0)),`<div class="dsh-tb-pick-group">
							<div class="dsh-tb-pick-grouphead">${l(H(u))} <b>${n.length}</b></div>
							${n.map(f=>`<div class="dsh-tb-pick-item" data-sid="${l(f.id)}">
								<div class="t">${l(f.title||f.id)}${f.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</div>
								<div class="m">${f.updatedAt?R(f.updatedAt):""}</div>
							</div>`).join("")}
						</div>`)).join("");d.innerHTML=p||'<div class="dsh-tb-empty">\uFF08\u65E0\u5339\u914D\u4F1A\u8BDD\uFF09</div>',y(".dsh-tb-pick-item",a).forEach(u=>u.addEventListener("click",async()=>{let n=u.dataset.sid;try{let{task:f,injected:E,injectionNote:$}=await g(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:n,action:"link"})});a.remove(),await k(),e(f),j(E?"\u2713 \u5DF2\u5173\u8054\u4F1A\u8BDD\uFF08\u5DF2\u6CE8\u5165\u4EFB\u52A1\u4E0A\u4E0B\u6587\uFF09":$||"\u5DF2\u5173\u8054\u4F1A\u8BDD")}catch(f){alert(`\u5173\u8054\u5931\u8D25\uFF1A${f.message}`)}}))};c(""),r("#tb-pick-search",a).addEventListener("input",()=>c(r("#tb-pick-search",a).value)),r('[data-act="cancel"]',a).addEventListener("click",()=>a.remove()),a.addEventListener("click",v=>{v.target===a&&a.remove()}),r("#tb-pick-search",a).focus()}).catch(()=>alert("\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868\u5931\u8D25"))}async function J(t){let{task:e}=await g(`/tasks/${t}`);nt(e)}function nt(t){let e=t.id,s=document.createElement("div");s.className="dsh-tb-modal-mask";let a=M.map(o=>`<option value="${l(o.id)}">${l(o.title||o.id)}${o.repo?` \xB7 ${l(H(o.repo))}`:""}</option>`).join("");s.innerHTML=`<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${l(t.title)}</h3>
			<div class="dsh-tb-field"><label>\u4ED3\u5E93\u76EE\u5F55\uFF08\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF09</label><input id="tb-d-repo" placeholder="/root/projects/\u2026" value="${l(t.repo)}" /><input id="tb-d-feature" value="${l(t.feature)}" placeholder="feature/\u5206\u652F" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>\u72B6\u6001\uFF08AI \u81EA\u52A8\u6D41\u8F6C\uFF0C\u4F60\u53EA\u9700\u5728"\u8BC4\u5BA1\u4E2D"\u65F6\u5904\u7406\uFF09</label>
					<div class="dsh-tb-statusline">
						<span class="dsh-tb-statusbadge" style="color:${x[t.status].color};border-color:${x[t.status].color}55;background:${x[t.status].color}14">${x[t.status].label}</span>
						<div class="dsh-tb-statusactions">${Vt(t)}</div>
					</div>
				</div>
				<div class="dsh-tb-field"><label>\u4F18\u5148\u7EA7</label><select id="tb-d-priority">${Object.entries(N).map(([o,p])=>`<option value="${o}" ${o===t.priority?"selected":""}>${p.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u8FDB\u5EA6 ${t.displayProgress??t.progress}%\uFF08\u81EA\u52A8\u6D3E\u751F\uFF09</label><input id="tb-d-progress" type="range" min="0" max="100" value="${t.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(st).map(([o,p])=>`<option value="${o}" ${o===t.review?"selected":""}>${p}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6D4B\u8BD5</label><select id="tb-d-test">${Object.entries(at).map(([o,p])=>`<option value="${o}" ${o===t.test?"selected":""}>${p}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6807\u7B7E</label><input id="tb-d-labels" value="${l((t.labels||[]).join(", "))}" placeholder="\u9017\u53F7\u5206\u9694" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${ot.map(o=>`<option value="${l(o)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>\u63CF\u8FF0</label><textarea id="tb-d-desc">${l(t.description||"")}</textarea></div>
			<div class="dsh-tb-field"><label>\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF08\u6C60\u5185\u4F1A\u8BDD\u53EF\u8BBF\u95EE\uFF1A\u65B0\u5BF9\u8BDD\u81EA\u52A8\u5E26\u3001\u5173\u8054\u4F1A\u8BDD\u81EA\u52A8\u6CE8\u5165\u3001\u4E5F\u53EF\u590D\u5236\u968F\u65F6\u53D6\u6700\u65B0\u7248\uFF09</label>
				<div class="dsh-tb-ctx">
					<div class="dsh-tb-ctx-body" id="tb-d-ctx-body">\u52A0\u8F7D\u4E2D\u2026</div>
					<div class="dsh-tb-ctx-actions">
						<button id="tb-d-ctx-copy" title="\u590D\u5236\u6700\u65B0\u4E0A\u4E0B\u6587\u5230\u526A\u8D34\u677F">\u{1F4CB} \u590D\u5236</button>
						<button id="tb-d-ctx-refresh" title="\u91CD\u65B0\u83B7\u53D6\u6700\u65B0\u4E0A\u4E0B\u6587">\u27F3 \u5237\u65B0</button>
					</div>
				</div>
			</div>
			<div class="dsh-tb-field"><label>\u8FDB\u5C55\u8BB0\u5F55\uFF08${(t.notes||[]).length}\uFF09</label>
				<div id="tb-d-notes">${(t.notes||[]).map(o=>`<div class="dsh-tb-note"><span class="dsh-tb-note-time">${R(o.at)}</span><br/>${l(o.text)}</div>`).join("")||'<div class="dsh-tb-note">\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09</div>'}</div>
				<textarea id="tb-d-note" placeholder="\u6DFB\u52A0\u8FDB\u5C55/\u5B8C\u6210\u60C5\u51B5\u2026\uFF08Ctrl+Enter \u63D0\u4EA4\uFF09" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>\u6C60\u5185\u4F1A\u8BDD\uFF08\u5171\u4EAB\u4E0A\u4E0B\u6587\u53EF\u8BBF\u95EE\u8005\uFF1B\u70B9\u51FB\u6253\u5F00\u53EF\u7EE7\u7EED\uFF09</label>
				<div id="tb-d-sessions">${(t.sessionIds||[]).map(o=>{let p=M.find(u=>u.id===o);return`<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${l(o)}">${l(p?p.title:o)}${p&&p.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</span><button data-sid="${l(o)}" data-act="open" class="dsh-tb-open">\u6253\u5F00</button><button data-sid="${l(o)}" data-act="unlink">\u89E3\u9664</button></div>`}).join("")||'<div class="dsh-tb-note">\uFF08\u672A\u5173\u8054\u4F1A\u8BDD\uFF09</div>'}</div>
				<div class="dsh-tb-row" style="margin-top:6px">
					<button id="tb-d-sess-open" style="flex:1" title="\u6309\u5DE5\u4F5C\u533A\u5206\u7EC4\u3001\u6309\u66F4\u65B0\u65F6\u95F4\u6392\u5E8F\u3001\u53EF\u641C\u7D22">\u{1F50D} \u9009\u62E9\u4F1A\u8BDD\u5173\u8054</button>
					<button id="tb-d-sess-new" title="\u65B0\u5EFA\u4E00\u4E2A\u7ED1\u5B9A\u5230\u6B64\u4EFB\u52A1\u7684\u5BF9\u8BDD">\uFF0B \u65B0\u5BF9\u8BDD</button>
				</div>
			</div>
			<div class="dsh-tb-actions">
				<button data-act="del" class="dsh-tb-danger">\u5220\u9664</button>
				<button data-act="copyctx" title="\u590D\u5236\u4EFB\u52A1\u4E0A\u4E0B\u6587\uFF08\u53EF\u7C98\u5230\u4EFB\u610F\u5BF9\u8BDD\u91CC\u5E26\u4E0A\u80CC\u666F\uFF09">\u{1F4CB} \u590D\u5236\u4E0A\u4E0B\u6587</button>
				<button data-act="split" title="\u5927\u4EFB\u52A1\u62C6\u6210\u591A\u4E2A\u5C0F\u4EFB\u52A1">\u2702 \u62C6\u5206</button>
				<button data-act="cancel">\u5173\u95ED</button>
				<button data-act="save" class="dsh-tb-primary dsh-tb-grow">\u4FDD\u5B58</button>
			</div>
		</div>`,document.body.appendChild(s);let i=async()=>{let o=r("#tb-d-ctx-body",s);if(o)try{let{context:p}=await g(`/tasks/${e}/context`);o.textContent=p||"\uFF08\u6682\u65E0\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF09"}catch{o.textContent="\uFF08\u83B7\u53D6\u5931\u8D25\uFF09"}},d=async()=>{try{let{context:o}=await g(`/tasks/${e}/context`);await navigator.clipboard.writeText(o||""),j("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch{try{let{context:o}=await g(`/tasks/${e}/context`),p=document.createElement("textarea");p.value=o||"",document.body.appendChild(p),p.select(),document.execCommand("copy"),p.remove(),j("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch(o){alert(`\u590D\u5236\u5931\u8D25\uFF1A${o.message}`)}}};i(),r("#tb-d-ctx-refresh",s)?.addEventListener("click",i),r("#tb-d-ctx-copy",s)?.addEventListener("click",d);let c=()=>({repo:r("#tb-d-repo",s).value.trim(),feature:r("#tb-d-feature",s).value.trim(),priority:r("#tb-d-priority",s).value,progress:Number(r("#tb-d-progress",s).value),review:r("#tb-d-review",s).value,test:r("#tb-d-test",s).value,labels:r("#tb-d-labels",s).value.split(",").map(o=>o.trim()).filter(Boolean),description:r("#tb-d-desc",s).value}),v=()=>s.remove(),b=o=>{s.remove(),nt(o)},h=async o=>{let{task:p}=await g(`/tasks/${e}`,{method:"PATCH",body:JSON.stringify(o)});return await k(),p};s.addEventListener("click",o=>{o.target===s&&v()}),r('[data-act="cancel"]',s).addEventListener("click",v),r('[data-act="save"]',s).addEventListener("click",async()=>{try{let o=await h(c());b(o),j("\u2713 \u5DF2\u4FDD\u5B58")}catch(o){alert(`\u4FDD\u5B58\u5931\u8D25\uFF1A${o.message}`)}}),r('[data-act="del"]',s).addEventListener("click",async()=>{if(confirm(`\u5220\u9664\u4EFB\u52A1\u300C${t.title}\u300D\uFF1F`))try{await g(`/tasks/${e}`,{method:"DELETE"}),v(),await B()}catch(o){alert(`\u5220\u9664\u5931\u8D25\uFF1A${o.message}`)}}),r('[data-act="copyctx"]',s)?.addEventListener("click",d),r("#tb-d-note",s).addEventListener("keydown",async o=>{if(o.key==="Enter"&&(o.ctrlKey||o.metaKey)){let p=r("#tb-d-note",s).value.trim();if(!p)return;try{let{task:u}=await g(`/tasks/${e}/notes`,{method:"POST",body:JSON.stringify({text:p})});await k(),b(u),j("\u2713 \u8FDB\u5C55\u5DF2\u8BB0\u5F55")}catch(u){alert(`\u8BB0\u5F55\u5931\u8D25\uFF1A${u.message}`)}}}),r("#tb-d-sess-open",s)?.addEventListener("click",()=>{te(e,o=>{s.remove(),nt(o)})}),y("#tb-d-sessions [data-act]",s).forEach(o=>o.addEventListener("click",async()=>{let p=o.dataset.sid;if(o.dataset.act==="open")Z(p);else{let{task:u}=await g(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:p,action:"unlink"})});await k(),b(u),j("\u5DF2\u89E3\u9664\u4F1A\u8BDD")}})),r("#tb-d-sess-new",s)?.addEventListener("click",async()=>{await Lt(e)}),y(".dsh-tb-statusbtn",s).forEach(o=>o.addEventListener("click",async()=>{try{let p=await h({status:o.dataset.status});b(p),j("\u2713 \u72B6\u6001\u5DF2\u66F4\u65B0")}catch(p){alert(`\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${p.message}`)}})),r('[data-act="split"]',s)?.addEventListener("click",()=>{let o=document.createElement("div");o.className="dsh-tb-modal-mask",o.innerHTML=`<div class="dsh-tb-modal">
				<h3>\u62C6\u5206\u4EFB\u52A1\uFF1A${l(t.title)}</h3>
				<div class="dsh-tb-field"><label>\u5B50\u4EFB\u52A1\u6807\u9898\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u62C6\u5206\u540E\u81EA\u52A8\u7EE7\u627F\u4ED3\u5E93/\u4F18\u5148\u7EA7/\u6807\u7B7E/\u5173\u8054\u4F1A\u8BDD\uFF09</label>
					<textarea id="tb-split-titles" style="min-height:120px" placeholder="\u4F8B\u5982\uFF1A&#10;\u5B9E\u73B0\u529F\u80FD A&#10;\u5B9E\u73B0\u529F\u80FD B&#10;\u8054\u8C03\u4E0E\u6D4B\u8BD5"></textarea></div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="do" class="dsh-tb-primary">\u62C6\u5206</button>
				</div>
			</div>`,document.body.appendChild(o);let p=()=>o.remove();r('[data-act="cancel"]',o).addEventListener("click",p),o.addEventListener("click",u=>{u.target===o&&p()}),r('[data-act="do"]',o).addEventListener("click",async()=>{let u=r("#tb-split-titles",o).value.split(`
`).map(n=>n.trim()).filter(Boolean);if(!u.length){r("#tb-split-titles",o).focus();return}try{let{tasks:n}=await g(`/tasks/${e}/split`,{method:"POST",body:JSON.stringify({titles:u})});p(),await B(),j(`\u2713 \u5DF2\u62C6\u5206\u4E3A ${n.length} \u4E2A\u5B50\u4EFB\u52A1`),n?.[0]&&J(n[0].id)}catch(n){alert(`\u62C6\u5206\u5931\u8D25\uFF1A${n.message}`)}}),r("#tb-split-titles",o).focus()})}ut(),vt(),mt(),qt(),new MutationObserver(()=>{ut(),vt(),mt()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",t=>{t.ctrlKey&&t.shiftKey&&(t.key==="B"||t.key==="b")&&(t.preventDefault(),U())}),document.addEventListener("click",t=>{if(!F())return;let e=t.target;e instanceof Element&&(e.closest(`[${A}]`)||e.closest('[data-pane="sidebar"], [class*="sidebarCol"]')&&U(!1))});function ee(){let t=pt();if(!t||t.clientWidth===0)return;let e=t.style.width;try{t.style.width=`${t.clientWidth-2}px`,setTimeout(()=>{t.style.width=e||"";try{window.dispatchEvent(new Event("resize"))}catch{}},180)}catch{}}try{localStorage.getItem("dsh-taskboard.unstick")!==null&&(localStorage.removeItem("dsh-taskboard.unstick"),setTimeout(()=>{Et()},900),setTimeout(()=>{Et()},2e3))}catch{}let se=[400,1e3,2e3],Tt=()=>{for(let t of se)setTimeout(ee,t)};document.readyState==="loading"?window.addEventListener("load",Tt):Tt()})();})();

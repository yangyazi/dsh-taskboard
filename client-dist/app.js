(()=>{(()=>{if(window.__dshTaskboardLoaded)return;window.__dshTaskboardLoaded=!0;let kt="/taskboard/api",g={todo:{label:"\u5F85\u529E",color:"#8b949e"},in_progress:{label:"\u8FDB\u884C\u4E2D",color:"#3478f6"},in_review:{label:"\u8BC4\u5BA1\u4E2D",color:"#bc8cff"},blocked:{label:"\u5DF2\u963B\u585E",color:"#f85149"},done:{label:"\u5DF2\u5B8C\u6210",color:"#3fb950"}},N=["todo","in_progress","in_review","blocked","done"],R={low:{label:"\u4F4E",color:"#8b949e"},medium:{label:"\u4E2D",color:"#d29922"},high:{label:"\u9AD8",color:"#e3862e"},urgent:{label:"\u7D27\u6025",color:"#f85149"}},tt={none:"\u2014",pending:"\u8BC4\u5BA1\u5F85\u5904\u7406",approved:"\u8BC4\u5BA1\u901A\u8FC7",rejected:"\u8BC4\u5BA1\u9A73\u56DE"},et={none:"\u2014",pending:"\u6D4B\u8BD5\u5F85\u5904\u7406",passed:"\u6D4B\u8BD5\u901A\u8FC7",failed:"\u6D4B\u8BD5\u5931\u8D25"},it=["#79c0ff","#d2a8ff","#7ee787","#ffa657","#ff7b72","#f2cc60","#a5d6ff","#ffd7a8"],S="data-dsh-taskboard-active",C="data-dsh-taskboard-entry",_="data-dsh-taskboard-view",Y="data-dsh-ssh-active",Et='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>',o=(t,e=document)=>e.querySelector(t),y=(t,e=document)=>[...e.querySelectorAll(t)],i=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),I=t=>{let e=String(t||"").split("/").filter(Boolean);return e.length?e[e.length-1]:String(t||"")},Lt=t=>{let e=0;for(let s of String(t))e=e*31+s.charCodeAt(0)>>>0;return it[e%it.length]},P=t=>{if(!t)return"";let e=new Date(t),s=Date.now()-t;return s<6e4?"\u521A\u521A":s<36e5?`${Math.floor(s/6e4)} \u5206\u949F\u524D`:s<864e5?`${Math.floor(s/36e5)} \u5C0F\u65F6\u524D`:`${e.getMonth()+1}/${e.getDate()} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},j=[],A=[],q=[],st=[],z={q:"",repo:"",priority:"",status:"",label:""},H="overview",U={};async function x(t,e={}){let s=await fetch(kt+t,{headers:{"content-type":"application/json"},...e}),d=await s.json().catch(()=>({}));if(!s.ok)throw new Error(d.error||`HTTP ${s.status}`);return d}let Tt=`
<style>
/* \u53EA\u5728\u4EFB\u52A1\u770B\u677F\u6253\u5F00\u65F6\u624D\u628A\u5BF9\u8BDD\u5217\u8BBE\u4E3A\u5B9A\u4F4D\u951A\u70B9\uFF1B\u6B63\u5E38\u5BF9\u8BDD\u65F6\u4E0D\u5E72\u9884\u65B0\u7248\u5E03\u5C40\uFF0C
   \u907F\u514D\u7EDD\u5BF9\u5B9A\u4F4D\u6D6E\u5C42\uFF08\u542B\u8F93\u5165\u533A\u76F8\u5173\uFF09\u7684\u5305\u542B\u5757\u88AB\u6539\u53D8\u5BFC\u81F4\u8F93\u5165\u88AB\u906E\u6321 */
html[${S}] [data-pane='conversation'],
html[${S}] [class*='centerCol'] { position: relative; }
[${_}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${S}]:not([${Y}]) [data-pane='conversation'] > div[${_}],
html[${S}]:not([${Y}]) [class*='centerCol'] > div[${_}] {
  display: flex !important; flex-direction: column;
}
html[${S}]:not([${Y}]) [data-pane='conversation'] > :not([${_}]),
html[${S}]:not([${Y}]) [class*='centerCol'] > :not([${_}]) {
  display: none !important;
}
[${C}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap; transition: background .15s, color .15s;
}
[${C}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${C}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${C}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${C}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${C}][data-icon-only] > span:not(:first-child) { display: none; }

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
/* \u5355\u4E2A\u4F1A\u8BDD\u884C\uFF1A\u5BF9\u9F50\u539F\u751F\u4F1A\u8BDD\u884C\u9AD8\u5EA6/\u5185\u8FB9\u8DDD\uFF0C\u6807\u9898\u884C + \u4E0B\u65B9\u7070\u8272\u9884\u89C8\u884C */
.dsh-recent-row{display:flex;flex-direction:column;gap:1px;padding:5px 8px;border-radius:8px;cursor:pointer;min-width:0;transition:background .12s}
.dsh-recent-row:hover{background:var(--dsw-alias-bg-layer-2,#1b2127)}
.dsh-recent-row .lbl{display:flex;align-items:center;gap:6px;min-width:0;font-size:13px;color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-recent-row .icn{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#768390);width:10px;text-align:center}
.dsh-recent-row .dot{flex:none;width:8px;height:8px;border-radius:50%}
.dsh-recent-row .dot.run{background:#f2cc60;box-shadow:0 0 5px #f2cc60aa;animation:dsh-tb-blink 1.4s ease-in-out infinite}
.dsh-recent-row .dot.idle{background:#3fb950;box-shadow:0 0 4px #3fb95066}
/* \u5F53\u524D\u6253\u5F00\u7684\u4F1A\u8BDD\uFF1A\u53BB\u6389\u72B6\u6001\u70B9\uFF0C\u884C\u7528\u4E0E\u539F\u751F\u300C\u9009\u4E2D\u300D\u4E00\u81F4\u7684\u8F7B\u5FAE\u5E95\u8272\uFF08\u65E0\u8FB9\u6846\u3001\u65E0\u7F29\u653E\uFF09 */
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
</style>`;document.documentElement.insertAdjacentHTML("beforeend",Tt);let zt=`
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
</div>`;function nt(){let t=document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');return t===null?void 0:t.querySelector('[class*="logoRow"]')?.parentElement??t.firstElementChild}function lt(t){let e=t.querySelector('button[class*="newSession"]');if(e!==null)return e;for(let s of t.children)if(s.tagName==="BUTTON")return s}function ct(){return document.querySelector('[data-pane="conversation"]')??document.querySelector('[class*="centerCol"]')??void 0}function bt(t){return[...t.classList].some(e=>/collapsed/i.test(e))}let m=null,J=null;function X(){return document.documentElement.hasAttribute(S)}function pt(){m!==null&&(X()?m.setAttribute("data-active",""):m.removeAttribute("data-active"))}function F(t){let e=t!==void 0?t:!X();e&&document.documentElement.removeAttribute(Y),e?document.documentElement.setAttribute(S,""):document.documentElement.removeAttribute(S),pt(),e&&V()}function ht(){if(J!==null)return;let t=ct();t!==void 0&&(J=document.createElement("div"),J.setAttribute(_,""),J.innerHTML=zt,t.appendChild(J),It())}function ft(){let t=nt();if(t===void 0||(m===null&&(m=document.createElement("button"),m.type="button",m.setAttribute(C,""),m.innerHTML=`<span>${Et}</span><span>\u4EFB\u52A1\u770B\u677F</span>`,m.title="\u4EFB\u52A1\u770B\u677F",m.addEventListener("click",()=>F()),pt()),m.parentElement===t))return;let e=lt(t),s=e?.closest('[class*="logoRow"]'),d=s!=null&&s.parentElement===t?s:e;t.insertBefore(m,d?.nextElementSibling??null),(()=>{m!==null&&(bt(t)?m.setAttribute("data-icon-only",""):m.removeAttribute("data-icon-only"))})()}let St=15,w=null,L=null,B=!1,ut=null;function jt(){return x("/sessions").then(t=>t.sessions||[]).catch(()=>A)}function Ct(t){return[...t||[]].filter(e=>e&&e.updatedAt).sort((e,s)=>(s.updatedAt||0)-(e.updatedAt||0)).slice(0,St)}function At(){try{let t=JSON.parse(localStorage.getItem("dsh.sessions.current")||"null");return t&&t.sessionId?t.sessionId:null}catch{return null}}function vt(t){return`dsh-tb-read:${t}`}function Mt(t){try{return Number(localStorage.getItem(vt(t)))||0}catch{return 0}}function Ot(t){try{localStorage.setItem(vt(t),String(Date.now()))}catch{}}function at(t){if(L===null)return;let e=Ct(t),s=o("#dsh-recent-cnt");if(s&&(s.textContent=String(e.length)),!e.length){L.innerHTML='<div class="dsh-recent-empty">\uFF08\u6682\u65E0\u6700\u8FD1\u4F1A\u8BDD\uFF09</div>';return}let d=At(),h=Date.now();L.innerHTML=e.map(n=>{let c=n.title&&String(n.title).trim()?n.title:n.id,u=n.id===d,b="",p="";return n.running?(b='<span class="dot run"></span>',p="run"):n.updatedAt&&n.updatedAt>Mt(n.id)&&(b='<span class="dot idle"></span>',p="idle"),`<div class="dsh-recent-row${u?" cur":""}" data-sid="${i(n.id)}" title="\u6253\u5F00\u5E76\u7EE7\u7EED\uFF1A${i(c)}">
				<span class="lbl">
					${b}
					<span class="t">${i(c)}</span>
				</span>
				<span class="meta">
					${n.preview?`<span class="prev">${i(n.preview)}</span>`:""}
					${n.repo?`<span class="repo">${i(I(n.repo))}</span>`:""}
					<span class="tm">${P(n.updatedAt)}</span>
				</span>
			</div>`}).join(""),y(".dsh-recent-row",L).forEach(n=>n.addEventListener("click",()=>{K(n.dataset.sid)}))}function G(){jt().then(t=>at(t)).catch(()=>at(A))}function xt(){let t=nt();if(t===void 0||(w===null&&(w=document.createElement("div"),w.id="dsh-recent",w.className="dsh-recent",w.innerHTML=`
				<div class="dsh-recent-head" id="dsh-recent-head">
					<span class="arrow">\u25BC</span><span class="title">\u6700\u65B0\u5BF9\u8BDD</span>
					<span class="cnt" id="dsh-recent-cnt">0</span>
					<button class="dsh-recent-refresh" id="dsh-recent-refresh" title="\u5237\u65B0">\u27F3</button>
				</div>
				<div class="dsh-recent-body" id="dsh-recent-body"></div>`,L=o("#dsh-recent-body",w),o("#dsh-recent-head",w).addEventListener("click",()=>{B=!B,w&&w.classList.toggle("collapsed",B),L&&(L.style.display=B?"none":"")}),o("#dsh-recent-refresh",w).addEventListener("click",h=>{h.stopPropagation(),G()}),at(A),G()),w.parentElement===t))return;let e=m??lt(t);t.insertBefore(w,e?.nextElementSibling??null),L&&(L.style.maxHeight="46vh",L.style.overflowY="auto"),(()=>{L&&(L.style.display=B?"none":""),w&&w.classList.toggle("collapsed",B)})(),(()=>{w&&(bt(t)?w.style.display="none":w.style.display="")})()}function _t(){ut===null&&(ut=setInterval(()=>{document.hidden||G()},6e4))}function It(){o("#dsh-tb-new")?.addEventListener("click",mt),o("#dsh-tb-refresh")?.addEventListener("click",()=>V()),o("#dsh-tb-search")?.addEventListener("input",()=>{z.q=o("#dsh-tb-search").value.trim(),k()}),o("#dsh-tb-repo-filter")?.addEventListener("change",()=>{z.repo=o("#dsh-tb-repo-filter").value,k()}),o("#dsh-tb-priority-filter")?.addEventListener("change",()=>{z.priority=o("#dsh-tb-priority-filter").value,k()}),o("#dsh-tb-status-filter")?.addEventListener("change",()=>{z.status=o("#dsh-tb-status-filter").value,k()}),o("#dsh-tb-label-filter")?.addEventListener("change",()=>{z.label=o("#dsh-tb-label-filter").value,k()}),y(".dsh-tb-tab").forEach(t=>t.addEventListener("click",()=>{H=t.dataset.tbView,Q()}))}async function k(){let t=new URLSearchParams;for(let s of["q","repo","priority","status","label"])z[s]&&t.set(s,z[s]);j=(await x(`/tasks?${t}`)).tasks||[],Q()}async function Ht(){try{let[t,e]=await Promise.all([x("/sessions"),x("/workspaces")]);A=t.sessions||[],q=e.workspaces||[];let s=o("#dsh-tb-repo-filter");if(s){let b=s.value;s.innerHTML='<option value="">\u5168\u90E8\u4ED3\u5E93</option>'+q.map(p=>`<option value="${i(p.path)}" title="${i(p.path)}">${i(I(p.path))}</option>`).join(""),b&&[...s.options].some(p=>p.value===b)&&(s.value=b)}let d=await x("/tasks").catch(()=>({tasks:[]})),h=new Set;for(let b of d.tasks||[])for(let p of b.labels||[])h.add(p);st=[...h].sort();let n=o("#dsh-tb-label-filter");if(n){let b=n.value;n.innerHTML='<option value="">\u5168\u90E8\u6807\u7B7E</option>'+st.map(p=>`<option value="${i(p)}">${i(p)}</option>`).join(""),b&&[...n.options].some(p=>p.value===b)&&(n.value=b)}let c=o("#dsh-tb-priority-filter");c&&!c.options.length&&(c.innerHTML='<option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>'+Object.entries(R).map(([b,p])=>`<option value="${b}">${p.label}</option>`).join(""));let u=o("#dsh-tb-status-filter");u&&!u.options.length&&(u.innerHTML='<option value="">\u5168\u90E8\u72B6\u6001</option>'+Object.entries(g).map(([b,p])=>`<option value="${b}">${p.label}</option>`).join(""))}catch{}}async function Nt(){for(let t of q)if(!(!t.path||U[t.path]!==void 0))try{let e=await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(t.path)}`).then(s=>s.json());U[t.path]=e.git?{branch:e.branch?.name||"(detached)",dirty:(e.files||[]).length}:null}catch{U[t.path]=null}}function V(){return Ht().then(()=>Nt()).then(k).catch(k)}function gt(t){return(t.labels||[]).map(e=>`<span class="dsh-tb-pill" style="color:${Lt(e)}">${i(e)}</span>`).join("")}function Rt(t){let e=g[t.status]||g.todo;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function wt(t){let e=R[t.priority]||R.medium;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function Pt(t){let e=(s,d,h)=>`<button type="button" class="dsh-tb-statusbtn ${h||""}" data-status="${s}">${d}</button>`;switch(t.status){case"todo":return`${e("in_progress","\u25B6 \u5F00\u59CB\u6267\u884C")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_progress":return`${e("in_review","\u63D0\u4EA4\u8BC4\u5BA1")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_review":return`${e("done","\u2705 \u786E\u8BA4\u5B8C\u6210","primary")} ${e("in_progress","\u21A9 \u9000\u56DE\u4FEE\u6539")}`;case"done":return`${e("in_progress","\u21A9 \u91CD\u65B0\u6253\u5F00","ghost")}`;case"blocked":return`${e("in_progress","\u25B6 \u6062\u590D\u8FDB\u884C")}`;default:return""}}function qt(){let t=document.querySelectorAll('[class*="sessionRow"], [class*="root"]');for(let e of t){let s=null;for(let h of Object.keys(e))if(h.startsWith("__reactFiber$")){s=h;break}if(s===null)continue;let d=e[s];for(let h=0;h<30&&d!==null;h++){let n=d.memoizedProps;if(n!==null&&typeof n=="object"&&typeof n.open=="function"&&typeof n.startSession=="function")return n.open;d=d.return}}return null}function K(t){Ot(t);try{let e=qt();if(typeof e=="function"){try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}e(t),X()&&F(!1),y(".dsh-tb-modal-mask").forEach(s=>s.remove()),G();return}}catch{}try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}location.reload()}function M(t){let e=document.createElement("div");e.className="dsh-tb-toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.remove(),1600)}function Bt(){var v;let t={};for(let r of N)t[r]=0;let e={};for(let r of j){t[r.status]!==void 0&&t[r.status]++;let f=r.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(e[f]||(e[f]=[])).push(r)}let s=j.length,d=t.done||0,h=s?Math.round(d/s*100):0,n={};for(let r of A)r.repo&&(n[v=r.repo]||(n[v]=[])).push(r);let c=[...j].sort((r,f)=>f.updatedAt-r.updatedAt).slice(0,10),b='<div class="dsh-tb-ov-stat dsh-tb-ov-add" id="dsh-tb-ov-new" title="\u65B0\u5EFA\u4EFB\u52A1"><div class="dsh-tb-ov-addbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</div></div>'+[["\u5168\u90E8\u4EFB\u52A1",s,"#e6edf3",""],...N.map(r=>[g[r].label,t[r]||0,g[r].color,r]),["\u5B8C\u6210\u7387",`${h}%`,"#3fb950",null]].map(([r,f,E,$])=>{let dt=r==="\u5B8C\u6210\u7387"?h:s?Math.round(f/s*100):0,Z=$!==null?" dsh-tb-ov-stat-click":"",rt=$===""?"\u67E5\u770B\u5168\u90E8\u4EFB\u52A1":$?`\u67E5\u770B\u300C${r}\u300D\u7684\u4EFB\u52A1`:"";return`<div class="dsh-tb-ov-stat${Z}" ${$!==null?`data-status="${$}"`:""} title="${rt}"><div class="n" style="color:${E}">${f}</div><div class="l">${r}</div><div class="mini"><i style="width:${dt}%;background:${E}"></i></div></div>`}).join(""),p;q.length?p=q.map(r=>{let f=e[r.path]||e[r.title]||[],E=N.map(T=>f.filter(O=>O.status===T).length),$=f.length,dt=E[N.indexOf("done")]||0,Z=$?Math.round(dt/$*100):0,rt=$?N.map((T,O)=>E[O]?`<i style="width:${Math.round(E[O]/$*100)}%;background:${g[T].color}" title="${g[T].label} ${E[O]}"></i>`:"").join(""):"",Ut=N.map((T,O)=>E[O]?`<span class="st"><i class="dot" style="background:${g[T].color}"></i>${g[T].label} <b>${E[O]}</b></span>`:"").join(""),Xt=(n[r.path]||n[r.title]||[]).length,W=U[r.path],Ft=W?`<span class="branch">\u2387 ${i(W.branch)}</span>${W.dirty?`<span class="branch dirty" title="${W.dirty} \u4E2A\u672A\u63D0\u4EA4\u6587\u4EF6">\u25CF${W.dirty}</span>`:""}`:"",$t=(n[r.path]||n[r.title]||[]).slice(0,3).map(T=>`<div class="s" data-sid="${i(T.id)}" title="\u6253\u5F00\u4F1A\u8BDD ${i(T.id)}">\u25B8 ${i(T.title)}</div>`).join("");return`<div class="dsh-tb-ov-ws" data-repo="${i(r.path)}">
					<div class="ws-head"><h4>${i(r.title)}</h4><span class="ws-total">${$} \u4E2A\u4EFB\u52A1</span></div>
					<div class="path">${i(r.path||"")}</div>
					${$?`<div class="stack">${rt}</div><div class="ws-stats">${Ut}</div>`:'<div class="ws-stats" style="color:var(--dsw-alias-label-secondary,#9aa7b4)">\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA</div>'}
					<div class="comp"><span class="pct">\u5B8C\u6210\u7387 ${Z}%</span><div class="track"><i style="width:${Z}%"></i></div></div>
					<div class="meta">${Ft}<span class="sess">\u4F1A\u8BDD ${Xt}</span></div>
					${$t?`<div class="sesslist">${$t}</div>`:""}
				</div>`}).join(""):p='<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5DE5\u4F5C\u533A\uFF09</div>';let a=c.length?c.map(r=>{let f=g[r.status]||g.todo;return`<div class="dsh-tb-ov-item" data-id="${i(r.id)}">
				<span class="dot" style="background:${f.color}"></span>
				<span class="t">${i(r.title)}</span>
				${r.repo?`<span class="r">${i(I(r.repo))}</span>`:""}
				<span class="tm">${P(r.updatedAt)}</span>
			</div>`}).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF09</div>',l=o("#dsh-tb-body");l&&(l.innerHTML=`<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${b}</div>
			<div class="dsh-tb-ov-sec">\u5DE5\u4F5C\u533A\u5185\u5BB9</div>
			<div class="dsh-tb-ov-grid">${p}</div>
			<div class="dsh-tb-ov-sec">\u6700\u8FD1\u66F4\u65B0</div>
			<div class="dsh-tb-ov-recent">${a}</div>
		</div>`,o("#dsh-tb-ov-new")?.addEventListener("click",mt),y(".dsh-tb-ov-stat[data-status]").forEach(r=>r.addEventListener("click",()=>{z.status=r.dataset.status,H="list",Q(),k()})),y(".dsh-tb-ov-ws").forEach(r=>r.addEventListener("click",()=>{z.repo=r.dataset.repo;let f=o("#dsh-tb-repo-filter");f&&(f.value=z.repo),H="kanban",Q(),k()})),y(".dsh-tb-ov-ws .s").forEach(r=>r.addEventListener("click",f=>{f.stopPropagation(),K(r.dataset.sid)})),y(".dsh-tb-ov-item").forEach(r=>r.addEventListener("click",()=>{r.dataset.id&&D(r.dataset.id)})))}function Dt(t){let e=g[t.status]||g.todo,s=R[t.priority]||R.medium,d=[];d.push(wt(t)),t.status==="in_review"&&d.push('<span class="dsh-tb-pill" style="color:#bc8cff;font-weight:600">\u25C9 \u5F85 review</span>'),t.repo&&d.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${i(I(t.repo))}</span>`),t.feature&&d.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${i(t.feature)}</span>`),d.push(gt(t)),t.review&&t.review!=="none"&&d.push(`<span class="dsh-tb-pill" style="color:${t.review==="approved"?"#3fb950":t.review==="rejected"?"#f85149":"#d29922"}">${tt[t.review]}</span>`),t.test&&t.test!=="none"&&d.push(`<span class="dsh-tb-pill" style="color:${t.test==="passed"?"#3fb950":t.test==="failed"?"#f85149":"#d29922"}">${et[t.test]}</span>`);let h=[];return t.sessionIds?.length&&h.push(`<span>\u4F1A\u8BDD ${t.sessionIds.length}</span>`),t.notes?.length&&h.push(`<span>\u8BC4\u8BBA ${t.notes.length}</span>`),h.push(`<span>${P(t.updatedAt)}</span>`),`<div class="dsh-tb-card" data-id="${i(t.id)}" style="border-left:3px solid ${e.color}">
			<div class="dsh-tb-card-title">${i(t.title)}</div>
			<div class="dsh-tb-card-meta">${d.join("")}</div>
			${t.displayProgress>0?`<div class="dsh-tb-bar"><i style="width:${Math.min(100,t.displayProgress)}%"></i></div>`:""}
			<div class="dsh-tb-card-foot">${h.join(" \xB7 ")}</div>
		</div>`}function Yt(){let t=o("#dsh-tb-body"),e=o("#dsh-tb-count");if(!t)return;t.innerHTML='<div class="dsh-tb-columns"></div>';let s=o(".dsh-tb-columns",t);e&&(e.textContent=`${j.length} \u4E2A\u4EFB\u52A1`);for(let[d,h]of Object.entries(g)){let n=document.createElement("div");n.className="dsh-tb-col";let c=j.filter(b=>b.status===d);n.innerHTML=`<div class="dsh-tb-col-head">${h.label} <b>${c.length}</b></div><div class="dsh-tb-col-body"></div>`;let u=o(".dsh-tb-col-body",n);c.length?c.forEach(b=>u.insertAdjacentHTML("beforeend",Dt(b))):u.innerHTML='<div class="dsh-tb-empty">\u2014</div>',s.appendChild(n)}y(".dsh-tb-card",s).forEach(d=>d.addEventListener("click",()=>D(d.dataset.id)))}function Jt(){let t=o("#dsh-tb-body"),e=o("#dsh-tb-count");if(!t)return;if(e&&(e.textContent=`${j.length} \u4E2A\u4EFB\u52A1`),!j.length){t.innerHTML='<div class="dsh-tb-ov"><div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA\uFF09</div></div>';return}let s=j.map(d=>`<tr data-id="${i(d.id)}">
			<td>${Rt(d)}</td>
			<td>${wt(d)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i(d.title)}</div></td>
			<td>${d.repo?`<span class="dsh-tb-pill" style="color:#79c0ff">${i(I(d.repo))}</span>`:""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i(d.feature||"")}</div></td>
			<td>${gt(d)}</td>
			<td style="min-width:90px">${d.displayProgress>0?`<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100,d.displayProgress)}%"></i></div>`:""}</td>
			<td>${d.review!=="none"?`<span class="dsh-tb-pill" style="color:${d.review==="approved"?"#3fb950":d.review==="rejected"?"#f85149":"#d29922"}">${tt[d.review]}</span>`:""}</td>
			<td>${d.test!=="none"?`<span class="dsh-tb-pill" style="color:${d.test==="passed"?"#3fb950":d.test==="failed"?"#f85149":"#d29922"}">${et[d.test]}</span>`:""}</td>
			<td style="white-space:nowrap">${P(d.updatedAt)}</td>
		</tr>`).join("");t.innerHTML=`<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>\u72B6\u6001</th><th>\u4F18\u5148\u7EA7</th><th>\u4EFB\u52A1</th><th>\u4ED3\u5E93</th><th>\u5206\u652F/feature</th><th>\u6807\u7B7E</th><th>\u8FDB\u5EA6</th><th>Review</th><th>\u6D4B\u8BD5</th><th>\u66F4\u65B0</th></tr></thead>
				<tbody>${s}</tbody>
			</table>
		</div>`,y("tr[data-id]",t).forEach(d=>d.addEventListener("click",()=>D(d.dataset.id)))}function Q(){y(".dsh-tb-tab").forEach(e=>{e.dataset.tbView===H?e.classList.add("dsh-tb-tab-on"):e.classList.remove("dsh-tb-tab-on")});let t=o("#dsh-tb-toolbar");t&&(t.style.display=H==="overview"?"none":"flex"),H==="kanban"?Yt():H==="list"?Jt():Bt()}function mt(){let t=document.createElement("div");t.className="dsh-tb-modal-mask";let e=q.map(c=>`<option value="${i(c.path)}" title="${i(c.path)}">${i(c.path)}</option>`).join(""),s=(c,u)=>{o(c,t)?.classList.add("err"),u&&(o(u,t).hidden=!1)},d=()=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
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
			</div>`,o("#tb-f-title",t).addEventListener("input",()=>{o("#tb-f-title",t).classList.remove("err"),o("#tb-hint-title",t).hidden=!0}),o("#tb-f-repo",t).addEventListener("change",()=>{o("#tb-f-repo",t).classList.remove("err"),o("#tb-hint-repo",t).hidden=!0}),o('[data-act="cancel"]',t).addEventListener("click",n),o('[data-act="save"]',t).addEventListener("click",async()=>{let c=o("#tb-f-title",t).value.trim(),u=o("#tb-f-repo",t).value;o("#tb-hint-title",t).hidden=!0,o("#tb-hint-repo",t).hidden=!0,y(".err",t).forEach(p=>p.classList.remove("err"));let b=!0;if(c||(s("#tb-f-title","#tb-hint-title"),b=!1),u||(s("#tb-f-repo","#tb-hint-repo"),b=!1),!!b)try{let{task:p}=await x("/tasks",{method:"POST",body:JSON.stringify({title:c,repo:u,feature:o("#tb-f-feature",t).value.trim(),description:o("#tb-f-desc",t).value})});V(),h(p)}catch(p){alert(`\u521B\u5EFA\u5931\u8D25\uFF1A${p.message}`)}}),o("#tb-f-title",t).focus()},h=c=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>\u2705 \u4EFB\u52A1\u5DF2\u521B\u5EFA</h3>
				<div class="dsh-tb-created-title">${i(c.title)}</div>
				<div class="dsh-tb-created-meta">${i(c.repo)}${c.feature?` \xB7 ${i(c.feature)}`:""}</div>
				<div class="dsh-tb-created-next">\u63A5\u4E0B\u6765\u505A\u4EC0\u4E48\uFF1F</div>
				<div class="dsh-tb-created-actions">
					<button data-act="newsess" class="dsh-tb-primary dsh-tb-big">\u2795 \u65B0\u5EFA\u5BF9\u8BDD\u5F00\u59CB\u5E72\u6D3B</button>
					<button data-act="bind" class="dsh-tb-big">\u{1F517} \u7ED1\u5B9A\u5DF2\u6709\u4F1A\u8BDD</button>
					<button data-act="detail" class="dsh-tb-big">\u8FDB\u5165\u4EFB\u52A1\u8BE6\u60C5</button>
				</div>
				<div class="dsh-tb-actions" style="margin-top:12px">
					<button data-act="close">\u5173\u95ED</button>
				</div>
			</div>`,o('[data-act="newsess"]',t).addEventListener("click",async()=>{try{let{sessionId:u}=await x(`/tasks/${c.id}/session`,{method:"POST",body:"{}"});K(u)}catch(u){alert(`\u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${u.message}`)}}),o('[data-act="bind"]',t).addEventListener("click",()=>{t.remove(),D(c.id)}),o('[data-act="detail"]',t).addEventListener("click",()=>{t.remove(),D(c.id)}),o('[data-act="close"]',t).addEventListener("click",()=>t.remove())},n=()=>t.remove();t.addEventListener("click",c=>{c.target===t&&n()}),document.body.appendChild(t),d()}function Vt(t,e){x("/sessions").then(s=>{let d=document.createElement("div");d.className="dsh-tb-modal-mask",d.innerHTML=`<div class="dsh-tb-modal" style="width:min(600px,92vw)">
				<h3>\u9009\u62E9\u4F1A\u8BDD\u5173\u8054</h3>
				<div class="dsh-tb-field"><input id="tb-pick-search" placeholder="\u641C\u7D22\u4F1A\u8BDD\u6807\u9898\u2026" /></div>
				<div class="dsh-tb-picklist" id="tb-pick-list">\u52A0\u8F7D\u4E2D\u2026</div>
				<div class="dsh-tb-actions"><button data-act="cancel">\u53D6\u6D88</button></div>
			</div>`,document.body.appendChild(d);let h=s.sessions||A,n=o("#tb-pick-list",d),c=u=>{let b=String(u||"").trim().toLowerCase(),p=h.filter(v=>!b||String(v.title||"").toLowerCase().includes(b)),a={};for(let v of p){let r=v.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(a[r]||(a[r]=[])).push(v)}let l=Object.entries(a).sort((v,r)=>r[1].length-v[1].length).map(([v,r])=>(r.sort((f,E)=>(E.updatedAt||0)-(f.updatedAt||0)),`<div class="dsh-tb-pick-group">
							<div class="dsh-tb-pick-grouphead">${i(I(v))} <b>${r.length}</b></div>
							${r.map(f=>`<div class="dsh-tb-pick-item" data-sid="${i(f.id)}">
								<div class="t">${i(f.title||f.id)}${f.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</div>
								<div class="m">${f.updatedAt?P(f.updatedAt):""}</div>
							</div>`).join("")}
						</div>`)).join("");n.innerHTML=l||'<div class="dsh-tb-empty">\uFF08\u65E0\u5339\u914D\u4F1A\u8BDD\uFF09</div>',y(".dsh-tb-pick-item",d).forEach(v=>v.addEventListener("click",async()=>{let r=v.dataset.sid;try{let{task:f,injected:E,injectionNote:$}=await x(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:r,action:"link"})});d.remove(),await k(),e(f),M(E?"\u2713 \u5DF2\u5173\u8054\u4F1A\u8BDD\uFF08\u5DF2\u6CE8\u5165\u4EFB\u52A1\u4E0A\u4E0B\u6587\uFF09":$||"\u5DF2\u5173\u8054\u4F1A\u8BDD")}catch(f){alert(`\u5173\u8054\u5931\u8D25\uFF1A${f.message}`)}}))};c(""),o("#tb-pick-search",d).addEventListener("input",()=>c(o("#tb-pick-search",d).value)),o('[data-act="cancel"]',d).addEventListener("click",()=>d.remove()),d.addEventListener("click",u=>{u.target===d&&d.remove()}),o("#tb-pick-search",d).focus()}).catch(()=>alert("\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868\u5931\u8D25"))}async function D(t){let{task:e}=await x(`/tasks/${t}`);ot(e)}function ot(t){let e=t.id,s=document.createElement("div");s.className="dsh-tb-modal-mask";let d=A.map(a=>`<option value="${i(a.id)}">${i(a.title||a.id)}${a.repo?` \xB7 ${i(I(a.repo))}`:""}</option>`).join("");s.innerHTML=`<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${i(t.title)}</h3>
			<div class="dsh-tb-field"><label>\u4ED3\u5E93\u76EE\u5F55\uFF08\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF09</label><input id="tb-d-repo" placeholder="/root/projects/\u2026" value="${i(t.repo)}" /><input id="tb-d-feature" value="${i(t.feature)}" placeholder="feature/\u5206\u652F" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>\u72B6\u6001\uFF08AI \u81EA\u52A8\u6D41\u8F6C\uFF0C\u4F60\u53EA\u9700\u5728"\u8BC4\u5BA1\u4E2D"\u65F6\u5904\u7406\uFF09</label>
					<div class="dsh-tb-statusline">
						<span class="dsh-tb-statusbadge" style="color:${g[t.status].color};border-color:${g[t.status].color}55;background:${g[t.status].color}14">${g[t.status].label}</span>
						<div class="dsh-tb-statusactions">${Pt(t)}</div>
					</div>
				</div>
				<div class="dsh-tb-field"><label>\u4F18\u5148\u7EA7</label><select id="tb-d-priority">${Object.entries(R).map(([a,l])=>`<option value="${a}" ${a===t.priority?"selected":""}>${l.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u8FDB\u5EA6 ${t.displayProgress??t.progress}%\uFF08\u81EA\u52A8\u6D3E\u751F\uFF09</label><input id="tb-d-progress" type="range" min="0" max="100" value="${t.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(tt).map(([a,l])=>`<option value="${a}" ${a===t.review?"selected":""}>${l}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6D4B\u8BD5</label><select id="tb-d-test">${Object.entries(et).map(([a,l])=>`<option value="${a}" ${a===t.test?"selected":""}>${l}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6807\u7B7E</label><input id="tb-d-labels" value="${i((t.labels||[]).join(", "))}" placeholder="\u9017\u53F7\u5206\u9694" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${st.map(a=>`<option value="${i(a)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>\u63CF\u8FF0</label><textarea id="tb-d-desc">${i(t.description||"")}</textarea></div>
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
				<div id="tb-d-notes">${(t.notes||[]).map(a=>`<div class="dsh-tb-note"><span class="dsh-tb-note-time">${P(a.at)}</span><br/>${i(a.text)}</div>`).join("")||'<div class="dsh-tb-note">\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09</div>'}</div>
				<textarea id="tb-d-note" placeholder="\u6DFB\u52A0\u8FDB\u5C55/\u5B8C\u6210\u60C5\u51B5\u2026\uFF08Ctrl+Enter \u63D0\u4EA4\uFF09" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>\u6C60\u5185\u4F1A\u8BDD\uFF08\u5171\u4EAB\u4E0A\u4E0B\u6587\u53EF\u8BBF\u95EE\u8005\uFF1B\u70B9\u51FB\u6253\u5F00\u53EF\u7EE7\u7EED\uFF09</label>
				<div id="tb-d-sessions">${(t.sessionIds||[]).map(a=>{let l=A.find(v=>v.id===a);return`<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${i(a)}">${i(l?l.title:a)}${l&&l.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</span><button data-sid="${i(a)}" data-act="open" class="dsh-tb-open">\u6253\u5F00</button><button data-sid="${i(a)}" data-act="unlink">\u89E3\u9664</button></div>`}).join("")||'<div class="dsh-tb-note">\uFF08\u672A\u5173\u8054\u4F1A\u8BDD\uFF09</div>'}</div>
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
		</div>`,document.body.appendChild(s);let h=async()=>{let a=o("#tb-d-ctx-body",s);if(a)try{let{context:l}=await x(`/tasks/${e}/context`);a.textContent=l||"\uFF08\u6682\u65E0\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF09"}catch{a.textContent="\uFF08\u83B7\u53D6\u5931\u8D25\uFF09"}},n=async()=>{try{let{context:a}=await x(`/tasks/${e}/context`);await navigator.clipboard.writeText(a||""),M("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch{try{let{context:a}=await x(`/tasks/${e}/context`),l=document.createElement("textarea");l.value=a||"",document.body.appendChild(l),l.select(),document.execCommand("copy"),l.remove(),M("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch(a){alert(`\u590D\u5236\u5931\u8D25\uFF1A${a.message}`)}}};h(),o("#tb-d-ctx-refresh",s)?.addEventListener("click",h),o("#tb-d-ctx-copy",s)?.addEventListener("click",n);let c=()=>({repo:o("#tb-d-repo",s).value.trim(),feature:o("#tb-d-feature",s).value.trim(),priority:o("#tb-d-priority",s).value,progress:Number(o("#tb-d-progress",s).value),review:o("#tb-d-review",s).value,test:o("#tb-d-test",s).value,labels:o("#tb-d-labels",s).value.split(",").map(a=>a.trim()).filter(Boolean),description:o("#tb-d-desc",s).value}),u=()=>s.remove(),b=a=>{s.remove(),ot(a)},p=async a=>{let{task:l}=await x(`/tasks/${e}`,{method:"PATCH",body:JSON.stringify(a)});return await k(),l};s.addEventListener("click",a=>{a.target===s&&u()}),o('[data-act="cancel"]',s).addEventListener("click",u),o('[data-act="save"]',s).addEventListener("click",async()=>{try{let a=await p(c());b(a),M("\u2713 \u5DF2\u4FDD\u5B58")}catch(a){alert(`\u4FDD\u5B58\u5931\u8D25\uFF1A${a.message}`)}}),o('[data-act="del"]',s).addEventListener("click",async()=>{if(confirm(`\u5220\u9664\u4EFB\u52A1\u300C${t.title}\u300D\uFF1F`))try{await x(`/tasks/${e}`,{method:"DELETE"}),u(),await V()}catch(a){alert(`\u5220\u9664\u5931\u8D25\uFF1A${a.message}`)}}),o('[data-act="copyctx"]',s)?.addEventListener("click",n),o("#tb-d-note",s).addEventListener("keydown",async a=>{if(a.key==="Enter"&&(a.ctrlKey||a.metaKey)){let l=o("#tb-d-note",s).value.trim();if(!l)return;try{let{task:v}=await x(`/tasks/${e}/notes`,{method:"POST",body:JSON.stringify({text:l})});await k(),b(v),M("\u2713 \u8FDB\u5C55\u5DF2\u8BB0\u5F55")}catch(v){alert(`\u8BB0\u5F55\u5931\u8D25\uFF1A${v.message}`)}}}),o("#tb-d-sess-open",s)?.addEventListener("click",()=>{Vt(e,a=>{s.remove(),ot(a)})}),y("#tb-d-sessions [data-act]",s).forEach(a=>a.addEventListener("click",async()=>{let l=a.dataset.sid;if(a.dataset.act==="open")K(l);else{let{task:v}=await x(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:l,action:"unlink"})});await k(),b(v),M("\u5DF2\u89E3\u9664\u4F1A\u8BDD")}})),o("#tb-d-sess-new",s)?.addEventListener("click",async()=>{try{let{sessionId:a}=await x(`/tasks/${e}/session`,{method:"POST",body:"{}"});K(a)}catch(a){alert(`\u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A${a.message}`)}}),y(".dsh-tb-statusbtn",s).forEach(a=>a.addEventListener("click",async()=>{try{let l=await p({status:a.dataset.status});b(l),M("\u2713 \u72B6\u6001\u5DF2\u66F4\u65B0")}catch(l){alert(`\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${l.message}`)}})),o('[data-act="split"]',s)?.addEventListener("click",()=>{let a=document.createElement("div");a.className="dsh-tb-modal-mask",a.innerHTML=`<div class="dsh-tb-modal">
				<h3>\u62C6\u5206\u4EFB\u52A1\uFF1A${i(t.title)}</h3>
				<div class="dsh-tb-field"><label>\u5B50\u4EFB\u52A1\u6807\u9898\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u62C6\u5206\u540E\u81EA\u52A8\u7EE7\u627F\u4ED3\u5E93/\u4F18\u5148\u7EA7/\u6807\u7B7E/\u5173\u8054\u4F1A\u8BDD\uFF09</label>
					<textarea id="tb-split-titles" style="min-height:120px" placeholder="\u4F8B\u5982\uFF1A&#10;\u5B9E\u73B0\u529F\u80FD A&#10;\u5B9E\u73B0\u529F\u80FD B&#10;\u8054\u8C03\u4E0E\u6D4B\u8BD5"></textarea></div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="do" class="dsh-tb-primary">\u62C6\u5206</button>
				</div>
			</div>`,document.body.appendChild(a);let l=()=>a.remove();o('[data-act="cancel"]',a).addEventListener("click",l),a.addEventListener("click",v=>{v.target===a&&l()}),o('[data-act="do"]',a).addEventListener("click",async()=>{let v=o("#tb-split-titles",a).value.split(`
`).map(r=>r.trim()).filter(Boolean);if(!v.length){o("#tb-split-titles",a).focus();return}try{let{tasks:r}=await x(`/tasks/${e}/split`,{method:"POST",body:JSON.stringify({titles:v})});l(),await V(),M(`\u2713 \u5DF2\u62C6\u5206\u4E3A ${r.length} \u4E2A\u5B50\u4EFB\u52A1`),r?.[0]&&D(r[0].id)}catch(r){alert(`\u62C6\u5206\u5931\u8D25\uFF1A${r.message}`)}}),o("#tb-split-titles",a).focus()})}ht(),ft(),xt(),_t(),new MutationObserver(()=>{ht(),ft(),xt()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",t=>{t.ctrlKey&&t.shiftKey&&(t.key==="B"||t.key==="b")&&(t.preventDefault(),F())}),document.addEventListener("click",t=>{if(!X())return;let e=t.target;e instanceof Element&&(e.closest(`[${C}]`)||e.closest('[data-pane="sidebar"], [class*="sidebarCol"]')&&F(!1))});function Kt(){let t=ct();if(!t||t.clientWidth===0)return;let e=t.style.width;try{t.style.width=`${t.clientWidth-1}px`,t.offsetWidth,t.style.width=e||""}catch{}}let Wt=[300,800,1600],yt=()=>{for(let t of Wt)setTimeout(Kt,t)};document.readyState==="loading"?window.addEventListener("load",yt):yt()})();})();

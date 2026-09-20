(()=>{(()=>{if(window.__dshTaskboardLoaded)return;window.__dshTaskboardLoaded=!0;let Wt="/taskboard/api",w={todo:{label:"\u5F85\u529E",color:"#8b949e"},in_progress:{label:"\u8FDB\u884C\u4E2D",color:"#3478f6"},in_review:{label:"\u8BC4\u5BA1\u4E2D",color:"#bc8cff"},blocked:{label:"\u5DF2\u963B\u585E",color:"#f85149"},done:{label:"\u5DF2\u5B8C\u6210",color:"#3fb950"}},q=["todo","in_progress","in_review","blocked","done"],B={low:{label:"\u4F4E",color:"#8b949e"},medium:{label:"\u4E2D",color:"#d29922"},high:{label:"\u9AD8",color:"#e3862e"},urgent:{label:"\u7D27\u6025",color:"#f85149"}},ct={none:"\u2014",pending:"\u8BC4\u5BA1\u5F85\u5904\u7406",approved:"\u8BC4\u5BA1\u901A\u8FC7",rejected:"\u8BC4\u5BA1\u9A73\u56DE"},bt={none:"\u2014",pending:"\u6D4B\u8BD5\u5F85\u5904\u7406",passed:"\u6D4B\u8BD5\u901A\u8FC7",failed:"\u6D4B\u8BD5\u5931\u8D25"},$t=["#79c0ff","#d2a8ff","#7ee787","#ffa657","#ff7b72","#f2cc60","#a5d6ff","#ffd7a8"],A="data-dsh-taskboard-active",_="data-dsh-taskboard-entry",O="data-dsh-taskboard-view",U="data-dsh-ssh-active",Ut='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M6.5 6.5v7"/></svg>',o=(t,e=document)=>e.querySelector(t),y=(t,e=document)=>[...e.querySelectorAll(t)],c=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),Y=t=>{let e=String(t||"").split("/").filter(Boolean);return e.length?e[e.length-1]:String(t||"")},Ft=t=>{let e=0;for(let s of String(t))e=e*31+s.charCodeAt(0)>>>0;return $t[e%$t.length]},J=t=>{if(!t)return"";let e=new Date(t),s=Date.now()-t;return s<6e4?"\u521A\u521A":s<36e5?`${Math.floor(s/6e4)} \u5206\u949F\u524D`:s<864e5?`${Math.floor(s/36e5)} \u5C0F\u65F6\u524D`:`${e.getMonth()+1}/${e.getDate()} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},M=[],F=[],K=[],pt=[],j={q:"",repo:"",priority:"",status:"",label:""},N="overview",ot={};async function x(t,e={}){let s=await fetch(Wt+t,{headers:{"content-type":"application/json"},...e}),n=await s.json().catch(()=>({}));if(!s.ok)throw new Error(n.error||`HTTP ${s.status}`);return n}let Xt=`
<style>
/* \u53EA\u5728\u4EFB\u52A1\u770B\u677F\u6253\u5F00\u65F6\u624D\u628A\u5BF9\u8BDD\u5217\u8BBE\u4E3A\u5B9A\u4F4D\u951A\u70B9\uFF1B\u6B63\u5E38\u5BF9\u8BDD\u65F6\u4E0D\u5E72\u9884\u65B0\u7248\u5E03\u5C40\uFF0C
   \u907F\u514D\u7EDD\u5BF9\u5B9A\u4F4D\u6D6E\u5C42\uFF08\u542B\u8F93\u5165\u533A\u76F8\u5173\uFF09\u7684\u5305\u542B\u5757\u88AB\u6539\u53D8\u5BFC\u81F4\u8F93\u5165\u88AB\u906E\u6321 */
html[${A}] [data-pane='conversation'],
html[${A}] [class*='centerCol'] { position: relative; }
[${O}] {
  position: absolute; inset: 0; display: none; z-index: 60;
  background: var(--dsw-alias-bg-base, #0d1117); overflow: hidden;
}
html[${A}]:not([${U}]) [data-pane='conversation'] > div[${O}],
html[${A}]:not([${U}]) [class*='centerCol'] > div[${O}] {
  display: flex !important; flex-direction: column;
}
html[${A}]:not([${U}]) [data-pane='conversation'] > :not([${O}]),
html[${A}]:not([${U}]) [class*='centerCol'] > :not([${O}]) {
  display: none !important;
}
[${_}] {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 32px;
  padding: 0 12px; background: transparent; border: none; border-radius: 8px;
  color: var(--dsw-alias-label-secondary, #9aa7b4); cursor: pointer;
  font-size: 13px; white-space: nowrap; transition: background .15s, color .15s;
}
[${_}]:hover { background: var(--dsw-specific-sidebar-nav-item-hover, #1b2127); color: var(--dsw-alias-label-primary, #e6edf3); }
[${_}][data-active] { background: var(--dsw-specific-sidebar-nav-item-active, #232a31); color: var(--dsw-alias-label-primary, #e6edf3); font-weight: 600; }
[${_}] span { display: inline-flex; align-items: center; justify-content: center; flex: none; }
[${_}][data-icon-only] { gap: 0; justify-content: center; padding: 0; height: 36px; margin-bottom: 12px; }
[${_}][data-icon-only] > span:not(:first-child) { display: none; }

/* \u4FA7\u8FB9\u680F\u300C\u6700\u65B0\u5BF9\u8BDD\u300D\u5E38\u9A7B\u5C0F\u7EC4\u4EF6\uFF08\u9489\u5728 New Session \u4E0B\u65B9\u3001\u4F1A\u8BDD\u5217\u8868\u4E4B\u4E0A\uFF09 */
#dsh-recent { border-top: 1px solid var(--dsw-alias-border-l2,#2a3138); }
.dsh-recent-head{display:flex;align-items:center;gap:6px;padding:5px 10px;font-size:11.5px;font-weight:700;color:var(--dsw-alias-label-secondary,#9aa7b4);cursor:pointer;letter-spacing:.2px;user-select:none}
.dsh-recent-head .arrow{font-size:8px;transition:transform .15s;color:#768390}
.dsh-recent.collapsed .dsh-recent-head .arrow{transform:rotate(-90deg)}
.dsh-recent-head .title{flex:1}
.dsh-recent-head .cnt{font-weight:600;font-size:10.5px;color:#79c0ff;background:#79c0ff14;border-radius:9px;padding:0 7px;flex:none}
.dsh-recent-refresh{background:transparent;border:0;color:var(--dsw-alias-label-secondary,#9aa7b4);cursor:pointer;font-size:12px;padding:0 2px;line-height:1;display:inline-flex}
.dsh-recent-refresh:hover{color:var(--dsw-alias-label-primary,#e6edf3)}
.dsh-recent-body{display:flex;flex-direction:column;gap:1px;padding:0 6px 6px;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin}
.dsh-recent-refresh.on{color:#79c0ff}
/* \u5217\u8868\u5E95\u90E8\u7684\u5C55\u5F00/\u6536\u8D77\u6309\u94AE\uFF1A\u5E38\u663E\u3001\u6574\u884C\u53EF\u70B9\uFF0C\u6EDA\u52A8\u65F6\u56FA\u5B9A\u5728\u5217\u8868\u4E0B\u65B9 */
.dsh-recent-more{display:block;width:calc(100% - 12px);margin:2px 6px 6px;padding:5px 8px;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);border-radius:8px;color:var(--dsw-alias-label-secondary,#9aa7b4);font-size:11.5px;font-weight:600;cursor:pointer;text-align:center;transition:color .12s,border-color .12s,background .12s}
.dsh-recent-more:hover{color:var(--dsw-alias-label-primary,#e6edf3);border-color:#79c0ff66;background:#79c0ff14}
.dsh-recent-more.open{color:#79c0ff}

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
/* \u884C\u5185"\u4ECE\u6700\u65B0\u91CC\u79FB\u9664"\u6309\u94AE\uFF1Ahover \u624D\u663E\u5F62\uFF0C\u5E73\u65F6\u4E0D\u5360\u89C6\u89C9\u7A7A\u95F4\uFF08\u4F46\u4ECD\u5360\u4F4D\u907F\u514D\u884C\u5185\u5143\u7D20\u8DF3\u52A8\uFF09 */
.dsh-recent-row .hide{flex:none;background:transparent;border:0;color:var(--dsw-alias-label-tertiary,#768390);cursor:pointer;font-size:11px;line-height:1;padding:2px 4px;border-radius:4px;opacity:.35;transition:opacity .12s,color .12s,background .12s}
.dsh-recent-row:hover .hide{opacity:1}

.dsh-recent-row .hide:hover{color:#f85149;background:#f8514918}
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
.dsh-tb-sess .dsh-tb-sess-gone{color:var(--dsw-alias-label-tertiary,#768390);font-style:italic}
.dsh-tb-sess button{flex:none;background:var(--dsw-alias-bg-layer-2,#1b2127);border:1px solid var(--dsw-alias-border-l2,#2a3138);color:var(--dsw-alias-label-primary,#e6edf3);border-radius:6px;padding:3px 9px;font-size:11px;cursor:pointer;transition:all .12s}
.dsh-tb-sess button:hover{border-color:var(--dsw-alias-border-accent,#bc8cff)}
.dsh-tb-sess button.dsh-tb-open{background:linear-gradient(135deg,#3478f6,#2a5fd8);border-color:transparent;color:#fff}
.dsh-tb-sess button.dsh-tb-open:hover{filter:brightness(1.1)}
.dsh-tb-run{color:#f2cc60;font-size:10px;border:1px solid #f2cc6066;border-radius:8px;padding:0 6px;margin-left:6px;flex:none;animation:dsh-tb-blink 1.2s ease-in-out infinite}
@keyframes dsh-tb-blink{0%,100%{opacity:1}50%{opacity:.45}}
.dsh-tb-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;background:#1b2127;border:1px solid #3478f6;color:#e6edf3;border-radius:9px;padding:9px 20px;font-size:12.5px;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.5);animation:dsh-tb-toast .18s ease;pointer-events:none}
/* \u5E26"\u64A4\u9500"\u6309\u94AE\u7684 toast\uFF1A\u5FC5\u987B\u53EF\u70B9\uFF0C\u5426\u5219\u64A4\u9500\u70B9\u4E0D\u5230 */
.dsh-tb-toast.actionable{pointer-events:auto;display:flex;align-items:center;gap:12px;padding-right:12px}
.dsh-tb-toast button{background:#3478f6;border:0;color:#fff;border-radius:6px;padding:3px 12px;font-size:12px;font-weight:700;cursor:pointer}
.dsh-tb-toast button:hover{background:#4b8bff}
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
</style>`;document.documentElement.insertAdjacentHTML("beforeend",Xt);let Gt=`
<div id="dsh-tb-view" ${O}="">
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
</div>`;function kt(){let t=document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');return t===null?void 0:t.querySelector('[class*="logoRow"]')?.parentElement??t.firstElementChild}function Et(t){let e=t.querySelector('button[class*="newSession"]');if(e!==null)return e;for(let s of t.children)if(s.tagName==="BUTTON")return s}function Lt(){return document.querySelector('[data-pane="conversation"]')??document.querySelector('[class*="centerCol"]')??void 0}function St(t){return[...t.classList].some(e=>/collapsed/i.test(e))}let $=null,X=null;function G(){return document.documentElement.hasAttribute(A)}function Ct(){$!==null&&(G()?$.setAttribute("data-active",""):$.removeAttribute("data-active"))}function Q(t){let e=t!==void 0?t:!G();e&&document.documentElement.removeAttribute(U),e?document.documentElement.setAttribute(A,""):document.documentElement.removeAttribute(A),Ct(),e&&et()}function Tt(){if(X!==null)return;let t=Lt();t!==void 0&&(X=document.createElement("div"),X.setAttribute(O,""),X.innerHTML=Gt,t.appendChild(X),ae())}function zt(){let t=kt();if(t===void 0||($===null&&($=document.createElement("button"),$.type="button",$.setAttribute(_,""),$.innerHTML=`<span>${Ut}</span><span>\u4EFB\u52A1\u770B\u677F</span>`,$.title="\u4EFB\u52A1\u770B\u677F",$.addEventListener("click",()=>Q()),Ct()),$.parentElement===t))return;let e=Et(t),s=e?.closest('[class*="logoRow"]'),n=s!=null&&s.parentElement===t?s:e;t.insertBefore($,n?.nextElementSibling??null),(()=>{$!==null&&(St(t)?$.setAttribute("data-icon-only",""):$.removeAttribute("data-icon-only"))})()}let Z=15,jt="dsh-tb-recent-hidden",At="dsh-tb-recent-expanded",T=!1,E=[],tt=[],I=15,ht=50,nt=new Map;try{T=localStorage.getItem(At)==="1";let t=JSON.parse(localStorage.getItem(jt)||"[]"),e=Date.now();E=(Array.isArray(t)?t:[]).map(s=>typeof s=="string"?{id:s,upto:e}:s&&typeof s.id=="string"?{id:s.id,upto:Number(s.upto)||e}:null).filter(s=>s!==null)}catch{}function ft(){try{localStorage.setItem(jt,JSON.stringify(E))}catch{}}function Mt(){let t=E[E.length-1];if(t===void 0)return;E=E.slice(0,-1),ft(),R();let e=tt.find(s=>H(s.id)===H(t.id));S(`\u5DF2\u6062\u590D\u300C${e?rt(e):_t(t.id)}\u300D`)}let m=null,g=null,V=!1,It=null;function H(t){let e=String(t??"");return e&&!e.startsWith("session-")?`session-${e}`:e}function ut(t){return(t||[]).map(e=>e&&e.id&&H(e.id)!==e.id?{...e,id:H(e.id)}:e)}let vt=!1;function Qt(){return x("/sessions").then(t=>ut(t.sessions||[]))}function rt(t){return t.title&&String(t.title).trim()?String(t.title).trim():String(t.id)}function _t(t){return String(t).replace(/^session-/,"").slice(0,8)}function Pt(t){let e=!1,s=new Set,n=[],d=[],h=st();for(let l of[...t||[]].sort((f,i)=>(i.updatedAt||0)-(f.updatedAt||0))){if(!l||!l.id||s.has(l.id))continue;s.add(l.id);let f=E.find(i=>i.id===l.id);if(f!==void 0)if((l.updatedAt||0)>f.upto)e=!0,E=E.filter(i=>i!==f);else continue;if(l.empty===!0&&l.id!==h){d.push(l);continue}n.push(l)}return e&&ft(),{visible:n,shells:d}}function Zt(t){return Pt(t).visible.slice(0,T?I:Z)}function gt(){return Pt(tt).visible.length}function Ot(t){return`dsh-tb-read:${t}`}function te(t){if(nt.has(t))return nt.get(t);let e=0;try{e=Number(localStorage.getItem(Ot(t)))||0}catch{}return nt.set(t,e),e}function ee(t){let e=Date.now();nt.set(t,e);try{localStorage.setItem(Ot(t),String(e))}catch{}}function R(){if(g===null)return;let t=Zt(tt),e=gt(),s=g.scrollTop,n=o("#dsh-recent-cnt");n&&(n.textContent=T&&e>t.length?`${t.length}`:e>t.length?`${t.length}/${e}`:`${t.length}`);let d=o("#dsh-recent-more");if(d){let i=e-I;d.style.display=e>Z?"":"none",T?i>0?d.textContent=`\u25BC \u7EE7\u7EED\u52A0\u8F7D\uFF08\u5DF2\u663E\u793A ${I}/${e}\uFF0C\u4E0B\u62C9\u81EA\u52A8\u52A0\u8F7D\uFF09`:d.textContent=`\u25B2 \u6536\u8D77\uFF08\u53EA\u770B ${Z} \u6761\uFF09`:d.textContent=`\u25BC \u5C55\u5F00\u5168\u90E8 ${e} \u6761`,d.classList.toggle("open",T)}let h=o("#dsh-recent-undo");if(h&&(h.style.display=E.length>0?"":"none",h.title="\u64A4\u9500\u4E0A\u4E00\u6B21\u79FB\u9664\uFF08\u9010\u4E2A\u6062\u590D\uFF0C\u4E0D\u4F1A\u4E00\u6B21\u5168\u653E\u56DE\u6765\uFF09",h.textContent="\u21BA"),g.style.maxHeight=T?"72vh":"46vh",!t.length){let i=E.length>0?"\uFF08\u90FD\u79FB\u9664\u4E86\uFF0C\u70B9\u53F3\u4E0A\u89D2 \u21BA \u9010\u4E2A\u6062\u590D\uFF09":"\uFF08\u6682\u65E0\u6700\u8FD1\u4F1A\u8BDD\uFF09";g.innerHTML=`<div class="dsh-recent-empty">${i}</div>`;return}let l=st(),f=new Map;for(let i of t){let p=rt(i);f.set(p,(f.get(p)||0)+1)}g.innerHTML=t.map(i=>{let p=rt(i),a=(f.get(p)||0)>1,b=i.id===l,u="";return i.running?u='<span class="dot run"></span>':i.updatedAt&&i.updatedAt>te(i.id)&&(u='<span class="dot idle"></span>'),`<div class="dsh-recent-row${b?" cur":""}" data-sid="${c(i.id)}" title="\u6253\u5F00\u5E76\u7EE7\u7EED\uFF1A${c(p)}\uFF08${c(i.id)}\uFF09">
				<span class="slot">${u}</span>
				<span class="title">${c(p)}</span>
				${a?`<span class="sid">${c(_t(i.id))}</span>`:""}
				<span class="time">${J(i.updatedAt)}</span>
				<button class="hide" data-hide="${c(i.id)}" title="\u4ECE\u300C\u6700\u65B0\u5BF9\u8BDD\u300D\u91CC\u79FB\u9664\uFF08\u4E0D\u5220\u9664\u4F1A\u8BDD\u672C\u8EAB\uFF1B\u9876\u90E8 \u21BA \u53EF\u6309\u9006\u5E8F\u9010\u4E2A\u6062\u590D\uFF09">\u2715</button>
			</div>`}).join(""),y(".dsh-recent-row",g).forEach(i=>i.addEventListener("click",()=>{it(i.dataset.sid)})),y(".dsh-recent-row .hide",g).forEach(i=>i.addEventListener("click",p=>{p.stopPropagation();let a=i.dataset.hide,b=t.find(u=>u.id===a);E=E.filter(u=>u.id!==a).concat({id:a,upto:b?.updatedAt||Date.now()}),ft(),R(),S(`\u5DF2\u79FB\u9664\u300C${rt(b??{id:a})}\u300D`,{label:"\u64A4\u9500",run:()=>{Mt()}})})),g.scrollTop=s}function D(){return vt?Promise.resolve():(vt=!0,Qt().then(t=>{tt=t,R()}).catch(()=>{tt.length===0&&R()}).finally(()=>{vt=!1}))}function Nt(){let t=kt();if(t===void 0||(m===null&&(m=document.createElement("div"),m.id="dsh-recent",m.className="dsh-recent",m.innerHTML=`
				<div class="dsh-recent-head" id="dsh-recent-head">
					<span class="arrow">\u25BC</span><span class="title">\u6700\u65B0\u5BF9\u8BDD</span>
					<span class="cnt" id="dsh-recent-cnt">0</span>
					<button class="dsh-recent-refresh" id="dsh-recent-undo" title="\u6062\u590D\u9690\u85CF\u7684\u5BF9\u8BDD" style="display:none">\u21BA</button>
					<button class="dsh-recent-refresh" id="dsh-recent-refresh" title="\u5237\u65B0">\u27F3</button>
				</div>
				<div class="dsh-recent-body" id="dsh-recent-body"></div>
				<button class="dsh-recent-more" id="dsh-recent-more" style="display:none"></button>`,g=o("#dsh-recent-body",m),o("#dsh-recent-head",m).addEventListener("click",()=>{V=!V,m&&m.classList.toggle("collapsed",V),g&&(g.style.display=V?"none":"")}),o("#dsh-recent-refresh",m).addEventListener("click",d=>{d.stopPropagation(),D()}),o("#dsh-recent-more",m).addEventListener("click",d=>{d.stopPropagation(),T?I<gt()?I+=ht:(T=!1,I=Z):(T=!0,I=Z+ht);try{localStorage.setItem(At,T?"1":"0")}catch{}R()}),g.addEventListener("scroll",()=>{!T||g===null||I>=gt()||g.scrollTop+g.clientHeight<g.scrollHeight-60||(I+=ht,R())}),o("#dsh-recent-undo",m).addEventListener("click",d=>{d.stopPropagation(),Mt()}),R(),D()),m.parentElement===t))return;let e=$??Et(t);t.insertBefore(m,e?.nextElementSibling??null),g&&(g.style.maxHeight="46vh",g.style.overflowY="auto"),(()=>{g&&(g.style.display=V?"none":""),m&&m.classList.toggle("collapsed",V)})(),(()=>{m&&(St(t)?m.style.display="none":m.style.display="")})()}function se(){if(It!==null)return;It=setInterval(()=>{document.hidden||D()},15e3),window.addEventListener("focus",()=>D()),document.addEventListener("visibilitychange",()=>{document.hidden||D()});let t=st();setInterval(()=>{if(document.hidden)return;let e=st();e!==t&&(t=e,D())},2e3)}function ae(){o("#dsh-tb-new")?.addEventListener("click",Jt),o("#dsh-tb-refresh")?.addEventListener("click",()=>et()),o("#dsh-tb-search")?.addEventListener("input",()=>{j.q=o("#dsh-tb-search").value.trim(),L()}),o("#dsh-tb-repo-filter")?.addEventListener("change",()=>{j.repo=o("#dsh-tb-repo-filter").value,L()}),o("#dsh-tb-priority-filter")?.addEventListener("change",()=>{j.priority=o("#dsh-tb-priority-filter").value,L()}),o("#dsh-tb-status-filter")?.addEventListener("change",()=>{j.status=o("#dsh-tb-status-filter").value,L()}),o("#dsh-tb-label-filter")?.addEventListener("change",()=>{j.label=o("#dsh-tb-label-filter").value,L()}),y(".dsh-tb-tab").forEach(t=>t.addEventListener("click",()=>{N=t.dataset.tbView,dt()}))}async function L(){let t=new URLSearchParams;for(let s of["q","repo","priority","status","label"])j[s]&&t.set(s,j[s]);M=(await x(`/tasks?${t}`)).tasks||[],dt()}async function oe(){try{let[t,e]=await Promise.all([x("/sessions"),x("/workspaces")]);F=ut(t.sessions||[]),K=e.workspaces||[];let s=o("#dsh-tb-repo-filter");if(s){let i=s.value;s.innerHTML='<option value="">\u5168\u90E8\u4ED3\u5E93</option>'+K.map(p=>`<option value="${c(p.path)}" title="${c(p.path)}">${c(Y(p.path))}</option>`).join(""),i&&[...s.options].some(p=>p.value===i)&&(s.value=i)}let n=await x("/tasks").catch(()=>({tasks:[]})),d=new Set;for(let i of n.tasks||[])for(let p of i.labels||[])d.add(p);pt=[...d].sort();let h=o("#dsh-tb-label-filter");if(h){let i=h.value;h.innerHTML='<option value="">\u5168\u90E8\u6807\u7B7E</option>'+pt.map(p=>`<option value="${c(p)}">${c(p)}</option>`).join(""),i&&[...h.options].some(p=>p.value===i)&&(h.value=i)}let l=o("#dsh-tb-priority-filter");l&&!l.options.length&&(l.innerHTML='<option value="">\u5168\u90E8\u4F18\u5148\u7EA7</option>'+Object.entries(B).map(([i,p])=>`<option value="${i}">${p.label}</option>`).join(""));let f=o("#dsh-tb-status-filter");f&&!f.options.length&&(f.innerHTML='<option value="">\u5168\u90E8\u72B6\u6001</option>'+Object.entries(w).map(([i,p])=>`<option value="${i}">${p.label}</option>`).join(""))}catch{}}async function ne(){for(let t of K)if(!(!t.path||ot[t.path]!==void 0))try{let e=await fetch(`/ide/api/git?op=status&path=${encodeURIComponent(t.path)}`).then(s=>s.json());ot[t.path]=e.git?{branch:e.branch?.name||"(detached)",dirty:(e.files||[]).length}:null}catch{ot[t.path]=null}}function et(){return oe().then(()=>ne()).then(L).catch(L)}function Ht(t){return(t.labels||[]).map(e=>`<span class="dsh-tb-pill" style="color:${Ft(e)}">${c(e)}</span>`).join("")}function re(t){let e=w[t.status]||w.todo;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function Rt(t){let e=B[t.priority]||B.medium;return`<span class="dsh-tb-pill" style="color:${e.color}">${e.label}</span>`}function ie(t){let e=(s,n,d)=>`<button type="button" class="dsh-tb-statusbtn ${d||""}" data-status="${s}">${n}</button>`;switch(t.status){case"todo":return`${e("in_progress","\u25B6 \u5F00\u59CB\u6267\u884C")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_progress":return`${e("in_review","\u63D0\u4EA4\u8BC4\u5BA1")} ${e("blocked","\u26D4 \u963B\u585E","ghost")}`;case"in_review":return`${e("done","\u2705 \u786E\u8BA4\u5B8C\u6210","primary")} ${e("in_progress","\u21A9 \u9000\u56DE\u4FEE\u6539")}`;case"done":return`${e("in_progress","\u21A9 \u91CD\u65B0\u6253\u5F00","ghost")}`;case"blocked":return`${e("in_progress","\u25B6 \u6062\u590D\u8FDB\u884C")}`;default:return""}}let xt=null,Dt=0,de=5e3;function le(){let t=new Set,e=document.querySelectorAll('[class*="centerCol"], [class*="sidebarCol"], [class*="frame"], [class*="App"], body > div');for(let s of e){for(let n of Object.keys(s)){if(!n.startsWith("__reactFiber$")&&!n.startsWith("__reactContainer$"))continue;let d=s[n];for(;d&&d.return;)d=d.return;d&&t.add(d)}if(t.size>0)break}return[...t]}function qt(){let t=Date.now();if(xt!==null&&t-Dt<de)return xt;let e={open:null,startSession:null},s=le(),n=0,d=t+40;for(;s.length>0&&n++<4e4&&!((n&255)===0&&Date.now()>d);){let h=s.shift(),l=h.memoizedProps;if(l!==null&&typeof l=="object"){e.open===null&&typeof l.open=="function"&&(e.open=l.open),e.startSession===null&&typeof l.startSession=="function"&&(e.startSession=l.startSession);let f=l.sessions??l.sessionService;if(f!==null&&typeof f=="object"&&(e.open===null&&typeof f.open=="function"&&(e.open=f.open),e.startSession===null&&typeof f.start=="function"&&(e.startSession=f.start)),e.open!==null&&e.startSession!==null)break}h.child&&s.push(h.child),h.sibling&&s.push(h.sibling)}return xt=e,Dt=Date.now(),e}function ce(){return qt().open}function st(){try{let t=localStorage.getItem("dsh.sessions.current");if(t===null)return null;let e=JSON.parse(t);return typeof e?.sessionId=="string"?e.sessionId:null}catch{return null}}function Bt(){let t=[...document.querySelectorAll('[class*="_handle"], [class*="handle"]')].find(i=>i.offsetParent!==null&&getComputedStyle(i).cursor==="col-resize");if(!t)return!1;let e=t.getBoundingClientRect(),s=Math.round(e.left+e.width/2),n=Math.round(e.top+Math.min(200,e.height/2)),d=Element.prototype,h=d.setPointerCapture,l=d.hasPointerCapture,f=d.releasePointerCapture;try{d.setPointerCapture=function(){},d.hasPointerCapture=function(){return!0},d.releasePointerCapture=function(){};let i=(p,a)=>new PointerEvent(p,{bubbles:!0,cancelable:!0,composed:!0,pointerId:1,pointerType:"mouse",isPrimary:!0,buttons:1,clientX:a,clientY:n});return t.dispatchEvent(i("pointerdown",s)),t.dispatchEvent(i("pointermove",s+1)),t.dispatchEvent(i("pointerup",s+1)),!0}catch{return!1}finally{d.setPointerCapture=h,d.hasPointerCapture=l,d.releasePointerCapture=f}}function it(t){t=H(t),ee(t);try{let e=ce();if(typeof e=="function"){try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t}))}catch{}e(t),G()&&Q(!1),y(".dsh-tb-modal-mask").forEach(s=>s.remove()),D();return}}catch{}try{localStorage.setItem("dsh.sessions.current",JSON.stringify({sessionId:t})),localStorage.setItem("dsh-taskboard.unstick",String(Date.now()))}catch{}location.reload()}async function Yt(t){if(be()){G()&&Q(!1),y(".dsh-tb-modal-mask").forEach(e=>e.remove()),pe(t);try{await x(`/tasks/${t}/arm-session`,{method:"POST",body:"{}"}),S("\u5DF2\u8FDB\u5165\u65B0\u5BF9\u8BDD\uFF1A\u53D1\u9001\u7B2C\u4E00\u6761\u6D88\u606F\u540E\u81EA\u52A8\u7ED1\u5B9A\u5230\u8BE5\u4EFB\u52A1")}catch(e){S(`\u26A0 \u767B\u8BB0\u5931\u8D25\uFF08\u4E0D\u4F1A\u81EA\u52A8\u7ED1\u5B9A\uFF09\uFF1A${e.message}`)}return!0}try{let{sessionId:e}=await x(`/tasks/${t}/session`,{method:"POST",body:"{}"});return he("\u2713 \u5DF2\u65B0\u5EFA\u5BF9\u8BDD\u5E76\u7ED1\u5B9A\u5230\u8BE5\u4EFB\u52A1"),it(e),!0}catch(e){return alert(`\u65B0\u5EFA\u5BF9\u8BDD\u5931\u8D25\uFF1A${e.message}`),!1}}function be(){let t=document.querySelector('button[class*="newSession"]');if(t!==null)return t.click(),!0;let e=qt();if(typeof e.startSession=="function")try{return e.startSession(),!0}catch{}return!1}function pe(t){x(`/tasks/${t}/context`).then(e=>{let s=e?.context;if(!(typeof s!="string"||!s))return navigator.clipboard?.writeText?.(s)}).catch(()=>{})}function he(t){try{localStorage.setItem("dsh-taskboard.pending-toast",t)}catch{}}function S(t,e){let s=document.createElement("div");s.className="dsh-tb-toast";let n=document.createElement("span");if(n.textContent=t,s.appendChild(n),e!==void 0){s.classList.add("actionable");let d=document.createElement("button");d.type="button",d.textContent=e.label,d.addEventListener("click",()=>{s.remove(),e.run()}),s.appendChild(d)}document.body.appendChild(s),setTimeout(()=>s.remove(),e===void 0?1600:8e3)}function fe(){var u;let t={};for(let r of q)t[r]=0;let e={};for(let r of M){t[r.status]!==void 0&&t[r.status]++;let v=r.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(e[v]||(e[v]=[])).push(r)}let s=M.length,n=t.done||0,d=s?Math.round(n/s*100):0,h={};for(let r of F)r.repo&&(h[u=r.repo]||(h[u]=[])).push(r);let l=[...M].sort((r,v)=>v.updatedAt-r.updatedAt).slice(0,10),i='<div class="dsh-tb-ov-stat dsh-tb-ov-add" id="dsh-tb-ov-new" title="\u65B0\u5EFA\u4EFB\u52A1"><div class="dsh-tb-ov-addbtn">\uFF0B \u65B0\u5EFA\u4EFB\u52A1</div></div>'+[["\u5168\u90E8\u4EFB\u52A1",s,"#e6edf3",""],...q.map(r=>[w[r].label,t[r]||0,w[r].color,r]),["\u5B8C\u6210\u7387",`${d}%`,"#3fb950",null]].map(([r,v,C,k])=>{let wt=r==="\u5B8C\u6210\u7387"?d:s?Math.round(v/s*100):0,lt=k!==null?" dsh-tb-ov-stat-click":"",yt=k===""?"\u67E5\u770B\u5168\u90E8\u4EFB\u52A1":k?`\u67E5\u770B\u300C${r}\u300D\u7684\u4EFB\u52A1`:"";return`<div class="dsh-tb-ov-stat${lt}" ${k!==null?`data-status="${k}"`:""} title="${yt}"><div class="n" style="color:${C}">${v}</div><div class="l">${r}</div><div class="mini"><i style="width:${wt}%;background:${C}"></i></div></div>`}).join(""),p;K.length?p=K.map(r=>{let v=e[r.path]||e[r.title]||[],C=q.map(z=>v.filter(P=>P.status===z).length),k=v.length,wt=C[q.indexOf("done")]||0,lt=k?Math.round(wt/k*100):0,yt=k?q.map((z,P)=>C[P]?`<i style="width:${Math.round(C[P]/k*100)}%;background:${w[z].color}" title="${w[z].label} ${C[P]}"></i>`:"").join(""):"",ye=q.map((z,P)=>C[P]?`<span class="st"><i class="dot" style="background:${w[z].color}"></i>${w[z].label} <b>${C[P]}</b></span>`:"").join(""),$e=(h[r.path]||h[r.title]||[]).length,at=ot[r.path],ke=at?`<span class="branch">\u2387 ${c(at.branch)}</span>${at.dirty?`<span class="branch dirty" title="${at.dirty} \u4E2A\u672A\u63D0\u4EA4\u6587\u4EF6">\u25CF${at.dirty}</span>`:""}`:"",Vt=(h[r.path]||h[r.title]||[]).slice(0,3).map(z=>`<div class="s" data-sid="${c(z.id)}" title="\u6253\u5F00\u4F1A\u8BDD ${c(z.id)}">\u25B8 ${c(z.title)}</div>`).join("");return`<div class="dsh-tb-ov-ws" data-repo="${c(r.path)}">
					<div class="ws-head"><h4>${c(r.title)}</h4><span class="ws-total">${k} \u4E2A\u4EFB\u52A1</span></div>
					<div class="path">${c(r.path||"")}</div>
					${k?`<div class="stack">${yt}</div><div class="ws-stats">${ye}</div>`:'<div class="ws-stats" style="color:var(--dsw-alias-label-secondary,#9aa7b4)">\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA</div>'}
					<div class="comp"><span class="pct">\u5B8C\u6210\u7387 ${lt}%</span><div class="track"><i style="width:${lt}%"></i></div></div>
					<div class="meta">${ke}<span class="sess">\u4F1A\u8BDD ${$e}</span></div>
					${Vt?`<div class="sesslist">${Vt}</div>`:""}
				</div>`}).join(""):p='<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u5DE5\u4F5C\u533A\uFF09</div>';let a=l.length?l.map(r=>{let v=w[r.status]||w.todo;return`<div class="dsh-tb-ov-item" data-id="${c(r.id)}">
				<span class="dot" style="background:${v.color}"></span>
				<span class="t">${c(r.title)}</span>
				${r.repo?`<span class="r">${c(Y(r.repo))}</span>`:""}
				<span class="tm">${J(r.updatedAt)}</span>
			</div>`}).join(""):'<div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF09</div>',b=o("#dsh-tb-body");b&&(b.innerHTML=`<div class="dsh-tb-ov">
			<div class="dsh-tb-ov-stats">${i}</div>
			<div class="dsh-tb-ov-sec">\u5DE5\u4F5C\u533A\u5185\u5BB9</div>
			<div class="dsh-tb-ov-grid">${p}</div>
			<div class="dsh-tb-ov-sec">\u6700\u8FD1\u66F4\u65B0</div>
			<div class="dsh-tb-ov-recent">${a}</div>
		</div>`,o("#dsh-tb-ov-new")?.addEventListener("click",Jt),y(".dsh-tb-ov-stat[data-status]").forEach(r=>r.addEventListener("click",()=>{j.status=r.dataset.status,N="list",dt(),L()})),y(".dsh-tb-ov-ws").forEach(r=>r.addEventListener("click",()=>{j.repo=r.dataset.repo;let v=o("#dsh-tb-repo-filter");v&&(v.value=j.repo),N="kanban",dt(),L()})),y(".dsh-tb-ov-ws .s").forEach(r=>r.addEventListener("click",v=>{v.stopPropagation(),it(r.dataset.sid)})),y(".dsh-tb-ov-item").forEach(r=>r.addEventListener("click",()=>{r.dataset.id&&W(r.dataset.id)})))}function ue(t){let e=w[t.status]||w.todo,s=B[t.priority]||B.medium,n=[];n.push(Rt(t)),t.status==="in_review"&&n.push('<span class="dsh-tb-pill" style="color:#bc8cff;font-weight:600">\u25C9 \u5F85 review</span>'),t.repo&&n.push(`<span class="dsh-tb-pill" style="color:#79c0ff">${c(Y(t.repo))}</span>`),t.feature&&n.push(`<span class="dsh-tb-pill" style="color:#d2a8ff">${c(t.feature)}</span>`),n.push(Ht(t)),t.review&&t.review!=="none"&&n.push(`<span class="dsh-tb-pill" style="color:${t.review==="approved"?"#3fb950":t.review==="rejected"?"#f85149":"#d29922"}">${ct[t.review]}</span>`),t.test&&t.test!=="none"&&n.push(`<span class="dsh-tb-pill" style="color:${t.test==="passed"?"#3fb950":t.test==="failed"?"#f85149":"#d29922"}">${bt[t.test]}</span>`);let d=[];return t.sessionIds?.length&&d.push(`<span>\u4F1A\u8BDD ${t.sessionIds.length}</span>`),t.notes?.length&&d.push(`<span>\u8BC4\u8BBA ${t.notes.length}</span>`),d.push(`<span>${J(t.updatedAt)}</span>`),`<div class="dsh-tb-card" data-id="${c(t.id)}" style="border-left:3px solid ${e.color}">
			<div class="dsh-tb-card-title">${c(t.title)}</div>
			<div class="dsh-tb-card-meta">${n.join("")}</div>
			${t.displayProgress>0?`<div class="dsh-tb-bar"><i style="width:${Math.min(100,t.displayProgress)}%"></i></div>`:""}
			<div class="dsh-tb-card-foot">${d.join(" \xB7 ")}</div>
		</div>`}function ve(){let t=o("#dsh-tb-body"),e=o("#dsh-tb-count");if(!t)return;t.innerHTML='<div class="dsh-tb-columns"></div>';let s=o(".dsh-tb-columns",t);e&&(e.textContent=`${M.length} \u4E2A\u4EFB\u52A1`);for(let[n,d]of Object.entries(w)){let h=document.createElement("div");h.className="dsh-tb-col";let l=M.filter(i=>i.status===n);h.innerHTML=`<div class="dsh-tb-col-head">${d.label} <b>${l.length}</b></div><div class="dsh-tb-col-body"></div>`;let f=o(".dsh-tb-col-body",h);l.length?l.forEach(i=>f.insertAdjacentHTML("beforeend",ue(i))):f.innerHTML='<div class="dsh-tb-empty">\u2014</div>',s.appendChild(h)}y(".dsh-tb-card",s).forEach(n=>n.addEventListener("click",()=>W(n.dataset.id)))}function ge(){let t=o("#dsh-tb-body"),e=o("#dsh-tb-count");if(!t)return;if(e&&(e.textContent=`${M.length} \u4E2A\u4EFB\u52A1`),!M.length){t.innerHTML='<div class="dsh-tb-ov"><div class="dsh-tb-empty">\uFF08\u6682\u65E0\u4EFB\u52A1\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u300D\u521B\u5EFA\uFF09</div></div>';return}let s=M.map(n=>`<tr data-id="${c(n.id)}">
			<td>${re(n)}</td>
			<td>${Rt(n)}</td>
			<td style="max-width:340px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(n.title)}</div></td>
			<td>${n.repo?`<span class="dsh-tb-pill" style="color:#79c0ff">${c(Y(n.repo))}</span>`:""}</td>
			<td style="max-width:140px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(n.feature||"")}</div></td>
			<td>${Ht(n)}</td>
			<td style="min-width:90px">${n.displayProgress>0?`<div class="dsh-tb-bar" style="margin:0"><i style="width:${Math.min(100,n.displayProgress)}%"></i></div>`:""}</td>
			<td>${n.review!=="none"?`<span class="dsh-tb-pill" style="color:${n.review==="approved"?"#3fb950":n.review==="rejected"?"#f85149":"#d29922"}">${ct[n.review]}</span>`:""}</td>
			<td>${n.test!=="none"?`<span class="dsh-tb-pill" style="color:${n.test==="passed"?"#3fb950":n.test==="failed"?"#f85149":"#d29922"}">${bt[n.test]}</span>`:""}</td>
			<td style="white-space:nowrap">${J(n.updatedAt)}</td>
		</tr>`).join("");t.innerHTML=`<div class="dsh-tb-ov" style="padding:0">
			<table class="dsh-tb-table">
				<thead><tr><th>\u72B6\u6001</th><th>\u4F18\u5148\u7EA7</th><th>\u4EFB\u52A1</th><th>\u4ED3\u5E93</th><th>\u5206\u652F/feature</th><th>\u6807\u7B7E</th><th>\u8FDB\u5EA6</th><th>Review</th><th>\u6D4B\u8BD5</th><th>\u66F4\u65B0</th></tr></thead>
				<tbody>${s}</tbody>
			</table>
		</div>`,y("tr[data-id]",t).forEach(n=>n.addEventListener("click",()=>W(n.dataset.id)))}function dt(){y(".dsh-tb-tab").forEach(e=>{e.dataset.tbView===N?e.classList.add("dsh-tb-tab-on"):e.classList.remove("dsh-tb-tab-on")});let t=o("#dsh-tb-toolbar");t&&(t.style.display=N==="overview"?"none":"flex"),N==="kanban"?ve():N==="list"?ge():fe()}function Jt(){let t=document.createElement("div");t.className="dsh-tb-modal-mask";let e=K.map(l=>`<option value="${c(l.path)}" title="${c(l.path)}">${c(l.path)}</option>`).join(""),s=(l,f)=>{o(l,t)?.classList.add("err"),f&&(o(f,t).hidden=!1)},n=()=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
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
			</div>`,o("#tb-f-title",t).addEventListener("input",()=>{o("#tb-f-title",t).classList.remove("err"),o("#tb-hint-title",t).hidden=!0}),o("#tb-f-repo",t).addEventListener("change",()=>{o("#tb-f-repo",t).classList.remove("err"),o("#tb-hint-repo",t).hidden=!0}),o('[data-act="cancel"]',t).addEventListener("click",h),o('[data-act="save"]',t).addEventListener("click",async()=>{let l=o("#tb-f-title",t).value.trim(),f=o("#tb-f-repo",t).value;o("#tb-hint-title",t).hidden=!0,o("#tb-hint-repo",t).hidden=!0,y(".err",t).forEach(p=>p.classList.remove("err"));let i=!0;if(l||(s("#tb-f-title","#tb-hint-title"),i=!1),f||(s("#tb-f-repo","#tb-hint-repo"),i=!1),!!i)try{let{task:p}=await x("/tasks",{method:"POST",body:JSON.stringify({title:l,repo:f,feature:o("#tb-f-feature",t).value.trim(),description:o("#tb-f-desc",t).value})});et(),d(p)}catch(p){alert(`\u521B\u5EFA\u5931\u8D25\uFF1A${p.message}`)}}),o("#tb-f-title",t).focus()},d=l=>{t.innerHTML=`<div class="dsh-tb-modal" style="width:min(560px,92vw)">
				<h3>\u2705 \u4EFB\u52A1\u5DF2\u521B\u5EFA</h3>
				<div class="dsh-tb-created-title">${c(l.title)}</div>
				<div class="dsh-tb-created-meta">${c(l.repo)}${l.feature?` \xB7 ${c(l.feature)}`:""}</div>
				<div class="dsh-tb-created-next">\u63A5\u4E0B\u6765\u505A\u4EC0\u4E48\uFF1F</div>
				<div class="dsh-tb-created-actions">
					<button data-act="newsess" class="dsh-tb-primary dsh-tb-big">\u2795 \u65B0\u5EFA\u5BF9\u8BDD\u5F00\u59CB\u5E72\u6D3B</button>
					<button data-act="bind" class="dsh-tb-big">\u{1F517} \u7ED1\u5B9A\u5DF2\u6709\u4F1A\u8BDD</button>
					<button data-act="detail" class="dsh-tb-big">\u8FDB\u5165\u4EFB\u52A1\u8BE6\u60C5</button>
				</div>
				<div class="dsh-tb-actions" style="margin-top:12px">
					<button data-act="close">\u5173\u95ED</button>
				</div>
			</div>`,o('[data-act="newsess"]',t).addEventListener("click",async()=>{t.remove(),await Yt(l.id)}),o('[data-act="bind"]',t).addEventListener("click",()=>{t.remove(),W(l.id)}),o('[data-act="detail"]',t).addEventListener("click",()=>{t.remove(),W(l.id)}),o('[data-act="close"]',t).addEventListener("click",()=>t.remove())},h=()=>t.remove();t.addEventListener("click",l=>{l.target===t&&h()}),document.body.appendChild(t),n()}function xe(t,e){x("/sessions").then(s=>{let n=document.createElement("div");n.className="dsh-tb-modal-mask",n.innerHTML=`<div class="dsh-tb-modal" style="width:min(600px,92vw)">
				<h3>\u9009\u62E9\u4F1A\u8BDD\u5173\u8054</h3>
				<div class="dsh-tb-field"><input id="tb-pick-search" placeholder="\u641C\u7D22\u4F1A\u8BDD\u6807\u9898\u2026" /></div>
				<div class="dsh-tb-picklist" id="tb-pick-list">\u52A0\u8F7D\u4E2D\u2026</div>
				<div class="dsh-tb-actions"><button data-act="cancel">\u53D6\u6D88</button></div>
			</div>`,document.body.appendChild(n);let d=ut(s.sessions||F),h=o("#tb-pick-list",n),l=f=>{let i=String(f||"").trim().toLowerCase(),p=d.filter(u=>!i||String(u.title||"").toLowerCase().includes(i)),a={};for(let u of p){let r=u.repo||"\uFF08\u672A\u6307\u5B9A\uFF09";(a[r]||(a[r]=[])).push(u)}let b=Object.entries(a).sort((u,r)=>r[1].length-u[1].length).map(([u,r])=>(r.sort((v,C)=>(C.updatedAt||0)-(v.updatedAt||0)),`<div class="dsh-tb-pick-group">
							<div class="dsh-tb-pick-grouphead">${c(Y(u))} <b>${r.length}</b></div>
							${r.map(v=>`<div class="dsh-tb-pick-item" data-sid="${c(v.id)}">
								<div class="t">${c(v.title||v.id)}${v.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</div>
								<div class="m">${v.updatedAt?J(v.updatedAt):""}</div>
							</div>`).join("")}
						</div>`)).join("");h.innerHTML=b||'<div class="dsh-tb-empty">\uFF08\u65E0\u5339\u914D\u4F1A\u8BDD\uFF09</div>',y(".dsh-tb-pick-item",n).forEach(u=>u.addEventListener("click",async()=>{let r=u.dataset.sid;try{let{task:v,injected:C,injectionNote:k}=await x(`/tasks/${t}/sessions`,{method:"POST",body:JSON.stringify({sessionId:r,action:"link"})});n.remove(),await L(),e(v),S(C===!0?"\u2713 \u5DF2\u5173\u8054\u4F1A\u8BDD":k||"\u5DF2\u5173\u8054\u4F1A\u8BDD")}catch(v){alert(`\u5173\u8054\u5931\u8D25\uFF1A${v.message}`)}}))};l(""),o("#tb-pick-search",n).addEventListener("input",()=>l(o("#tb-pick-search",n).value)),o('[data-act="cancel"]',n).addEventListener("click",()=>n.remove()),n.addEventListener("click",f=>{f.target===n&&n.remove()}),o("#tb-pick-search",n).focus()}).catch(()=>alert("\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868\u5931\u8D25"))}async function W(t){let{task:e}=await x(`/tasks/${t}`);mt(e)}function mt(t){let e=t.id,s=document.createElement("div");s.className="dsh-tb-modal-mask";let n=F.map(a=>`<option value="${c(a.id)}">${c(a.title||a.id)}${a.repo?` \xB7 ${c(Y(a.repo))}`:""}</option>`).join("");s.innerHTML=`<div class="dsh-tb-modal" style="width:min(700px,92vw)">
			<h3>${c(t.title)}</h3>
			<div class="dsh-tb-field"><label>\u4ED3\u5E93\u76EE\u5F55\uFF08\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF09</label><input id="tb-d-repo" placeholder="/root/projects/\u2026" value="${c(t.repo)}" /><input id="tb-d-feature" value="${c(t.feature)}" placeholder="feature/\u5206\u652F" style="margin-top:6px" /></div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>\u72B6\u6001\uFF08AI \u81EA\u52A8\u6D41\u8F6C\uFF0C\u4F60\u53EA\u9700\u5728"\u8BC4\u5BA1\u4E2D"\u65F6\u5904\u7406\uFF09</label>
					<div class="dsh-tb-statusline">
						<span class="dsh-tb-statusbadge" style="color:${w[t.status].color};border-color:${w[t.status].color}55;background:${w[t.status].color}14">${w[t.status].label}</span>
						<div class="dsh-tb-statusactions">${ie(t)}</div>
					</div>
				</div>
				<div class="dsh-tb-field"><label>\u4F18\u5148\u7EA7</label><select id="tb-d-priority">${Object.entries(B).map(([a,b])=>`<option value="${a}" ${a===t.priority?"selected":""}>${b.label}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u8FDB\u5EA6 ${t.displayProgress??t.progress}%\uFF08\u81EA\u52A8\u6D3E\u751F\uFF09</label><input id="tb-d-progress" type="range" min="0" max="100" value="${t.progress}" /></div>
			</div>
			<div class="dsh-tb-row">
				<div class="dsh-tb-field"><label>Review</label><select id="tb-d-review">${Object.entries(ct).map(([a,b])=>`<option value="${a}" ${a===t.review?"selected":""}>${b}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6D4B\u8BD5</label><select id="tb-d-test">${Object.entries(bt).map(([a,b])=>`<option value="${a}" ${a===t.test?"selected":""}>${b}</option>`).join("")}</select></div>
				<div class="dsh-tb-field"><label>\u6807\u7B7E</label><input id="tb-d-labels" value="${c((t.labels||[]).join(", "))}" placeholder="\u9017\u53F7\u5206\u9694" list="tb-labels-datalist2" /><datalist id="tb-labels-datalist2">${pt.map(a=>`<option value="${c(a)}"></option>`).join("")}</datalist></div>
			</div>
			<div class="dsh-tb-field"><label>\u63CF\u8FF0</label><textarea id="tb-d-desc">${c(t.description||"")}</textarea></div>
			<div class="dsh-tb-field"><label>\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF08\u65B0\u5BF9\u8BDD\u81EA\u52A8\u5E26\uFF1B\u5DF2\u6709\u5173\u8054\u4F1A\u8BDD\u7528\u300C\u{1F4CB} \u590D\u5236\u300D\u7C98\u8D34\uFF0C\u6216\u8BA9\u4F1A\u8BDD\u91CC\u7684 agent \u7528 task-by-session \u81EA\u53D6\uFF09</label>
				<div class="dsh-tb-ctx">
					<div class="dsh-tb-ctx-body" id="tb-d-ctx-body">\u52A0\u8F7D\u4E2D\u2026</div>
					<div class="dsh-tb-ctx-actions">
						<button id="tb-d-ctx-copy" title="\u590D\u5236\u6700\u65B0\u4E0A\u4E0B\u6587\u5230\u526A\u8D34\u677F">\u{1F4CB} \u590D\u5236</button>
						<button id="tb-d-ctx-refresh" title="\u91CD\u65B0\u83B7\u53D6\u6700\u65B0\u4E0A\u4E0B\u6587">\u27F3 \u5237\u65B0</button>
					</div>
				</div>
			</div>
			<div class="dsh-tb-field"><label>\u8FDB\u5C55\u8BB0\u5F55\uFF08${(t.notes||[]).length}\uFF09</label>
				<div id="tb-d-notes">${(t.notes||[]).map(a=>`<div class="dsh-tb-note"><span class="dsh-tb-note-time">${J(a.at)}</span><br/>${c(a.text)}</div>`).join("")||'<div class="dsh-tb-note">\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09</div>'}</div>
				<textarea id="tb-d-note" placeholder="\u6DFB\u52A0\u8FDB\u5C55/\u5B8C\u6210\u60C5\u51B5\u2026\uFF08Ctrl+Enter \u63D0\u4EA4\uFF09" style="margin-top:6px"></textarea>
			</div>
			<div class="dsh-tb-field"><label>\u6C60\u5185\u4F1A\u8BDD\uFF08\u5171\u4EAB\u4E0A\u4E0B\u6587\u53EF\u8BBF\u95EE\u8005\uFF1B\u70B9\u51FB\u6253\u5F00\u53EF\u7EE7\u7EED\uFF09</label>
				<div id="tb-d-sessions">${(t.sessionIds||[]).map(a=>{let b=H(a),u=F.find(v=>v.id===b),r=u?c(u.title||b):'<span class="dsh-tb-sess-gone">\uFF08\u4F1A\u8BDD\u5DF2\u4E0D\u5B58\u5728\uFF09</span>';return`<div class="dsh-tb-sess"><span class="dsh-tb-sess-title" title="${c(b)}">${r}${u&&u.running?' <span class="dsh-tb-run">\u25CF \u8FD0\u884C\u4E2D</span>':""}</span>${u?`<button data-sid="${c(b)}" data-act="open" class="dsh-tb-open">\u6253\u5F00</button>`:""}<button data-sid="${c(a)}" data-act="unlink">\u89E3\u9664</button></div>`}).join("")||'<div class="dsh-tb-note">\uFF08\u672A\u5173\u8054\u4F1A\u8BDD\uFF09</div>'}</div>
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
		</div>`,document.body.appendChild(s);let d=async()=>{let a=o("#tb-d-ctx-body",s);if(a)try{let{context:b}=await x(`/tasks/${e}/context`);a.textContent=b||"\uFF08\u6682\u65E0\u5171\u4EAB\u4E0A\u4E0B\u6587\uFF09"}catch{a.textContent="\uFF08\u83B7\u53D6\u5931\u8D25\uFF09"}},h=async()=>{try{let{context:a}=await x(`/tasks/${e}/context`);await navigator.clipboard.writeText(a||""),S("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch{try{let{context:a}=await x(`/tasks/${e}/context`),b=document.createElement("textarea");b.value=a||"",document.body.appendChild(b),b.select(),document.execCommand("copy"),b.remove(),S("\u2713 \u5DF2\u590D\u5236\u6700\u65B0\u5171\u4EAB\u4E0A\u4E0B\u6587")}catch(a){alert(`\u590D\u5236\u5931\u8D25\uFF1A${a.message}`)}}};d(),o("#tb-d-ctx-refresh",s)?.addEventListener("click",d),o("#tb-d-ctx-copy",s)?.addEventListener("click",h);let l=()=>({repo:o("#tb-d-repo",s).value.trim(),feature:o("#tb-d-feature",s).value.trim(),priority:o("#tb-d-priority",s).value,progress:Number(o("#tb-d-progress",s).value),review:o("#tb-d-review",s).value,test:o("#tb-d-test",s).value,labels:o("#tb-d-labels",s).value.split(",").map(a=>a.trim()).filter(Boolean),description:o("#tb-d-desc",s).value}),f=()=>s.remove(),i=a=>{s.remove(),mt(a)},p=async a=>{let{task:b}=await x(`/tasks/${e}`,{method:"PATCH",body:JSON.stringify(a)});return await L(),b};s.addEventListener("click",a=>{a.target===s&&f()}),o('[data-act="cancel"]',s).addEventListener("click",f),o('[data-act="save"]',s).addEventListener("click",async()=>{try{let a=await p(l());i(a),S("\u2713 \u5DF2\u4FDD\u5B58")}catch(a){alert(`\u4FDD\u5B58\u5931\u8D25\uFF1A${a.message}`)}}),o('[data-act="del"]',s).addEventListener("click",async()=>{if(confirm(`\u5220\u9664\u4EFB\u52A1\u300C${t.title}\u300D\uFF1F`))try{await x(`/tasks/${e}`,{method:"DELETE"}),f(),await et()}catch(a){alert(`\u5220\u9664\u5931\u8D25\uFF1A${a.message}`)}}),o('[data-act="copyctx"]',s)?.addEventListener("click",h),o("#tb-d-note",s).addEventListener("keydown",async a=>{if(a.key==="Enter"&&(a.ctrlKey||a.metaKey)){let b=o("#tb-d-note",s).value.trim();if(!b)return;try{let{task:u}=await x(`/tasks/${e}/notes`,{method:"POST",body:JSON.stringify({text:b})});await L(),i(u),S("\u2713 \u8FDB\u5C55\u5DF2\u8BB0\u5F55")}catch(u){alert(`\u8BB0\u5F55\u5931\u8D25\uFF1A${u.message}`)}}}),o("#tb-d-sess-open",s)?.addEventListener("click",()=>{xe(e,a=>{s.remove(),mt(a)})}),y("#tb-d-sessions [data-act]",s).forEach(a=>a.addEventListener("click",async()=>{let b=a.dataset.sid;if(a.dataset.act==="open")it(b);else{let{task:u}=await x(`/tasks/${e}/sessions`,{method:"POST",body:JSON.stringify({sessionId:b,action:"unlink"})});await L(),i(u),S("\u5DF2\u89E3\u9664\u4F1A\u8BDD")}})),o("#tb-d-sess-new",s)?.addEventListener("click",async()=>{await Yt(e)}),y(".dsh-tb-statusbtn",s).forEach(a=>a.addEventListener("click",async()=>{try{let b=await p({status:a.dataset.status});i(b),S("\u2713 \u72B6\u6001\u5DF2\u66F4\u65B0")}catch(b){alert(`\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${b.message}`)}})),o('[data-act="split"]',s)?.addEventListener("click",()=>{let a=document.createElement("div");a.className="dsh-tb-modal-mask",a.innerHTML=`<div class="dsh-tb-modal">
				<h3>\u62C6\u5206\u4EFB\u52A1\uFF1A${c(t.title)}</h3>
				<div class="dsh-tb-field"><label>\u5B50\u4EFB\u52A1\u6807\u9898\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF0C\u62C6\u5206\u540E\u81EA\u52A8\u7EE7\u627F\u4ED3\u5E93/\u4F18\u5148\u7EA7/\u6807\u7B7E/\u5173\u8054\u4F1A\u8BDD\uFF09</label>
					<textarea id="tb-split-titles" style="min-height:120px" placeholder="\u4F8B\u5982\uFF1A&#10;\u5B9E\u73B0\u529F\u80FD A&#10;\u5B9E\u73B0\u529F\u80FD B&#10;\u8054\u8C03\u4E0E\u6D4B\u8BD5"></textarea></div>
				<div class="dsh-tb-actions">
					<button data-act="cancel">\u53D6\u6D88</button>
					<button data-act="do" class="dsh-tb-primary">\u62C6\u5206</button>
				</div>
			</div>`,document.body.appendChild(a);let b=()=>a.remove();o('[data-act="cancel"]',a).addEventListener("click",b),a.addEventListener("click",u=>{u.target===a&&b()}),o('[data-act="do"]',a).addEventListener("click",async()=>{let u=o("#tb-split-titles",a).value.split(`
`).map(r=>r.trim()).filter(Boolean);if(!u.length){o("#tb-split-titles",a).focus();return}try{let{tasks:r}=await x(`/tasks/${e}/split`,{method:"POST",body:JSON.stringify({titles:u})});b(),await et(),S(`\u2713 \u5DF2\u62C6\u5206\u4E3A ${r.length} \u4E2A\u5B50\u4EFB\u52A1`),r?.[0]&&W(r[0].id)}catch(r){alert(`\u62C6\u5206\u5931\u8D25\uFF1A${r.message}`)}}),o("#tb-split-titles",a).focus()})}Tt(),zt(),Nt(),se(),new MutationObserver(()=>{Tt(),zt(),Nt()}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",t=>{t.ctrlKey&&t.shiftKey&&(t.key==="B"||t.key==="b")&&(t.preventDefault(),Q())}),document.addEventListener("click",t=>{if(!G())return;let e=t.target;e instanceof Element&&(e.closest(`[${_}]`)||e.closest('[data-pane="sidebar"], [class*="sidebarCol"]')&&Q(!1))});function me(){let t=Lt();if(!t||t.clientWidth===0)return;let e=t.style.width;try{t.style.width=`${t.clientWidth-2}px`,setTimeout(()=>{t.style.width=e||"";try{window.dispatchEvent(new Event("resize"))}catch{}},180)}catch{}}try{localStorage.getItem("dsh-taskboard.unstick")!==null&&(localStorage.removeItem("dsh-taskboard.unstick"),setTimeout(()=>{Bt()},900),setTimeout(()=>{Bt()},2e3))}catch{}try{let t=localStorage.getItem("dsh-taskboard.pending-toast");t!==null&&(localStorage.removeItem("dsh-taskboard.pending-toast"),setTimeout(()=>{S(t)},1200))}catch{}let we=[400,1e3,2e3],Kt=()=>{for(let t of we)setTimeout(me,t)};document.readyState==="loading"?window.addEventListener("load",Kt):Kt()})();})();

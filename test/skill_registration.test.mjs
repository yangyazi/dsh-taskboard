import { apply } from "../lib/index.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os"; import { join } from "node:path";
process.env.DSH_HOME = await mkdtemp(join(tmpdir(),"tb-reg-"));
let registered=null;
const h=[];
const ctx={effect(){},on(){},logger:{info(){},warn(){},error(){}},
  webServer:{register(x){h.push(x);},tapIndex(){}},
  workspaceRegistry:{list:()=>[]},sessions:{list:()=>[],get:()=>void 0},sessionPersistence:{},
  skills:{register(r){registered=r; return ()=>{};}}
};
await apply(ctx,{storePath:join(process.env.DSH_HOME,"s.json")});
await new Promise(r=>setTimeout(r,1200));
let fail=0;
const ck=(n,c)=>{console.log(`${c?"PASS":"FAIL"}  ${n}`);if(!c)fail++;};
ck("bundled skill auto-registered", !!registered && registered.name==="manage-taskboard");
ck("skill has content body", !!registered && (registered.content||"").length>200);
ck("skill carries description", !!registered && (registered.description||"").length>10);
ck("skill resourceBase set", !!registered && registered.resourceBase?.kind==="directory");
console.log(fail?"FAILURES":"ALL OK"); process.exit(fail?1:0);

var tt=Object.defineProperty;var M=Object.getOwnPropertySymbols;var et=Object.prototype.hasOwnProperty,st=Object.prototype.propertyIsEnumerable;var J=(w,l,a)=>l in w?tt(w,l,{enumerable:!0,configurable:!0,writable:!0,value:a}):w[l]=a,F=(w,l)=>{for(var a in l||(l={}))et.call(l,a)&&J(w,a,l[a]);if(M)for(var a of M(l))st.call(l,a)&&J(w,a,l[a]);return w};import{Q as at,b as ot,a as R,c as q}from"./QTabPanels.01a52a29.js";import{Q as lt}from"./QTooltip.d37a010b.js";import{cu as X,f as S,u as L,c as h,o as U,j as z,r as B,z as Y,bk as A,k as _,B as x,q as e,x as s,t as n,m as u,v as b,Q as E,H as D,K as O,l as C,aD as y,G as v,D as T,s as V,A as N}from"./index.e18600f8.js";import{Q as W}from"./QInput.75b94522.js";import{Q as P}from"./QList.68ba6ad8.js";import{Q as G}from"./QScrollArea.76dfba7f.js";import{_ as Z}from"./Confirm.6bb1b61d.js";import{f as Q}from"./datetime.6205e5a7.js";import{t as H,b as K}from"./thumbStyle.856de4cb.js";import"./touch.1d111f56.js";import"./QDialog.07d9a48e.js";import"./use-dark.f89e8300.js";import"./use-prevent-scroll.d4f2a0d7.js";import"./focus-manager.32f8d49a.js";import"./rtl.4b414a6d.js";import"./position-engine.e707f0b1.js";import"./use-key-composition.4a5ce83a.js";import"./uid.81432f81.js";import"./ClosePopup.665fa76c.js";const rt={class:"tw-h-full tw-w-full tw-flex tw-flex-col"},nt={class:"q-pa-md tw-flex tw-justify-around"},ut={class:"tw-w-full tw-grow"},it={class:"task__cron"},dt={class:"task__remark"},ct={class:"task__bottom-box"},mt={class:"task__bottom-time"},wt={key:0,class:"tw-w-full tw-text-center tw-m-auto tw-text-gray-500"},pt=T(" \u6682\u65E0\u6570\u636E "),ft=S({props:{projectId:{type:Number,required:!0}},setup(w){const l=w,a=L(),d=h(()=>a.state.Task.loadingTasks);U(()=>{z(async()=>{await p()}),a.watch(t=>[t.Root.eventTask],([t])=>{if(!t||t.projectId!==l.projectId)return;const o=i.value.find(I=>I.id===t.taskId);o!==void 0&&a.commit("success",{message:`\u4EFB\u52A1 ${o.name} \u5F53\u524D\u72B6\u6001: ${t.status}`}),p()})});async function p(){await a.dispatch("Task/fetchTasks",F({},l))}const c=B(""),i=h(()=>{var t;return((t=a.state.Task.tasks.get(l.projectId))==null?void 0:t.filter(o=>o.name.indexOf(c.value)>=0||o.id.toString().indexOf(c.value)>=0))||[]});function k(t){return N().params.taskId===t.id}const f=h(()=>i.value.filter(k).pop()),g=Y(),m=B(!1);async function j(t,o){a.commit("cleanError"),await a.dispatch("deleteTask",{projectId:t,taskId:o}),a.state.Root.currentError===void 0&&(g.push({name:"crontab_tasks",params:{projectId:t}}),m.value=!1,await p())}return(t,o)=>{var $;const I=A("router-link");return _(),x("div",rt,[e(Z,{modelValue:m.value,"onUpdate:modelValue":o[0]||(o[0]=r=>m.value=r),content:"\u662F\u5426\u8981\u5220\u9664\u4EFB\u52A1"+(($=s(f))==null?void 0:$.name)+"?",type:"warning",onConfirm:o[1]||(o[1]=r=>s(f)&&j(s(f).projectId,s(f).id))},null,8,["modelValue","content"]),n("div",nt,[e(W,{modelValue:c.value,"onUpdate:modelValue":o[2]||(o[2]=r=>c.value=r),borderless:"",dense:"",debounce:"300",placeholder:"Search"},{append:u(()=>[e(b,{name:"search"})]),_:1},8,["modelValue"]),e(E,{flat:"",dense:"",loading:s(d),icon:"refresh",onClick:p},null,8,["loading"]),e(E,{flat:"",dense:"",to:{name:"create_crontab_task"},icon:"add"}),e(E,{flat:"",dense:"",class:"tw-text-red-300 lg:tw-flex tw-hidden",icon:"delete",disable:!s(f),onClick:o[3]||(o[3]=r=>m.value=!0)},null,8,["disable"])]),n("div",ut,[e(G,{class:"tw-w-full tw-h-full tw-px-[15px]",visible:"","thumb-style":s(H),"bar-style":s(K)},{default:u(()=>[e(P,{class:"tw-w-full tw-flex tw-flex-col tw-gap-2 tw-pb-4"},{default:u(()=>[(_(!0),x(D,null,O(s(i),r=>(_(),C(I,{key:r.id,to:{name:"crontab_task",params:{taskId:r.id}}},{default:u(()=>[n("div",{class:y((k(r)?"tw-bg-primary tw-text-black ":"tw-bg-[#27272a] ")+"tw-w-full tw-min-h-[130px] tw-pt-[30px] tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black")},[n("div",{class:y("task__status"+r.status)},v(r.isRunning==1?"\u6267\u884C\u4E2D":r.status==1?"\u8C03\u5EA6\u4E2D":"\u5DF2\u6682\u505C"),3),n("div",{class:y((k(r)?"active ":"")+"task__title tw-inline-flex tw-items-center")},[n("div",it,[e(b,{name:"schedule"}),T(" "+v(r.cronExpr),1)]),e(b,{name:"numbers"}),T(" "+v(r.name),1)],2),n("div",dt,v(r.remark||"-"),1),n("div",ct,[n("div",mt,v(s(Q)(r.createTime*1e3)),1)])],2)]),_:2},1032,["to"]))),128))]),_:1}),!s(d)&&(!s(i)||s(i).length===0)?(_(),x("div",wt,[e(b,{name:"outlet",style:{"font-size":"3rem"}}),pt])):V("",!0)]),_:1},8,["thumb-style","bar-style"])])])}}});var _t=X(ft,[["__scopeId","data-v-5feefa82"]]);const kt={class:"tw-h-full tw-w-full tw-flex tw-flex-col"},vt={class:"q-pa-md tw-flex tw-justify-around"},bt={class:"tw-w-full tw-grow"},ht={class:"task__cron"},xt={class:"task__remark"},yt={class:"task__bottom-box"},gt={class:"task__bottom-time"},Tt={key:1,class:"tw-w-full tw-text-center tw-m-auto tw-text-gray-500"},It=T(" \u6682\u65E0\u6570\u636E "),Et=S({props:{projectId:{type:Number,required:!0}},setup(w){const l=w,a=B(""),d=L(),p=h(()=>d.state.Task.loadingTasks);async function c(){await d.dispatch("Task/fetchTasks",F({},l)),await d.dispatch("Task/fetchTemporaryTasks",F({},l))}U(async()=>{z(async()=>{await c()}),d.state.Task.tasks||await d.dispatch("Task/fetchTasks",{projectId:l.projectId})});const i=h(()=>d.state.Task.tasks.get(l.projectId)),k=h(()=>{var g;return((g=d.state.Task.temporaryTasks.get(l.projectId))==null?void 0:g.filter(m=>m.taskId.toString().indexOf(a.value)>=0))||[]});function f(g){const m=N();return Number(m.params.taskId)===g.id}return(g,m)=>{const j=A("router-link");return _(),x("div",kt,[n("div",vt,[e(W,{modelValue:a.value,"onUpdate:modelValue":m[0]||(m[0]=t=>a.value=t),borderless:"",dense:"",debounce:"300",placeholder:"Search"},{append:u(()=>[e(b,{name:"search"})]),_:1},8,["modelValue"]),e(E,{flat:"",dense:"",loading:s(p),icon:"refresh",onClick:c},null,8,["loading"])]),n("div",bt,[e(G,{class:"tw-w-full tw-h-full tw-px-[15px]",visible:"","thumb-style":s(H),"bar-style":s(K)},{default:u(()=>[s(i)?(_(),C(P,{key:0,class:"tw-w-full tw-flex tw-flex-col tw-gap-2 tw-pb-4"},{default:u(()=>[(_(!0),x(D,null,O(s(k),t=>(_(),C(j,{key:t.id,to:{name:"temporary_task",params:{taskId:t.id}}},{default:u(()=>[n("div",{class:y((f(t)?"tw-bg-primary tw-text-black ":"tw-bg-[#27272a] ")+"tw-w-full tw-min-h-[130px] tw-pt-[30px] tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black")},[n("div",{class:y("task__status"+t.scheduleStatus)},v(t.isRunning==1?"\u6267\u884C\u4E2D":t.scheduleStatus==1?"\u7B49\u5F85\u4E2D":"\u5DF2\u5B8C\u6210"),3),n("div",{class:y((f(t)?"active ":"")+"task__title tw-inline-flex tw-items-center")},[n("div",ht,[e(b,{name:"schedule"}),T(" "+v(s(Q)(t.scheduleTime*1e3)),1)]),e(b,{name:"numbers"}),T(" "+v(t.remark),1)],2),n("div",xt,"\u521B\u5EFA\u4EBA\uFF1A"+v(t.userName||"-"),1),n("div",yt,[n("div",gt,v(s(Q)(t.createTime*1e3)),1)])],2)]),_:2},1032,["to"]))),128))]),_:1})):V("",!0),!s(p)&&(!s(k)||s(k).length===0)?(_(),x("div",Tt,[e(b,{name:"outlet",style:{"font-size":"3rem"}}),It])):V("",!0)]),_:1},8,["thumb-style","bar-style"])])])}}});var jt=X(Et,[["__scopeId","data-v-33f03fa5"]]);const $t={class:"tw-h-full tw-w-full tw-flex tw-flex-col"},Ft={class:"q-pa-md tw-flex tw-justify-around"},Bt={class:"tw-w-full tw-grow"},Ct={class:"task__remark"},Vt={class:"task__bottom-box"},Qt={class:"task__bottom-time"},St={key:0,class:"tw-w-full tw-text-center tw-m-auto tw-text-gray-500"},At=T(" \u6682\u65E0\u6570\u636E "),Dt=S({props:{projectId:{type:Number,required:!0}},setup(w){const l=w,a=L(),d=h(()=>a.state.WorkFlowTask.loadingTasks);U(()=>{z(async()=>{await p()}),a.watch(t=>[t.Root.eventWorkFlowTask],([t])=>{if(!t||t.projectId!==l.projectId)return;const o=i.value.find(I=>I.id===t.taskId);o!==void 0&&a.commit("success",{message:`\u4EFB\u52A1 ${o.name} \u5F53\u524D\u72B6\u6001: ${t.status}`}),p()})});async function p(){await a.dispatch("WorkFlowTask/fetchTasks",F({},l))}const c=B(""),i=h(()=>{var t;return((t=a.state.WorkFlowTask.tasks.get(l.projectId))==null?void 0:t.filter(o=>o.name.indexOf(c.value)>=0||o.id.toString().indexOf(c.value)>=0))||[]});function k(t){return N().params.taskId===t.id}const f=h(()=>i.value.filter(k).pop()),g=Y(),m=B(!1);async function j(t,o){a.commit("cleanError"),await a.dispatch("deleteWorkFlowTask",{projectId:t,taskId:o}),a.state.Root.currentError===void 0&&(g.push({name:"workflow_tasks",params:{projectId:t}}),m.value=!1,await p())}return(t,o)=>{var $;const I=A("router-link");return _(),x("div",$t,[e(Z,{modelValue:m.value,"onUpdate:modelValue":o[0]||(o[0]=r=>m.value=r),content:"\u662F\u5426\u8981\u5220\u9664\u4EFB\u52A1"+(($=s(f))==null?void 0:$.name)+"?",type:"warning",onConfirm:o[1]||(o[1]=r=>s(f)&&j(s(f).projectId,s(f).id))},null,8,["modelValue","content"]),n("div",Ft,[e(W,{modelValue:c.value,"onUpdate:modelValue":o[2]||(o[2]=r=>c.value=r),borderless:"",dense:"",debounce:"300",placeholder:"Search"},{append:u(()=>[e(b,{name:"search"})]),_:1},8,["modelValue"]),e(E,{flat:"",dense:"",loading:s(d),icon:"refresh",onClick:p},null,8,["loading"]),e(E,{flat:"",dense:"",to:{name:"create_workflow_task"},icon:"add"}),e(E,{flat:"",dense:"",class:"tw-text-red-300 lg:tw-flex tw-hidden",icon:"delete",disable:!s(f),onClick:o[3]||(o[3]=r=>m.value=!0)},null,8,["disable"])]),n("div",Bt,[e(G,{class:"tw-h-full tw-w-full tw-px-[15px]",visible:"","thumb-style":s(H),"bar-style":s(K)},{default:u(()=>[e(P,{class:"tw-w-full tw-flex tw-flex-col tw-gap-2 tw-pb-4"},{default:u(()=>[(_(!0),x(D,null,O(s(i),r=>(_(),C(I,{key:r.id,to:{name:"workflow_task",params:{taskId:r.id}}},{default:u(()=>[n("div",{class:y((k(r)?"tw-bg-primary tw-text-black ":"tw-bg-[#27272a] ")+"tw-w-full tw-min-h-[130px] tw-py-3 tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black")},[n("div",{class:y((k(r)?"active ":"")+"task__title tw-inline-flex tw-items-center")},[e(b,{name:"numbers"}),T(" "+v(r.name),1)],2),n("div",Ct,v(r.remark||"-"),1),n("div",Vt,[n("div",Qt,v(s(Q)(r.createTime*1e3)),1)])],2)]),_:2},1032,["to"]))),128))]),_:1}),!s(d)&&(!s(i)||s(i).length===0)?(_(),x("div",St,[e(b,{name:"outlet",style:{"font-size":"3rem"}}),At])):V("",!0)]),_:1},8,["thumb-style","bar-style"])])])}}}),Nt={class:"tw-h-full tw-w-full tw-flex tw-flex-col"},Rt=T(" \u6307\u5B9A\u65F6\u95F4\u8C03\u5EA6\u4E00\u6B21\u7684\u4EFB\u52A1 "),le=S({props:{projectId:{type:Number,required:!0}},setup(w){const l=w,a=N(),d=h(()=>a.name&&!["crontab_tasks","workflow_tasks","temporary_tasks"].includes(a.name.toString())),p=h(()=>{var c;if(a.name){const i=a.name.toString();if(i.search("crontab")>=0)return"normal";if(i.search("workflow")>=0)return"workflow";if(i.search("temporary")>=0)return"temporary"}throw new Error(`Unknown route name ${(c=a.name)==null?void 0:c.toString()}`)});return(c,i)=>{const k=A("router-view");return _(),x(D,null,[n("div",{class:y("xl:tw-basis-1/5 tw-basis-1/4 tw-w-full tw-h-full tw-bg-[#1E1E1E]"+(s(d)?" tw-hidden lg:tw-block":""))},[n("div",Nt,[e(at,{"model-value":s(p),"active-color":"primary"},{default:u(()=>[e(R,{name:"crontab",label:"\u666E\u901A",to:{name:"crontab_tasks",params:{projectId:l.projectId}},replace:""},null,8,["to"]),e(R,{name:"temporary",label:"\u4E34\u65F6",to:{name:"temporary_tasks",params:{projectId:l.projectId}},replace:""},{default:u(()=>[e(lt,{class:"bg-warning tw-text-black",offset:[10,10]},{default:u(()=>[Rt]),_:1})]),_:1},8,["to"]),e(R,{name:"workflow",label:"\u4EFB\u52A1\u6D41",to:{name:"workflow_tasks",params:{projectId:l.projectId}},replace:""},null,8,["to"])]),_:1},8,["model-value"]),e(ot,{"model-value":s(p),animated:"",class:"tw-w-full tw-grow"},{default:u(()=>[e(q,{name:"normal",class:"tw-p-0"},{default:u(()=>[e(_t,{"project-id":l.projectId},null,8,["project-id"])]),_:1}),e(q,{name:"temporary",class:"tw-p-0"},{default:u(()=>[e(jt,{"project-id":l.projectId},null,8,["project-id"])]),_:1}),e(q,{name:"workflow",class:"tw-p-0"},{default:u(()=>[e(Dt,{"project-id":l.projectId},null,8,["project-id"])]),_:1})]),_:1},8,["model-value"])])],2),n("div",{class:y("xl:tw-basis-3/5 tw-basis-1/2 tw-h-full tw-w-full"+(s(d)?"":" tw-hidden lg:tw-block"))},[e(k)],2)],64)}}});export{le as default};
var f=Object.defineProperty,x=Object.defineProperties;var S=Object.getOwnPropertyDescriptors;var l=Object.getOwnPropertySymbols;var z=Object.prototype.hasOwnProperty,k=Object.prototype.propertyIsEnumerable;var u=(e,t,a)=>t in e?f(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,m=(e,t)=>{for(var a in t||(t={}))z.call(t,a)&&u(e,a,t[a]);if(l)for(var a of l(t))k.call(t,a)&&u(e,a,t[a]);return e},v=(e,t)=>x(e,S(t));import{u as q,a as B}from"./focus-manager.2ec597e1.js";import{a as C,c as i,h as b,g as y}from"./index.858abf03.js";const D={true:"inset",item:"item-inset","item-thumbnail":"item-thumbnail-inset"},n={xs:2,sm:4,md:8,lg:16,xl:24};var L=C({name:"QSeparator",props:v(m({},q),{spaced:[Boolean,String],inset:[Boolean,String],vertical:Boolean,color:String,size:String}),setup(e){const t=y(),a=B(e,t.proxy.$q),r=i(()=>e.vertical===!0?"vertical":"horizontal"),o=i(()=>` q-separator--${r.value}`),d=i(()=>e.inset!==!1?`${o.value}-${D[e.inset]}`:""),g=i(()=>`q-separator${o.value}${d.value}`+(e.color!==void 0?` bg-${e.color}`:"")+(a.value===!0?" q-separator--dark":"")),$=i(()=>{const s={};if(e.size!==void 0&&(s[e.vertical===!0?"width":"height"]=e.size),e.spaced!==!1){const h=e.spaced===!0?`${n.md}px`:e.spaced in n?`${n[e.spaced]}px`:e.spaced,c=e.vertical===!0?["Left","Right"]:["Top","Bottom"];s[`margin${c[0]}`]=s[`margin${c[1]}`]=h}return s});return()=>b("hr",{class:g.value,style:$.value,"aria-orientation":r.value})}});export{L as Q};

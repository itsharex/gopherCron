var re=Object.defineProperty,ue=Object.defineProperties;var oe=Object.getOwnPropertyDescriptors;var p=Object.getOwnPropertySymbols;var se=Object.prototype.hasOwnProperty,fe=Object.prototype.propertyIsEnumerable;var ee=(e,f,x)=>f in e?re(e,f,{enumerable:!0,configurable:!0,writable:!0,value:x}):e[f]=x,P=(e,f)=>{for(var x in f||(f={}))se.call(f,x)&&ee(e,x,f[x]);if(p)for(var x of p(f))fe.call(f,x)&&ee(e,x,f[x]);return e},H=(e,f)=>ue(e,oe(f));import{c as de,u as ce,d as ge,e as me,f as ve,g as he,h as te,i as ke}from"./use-key-composition.89abe8dc.js";import{r as J,w as j,n as _,Z as Me,c as A,a as we,S as xe,o as ye,h as Y,e as Ce,g as Se,ah as ae}from"./index.858abf03.js";import{c as be}from"./focus-manager.2ec597e1.js";const ne={date:"####/##/##",datetime:"####/##/## ##:##",time:"##:##",fulltime:"##:##:##",phone:"(###) ### - ####",card:"#### #### #### ####"},Q={"#":{pattern:"[\\d]",negate:"[^\\d]"},S:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]"},N:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]"},A:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]",transform:e=>e.toLocaleUpperCase()},a:{pattern:"[a-zA-Z]",negate:"[^a-zA-Z]",transform:e=>e.toLocaleLowerCase()},X:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]",transform:e=>e.toLocaleUpperCase()},x:{pattern:"[0-9a-zA-Z]",negate:"[^0-9a-zA-Z]",transform:e=>e.toLocaleLowerCase()}},ie=Object.keys(Q);ie.forEach(e=>{Q[e].regex=new RegExp(Q[e].pattern)});const Fe=new RegExp("\\\\([^.*+?^${}()|([\\]])|([.*+?^${}()|[\\]])|(["+ie.join("")+"])|(.)","g"),le=/[.*+?^${}()|[\]\\]/g,k=String.fromCharCode(1),Re={mask:String,reverseFillMask:Boolean,fillMask:[Boolean,String],unmaskedValue:Boolean};function Ee(e,f,x,b){let g,m,T,V,N,w;const y=J(null),d=J(F());function W(){return e.autogrow===!0||["textarea","text","search","url","tel","password"].includes(e.type)}j(()=>e.type+e.autogrow,q),j(()=>e.mask,l=>{if(l!==void 0)K(d.value,!0);else{const a=R(d.value);q(),e.modelValue!==a&&f("update:modelValue",a)}}),j(()=>e.fillMask+e.reverseFillMask,()=>{y.value===!0&&K(d.value,!0)}),j(()=>e.unmaskedValue,()=>{y.value===!0&&K(d.value)});function F(){if(q(),y.value===!0){const l=z(R(e.modelValue));return e.fillMask!==!1?U(l):l}return e.modelValue}function Z(l){if(l<g.length)return g.slice(-l);let a="",i=g;const n=i.indexOf(k);if(n>-1){for(let u=l-i.length;u>0;u--)a+=k;i=i.slice(0,n)+a+i.slice(n)}return i}function q(){if(y.value=e.mask!==void 0&&e.mask.length!==0&&W(),y.value===!1){V=void 0,g="",m="";return}const l=ne[e.mask]===void 0?e.mask:ne[e.mask],a=typeof e.fillMask=="string"&&e.fillMask.length!==0?e.fillMask.slice(0,1):"_",i=a.replace(le,"\\$&"),n=[],u=[],r=[];let h=e.reverseFillMask===!0,o="",s="";l.replace(Fe,(M,t,v,O,E)=>{if(O!==void 0){const C=Q[O];r.push(C),s=C.negate,h===!0&&(u.push("(?:"+s+"+)?("+C.pattern+"+)?(?:"+s+"+)?("+C.pattern+"+)?"),h=!1),u.push("(?:"+s+"+)?("+C.pattern+")?")}else if(v!==void 0)o="\\"+(v==="\\"?"":v),r.push(v),n.push("([^"+o+"]+)?"+o+"?");else{const C=t!==void 0?t:E;o=C==="\\"?"\\\\\\\\":C.replace(le,"\\\\$&"),r.push(C),n.push("([^"+o+"]+)?"+o+"?")}});const B=new RegExp("^"+n.join("")+"("+(o===""?".":"[^"+o+"]")+"+)?"+(o===""?"":"["+o+"]*")+"$"),D=u.length-1,c=u.map((M,t)=>t===0&&e.reverseFillMask===!0?new RegExp("^"+i+"*"+M):t===D?new RegExp("^"+M+"("+(s===""?".":s)+"+)?"+(e.reverseFillMask===!0?"$":i+"*")):new RegExp("^"+M));T=r,V=M=>{const t=B.exec(e.reverseFillMask===!0?M:M.slice(0,r.length+1));t!==null&&(M=t.slice(1).join(""));const v=[],O=c.length;for(let E=0,C=M;E<O;E++){const L=c[E].exec(C);if(L===null)break;C=C.slice(L.shift().length),v.push(...L)}return v.length!==0?v.join(""):M},g=r.map(M=>typeof M=="string"?M:k).join(""),m=g.split(k).join(a)}function K(l,a,i){const n=b.value,u=n.selectionEnd,r=n.value.length-u,h=R(l);a===!0&&q();const o=z(h),s=e.fillMask!==!1?U(o):o,B=d.value!==s;n.value!==s&&(n.value=s),B===!0&&(d.value=s),document.activeElement===n&&_(()=>{if(s===m){const c=e.reverseFillMask===!0?m.length:0;n.setSelectionRange(c,c,"forward");return}if(i==="insertFromPaste"&&e.reverseFillMask!==!0){const c=n.selectionEnd;let M=u-1;for(let t=N;t<=M&&t<c;t++)g[t]!==k&&M++;S.right(n,M);return}if(["deleteContentBackward","deleteContentForward"].indexOf(i)>-1){const c=e.reverseFillMask===!0?u===0?s.length>o.length?1:0:Math.max(0,s.length-(s===m?0:Math.min(o.length,r)+1))+1:u;n.setSelectionRange(c,c,"forward");return}if(e.reverseFillMask===!0)if(B===!0){const c=Math.max(0,s.length-(s===m?0:Math.min(o.length,r+1)));c===1&&u===1?n.setSelectionRange(c,c,"forward"):S.rightReverse(n,c)}else{const c=s.length-r;n.setSelectionRange(c,c,"backward")}else if(B===!0){const c=Math.max(0,g.indexOf(k),Math.min(o.length,u)-1);S.right(n,c)}else{const c=u-1;S.right(n,c)}});const D=e.unmaskedValue===!0?R(s):s;String(e.modelValue)!==D&&x(D,!0)}function X(l,a,i){const n=z(R(l.value));a=Math.max(0,g.indexOf(k),Math.min(n.length,a)),N=a,l.setSelectionRange(a,i,"forward")}const S={left(l,a){const i=g.slice(a-1).indexOf(k)===-1;let n=Math.max(0,a-1);for(;n>=0;n--)if(g[n]===k){a=n,i===!0&&a++;break}if(n<0&&g[a]!==void 0&&g[a]!==k)return S.right(l,0);a>=0&&l.setSelectionRange(a,a,"backward")},right(l,a){const i=l.value.length;let n=Math.min(i,a+1);for(;n<=i;n++)if(g[n]===k){a=n;break}else g[n-1]===k&&(a=n);if(n>i&&g[a-1]!==void 0&&g[a-1]!==k)return S.left(l,i);l.setSelectionRange(a,a,"forward")},leftReverse(l,a){const i=Z(l.value.length);let n=Math.max(0,a-1);for(;n>=0;n--)if(i[n-1]===k){a=n;break}else if(i[n]===k&&(a=n,n===0))break;if(n<0&&i[a]!==void 0&&i[a]!==k)return S.rightReverse(l,0);a>=0&&l.setSelectionRange(a,a,"backward")},rightReverse(l,a){const i=l.value.length,n=Z(i),u=n.slice(0,a+1).indexOf(k)===-1;let r=Math.min(i,a+1);for(;r<=i;r++)if(n[r-1]===k){a=r,a>0&&u===!0&&a--;break}if(r>i&&n[a-1]!==void 0&&n[a-1]!==k)return S.leftReverse(l,i);l.setSelectionRange(a,a,"forward")}};function G(l){f("click",l),w=void 0}function $(l){if(f("keydown",l),Me(l)===!0)return;const a=b.value,i=a.selectionStart,n=a.selectionEnd;if(l.shiftKey||(w=void 0),l.keyCode===37||l.keyCode===39){l.shiftKey&&w===void 0&&(w=a.selectionDirection==="forward"?i:n);const u=S[(l.keyCode===39?"right":"left")+(e.reverseFillMask===!0?"Reverse":"")];if(l.preventDefault(),u(a,w===i?n:i),l.shiftKey){const r=a.selectionStart;a.setSelectionRange(Math.min(w,r),Math.max(w,r),"forward")}}else l.keyCode===8&&e.reverseFillMask!==!0&&i===n?(S.left(a,i),a.setSelectionRange(a.selectionStart,n,"backward")):l.keyCode===46&&e.reverseFillMask===!0&&i===n&&(S.rightReverse(a,n),a.setSelectionRange(i,a.selectionEnd,"forward"))}function z(l){if(l==null||l==="")return"";if(e.reverseFillMask===!0)return I(l);const a=T;let i=0,n="";for(let u=0;u<a.length;u++){const r=l[i],h=a[u];if(typeof h=="string")n+=h,r===h&&i++;else if(r!==void 0&&h.regex.test(r))n+=h.transform!==void 0?h.transform(r):r,i++;else return n}return n}function I(l){const a=T,i=g.indexOf(k);let n=l.length-1,u="";for(let r=a.length-1;r>=0&&n>-1;r--){const h=a[r];let o=l[n];if(typeof h=="string")u=h+u,o===h&&n--;else if(o!==void 0&&h.regex.test(o))do u=(h.transform!==void 0?h.transform(o):o)+u,n--,o=l[n];while(i===r&&o!==void 0&&h.regex.test(o));else return u}return u}function R(l){return typeof l!="string"||V===void 0?typeof l=="number"?V(""+l):l:V(l)}function U(l){return m.length-l.length<=0?l:e.reverseFillMask===!0&&l.length!==0?m.slice(0,-l.length)+l:l+m.slice(l.length)}return{innerValue:d,hasMask:y,moveCursorForPaste:X,updateMaskValue:K,onMaskedKeydown:$,onMaskedClick:G}}function Ve(e,f){function x(){const b=e.modelValue;try{const g="DataTransfer"in window?new DataTransfer:"ClipboardEvent"in window?new ClipboardEvent("").clipboardData:void 0;return Object(b)===b&&("length"in b?Array.from(b):[b]).forEach(m=>{g.items.add(m)}),{files:g.files}}catch{return{files:void 0}}}return f===!0?A(()=>{if(e.type==="file")return x()}):A(x)}var Ie=we({name:"QInput",inheritAttrs:!1,props:H(P(P(P({},de),Re),ce),{modelValue:{required:!1},shadowText:String,type:{type:String,default:"text"},debounce:[String,Number],autogrow:Boolean,inputClass:[Array,String,Object],inputStyle:[Array,String,Object]}),emits:[...ge,"paste","change","keydown","click","animationend"],setup(e,{emit:f,attrs:x}){const{proxy:b}=Se(),{$q:g}=b,m={};let T=NaN,V,N,w=null,y;const d=J(null),W=me(e),{innerValue:F,hasMask:Z,moveCursorForPaste:q,updateMaskValue:K,onMaskedKeydown:X,onMaskedClick:S}=Ee(e,f,o,d),G=Ve(e,!0),$=A(()=>te(F.value)),z=ke(r),I=ve(),R=A(()=>e.type==="textarea"||e.autogrow===!0),U=A(()=>R.value===!0||["text","search","url","tel","password"].includes(e.type)),l=A(()=>{const t=H(P({},I.splitAttrs.listeners.value),{onInput:r,onPaste:u,onChange:B,onBlur:D,onFocus:ae});return t.onCompositionstart=t.onCompositionupdate=t.onCompositionend=z,Z.value===!0&&(t.onKeydown=X,t.onClick=S),e.autogrow===!0&&(t.onAnimationend=h),t}),a=A(()=>{const t=H(P({tabindex:0,"data-autofocus":e.autofocus===!0||void 0,rows:e.type==="textarea"?6:void 0,"aria-label":e.label,name:W.value},I.splitAttrs.attributes.value),{id:I.targetUid.value,maxlength:e.maxlength,disabled:e.disable===!0,readonly:e.readonly===!0});return R.value===!1&&(t.type=e.type),e.autogrow===!0&&(t.rows=1),t});j(()=>e.type,()=>{d.value&&(d.value.value=e.modelValue)}),j(()=>e.modelValue,t=>{if(Z.value===!0){if(N===!0&&(N=!1,String(t)===T))return;K(t)}else F.value!==t&&(F.value=t,e.type==="number"&&m.hasOwnProperty("value")===!0&&(V===!0?V=!1:delete m.value));e.autogrow===!0&&_(s)}),j(()=>e.autogrow,t=>{t===!0?_(s):d.value!==null&&x.rows>0&&(d.value.style.height="auto")}),j(()=>e.dense,()=>{e.autogrow===!0&&_(s)});function i(){be(()=>{const t=document.activeElement;d.value!==null&&d.value!==t&&(t===null||t.id!==I.targetUid.value)&&d.value.focus({preventScroll:!0})})}function n(){d.value!==null&&d.value.select()}function u(t){if(Z.value===!0&&e.reverseFillMask!==!0){const v=t.target;q(v,v.selectionStart,v.selectionEnd)}f("paste",t)}function r(t){if(!t||!t.target)return;if(e.type==="file"){f("update:modelValue",t.target.files);return}const v=t.target.value;if(t.target.qComposing===!0){m.value=v;return}if(Z.value===!0)K(v,!1,t.inputType);else if(o(v),U.value===!0&&t.target===document.activeElement){const{selectionStart:O,selectionEnd:E}=t.target;O!==void 0&&E!==void 0&&_(()=>{t.target===document.activeElement&&v.indexOf(t.target.value)===0&&t.target.setSelectionRange(O,E)})}e.autogrow===!0&&s()}function h(t){f("animationend",t),s()}function o(t,v){y=()=>{w=null,e.type!=="number"&&m.hasOwnProperty("value")===!0&&delete m.value,e.modelValue!==t&&T!==t&&(T=t,v===!0&&(N=!0),f("update:modelValue",t),_(()=>{T===t&&(T=NaN)})),y=void 0},e.type==="number"&&(V=!0,m.value=t),e.debounce!==void 0?(w!==null&&clearTimeout(w),m.value=t,w=setTimeout(y,e.debounce)):y()}function s(){requestAnimationFrame(()=>{const t=d.value;if(t!==null){const v=t.parentNode.style,{scrollTop:O}=t,{overflowY:E,maxHeight:C}=g.platform.is.firefox===!0?{}:window.getComputedStyle(t),L=E!==void 0&&E!=="scroll";L===!0&&(t.style.overflowY="hidden"),v.marginBottom=t.scrollHeight-1+"px",t.style.height="1px",t.style.height=t.scrollHeight+"px",L===!0&&(t.style.overflowY=parseInt(C,10)<t.scrollHeight?"auto":"hidden"),v.marginBottom="",t.scrollTop=O}})}function B(t){z(t),w!==null&&(clearTimeout(w),w=null),y!==void 0&&y(),f("change",t.target.value)}function D(t){t!==void 0&&ae(t),w!==null&&(clearTimeout(w),w=null),y!==void 0&&y(),V=!1,N=!1,delete m.value,e.type!=="file"&&setTimeout(()=>{d.value!==null&&(d.value.value=F.value!==void 0?F.value:"")})}function c(){return m.hasOwnProperty("value")===!0?m.value:F.value!==void 0?F.value:""}xe(()=>{D()}),ye(()=>{e.autogrow===!0&&s()}),Object.assign(I,{innerValue:F,fieldClass:A(()=>`q-${R.value===!0?"textarea":"input"}`+(e.autogrow===!0?" q-textarea--autogrow":"")),hasShadow:A(()=>e.type!=="file"&&typeof e.shadowText=="string"&&e.shadowText.length!==0),inputRef:d,emitValue:o,hasValue:$,floatingLabel:A(()=>$.value===!0&&(e.type!=="number"||isNaN(F.value)===!1)||te(e.displayValue)),getControl:()=>Y(R.value===!0?"textarea":"input",P(P(P({ref:d,class:["q-field__native q-placeholder",e.inputClass],style:e.inputStyle},a.value),l.value),e.type!=="file"?{value:c()}:G.value)),getShadowControl:()=>Y("div",{class:"q-field__native q-field__shadow absolute-bottom no-pointer-events"+(R.value===!0?"":" text-no-wrap")},[Y("span",{class:"invisible"},c()),Y("span",e.shadowText)])});const M=he(I);return Object.assign(b,{focus:i,select:n,getNativeElement:()=>d.value}),Ce(b,"nativeEl",()=>d.value),M}});export{Ie as Q};

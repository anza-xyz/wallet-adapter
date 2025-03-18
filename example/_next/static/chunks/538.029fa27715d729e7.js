"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[538],{2538:function(n,e,r){r.r(e),r.d(e,{SignIn:function(){return p}});var o=r(7891),t=r(1805),i=r(9980),a=r(8360),s=r(5593),c=r(4480),l=r(697),u=r.n(l),d=r(2363),f=r(2994),p=function(){var n=(0,s.O)(),e=n.signIn,r=n.publicKey,l=(0,f.d)(),p=(0,d.useCallback)((0,o.Z)((function(){var n,o,i;return(0,t.__generator)(this,(function(t){switch(t.label){case 0:if(t.trys.push([0,2,,3]),!e)throw new Error("Wallet does not support Sign In With Solana!");return n={domain:window.location.host,address:r?r.toBase58():void 0,statement:"Please sign in."},[4,e(n)];case 1:if(o=t.sent(),!(0,c.HS)(n,o))throw new Error("Sign In verification failed!");return l("success","Message signature: ".concat(u().encode(o.signature))),[3,3];case 2:return i=t.sent(),l("error","Sign In failed: ".concat(null===i||void 0===i?void 0:i.message)),[3,3];case 3:return[2]}}))})),[e,r,l]);return(0,i.jsx)(a.Z,{variant:"contained",color:"secondary",onClick:p,disabled:!e,children:"Sign In"})}},2994:function(n,e,r){r.d(e,{d:function(){return j}});var o=r(9980),t=(0,r(8249).Z)((0,o.jsx)("path",{d:"M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"}),"Launch"),i=r(892),a=r(9276),s=r(2363),c=r(8640),l=r(1697),u=r(7993),d=r(6490),f=r(7996),p=r(9843),h=r(3147),m=r(8793),v=r(3356),b=r(1677);function g(n){return(0,b.Z)("MuiLink",n)}var y=(0,v.Z)("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]),x=r(2949),Z=r(5305);const w={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"};var S=({theme:n,ownerState:e})=>{const r=(n=>w[n]||n)(e.color),o=(0,x.DW)(n,`palette.${r}`,!1)||e.color,t=(0,x.DW)(n,`palette.${r}Channel`);return"vars"in n&&t?`rgba(${t} / 0.4)`:(0,Z.Fq)(o,.4)};const k=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],C=(0,d.ZP)(m.Z,{name:"MuiLink",slot:"Root",overridesResolver:(n,e)=>{const{ownerState:r}=n;return[e.root,e[`underline${(0,u.Z)(r.underline)}`],"button"===r.component&&e.button]}})((({theme:n,ownerState:e})=>(0,a.Z)({},"none"===e.underline&&{textDecoration:"none"},"hover"===e.underline&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},"always"===e.underline&&(0,a.Z)({textDecoration:"underline"},"inherit"!==e.color&&{textDecorationColor:S({theme:n,ownerState:e})},{"&:hover":{textDecorationColor:"inherit"}}),"button"===e.component&&{position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"},[`&.${y.focusVisible}`]:{outline:"auto"}})));var D=s.forwardRef((function(n,e){const r=(0,f.Z)({props:n,name:"MuiLink"}),{className:t,color:d="primary",component:m="a",onBlur:v,onFocus:b,TypographyClasses:y,underline:x="always",variant:Z="inherit",sx:S}=r,D=(0,i.Z)(r,k),{isFocusVisibleRef:V,onBlur:I,onFocus:L,ref:M}=(0,p.Z)(),[j,_]=s.useState(!1),A=(0,h.Z)(e,M),F=(0,a.Z)({},r,{color:d,component:m,focusVisible:j,underline:x,variant:Z}),N=(n=>{const{classes:e,component:r,focusVisible:o,underline:t}=n,i={root:["root",`underline${(0,u.Z)(t)}`,"button"===r&&"button",o&&"focusVisible"]};return(0,l.Z)(i,g,e)})(F);return(0,o.jsx)(C,(0,a.Z)({color:d,className:(0,c.Z)(N.root,t),classes:y,component:m,onBlur:n=>{I(n),!1===V.current&&_(!1),v&&v(n)},onFocus:n=>{L(n),!0===V.current&&_(!0),b&&b(n)},ref:A,ownerState:F,variant:Z,sx:[...Object.keys(w).includes(d)?[]:[{color:d}],...Array.isArray(S)?S:[S]]},D))})),V=r(9667),I=(0,d.ZP)("span")((function(){return{display:"flex",alignItems:"center"}})),L=(0,d.ZP)(D)((function(){return{color:"#ffffff",display:"flex",alignItems:"center",marginLeft:16,textDecoration:"underline","&:hover":{color:"#000000"}}})),M=(0,d.ZP)(t)((function(){return{fontSize:20,marginLeft:8}}));function j(){var n=(0,V.Ds)().enqueueSnackbar;return(0,s.useCallback)((function(e,r,t){n((0,o.jsxs)(I,{children:[r,t&&(0,o.jsxs)(L,{href:"https://explorer.solana.com/tx/".concat(t,"?cluster=devnet"),target:"_blank",children:["Transaction",(0,o.jsx)(M,{})]})]}),{variant:e})}),[n])}}}]);
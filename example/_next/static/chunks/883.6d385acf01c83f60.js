"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[883],{9883:function(n,e,r){r.r(e),r.d(e,{SignTransaction:function(){return m}});var o=r(7891),t=r(1805),a=r(9980),i=r(1263),s=r(8833),c=r(5593),l=r(2486),u=r(697),d=r.n(u),f=r(2363),p=r(1033),h=r(778).Buffer,m=function(){var n=(0,s.R)().connection,e=(0,c.O)(),r=e.publicKey,u=e.signTransaction,m=(0,p.d)(),g=(0,f.useCallback)((0,o.Z)((function(){var e,o,a,i;return(0,t.__generator)(this,(function(t){switch(t.label){case 0:if(t.trys.push([0,3,,4]),!r)throw new Error("Wallet not connected!");if(!u)throw new Error("Wallet does not support transaction signing!");return[4,n.getLatestBlockhash()];case 1:return e=t.sent().blockhash,o=new l.Transaction({feePayer:r,recentBlockhash:e}).add(new l.TransactionInstruction({data:h.from("Hello, from the Solana Wallet Adapter example app!"),keys:[],programId:new l.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")})),[4,u(o)];case 2:if(!(o=t.sent()).signature)throw new Error("Transaction not signed!");if(a=d().encode(o.signature),m("info","Transaction signed: ".concat(a)),!o.verifySignatures())throw new Error("Transaction signature invalid! ".concat(a));return m("success","Transaction signature valid! ".concat(a)),[3,4];case 3:return i=t.sent(),m("error","Transaction signing failed! ".concat(null===i||void 0===i?void 0:i.message)),[3,4];case 4:return[2]}}))})),[r,u,n,m]);return(0,a.jsx)(i.Z,{variant:"contained",color:"secondary",onClick:g,disabled:!r||!u,children:"Sign Transaction"})}},1033:function(n,e,r){r.d(e,{d:function(){return M}});var o=r(9980),t=(0,r(2526).Z)((0,o.jsx)("path",{d:"M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"}),"Launch"),a=r(892),i=r(9276),s=r(2363),c=r(8640),l=r(1697),u=r(8428),d=r(38),f=r(5921),p=r(5083),h=r(2097),m=r(2693),g=r(3356),v=r(1677);function b(n){return(0,v.Z)("MuiLink",n)}var y=(0,g.Z)("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]),x=r(6846),w=r(2442);const Z={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"};var k=({theme:n,ownerState:e})=>{const r=(n=>Z[n]||n)(e.color),o=(0,x.DW)(n,`palette.${r}`,!1)||e.color,t=(0,x.DW)(n,`palette.${r}Channel`);return"vars"in n&&t?`rgba(${t} / 0.4)`:(0,w.Fq)(o,.4)};const S=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],T=(0,d.ZP)(m.Z,{name:"MuiLink",slot:"Root",overridesResolver:(n,e)=>{const{ownerState:r}=n;return[e.root,e[`underline${(0,u.Z)(r.underline)}`],"button"===r.component&&e.button]}})((({theme:n,ownerState:e})=>(0,i.Z)({},"none"===e.underline&&{textDecoration:"none"},"hover"===e.underline&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},"always"===e.underline&&(0,i.Z)({textDecoration:"underline"},"inherit"!==e.color&&{textDecorationColor:k({theme:n,ownerState:e})},{"&:hover":{textDecorationColor:"inherit"}}),"button"===e.component&&{position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"},[`&.${y.focusVisible}`]:{outline:"auto"}})));var C=s.forwardRef((function(n,e){const r=(0,f.Z)({props:n,name:"MuiLink"}),{className:t,color:d="primary",component:m="a",onBlur:g,onFocus:v,TypographyClasses:y,underline:x="always",variant:w="inherit",sx:k}=r,C=(0,a.Z)(r,S),{isFocusVisibleRef:D,onBlur:L,onFocus:V,ref:A}=(0,p.Z)(),[M,W]=s.useState(!1),B=(0,h.Z)(e,A),j=(0,i.Z)({},r,{color:d,component:m,focusVisible:M,underline:x,variant:w}),H=(n=>{const{classes:e,component:r,focusVisible:o,underline:t}=n,a={root:["root",`underline${(0,u.Z)(t)}`,"button"===r&&"button",o&&"focusVisible"]};return(0,l.Z)(a,b,e)})(j);return(0,o.jsx)(T,(0,i.Z)({color:d,className:(0,c.Z)(H.root,t),classes:y,component:m,onBlur:n=>{L(n),!1===D.current&&W(!1),g&&g(n)},onFocus:n=>{V(n),!0===D.current&&W(!0),v&&v(n)},ref:B,ownerState:j,variant:w,sx:[...Object.keys(Z).includes(d)?[]:[{color:d}],...Array.isArray(k)?k:[k]]},C))})),D=r(9473),L=(0,d.ZP)("span")((function(){return{display:"flex",alignItems:"center"}})),V=(0,d.ZP)(C)((function(){return{color:"#ffffff",display:"flex",alignItems:"center",marginLeft:16,textDecoration:"underline","&:hover":{color:"#000000"}}})),A=(0,d.ZP)(t)((function(){return{fontSize:20,marginLeft:8}}));function M(){var n=(0,D.Ds)().enqueueSnackbar;return(0,s.useCallback)((function(e,r,t){n((0,o.jsxs)(L,{children:[r,t&&(0,o.jsxs)(V,{href:"https://explorer.solana.com/tx/".concat(t,"?cluster=devnet"),target:"_blank",children:["Transaction",(0,o.jsx)(A,{})]})]}),{variant:e})}),[n])}}}]);
!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([function(t,e,n){"use strict";t.exports=function(t){function e(t,e,n,r){function o(e){"function"!=typeof self.postMessage?t.ports[0].postMessage(e):self.postMessage(e)}n?("undefined"!=typeof console&&"error"in console&&console.error("Worker caught an error:",n),o([e,{message:n.message}])):o([e,null,r])}self.addEventListener("message",(function(n){var r=n.data;if(Array.isArray(r)&&2===r.length){var o=r[0],u=r[1];"function"!=typeof t?e(n,o,new Error("Please pass a function into register().")):function(t,n,r,o){var u,s=function(t,e){try{return{res:t(e)}}catch(t){return{err:t}}}(n,o);s.err?e(t,r,s.err):!(u=s.res)||"object"!=typeof u&&"function"!=typeof u||"function"!=typeof u.then?e(t,r,null,s.res):s.res.then((function(n){e(t,r,null,n)}),(function(n){e(t,r,n)}))}(n,t,o,u)}}))}},function(t,e,n){"use strict";n.r(e);var r=n(0);const o=(t,e)=>{let n={x:0,y:0};const r=e;let o=0;for(;o<t.maxIterations&&!(n.x*n.x+n.y*n.y>=4);){const t={x:n.x*n.x-n.y*n.y,y:2*n.x*n.y};n={x:t.x+r.x,y:t.y+r.y},o+=1}return o},u=t=>{const e=((t,e)=>{const n=(t.regionTopRight.x-t.regionBottomLeft.x)/(e+1),r=(t.regionTopRight.y-t.regionBottomLeft.y)/(e+1),u=[];for(let s=1;s<=e;s++){const i=t.regionBottomLeft.y+s*r;for(let r=1;r<=e;r++){const e=t.regionBottomLeft.x+r*n,s=o(t,{x:e,y:i});u.push(s)}}return u})(t,12),n=s(.4,.7);return new Set(e).size>=e.length*n},s=(t,e)=>Math.random()*(e-t)+t,i=t=>t[Math.trunc(Math.random()*t.length)],f=(t,e)=>{const n=i(t),r=i(e),o=s(-2,.75),u=s(-1.5,1.5),f=s(.01,.5);return{fractalSetId:n,juliaConstant:{x:o,y:u},colourMapId:r,regionBottomLeft:{x:o-f,y:u-f},regionTopRight:{x:o+f,y:u+f},maxIterations:(c=16,a=256,Math.trunc(s(c,a)))};var c,a};n.n(r)()(t=>{switch(t.type){case"chooseConfiguration":return((t,e)=>{for(;;){const n=f(t,e);if(u(n))return n}})(t.fractalSetIds,t.colorMapIds);default:return(t=>{console.log("Unknown message: "+JSON.stringify(t))})(t)}})}]);
//# sourceMappingURL=0.bundle.worker.js.map
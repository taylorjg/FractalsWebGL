(()=>{"use strict";var e={847:e=>{e.exports=function(e){function t(e,t,o,r){function n(t){"function"!=typeof self.postMessage?e.ports[0].postMessage(t):self.postMessage(t)}o?("undefined"!=typeof console&&"error"in console&&console.error("Worker caught an error:",o),n([t,{message:o.message}])):n([t,null,r])}self.addEventListener("message",(function(o){var r=o.data;if(Array.isArray(r)&&2===r.length){var n=r[0],s=r[1];"function"!=typeof e?t(o,n,new Error("Please pass a function into register().")):function(e,o,r,n){var s,a=function(e,t){try{return{res:e(t)}}catch(e){return{err:e}}}(o,n);a.err?t(e,r,a.err):!(s=a.res)||"object"!=typeof s&&"function"!=typeof s||"function"!=typeof s.then?t(e,r,null,a.res):a.res.then((function(o){t(e,r,null,o)}),(function(o){t(e,r,o)}))}(o,e,n,s)}}))}}},t={};function o(r){var n=t[r];if(void 0!==n)return n.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,o),s.exports}o.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return o.d(t,{a:t}),t},o.d=(e,t)=>{for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=o(847);const t=(e,t)=>Math.random()*(t-e)+e,r=(e,o)=>Math.trunc(t(e,o)),n=e=>e[r(0,e.length)],s=()=>t(-.1,.1),a=(e,t)=>{let o={x:0,y:0};const r=t;let n=0;for(;n<e.maxIterations&&!(o.x*o.x+o.y*o.y>=4);){const e={x:o.x*o.x-o.y*o.y,y:2*o.x*o.y};o={x:e.x+r.x,y:e.y+r.y},n+=1}return n},i=e=>{const o=((e,t)=>{const o=(e.regionTopRight.x-e.regionBottomLeft.x)/13,r=(e.regionTopRight.y-e.regionBottomLeft.y)/13,n=[];for(let t=1;t<=12;t++){const s=e.regionBottomLeft.y+t*r;for(let t=1;t<=12;t++){const r=e.regionBottomLeft.x+t*o,i=a(e,{x:r,y:s});n.push(i)}}return n})(e),r=t(.4,.7);return new Set(o).size>=o.length*r},f=(e,o)=>{const a=n(e),i=n(o),f=t(-2,.75),c=t(-1.5,1.5),u=t(.01,.5);return{fractalSetId:a,juliaConstant:{x:f,y:c},colourMapId:i,regionBottomLeft:{x:f-u,y:c-u},regionTopRight:{x:f+u,y:c+u},maxIterations:r(16,256),panSpeedX:s(),panSpeedY:s(),zoomSpeed:t(.01,.1)}};o.n(e)()((e=>"chooseConfiguration"===e.type?((e,t)=>{for(;;){const o=f(e,t);if(i(o))return o}})(e.fractalSetIds,e.colourMapIds):(e=>{console.log(`Unknown message: ${JSON.stringify(e)}`)})(e)))})()})();
//# sourceMappingURL=653.js.map
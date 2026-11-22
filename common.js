const $=id=>document.getElementById(id);
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=n=>Math.random()*n|0;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>(s/60|0)+':'+String(s%60).padStart(2,'0');
const overlay=(el,t,p,b,f)=>{el.querySelector('h2').textContent=t;el.querySelector('p').textContent=p;const bt=el.querySelector('button');if(bt){bt.textContent=b||'Play Again';bt.onclick=f}el.classList.remove('hide')};
if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Array.isArray(r)?r[0]:r;r=Math.max(0,Math.min(+r||0,Math.abs(w)/2,Math.abs(h)/2));this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath()};

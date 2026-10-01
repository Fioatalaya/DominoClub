const SYMBOLS=["🍒","🍋","🔔","💎","7️⃣","⭐"];let balance=10000,bet=100,spinning=false;
const $=s=>document.querySelector(s), reels=[...document.querySelectorAll(".reel")];
function fmt(n){return n.toLocaleString("en-US")}
function randomSymbol(){return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]}
function update(){ $("#balance").textContent=fmt(balance);$("#bet").textContent=fmt(bet)}
function makeStrip(final){
 const a=Array.from({length:18},randomSymbol);a.push(final);a.push(randomSymbol());
 return '<div class="strip">'+a.map(x=>'<div class="symbol">'+x+'</div>').join("")+'</div>'
}
function prize(result){
 const counts={};result.forEach(x=>counts[x]=(counts[x]||0)+1);
 const max=Math.max(...Object.values(counts));
 if(max===5)return bet*50;if(max===4)return bet*10;if(max===3)return bet*3;return 0
}
async function spin(){
 if(spinning)return;if(balance<bet){$("#message").textContent="Saldo virtual insuficiente";return}
 spinning=true;$("#spin").disabled=true;balance-=bet;$("#win").textContent="0";update();
 const result=Array.from({length:5},randomSymbol);
 const jobs=reels.map((r,i)=>{r.innerHTML=makeStrip(result[i]);const strip=r.firstElementChild;const h=r.querySelector(".symbol").getBoundingClientRect().height;const end=-(18*h-2*h);return strip.animate([{transform:"translateY(0)"},{transform:"translateY("+end+"px)"}],{duration:1200+i*180,easing:"cubic-bezier(.12,.65,.18,1)",fill:"forwards"}).finished});
 await Promise.all(jobs);
 const win=prize(result);balance+=win;update();$("#win").textContent=fmt(win);
 $("#message").textContent=win?("¡Premio! +"+fmt(win)+" créditos"):"Intenta otra vez";
 spinning=false;$("#spin").disabled=false
}
reels.forEach(r=>{const vals=[randomSymbol(),randomSymbol(),randomSymbol()];r.innerHTML='<div class="strip">'+vals.map(x=>'<div class="symbol">'+x+'</div>').join("")+'</div>'});
$("#spin").addEventListener("click",spin);
$("#minus").addEventListener("click",()=>{if(!spinning){bet=Math.max(50,bet-50);update()}});
$("#plus").addEventListener("click",()=>{if(!spinning){bet=Math.min(500,bet+50);update()}});
update();
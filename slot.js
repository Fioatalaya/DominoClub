
let symbolSerial=0;
function symbolArt(symbol){
 const id='slot-art-'+symbolSerial++;
 const shapes={
 '🍒':'<path d="M31 50Q28 21 61 12Q53 36 68 55" fill="none" stroke="#387837" stroke-width="5"/><path d="M42 24Q44 6 68 9Q64 28 42 24" fill="url(#'+id+'g)"/><circle cx="30" cy="63" r="20" fill="url(#'+id+'r)" stroke="#980c30" stroke-width="2"/><circle cx="66" cy="67" r="20" fill="url(#'+id+'r)" stroke="#980c30" stroke-width="2"/><ellipse cx="23" cy="54" rx="7" ry="5" fill="#fff" opacity=".65"/><ellipse cx="60" cy="57" rx="7" ry="5" fill="#fff" opacity=".65"/>',
 '🍋':'<path d="M15 54Q9 31 35 20Q68 5 85 37Q94 66 67 78Q31 93 15 54" fill="url(#'+id+'y)" stroke="#cc9c13" stroke-width="3"/><path d="M24 40Q36 22 56 23" fill="none" stroke="#ffffd2" stroke-width="6" stroke-linecap="round"/><path d="M67 18Q69 2 86 8Q86 23 67 18" fill="url(#'+id+'g)"/>',
 '🔔':'<path d="M45 20V12Q50 5 55 12V20" fill="none" stroke="#d39a24" stroke-width="5"/><path d="M23 70Q33 59 31 42Q31 21 50 20Q69 21 69 42Q67 59 77 70Z" fill="url(#'+id+'y)" stroke="#b27616" stroke-width="3"/><ellipse cx="50" cy="72" rx="30" ry="8" fill="url(#'+id+'y)" stroke="#b27616" stroke-width="2"/><circle cx="50" cy="80" r="8" fill="#bd811c"/><path d="M40 32Q36 44 39 56" fill="none" stroke="#fffac3" stroke-width="5" stroke-linecap="round"/>',
 '💎':'<path d="M12 34L30 15H70L88 34L50 85Z" fill="#169de9" stroke="#1655a8" stroke-width="3"/><path d="M12 34H88L50 85Z" fill="#258bea"/><path d="M30 15L37 34L50 85L63 34L70 15Z" fill="#a8f6ff"/><path d="M12 34L30 15L37 34Z" fill="#e6ffff"/><path d="M63 34L70 15L88 34Z" fill="#61caff"/><path d="M37 34L50 15L63 34Z" fill="#fff"/><path d="M18 34H83" stroke="#e2ffff" stroke-width="2"/>',
 '7️⃣':'<text x="50" y="80" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="86" fill="#9d142f" stroke="#8e1233" stroke-width="7">7</text><text x="48" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="86" fill="url(#'+id+'r)" stroke="#ffcb75" stroke-width="2">7</text>',
 '👑':'<path d="M16 34L33 47L50 21L67 47L84 34L75 76H25Z" fill="url(#'+id+'y)" stroke="#98621b" stroke-width="3"/><rect x="23" y="70" width="54" height="13" rx="5" fill="url(#'+id+'y)" stroke="#b77b1c" stroke-width="2"/><circle cx="16" cy="30" r="6" fill="#ffedaa"/><circle cx="50" cy="17" r="7" fill="#ffedaa"/><circle cx="84" cy="30" r="6" fill="#ffedaa"/><path d="M50 44L58 56L50 68L42 56Z" fill="url(#'+id+'r)" stroke="#fff0a1" stroke-width="2"/><circle cx="32" cy="60" r="4" fill="#45cfff"/><circle cx="68" cy="60" r="4" fill="#45cfff"/>'
 };
 return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="'+id+'y" x2=".8" y2="1"><stop stop-color="#fff5ac"/><stop offset=".4" stop-color="#ffd548"/><stop offset=".75" stop-color="#eab32c"/><stop offset="1" stop-color="#a76618"/></linearGradient><radialGradient id="'+id+'r" cx=".3" cy=".25"><stop stop-color="#ffbba9"/><stop offset=".35" stop-color="#fc424e"/><stop offset="1" stop-color="#b30835"/></radialGradient><linearGradient id="'+id+'g" x2="1" y2="1"><stop stop-color="#baff85"/><stop offset="1" stop-color="#1a813e"/></linearGradient></defs>'+shapes[symbol]+'</svg>';
}
const S=["🍒","🍋","🔔","💎","7️⃣","👑"],MULT=[2,3,4,5,6,7,8,9,10,11,12,15,18,20,22,25,30,32,35,38,40,45,50,55,100];
let balance=10000,bet=50,busy=false,grid=[],cascade=1,freeSpins=0;
const $=s=>document.querySelector(s),fmt=n=>n.toLocaleString("en-US"),rnd=()=>S[Math.floor(Math.random()*S.length)],wait=t=>new Promise(r=>setTimeout(r,t));
function makeGrid(){return Array.from({length:5},()=>Array.from({length:3},rnd))}
function draw(){const r=$("#reels");r.innerHTML="";grid.forEach((col,c)=>{const d=document.createElement("div");d.className="reel";col.forEach((x,row)=>{const e=document.createElement("div");e.className="symbol";e.dataset.c=c;e.dataset.r=row;e.innerHTML=symbolArt(x);e.setAttribute('aria-label',x);d.appendChild(e)});r.appendChild(d)})}
function update(){$("#balance").textContent=fmt(balance);$("#bet").textContent=fmt(bet);const f=$("#freeSpinsCounter");if(f){f.textContent="GIROS GRATIS: "+freeSpins;f.style.display=freeSpins>0?"block":"none"}}
function groups(){const map={};grid.forEach((col,c)=>col.forEach((s,r)=>(map[s]??=[]).push([c,r])));return Object.entries(map).filter(([symbol,a])=>a.length>=5||(symbol==="👑"&&a.length>=4))}
async function tumble(){
 let total=0,round=0;
 while(round<8){
  const g=groups();if(!g.length)break; const crown=g.find(([s,a])=>s==="👑"&&a.length>=4); if(crown){const count=crown[1].length,award=count>=5?15:10;freeSpins+=award;$("#crownText").textContent=(count+" coronas · "+award)+" giros gratis";$("#crownPrize").style.display="grid";await new Promise(resolve=>{$("#crownOk").onclick=()=>{$("#crownPrize").style.display="none";resolve()}});$("#msg").textContent="👑 "+award+" giros gratis";update();}
  const cells=[...new Map(g.flatMap(([,a])=>a).map(x=>[x.join("-"),x])).values()];
  const base=MULT[Math.min(MULT.length-1,round+1)];
  $("#multiplier").textContent="MULTIPLICADOR ×"+base;
  cells.forEach(([c,r])=>document.querySelector('[data-c="'+c+'"][data-r="'+r+'"]')?.classList.add("win"));
  if(g.some(([,a])=>a.length>=5))total+=bet*base;await wait(600);
  const remove=new Set(cells.map(x=>x.join("-")));
  for(let c=0;c<5;c++){let keep=[];for(let r=2;r>=0;r--)if(!remove.has(c+"-"+r))keep.unshift(grid[c][r]);while(keep.length<3)keep.unshift(rnd());grid[c]=keep}
  draw();document.querySelectorAll(".symbol").forEach((e)=>e.animate([{transform:"translateY(-95px)",opacity:.15},{transform:"translateY(0)",opacity:1}],{duration:520,easing:"cubic-bezier(.2,.8,.2,1)"}));
  await wait(480);round++;
 }
 return total;
}
async function spin(){
 if(busy||(balance<bet&&freeSpins===0))return;busy=true;if(freeSpins>0){freeSpins--;$("#msg").textContent="Giro gratis · quedan "+freeSpins}else balance-=bet;update();$("#win").textContent="0";$("#multiplier").textContent="MULTIPLICADOR ×1";$("#msg").textContent="Girando…";
 for(let frame=0;frame<9;frame++){grid=makeGrid();draw();document.querySelectorAll(".symbol").forEach(e=>e.animate([{transform:"translateY(-80px)",filter:"blur(5px)"},{transform:"translateY(80px)",filter:"blur(3px)"}],{duration:110,easing:"linear"}));await wait(110)}
 grid=makeGrid();draw();
 [...document.querySelectorAll(".reel")].forEach((reel,c)=>reel.animate([{transform:"translateY(-120px)",filter:"blur(6px)"},{transform:"translateY(0)",filter:"blur(0)"}],{duration:480+c*180,easing:"cubic-bezier(.15,.75,.2,1)",fill:"both"}));
 await wait(1250);const total=await tumble();balance+=total;update();$("#win").textContent=fmt(total);$("#msg").textContent=total?"¡Cascada ganadora! +"+fmt(total):"Sin premio esta vez";busy=false;update()
}
$("#spin").onclick=spin;$("#minus").onclick=()=>{if(!busy){bet=Math.max(25,bet-25);update()}};$("#plus").onclick=()=>{if(!busy){bet=Math.min(500,bet+25);update()}};grid=makeGrid();draw();update();
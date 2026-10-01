const S=["🍒","🍋","🔔","💎","7️⃣","👑"],MULT=[2,3,4,5,6,7,8,9,10,11,12,15,18,20,22,25,30,32,35,38,40,45,50,55,100];
let balance=10000,bet=50,busy=false,grid=[],cascade=1,freeSpins=0;
const $=s=>document.querySelector(s),fmt=n=>n.toLocaleString("en-US"),rnd=()=>S[Math.floor(Math.random()*S.length)],wait=t=>new Promise(r=>setTimeout(r,t));
function makeGrid(){return Array.from({length:5},()=>Array.from({length:3},rnd))}
function draw(){const r=$("#reels");r.innerHTML="";grid.forEach((col,c)=>{const d=document.createElement("div");d.className="reel";col.forEach((x,row)=>{const e=document.createElement("div");e.className="symbol";e.dataset.c=c;e.dataset.r=row;e.textContent=x;d.appendChild(e)});r.appendChild(d)})}
function update(){$("#balance").textContent=fmt(balance);$("#bet").textContent=fmt(bet);const f=$("#freeSpinsCounter");if(f)f.textContent="GIROS GRATIS: "+freeSpins}
function groups(){const map={};grid.forEach((col,c)=>col.forEach((s,r)=>(map[s]??=[]).push([c,r])));return Object.entries(map).filter(([,a])=>a.length>=5)}
async function tumble(){
 let total=0,round=0;
 while(round<8){
  const g=groups();if(!g.length)break; const crown=g.find(([s,a])=>s==="👑"&&a.length>=4); if(crown){const count=crown[1].length,award=count>=5?15:10;freeSpins+=award;update();$("#crownText").textContent=(count>=5?"5 coronas · 15":"4 coronas · 10")+" giros gratis";$("#crownPrize").style.display="grid";await new Promise(resolve=>{$("#crownOk").onclick=()=>{$("#crownPrize").style.display="none";resolve()}});$("#msg").textContent="👑 "+award+" giros gratis";update();}
  const cells=[...new Map(g.flatMap(([,a])=>a).map(x=>[x.join("-"),x])).values()];
  const base=MULT[Math.min(MULT.length-1,round+1)];
  $("#multiplier").textContent="MULTIPLICADOR ×"+base;
  cells.forEach(([c,r])=>document.querySelector('[data-c="'+c+'"][data-r="'+r+'"]')?.classList.add("win"));
  total+=bet*base;await wait(600);
  const remove=new Set(cells.map(x=>x.join("-")));
  for(let c=0;c<5;c++){let keep=[];for(let r=2;r>=0;r--)if(!remove.has(c+"-"+r))keep.unshift(grid[c][r]);while(keep.length<3)keep.unshift(rnd());grid[c]=keep}
  draw();document.querySelectorAll(".symbol").forEach((e)=>e.animate([{transform:"translateY(-95px)",opacity:.15},{transform:"translateY(0)",opacity:1}],{duration:520,easing:"cubic-bezier(.2,.8,.2,1)"}));
  await wait(480);round++;
 }
 return total;
}
async function spin(){
 if(busy||(balance<bet&&freeSpins===0))return;busy=true;if(freeSpins>0){freeSpins--;$("#msg").textContent="Giro gratis · quedan "+freeSpins}else balance-=bet;update();$("#win").textContent="0";$("#multiplier").textContent="MULTIPLICADOR ×1";$("#msg").textContent="Girando…";
 grid=makeGrid();draw();
 document.querySelectorAll(".symbol").forEach((e,i)=>e.animate([{transform:"translateY(-160px) rotateX(75deg)",filter:"blur(6px)"},{transform:"translateY(0) rotateX(0)",filter:"blur(0)"}],{duration:700+(i%5)*120,easing:"cubic-bezier(.2,.8,.2,1)"}));
 await wait(1350);const total=await tumble();balance+=total;update();$("#win").textContent=fmt(total);$("#msg").textContent=total?"¡Cascada ganadora! +"+fmt(total):"Sin premio esta vez";busy=false;update();if(freeSpins>0)setTimeout(spin,650)
}
$("#spin").onclick=spin;$("#minus").onclick=()=>{if(!busy){bet=Math.max(25,bet-25);update()}};$("#plus").onclick=()=>{if(!busy){bet=Math.min(500,bet+25);update()}};grid=makeGrid();draw();update();
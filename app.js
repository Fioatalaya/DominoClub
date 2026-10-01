let extremoIzquierdo = null;
let extremoDerecho = null;
let manosJugadores = {};
let turnoActual = "tu";
let segundosTurno = 10;
let relojTurno = null;
let turnoBloqueado = false;
let turnoToken = 0;
let turnoHumanoId = 0;
let ultimaJugadaHumanaId = -1;
let fichaPendiente = null;
let arrastreFicha = null;
let cadenaLogica = [];
let indiceInicioCadena = 0;
let siguienteFichaId = 1;
let estadoPartida = null;

function crearEstadoPartida(){
  const fichas=[];
  for(let a=0;a<=6;a++) for(let b=a;b<=6;b++) fichas.push({id:siguienteFichaId++,a,b});
  for(let i=fichas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[fichas[i],fichas[j]]=[fichas[j],fichas[i]];}
  return {
    manos:{
      tu:fichas.slice(0,7), j2:fichas.slice(7,14),
      j3:fichas.slice(14,21), j4:fichas.slice(21,28)
    },
    cadena:[], inicioId:null
  };
}
function valoresFicha(f){ return Array.isArray(f)?f:[f.a,f.b]; }

const ordenTurnos = ["tu", "j2", "j3", "j4"];

const tables = [
  { name: "Mesa Principiantes", entry: 100 },
  { name: "Mesa Clasica", entry: 500 },
  { name: "Mesa VIP", entry: 1000 }
];

function render() {
  const box = document.querySelector("#tables");
  if (!box) return;

  box.innerHTML = tables.map((table, index) => `
    <div class="table">
      <div>
        <b>${table.name}</b><br>
        <small>Entrada: ${table.entry} monedas</small>
      </div>
      <button type="button" onclick="joinTable(${index})">Entrar</button>
    </div>
  `).join("");
}

function joinTable(index) {
  openGame(index);
}

function createTable() {
  const stake = document.querySelector("#stake");
  const entry = stake ? Number(stake.value) : 100;

  tables.push({
    name: "Mi Mesa",
    entry: entry
  });

  render();
}

function crearMazoDomino() {
  const mazo = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) mazo.push([a, b]);
  }
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo;
}

function htmlFicha(ficha, indice = null) {
  const [a, b] = ficha;
  return `<div class="ficha-domino"${indice !== null ? ` data-hand-index="${indice}"` : ""}
    onclick="seleccionarFicha(this, ${a}, ${b})"
    onpointerdown="iniciarArrastreFicha(event,this,${a},${b})">
    <span class="cara" data-num="${a}"></span><span class="cara" data-num="${b}"></span>
  </div>`;
}

function openGame(index) {
  extremoIzquierdo = null;
  extremoDerecho = null;
  cadenaLogica = [];
  indiceInicioCadena = 0;
  const table = tables[index];
  if (!table) return;

  estadoPartida=crearEstadoPartida();
  manosJugadores={
    tu:estadoPartida.manos.tu.map(valoresFicha),
    j2:estadoPartida.manos.j2.map(valoresFicha),
    j3:estadoPartida.manos.j3.map(valoresFicha),
    j4:estadoPartida.manos.j4.map(valoresFicha)
  };
  const total=Object.values(manosJugadores).reduce((n,m)=>n+m.length,0);
  if(total!==28) throw new Error("Reparto inválido: "+total+" fichas");

  document.body.innerHTML = `
    <div class="partida">
      <div class="partida-superior nueva-barra">
        <button class="salir-partida" type="button" onclick="location.reload()">‹</button>
        <div class="bote-partida"><small>BOTE</small><strong>🪙 ${table.entry * 4}</strong></div>
        <div class="mesa-titulo"><strong>${table.name}</strong><small>Dominó Club</small></div>
        <div class="saldo-partida">🪙 10,000</div>
      </div>
      <div class="mesa-domino">
        <div class="jugador jugador-arriba"><span class="avatar-juego">J2</span><span class="datos-jugador"><b>J2</b><small>7 fichas</small></span></div>
        <div class="jugador jugador-izquierda"><span class="avatar-juego">J3</span><span class="datos-jugador"><b>J3</b><small>7 fichas</small></span></div>
        <div class="centro-mesa">DOMINO<br><span>Partida iniciada</span></div>
        <div class="tablero-fichas"><div class="cadena-fichas"></div></div>
        <div class="jugador jugador-derecha"><span class="avatar-juego">J4</span><span class="datos-jugador"><b>J4</b><small>7 fichas</small></span></div>
        <div class="jugador jugador-abajo"><span class="avatar-juego avatar-tu">TÚ</span><span class="datos-jugador"><small>10,000 monedas</small></span></div>
      </div>
      <div class="mis-fichas">${manosJugadores.tu.map((f,i)=>htmlFicha(f,i)).join("")}</div>
    </div>
  `;
  dibujarFichas();
  iniciarTurno("tu");
}

function crearPuntos(numero) {
  const posiciones = {
    0: [],
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  let html = '<span class="puntos">';

  for (let i = 1; i <= 9; i++) {
  const activo = posiciones[numero].includes(i);
  html += `<i class="${activo ? "punto activo" : "punto"}"></i>`;
  }

  html += '</span>';
  return html;
}

function dibujarFichas() {
  document.querySelectorAll(".cara").forEach(cara => {
    const numero = Number(cara.dataset.num);
    cara.innerHTML = crearPuntos(numero);
    cara.querySelectorAll(".punto.activo").forEach(p=>{
      p.style.backgroundColor="#111827";
      p.style.opacity="1";
      p.style.filter="none";
    });
  });
}
let ultimoToqueFicha={el:null,t:0};
function seleccionarFicha(elemento, ladoA, ladoB) {
  if (arrastreFicha?.movio || turnoActual !== "tu" || turnoBloqueado) return;
  const ahora=Date.now();
  const doble=ultimoToqueFicha.el===elemento && ahora-ultimoToqueFicha.t<380;
  document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f=>f.classList.remove("ficha-levantada"));
  if(doble){
    elemento.classList.add("ficha-levantada");
    if(!fichaValida([ladoA,ladoB])) mostrarMensaje("Puedes moverla, pero no encaja en la mesa");
    ultimoToqueFicha={el:null,t:0};
  }else{
    ultimoToqueFicha={el:elemento,t:ahora};
  }
}

function iniciarArrastreFicha(e, elemento, ladoA, ladoB) {
  if (turnoActual !== "tu" || turnoBloqueado) return;
  const existe=manosJugadores.tu.some(f=>(f[0]===ladoA&&f[1]===ladoB)||(f[0]===ladoB&&f[1]===ladoA));
  if(!existe) return;
  e.preventDefault();
  elemento.setPointerCapture?.(e.pointerId);
  const r=elemento.getBoundingClientRect();
  arrastreFicha={elemento,ladoA,ladoB,indiceMano:Number(elemento.dataset.handIndex),pointerId:e.pointerId,movio:false,
    ox:e.clientX-r.left,oy:e.clientY-r.top,
    css:{position:elemento.style.position,left:elemento.style.left,top:elemento.style.top,
      width:elemento.style.width,height:elemento.style.height,zIndex:elemento.style.zIndex,
      transform:elemento.style.transform,pointerEvents:elemento.style.pointerEvents}};
  elemento.classList.add("ficha-arrastrando");
  elemento.style.position="fixed";
  elemento.style.width=r.width+"px"; elemento.style.height=r.height+"px";
  elemento.style.left=(e.clientX-arrastreFicha.ox)+"px";
  elemento.style.top=(e.clientY-arrastreFicha.oy)+"px";
  elemento.style.zIndex="1000";
  elemento.style.pointerEvents="none";
  window.addEventListener("pointermove",moverArrastreFicha,{passive:false});
  window.addEventListener("pointerup",soltarArrastreFicha,{once:true});
  window.addEventListener("pointercancel",cancelarArrastreFicha,{once:true});
}
function moverArrastreFicha(e){
  const d=arrastreFicha;if(!d)return;
  e.preventDefault(); d.movio=true;
  d.elemento.style.left=(e.clientX-d.ox)+"px";
  d.elemento.style.top=(e.clientY-d.oy)+"px";
}
function restaurarArrastre(d){
  if(!d)return;
  Object.assign(d.elemento.style,d.css);
  d.elemento.classList.remove("ficha-arrastrando");
}
function cancelarArrastreFicha(){
  const d=arrastreFicha;arrastreFicha=null;
  window.removeEventListener("pointermove",moverArrastreFicha);
  restaurarArrastre(d);
}
function soltarArrastreFicha(e){
  const d=arrastreFicha;arrastreFicha=null;
  window.removeEventListener("pointermove",moverArrastreFicha);
  if(!d)return;
  const mesa=document.querySelector(".tablero-fichas");
  const mr=mesa?.getBoundingClientRect();
  if(!mr || e.clientX<mr.left || e.clientX>mr.right || e.clientY<mr.top || e.clientY>mr.bottom){
    restaurarArrastre(d); return;
  }
  sincronizarExtremos();
  const opciones=ladosValidos([d.ladoA,d.ladoB]);
  const puedeIzq=opciones.includes("izquierda");
  const puedeDer=opciones.includes("derecha");
  let lado=null;
  if(opciones.includes("inicio")) lado="derecha";
  else if(puedeIzq&&puedeDer){
    // Sin botones ni señales: la mitad donde se suelta decide el extremo.
    const cr=document.querySelector(".cadena-fichas")?.getBoundingClientRect();
    lado=e.clientX < (cr ? cr.left+cr.width/2 : mr.left+mr.width/2) ? "izquierda" : "derecha";
  } else if(puedeIzq) lado="izquierda";
  else if(puedeDer) lado="derecha";
  if(!lado){restaurarArrastre(d);mostrarMensaje("Esa ficha no encaja en ningún extremo");return;}
  restaurarArrastre(d);
  jugarFicha(d.elemento,d.ladoA,d.ladoB,lado,d.indiceMano);
}

function actualizarGuiaTurno() {
  sincronizarExtremos();
  const fichas = Array.from(document.querySelectorAll(".mis-fichas .ficha-domino"));
  fichas.forEach(ficha => {
    const caras = ficha.querySelectorAll(".cara");
    const valores = caras.length === 2
      ? [Number(caras[0].dataset.num), Number(caras[1].dataset.num)]
      : null;
    ficha.classList.toggle("ficha-disponible", turnoActual === "tu" && valores && fichaValida(valores));
    ficha.classList.toggle("ficha-bloqueada", turnoActual === "tu" && valores && !fichaValida(valores));
  });
}

function mostrarMensaje(texto) {
  let aviso = document.querySelector(".mensaje-juego");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.className = "mensaje-juego";
    document.querySelector(".mesa-domino")?.appendChild(aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(mostrarMensaje.timer);
  mostrarMensaje.timer = setTimeout(() => aviso.classList.remove("visible"), 1500);
}

function jugarFicha(elemento, ladoA, ladoB, ladoElegido=null, indiceMano=null) {
  if(turnoActual!=="tu"||turnoBloqueado) return;
  sincronizarExtremos();

  const idx=Number.isInteger(indiceMano)&&indiceMano>=0&&manosJugadores.tu[indiceMano]&&
    manosJugadores.tu[indiceMano][0]===ladoA&&manosJugadores.tu[indiceMano][1]===ladoB
      ? indiceMano : -1;
  if(idx<0){ mostrarMensaje("Esa ficha ya no está en tu mano"); renderizarManoHumana(); return; }

  const opciones=ladosValidos(manosJugadores.tu[idx]);
  let lado=cadenaLogica.length?ladoElegido:"derecha";
  if(cadenaLogica.length&&!opciones.includes(lado)){mostrarMensaje("Esa ficha no encaja");return;}
  const orientada=orientarFicha(ladoA,ladoB,lado);
  if(!orientada){mostrarMensaje("Esa ficha no encaja");return;}

  turnoBloqueado=true; clearInterval(relojTurno);
  const antes=cadenaLogica.map(f=>[...f]), inicioAntes=indiceInicioCadena;
  if(!cadenaLogica.length) cadenaLogica.push(orientada);
  else if(lado==="izquierda"){cadenaLogica.unshift(orientada);indiceInicioCadena++;}
  else cadenaLogica.push(orientada);
  sincronizarExtremos();
  if(!validarCadenaLogica()){
    cadenaLogica=antes;indiceInicioCadena=inicioAntes;sincronizarExtremos();turnoBloqueado=false;
    mostrarMensaje("Jugada inválida");return;
  }

  manosJugadores.tu.splice(idx,1);
  document.querySelector(".centro-mesa")?.classList.add("oculto");
  renderizarManoHumana();
  renderizarCadenaLogica();
  actualizarContadores();

  if(!manosJugadores.tu.length){mostrarMensaje("Ganaste la partida");return;}
  const jugadorDeEstaJugada=turnoActual;
  setTimeout(()=>{if(turnoActual===jugadorDeEstaJugada) avanzarTurno();},450);
}


function actualizarContadores() {
  ["j2","j3","j4"].forEach((id, i) => {
    const jugador = document.querySelector([".jugador-arriba",".jugador-izquierda",".jugador-derecha"][i]);
    const small = jugador?.querySelector(".datos-jugador small");
    if (small) small.textContent = manosJugadores[id].length + " fichas";
  });
}
function renderizarManoHumana(){
 const mano=document.querySelector(".mis-fichas"); if(!mano)return;
 mano.innerHTML=manosJugadores.tu.map((f,i)=>htmlFicha(f,i)).join("");
 dibujarFichas(); actualizarGuiaTurno();
}


function iniciarTurno(jugador) {
  clearInterval(relojTurno);
  turnoToken++;
  turnoBloqueado = false;
  turnoActual = jugador;
  if (jugador === "tu") {
    turnoHumanoId++;
    ultimaJugadaHumanaId = -1;
    document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f => f.style.pointerEvents = "");
  }
  segundosTurno = 10;
  const nombres = {tu:"Tu turno", j2:"Turno J2", j3:"Turno J3", j4:"Turno J4"};
  const avatarTu = document.querySelector(".jugador-abajo .avatar-tu");
  if (avatarTu) {
    avatarTu.textContent = "TÚ";
    avatarTu.classList.remove("avatar-urgente");
  }

  document.querySelectorAll(".jugador").forEach(x => x.classList.remove("turno-activo"));
  const selector = {tu:".jugador-abajo",j2:".jugador-arriba",j3:".jugador-izquierda",j4:".jugador-derecha"}[jugador];
  document.querySelector(selector)?.classList.add("turno-activo");

  actualizarGuiaTurno();
  if (jugador === "tu") {
    const hayJugada = manosJugadores.tu.some(fichaValida);
    mostrarMensaje(hayJugada ? "Tu turno · toca una ficha iluminada" : "No tienes jugada · espera 5 segundos");
    if (!hayJugada) {
      clearInterval(relojTurno);
      setTimeout(avanzarTurno, 5000);
      return;
    }
  }

  relojTurno = setInterval(() => {
    segundosTurno--;
    if (jugador === "tu") {
      const avatar = document.querySelector(".jugador-abajo .avatar-tu");
      if (avatar) {
        avatar.textContent = segundosTurno <= 5 ? String(segundosTurno) : "TÚ";
        avatar.classList.toggle("avatar-urgente", segundosTurno <= 3);
      }
    }
    if (segundosTurno <= 0) {
      clearInterval(relojTurno);
      if (jugador === "tu") mostrarMensaje("Tiempo agotado · turno pasado");
      setTimeout(avanzarTurno, 500);
    }
  }, 1000);

  if (jugador !== "tu") setTimeout(() => jugarBot(jugador), 900 + Math.floor(Math.random() * 900));
}

function avanzarTurno() {
  clearInterval(relojTurno);
  turnoBloqueado = false;
  const i = ordenTurnos.indexOf(turnoActual);
  const siguiente = ordenTurnos[(i + 1) % ordenTurnos.length];
  iniciarTurno(siguiente);
}

function validarCadenaLogica(){
  for(let i=1;i<cadenaLogica.length;i++){
    if(cadenaLogica[i-1][1]!==cadenaLogica[i][0]) return false;
  }
  return true;
}

function confirmarCadena(contexto){
  if(validarCadenaLogica()) return true;
  console.error("Cadena de dominó inválida",contexto,cadenaLogica);
  mostrarMensaje("Error de cadena · jugada cancelada");
  return false;
}

function sincronizarExtremos(){
  if(!cadenaLogica.length){extremoIzquierdo=null;extremoDerecho=null;return;}
  extremoIzquierdo=cadenaLogica[0][0];
  extremoDerecho=cadenaLogica[cadenaLogica.length-1][1];
}
function ladosValidos(ficha){
  sincronizarExtremos();
  if(!cadenaLogica.length) return ["inicio"];
  const [a,b]=ficha,l=[];
  if(a===extremoIzquierdo||b===extremoIzquierdo) l.push("izquierda");
  if(a===extremoDerecho||b===extremoDerecho) l.push("derecha");
  return l;
}
function fichaValida(ficha){return ladosValidos(ficha).length>0;}
function orientarFicha(a,b,lado){
  sincronizarExtremos();
  if(!cadenaLogica.length) return [a,b];
  if(lado==="izquierda"){
    if(b===extremoIzquierdo) return [a,b];
    if(a===extremoIzquierdo) return [b,a];
  }else{
    if(a===extremoDerecho) return [a,b];
    if(b===extremoDerecho) return [b,a];
  }
  return null;
}

function jugarBot(jugador) {
  if (turnoActual !== jugador) return;
  const mano = manosJugadores[jugador];
  const indice = mano.findIndex(fichaValida);

  if (indice < 0) {
    clearInterval(relojTurno);
    // Pase automático del bot: mensaje privado, no visible.
    setTimeout(() => {
      if (turnoActual === jugador) avanzarTurno();
    }, 5000);
    return;
  }

  const ficha = mano[indice];
  const opciones = ladosValidos(ficha);
  let lado = opciones.includes("derecha") ? "derecha" : opciones[0];
  if (lado === "inicio") lado = "derecha";
  const orientada = orientarFicha(ficha[0], ficha[1], lado);
  if (!orientada) { setTimeout(avanzarTurno,500); return; }

  clearInterval(relojTurno);
  const cadenaAntes = cadenaLogica.map(f=>[f[0],f[1]]);
  const inicioAntes = indiceInicioCadena;
  if (!cadenaLogica.length) cadenaLogica.push(orientada);
  else if (lado === "izquierda") { cadenaLogica.unshift(orientada); indiceInicioCadena++; }
  else cadenaLogica.push(orientada);
  sincronizarExtremos();

  if (!validarCadenaLogica()) {
    cadenaLogica = cadenaAntes;
    indiceInicioCadena = inicioAntes;
    sincronizarExtremos();
    setTimeout(avanzarTurno,500);
    return;
  }

  // Primero actualizamos el estado del juego; el dibujo nunca controla el turno.
  mano.splice(indice,1);
  actualizarContadores();

  try {
    document.querySelector(".centro-mesa")?.classList.add("oculto");
    renderizarCadenaLogica();
  } catch (err) {
    console.error("Error visual del tablero:", err);
  }

  if (mano.length === 0) {
    turnoBloqueado = true;
    mostrarMensaje(jugador.toUpperCase() + " ganó la partida");
    return;
  }

  turnoBloqueado = false;
  setTimeout(() => {
    if (turnoActual === jugador) avanzarTurno();
  }, 700);
}

function renderizarCadenaLogica() {
  if(cadenaLogica.length) indiceInicioCadena=Math.max(0,Math.min(indiceInicioCadena,cadenaLogica.length-1));
  const cadena=document.querySelector(".cadena-fichas");
  if(!cadena) return;
  cadena.innerHTML="";
  cadenaLogica.forEach((f,i)=>{
    const wrap=document.createElement("div");
    wrap.innerHTML=htmlFicha(f);
    const el=wrap.firstElementChild;
    el.removeAttribute("onclick");
    el.removeAttribute("onpointerdown");
    el.classList.add("ficha-jugada");
    el.classList.toggle("doble",f[0]===f[1]);
    el.dataset.a=String(f[0]); el.dataset.b=String(f[1]);
    cadena.appendChild(el);
  });
  // Anchor the logical first-play position: closest split between left/right additions.
  // Geometry no longer decides tile values or legality.
  const ancla=cadena.children[indiceInicioCadena];
  if(ancla) ancla.dataset.inicio="1";
  dibujarFichas();
  ajustarCadena();
}

function ajustarCadena(){
 const c=document.querySelector(".cadena-fichas"); if(!c)return;
 const fs=[...c.querySelectorAll(".ficha-domino")]; if(!fs.length)return;
 const r=c.getBoundingClientRect(),W=r.width||520,H=r.height||390,L=42,C=26,G=1;
 const left=82,right=W-82,top=72,bottom=H-82;
 let x=W/2,y=H/2,dir=0;
 const put=(f,x,y,vertical)=>{
   const w=vertical?C:L,h=vertical?L:C;
   f.classList.toggle("giro-cadena",vertical); f.classList.toggle("doble-tablero",f.classList.contains("doble")&&vertical);
   [["position","absolute"],["left",x+"px"],["top",y+"px"],["width",w+"px"],["height",h+"px"],["min-width",w+"px"],["max-width",w+"px"],["min-height",h+"px"],["max-height",h+"px"],["transform","translate(-50%,-50%)"],["margin","0"]].forEach(([k,v])=>f.style.setProperty(k,v,"important"));
 };
 // Start from the true first-play tile, then lay logical right side and logical left side independently but continuously.
 const anchor=Math.max(0,Math.min(indiceInicioCadena,fs.length-1));
 put(fs[anchor],x,y,fs[anchor].classList.contains("doble"));
 const walk=(arr,startDir)=>{
   let px=x,py=y,d=startDir;
   for(const f of arr){
     const isDouble=f.classList.contains("doble");
     let pathVertical=d===1||d===3, visualVertical=isDouble?!pathVertical:pathVertical;
     const along=isDouble?C:L, step=L/2+along/2+G;
     let nx=px+(d===0?step:d===2?-step:0),ny=py+(d===1?step:d===3?-step:0);
     if(nx<left||nx>right||ny<top||ny>bottom){
       d=(d+1)%4; pathVertical=d===1||d===3; visualVertical=isDouble?!pathVertical:pathVertical;
       nx=px+(d===0?step:d===2?-step:0);ny=py+(d===1?step:d===3?-step:0);
     }
     put(f,nx,ny,visualVertical);px=nx;py=ny;
   }
 };
 walk(fs.slice(anchor+1),0);
 walk(fs.slice(0,anchor).reverse(),2);
}
document.addEventListener("DOMContentLoaded", function () {
  render();

  const createBtn = document.querySelector("#createBtn");
  if (createBtn) {
    createBtn.addEventListener("click", createTable);
  }

  const refreshBtn = document.querySelector("#refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", render);
  }
});

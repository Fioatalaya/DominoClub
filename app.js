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

  const mazo = crearMazoDomino();
  manosJugadores = {
    tu: mazo.splice(0, 7),
    j2: mazo.splice(0, 7),
    j3: mazo.splice(0, 7),
    j4: mazo.splice(0, 7)
  };

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
function seleccionarFicha(elemento, ladoA, ladoB) {
  // En móvil la jugada se hace arrastrando. El toque simple no decide el extremo.
  if (arrastreFicha?.movio) return;
  if (turnoActual !== "tu" || turnoBloqueado) return;
  if (!fichaValida([ladoA,ladoB])) mostrarMensaje("Esa ficha no coincide");
}

function iniciarArrastreFicha(e, elemento, ladoA, ladoB) {
  if (turnoActual !== "tu" || turnoBloqueado || !fichaValida([ladoA,ladoB])) return;
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
  const puedeIzq=extremoIzquierdo!==null&&(d.ladoA===extremoIzquierdo||d.ladoB===extremoIzquierdo);
  const puedeDer=extremoDerecho!==null&&(d.ladoA===extremoDerecho||d.ladoB===extremoDerecho);
  let lado=null;
  if(extremoIzquierdo===null) lado="derecha";
  else if(puedeIzq&&puedeDer){
    // Sin botones ni señales: la mitad donde se suelta decide el extremo.
    const cr=document.querySelector(".cadena-fichas")?.getBoundingClientRect();
    lado=e.clientX < (cr ? cr.left+cr.width/2 : mr.left+mr.width/2) ? "izquierda" : "derecha";
  } else if(puedeIzq) lado="izquierda";
  else if(puedeDer) lado="derecha";
  if(!lado){restaurarArrastre(d);return;}
  restaurarArrastre(d);
  jugarFicha(d.elemento,d.ladoA,d.ladoB,lado,d.indiceMano);
}

function actualizarGuiaTurno() {
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

function jugarFicha(elemento, ladoA, ladoB, ladoElegido = null, indiceMano = null) {
  const cadena = document.querySelector(".cadena-fichas");
  if (!cadena || !elemento || turnoActual !== "tu" || turnoBloqueado) return;

  // Bloquea el turno en el mismo instante del primer movimiento válido.
  // Así un toque doble o varios toques rápidos nunca pueden jugar 2+ fichas.
  turnoBloqueado = true;
  ultimaJugadaHumanaId = turnoHumanoId;
  document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f => {
    f.style.pointerEvents = "none";
    f.classList.remove("ficha-disponible");
  });
  const tokenJugada = ++turnoToken;

  sincronizarExtremos();
  const opciones=ladosValidos([ladoA,ladoB]);
  let lado=ladoElegido;
  if(!cadenaLogica.length) lado="derecha";
  else if(!opciones.includes(lado)) lado=null;
  if(!lado){
    turnoBloqueado=false;ultimaJugadaHumanaId=-1;
    document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f=>f.style.pointerEvents="");
    mostrarMensaje("Esa ficha no coincide con los extremos"); return;
  }
  const orientada=orientarFicha(ladoA,ladoB,lado);
  if(!orientada){
    turnoBloqueado=false;ultimaJugadaHumanaId=-1;
    document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f=>f.style.pointerEvents="");
    mostrarMensaje("Esa ficha no coincide con los extremos"); return;
  }
  const invertir=orientada[0]!==ladoA||orientada[1]!==ladoB;
  const cadenaAntes=cadenaLogica.map(f=>[f[0],f[1]]); const inicioAntes=indiceInicioCadena;
  if(!cadenaLogica.length) cadenaLogica.push(orientada);
  else if(lado==="izquierda"){ cadenaLogica.unshift(orientada); indiceInicioCadena++; }
  else cadenaLogica.push(orientada);
  sincronizarExtremos();
  if(!confirmarCadena("jugador")){
    cadenaLogica=cadenaAntes;indiceInicioCadena=inicioAntes;sincronizarExtremos();
    turnoBloqueado=false;ultimaJugadaHumanaId=-1;
    document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f=>f.style.pointerEvents="");
    return;
  }

  document.querySelector(".centro-mesa")?.classList.add("oculto");
  renderizarCadenaLogica();

  // Quitar exactamente la ficha jugada de la mano lógica.
  const indiceJugado = Number.isInteger(indiceMano) && indiceMano >= 0 &&
    manosJugadores.tu[indiceMano] &&
    manosJugadores.tu[indiceMano][0] === ladoA &&
    manosJugadores.tu[indiceMano][1] === ladoB
      ? indiceMano
      : manosJugadores.tu.findIndex(f => f[0] === ladoA && f[1] === ladoB);
  if (indiceJugado < 0) {
    console.error("No se encontró la ficha exacta jugada", ladoA, ladoB, indiceMano);
    mostrarMensaje("Error al identificar la ficha");
    return;
  }
  manosJugadores.tu.splice(indiceJugado, 1);
  dibujarFichas();

  // Si esta era la última ficha, la partida termina aquí; no se entrega otro turno.
  if (manosJugadores.tu.length === 0) {
    clearInterval(relojTurno);
    turnoBloqueado = true;
    mostrarMensaje("Ganaste la partida");
    return;
  }

  // Detener el reloj inmediatamente al hacer una jugada válida.
  // Evita que el temporizador venza durante la animación y salte dos turnos.
  clearInterval(relojTurno);
  setTimeout(() => {
    if (tokenJugada === turnoToken) avanzarTurno();
  }, 450);
}




function actualizarContadores() {
  ["j2","j3","j4"].forEach((id, i) => {
    const jugador = document.querySelector([".jugador-arriba",".jugador-izquierda",".jugador-derecha"][i]);
    const small = jugador?.querySelector(".datos-jugador small");
    if (small) small.textContent = manosJugadores[id].length + " fichas";
  });
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
    mostrarMensaje(hayJugada ? "Tu turno · toca una ficha iluminada" : "No tienes jugada · espera 3 segundos");
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
      mostrarMensaje(jugador === "tu" ? "Tiempo agotado · turno pasado" : "Tiempo agotado");
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
    mostrarMensaje(jugador.toUpperCase() + " no tiene jugada · pasa en 5 segundos");
    setTimeout(() => {
      if (turnoActual === jugador) {
        mostrarMensaje(jugador.toUpperCase() + " pasa");
        setTimeout(avanzarTurno, 450);
      }
    }, 5000);
    return;
  }

  const ficha = mano[indice];
  clearInterval(relojTurno);
  let [a,b] = ficha;
  const opciones=ladosValidos(ficha);
  let lado=opciones.includes("derecha")?"derecha":opciones[0];
  if(lado==="inicio") lado="derecha";
  const orientada=orientarFicha(a,b,lado);
  if(!orientada){mostrarMensaje(jugador.toUpperCase()+" pasa");setTimeout(avanzarTurno,700);return;}
  const invertir=orientada[0]!==a||orientada[1]!==b;
  const cadenaAntes=cadenaLogica.map(f=>[f[0],f[1]]); const inicioAntes=indiceInicioCadena;
  if(!cadenaLogica.length) cadenaLogica.push(orientada);
  else if(lado==="izquierda"){ cadenaLogica.unshift(orientada); indiceInicioCadena++; }
  else cadenaLogica.push(orientada);
  sincronizarExtremos();
  if(!confirmarCadena(jugador)){
    cadenaLogica=cadenaAntes;indiceInicioCadena=inicioAntes;sincronizarExtremos();
    mostrarMensaje(jugador.toUpperCase()+" no puede colocar esa ficha");
    setTimeout(avanzarTurno,700);return;
  }

  document.querySelector(".centro-mesa")?.classList.add("oculto");
  renderizarCadenaLogica();

  mano.splice(indice,1);
  dibujarFichas();
  ajustarCadena();
  actualizarContadores();
  document.querySelector(".centro-mesa")?.classList.add("oculto");
  const fichaNueva=document.querySelector(".cadena-fichas .ficha-domino:last-child");
  if(fichaNueva){
    fichaNueva.classList.add("entrada-ficha");
    setTimeout(() => fichaNueva.classList.remove("entrada-ficha"), 280);
  }

  if (mano.length === 0) {
    clearInterval(relojTurno);
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

function ajustarCadena() {
  const cadena=document.querySelector(".cadena-fichas");
  if(!cadena) return;
  const todas=[...cadena.querySelectorAll(".ficha-domino")];
  if(!todas.length) return;
  cadena.classList.add("cadena-serpiente");

  const inicio=todas.find(f=>f.dataset.inicio==="1")||todas[0];
  const k=todas.indexOf(inicio);
  const izquierda=todas.slice(0,k).reverse();
  const derecha=todas.slice(k+1);
  const r=cadena.getBoundingClientRect(),W=r.width||520,H=r.height||390;
  const cx=W/2,cy=H/2,L=42,C=26,G=1;
  const minX=72,maxX=W-72,minY=62,maxY=H-70;

  function esDoble(f){return f.classList.contains("doble");}
  function poner(f,x,y,vertical){
    const w=vertical?C:L,h=vertical?L:C;
    f.classList.toggle("giro-cadena",vertical);
    f.classList.toggle("doble-tablero",esDoble(f)&&vertical);
    const props={position:"absolute",left:x+"px",top:y+"px",width:w+"px",height:h+"px",
      "min-width":w+"px","max-width":w+"px","min-height":h+"px","max-height":h+"px",
      transform:"translate(-50%,-50%)",margin:"0"};
    Object.entries(props).forEach(([q,z])=>f.style.setProperty(q,z,"important"));
  }

  // Cada brazo sigue una sola ruta continua. Nunca crea filas independientes.
  function brazo(arr,dirInicial,verticalInicial){
    let x=cx,y=cy,dir=dirInicial; // 0 derecha, 1 abajo, 2 izquierda, 3 arriba
    let prevVertical=verticalInicial;
    for(const f of arr){
      let vertical=(dir===1||dir===3);
      // Los dobles se dibujan perpendiculares al sentido de la cadena.
      if(esDoble(f)) vertical=!vertical;

      const prevAlong=prevVertical?C:L;
      const curAlong=vertical?C:L;
      let paso=(prevAlong+curAlong)/2+G;
      let nx=x+(dir===0?paso:dir===2?-paso:0);
      let ny=y+(dir===1?paso:dir===3?-paso:0);

      // Giro real al llegar al borde seguro.
      const hw=(vertical?C:L)/2,hh=(vertical?L:C)/2;
      if(nx-hw<minX||nx+hw>maxX||ny-hh<minY||ny+hh>maxY){
        dir=(dir+1)%4;
        vertical=(dir===1||dir===3);
        if(esDoble(f)) vertical=!vertical;
        const cur2=vertical?C:L;
        paso=(prevAlong+cur2)/2+G;
        nx=x+(dir===0?paso:dir===2?-paso:0);
        ny=y+(dir===1?paso:dir===3?-paso:0);
      }
      x=nx;y=ny;poner(f,x,y,vertical);prevVertical=vertical;
    }
  }

  poner(inicio,cx,cy,esDoble(inicio));
  // Los dos extremos salen en direcciones opuestas desde la ficha inicial.
  brazo(derecha,0,esDoble(inicio));
  brazo(izquierda,2,esDoble(inicio));
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

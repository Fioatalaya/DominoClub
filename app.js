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

function htmlFicha(ficha) {
  const [a, b] = ficha;
  return `<div class="ficha-domino" onclick="seleccionarFicha(this, ${a}, ${b})">
    <span class="cara" data-num="${a}"></span><span class="cara" data-num="${b}"></span>
  </div>`;
}

function openGame(index) {
  extremoIzquierdo = null;
  extremoDerecho = null;
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
      <div class="mis-fichas">${manosJugadores.tu.map(htmlFicha).join("")}</div>
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
  });
}
function seleccionarFicha(elemento, ladoA, ladoB) {
  if (turnoActual !== "tu" || turnoBloqueado || ultimaJugadaHumanaId === turnoHumanoId) {
    mostrarMensaje("Espera tu turno");
    return;
  }

  if (!fichaValida([ladoA, ladoB])) {
    mostrarMensaje("No coincide. Juega una ficha iluminada.");
    return;
  }

  const puedeIzq = extremoIzquierdo !== null && (ladoA === extremoIzquierdo || ladoB === extremoIzquierdo);
  const puedeDer = extremoDerecho !== null && (ladoA === extremoDerecho || ladoB === extremoDerecho);

  // Si la ficha sirve en ambos extremos, el jugador decide dónde ponerla.
  if (puedeIzq && puedeDer) {
    fichaPendiente = {elemento,ladoA,ladoB};
    document.querySelectorAll(".ficha-domino").forEach(f=>f.classList.remove("seleccionada"));
    elemento.classList.add("seleccionada");
    mostrarSelectorExtremo();
    return;
  }
  jugarFicha(elemento, ladoA, ladoB, puedeIzq && !puedeDer ? "izquierda" : "derecha");
}

function mostrarSelectorExtremo(){
  let c=document.querySelector(".selector-extremo");
  if(!c){
    c=document.createElement("div"); c.className="selector-extremo";
    c.innerHTML='<button type="button" onclick="elegirExtremo(\'izquierda\')">← IZQUIERDA</button><button type="button" onclick="elegirExtremo(\'derecha\')">DERECHA →</button>';
    document.querySelector(".mesa-domino")?.appendChild(c);
  }
  c.classList.add("visible");
  mostrarMensaje("Esta ficha sirve en ambos lados · elige dónde jugar");
}
function elegirExtremo(lado){
  const p=fichaPendiente; fichaPendiente=null;
  document.querySelector(".selector-extremo")?.classList.remove("visible");
  if(p) jugarFicha(p.elemento,p.ladoA,p.ladoB,lado);
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

function jugarFicha(elemento, ladoA, ladoB, ladoElegido = null) {
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

  let lado = "derecha";
  let invertir = false;

  const coincideIzq = extremoIzquierdo !== null && (ladoA === extremoIzquierdo || ladoB === extremoIzquierdo);
  const coincideDer = extremoDerecho !== null && (ladoA === extremoDerecho || ladoB === extremoDerecho);

  if (extremoIzquierdo === null) {
    extremoIzquierdo = ladoA;
    extremoDerecho = ladoB;
  } else if (ladoElegido === "izquierda" && coincideIzq) {
    lado = "izquierda";
    if (ladoB === extremoIzquierdo) extremoIzquierdo = ladoA;
    else { extremoIzquierdo = ladoB; invertir = true; }
  } else if (ladoA === extremoDerecho) {
    extremoDerecho = ladoB;
    lado = "derecha";
  } else if (ladoB === extremoDerecho) {
    extremoDerecho = ladoA;
    lado = "derecha";
    invertir = true;
  } else if (ladoB === extremoIzquierdo) {
    extremoIzquierdo = ladoA;
    lado = "izquierda";
  } else if (ladoA === extremoIzquierdo) {
    extremoIzquierdo = ladoB;
    lado = "izquierda";
    invertir = true;
  } else {
    turnoBloqueado = false;
    ultimaJugadaHumanaId = -1;
    document.querySelectorAll(".mis-fichas .ficha-domino").forEach(f => f.style.pointerEvents = "");
    mostrarMensaje("Esa ficha no coincide con los extremos");
    return;
  }

  elemento.classList.remove("seleccionada");
  elemento.style.transform = "";
  elemento.style.borderColor = "";
  elemento.style.boxShadow = "";
  elemento.style.zIndex = "";
  elemento.removeAttribute("onclick");
  elemento.classList.add("ficha-jugada");
  if (cadena.children.length === 0) elemento.dataset.inicio = "1";

  const intro = document.querySelector(".centro-mesa");
  if (intro) intro.classList.add("oculto");
  elemento.classList.toggle("doble", ladoA === ladoB);

  if (invertir) {
    const caras = Array.from(elemento.querySelectorAll(".cara"));
    if (caras.length === 2) elemento.insertBefore(caras[1], caras[0]);
  }

  if (lado === "izquierda" && cadena.firstChild) {
    cadena.insertBefore(elemento, cadena.firstChild);
  } else {
    cadena.appendChild(elemento);
  }

  // Mantiene la cadena proporcionada a medida que se agregan fichas.
  ajustarCadena();

  // Animación corta de entrada sin alterar el tamaño de la mano.
  elemento.classList.add("entrada-ficha");
  setTimeout(() => elemento.classList.remove("entrada-ficha"), 280);

  manosJugadores.tu = manosJugadores.tu.filter(f => !(f[0] === ladoA && f[1] === ladoB));

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
      setTimeout(avanzarTurno, 3000);
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
  if (turnoBloqueado && turnoActual !== "tu") return;
  clearInterval(relojTurno);
  turnoBloqueado = false;
  const i = ordenTurnos.indexOf(turnoActual);
  iniciarTurno(ordenTurnos[(i + 1) % ordenTurnos.length]);
}

function fichaValida(ficha) {
  if (extremoIzquierdo === null) return true;
  return ficha[0] === extremoIzquierdo || ficha[1] === extremoIzquierdo ||
         ficha[0] === extremoDerecho || ficha[1] === extremoDerecho;
}

function jugarBot(jugador) {
  if (turnoActual !== jugador) return;
  const mano = manosJugadores[jugador];
  const indice = mano.findIndex(fichaValida);
  if (indice < 0) {
    mostrarMensaje(jugador.toUpperCase() + " pasa");
    setTimeout(avanzarTurno, 700);
    return;
  }

  const ficha = mano[indice];
  clearInterval(relojTurno);
  let [a,b] = ficha;
  let lado = "derecha", invertir = false;

  if (extremoIzquierdo === null) {
    extremoIzquierdo = a; extremoDerecho = b;
  } else if (a === extremoDerecho) {
    extremoDerecho = b;
  } else if (b === extremoDerecho) {
    extremoDerecho = a; invertir = true;
  } else if (b === extremoIzquierdo) {
    extremoIzquierdo = a; lado = "izquierda";
  } else if (a === extremoIzquierdo) {
    extremoIzquierdo = b; lado = "izquierda"; invertir = true;
  }

  const cadena = document.querySelector(".cadena-fichas");
  if (!cadena) return;
  const cont = document.createElement("div");
  cont.innerHTML = htmlFicha(ficha);
  const elemento = cont.firstElementChild;
  elemento.removeAttribute("onclick");
  elemento.classList.add("ficha-jugada");
  if (cadena.children.length === 0) elemento.dataset.inicio = "1";
  elemento.classList.toggle("doble", a === b);
  if (invertir) {
    const caras = Array.from(elemento.querySelectorAll(".cara"));
    elemento.insertBefore(caras[1], caras[0]);
  }
  if (lado === "izquierda" && cadena.firstChild) cadena.insertBefore(elemento, cadena.firstChild);
  else cadena.appendChild(elemento);

  mano.splice(indice,1);
  dibujarFichas();
  ajustarCadena();
  actualizarContadores();
  document.querySelector(".centro-mesa")?.classList.add("oculto");
  elemento.classList.add("entrada-ficha");
  setTimeout(() => elemento.classList.remove("entrada-ficha"), 280);

  if (mano.length === 0) {
    clearInterval(relojTurno);
    mostrarMensaje(jugador.toUpperCase() + " ganó la partida");
    return;
  }
  setTimeout(avanzarTurno, 700);
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

  const L=58,C=34;
  const anchoCadena=Math.min(window.innerWidth*0.92,620);
  const cx=anchoCadena/2,cy=220;
  // Limites calculados desde el ancho REAL disponible, no desde 320px fijos.
  // Dejamos una franja libre a ambos lados para que la cadena no pase debajo de J3/J4.
  const lim={l:68,r:anchoCadena-68,t:55,b:385};

  function dims(v){return v?{w:C,h:L}:{w:L,h:C};}
  function pintar(f,x,y,v){
    const d=dims(v);
    f.classList.toggle("giro-cadena",v);
    f.classList.remove("doble-tablero");
    const p={position:"absolute",left:x+"px",top:y+"px",width:d.w+"px",height:d.h+"px",
      "min-width":d.w+"px","max-width":d.w+"px","min-height":d.h+"px","max-height":d.h+"px",
      transform:"translate(-50%,-50%)",margin:"0",flex:"0 0 auto"};
    Object.entries(p).forEach(([q,val])=>f.style.setProperty(q,val,"important"));
  }
  function doble(f){return f.classList.contains("doble");}
  function verticalPara(f,dir){
    const ejeV=dir==="U"||dir==="D";
    return doble(f)?!ejeV:ejeV;
  }
  function half(v,dir){
    const d=dims(v);
    return (dir==="R"||dir==="L"?d.w:d.h)/2;
  }
  function mover(x,y,dir,n){
    return {x:x+(dir==="R"?n:dir==="L"?-n:0),y:y+(dir==="D"?n:dir==="U"?-n:0)};
  }
  function gira(dir,lado){
    if(lado==="derecha") return {R:"D",D:"L",L:"D",U:"R"}[dir];
    return {L:"U",U:"R",R:"U",D:"L"}[dir];
  }

  // Salida central; el doble se cruza sin alterar el eje de crecimiento.
  const inicioV=doble(inicio);
  pintar(inicio,cx,cy,inicioV);

  function construir(arr,lado){
    let x=cx,y=cy,dir=lado==="derecha"?"R":"L",prevV=inicioV;
    arr.forEach(f=>{
      let v=verticalPara(f,dir);
      let paso=half(prevV,dir)+half(v,dir);
      let p=mover(x,y,dir,paso);
      let d=dims(v);
      let fuera=p.x-d.w/2<lim.l||p.x+d.w/2>lim.r||p.y-d.h/2<lim.t||p.y+d.h/2>lim.b;

      if(fuera){
        dir=gira(dir,lado);
        v=verticalPara(f,dir);
        paso=half(prevV,dir)+half(v,dir);
        p=mover(x,y,dir,paso);
      }

      x=p.x;y=p.y;prevV=v;
      pintar(f,x,y,v);
    });
  }
  construir(derecha,"derecha");
  construir(izquierda,"izquierda");
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

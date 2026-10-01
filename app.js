let extremoIzquierdo = null;
let extremoDerecho = null;
let manosJugadores = {};
let turnoActual = "tu";
let segundosTurno = 15;
let relojTurno = null;
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
        <div class="jugador jugador-arriba"><span class="avatar-juego">J2</span><span class="datos-jugador"><b>Jugador 2</b><small>7 fichas</small></span></div>
        <div class="jugador jugador-izquierda"><span class="avatar-juego">J3</span><span class="datos-jugador"><b>Jugador 3</b><small>7 fichas</small></span></div>
        <div class="centro-mesa">DOMINO<br><span>Partida iniciada</span></div>
        <div class="reloj-turno"><span class="reloj-icono">⏱</span><b id="tiempoTurno">15</b><small id="nombreTurno">Tu turno</small></div>
        <div class="tablero-fichas"><div class="cadena-fichas"></div></div>
        <div class="jugador jugador-derecha"><span class="avatar-juego">J4</span><span class="datos-jugador"><b>Jugador 4</b><small>7 fichas</small></span></div>
        <div class="jugador jugador-abajo"><span class="avatar-juego avatar-tu">TÚ</span><span class="datos-jugador"><b>Tú</b><small>10,000 monedas</small></span></div>
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
  if (turnoActual !== "tu") {
    mostrarMensaje("Espera tu turno");
    return;
  }
  const yaSeleccionada = elemento.classList.contains("seleccionada");

  document.querySelectorAll(".mis-fichas .ficha-domino").forEach(ficha => {
    ficha.classList.remove("seleccionada");
    ficha.style.transform = "";
    ficha.style.borderColor = "";
    ficha.style.boxShadow = "";
    ficha.style.zIndex = "";
  });

  if (yaSeleccionada) {
    jugarFicha(elemento, ladoA, ladoB);
    return;
  }

  elemento.classList.add("seleccionada");
  elemento.style.transform = "translateY(-14px) scale(1.08)";
  elemento.style.borderColor = "#f5c542";
  elemento.style.boxShadow = "0 12px 22px rgba(0,0,0,.55)";
  elemento.style.zIndex = "5";
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

function jugarFicha(elemento, ladoA, ladoB) {
  const cadena = document.querySelector(".cadena-fichas");
  if (!cadena || !elemento) return;

  let lado = "derecha";
  let invertir = false;

  if (extremoIzquierdo === null) {
    extremoIzquierdo = ladoA;
    extremoDerecho = ladoB;
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
  setTimeout(() => avanzarTurno(), 450);
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
  turnoActual = jugador;
  segundosTurno = 15;
  const nombres = {tu:"Tu turno", j2:"Turno J2", j3:"Turno J3", j4:"Turno J4"};
  const tiempo = document.querySelector("#tiempoTurno");
  const nombre = document.querySelector("#nombreTurno");
  if (tiempo) tiempo.textContent = segundosTurno;
  if (nombre) nombre.textContent = nombres[jugador];

  // En este prototipo cada jugador solo ve su propio reloj.
  const reloj = document.querySelector(".reloj-turno");
  if (reloj) reloj.classList.toggle("reloj-oculto", jugador !== "tu");

  document.querySelectorAll(".jugador").forEach(x => x.classList.remove("turno-activo"));
  const selector = {tu:".jugador-abajo",j2:".jugador-arriba",j3:".jugador-izquierda",j4:".jugador-derecha"}[jugador];
  document.querySelector(selector)?.classList.add("turno-activo");

  relojTurno = setInterval(() => {
    segundosTurno--;
    if (tiempo) tiempo.textContent = segundosTurno;
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

  const cont = document.createElement("div");
  cont.innerHTML = htmlFicha(ficha);
  const elemento = cont.firstElementChild;
  elemento.removeAttribute("onclick");
  elemento.classList.add("ficha-jugada");
  elemento.classList.toggle("doble", a === b);
  if (invertir) {
    const caras = Array.from(elemento.querySelectorAll(".cara"));
    elemento.insertBefore(caras[1], caras[0]);
  }
  const cadena = document.querySelector(".cadena-fichas");
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
  const cadena = document.querySelector(".cadena-fichas");
  if (!cadena) return;

  const total = cadena.querySelectorAll(".ficha-domino").length;
  cadena.classList.remove("cadena-media", "cadena-larga");

  if (total >= 4) cadena.classList.add("cadena-media");
  if (total >= 6) cadena.classList.add("cadena-larga");
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

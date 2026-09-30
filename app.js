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

function openGame(index) {
  const table = tables[index];
  if (!table) return;

  document.body.innerHTML = `
    <div class="partida">

      <div class="partida-superior">
        <button type="button" onclick="location.reload()">← Salir</button>

        <div>
          <strong>${table.name}</strong>
          <small>Mesa de domino</small>
        </div>

        <div>🪙 10,000</div>
      </div>

      <div class="mesa-domino">
        <div class="jugador jugador-arriba">👤 Jugador 2</div>
        <div class="jugador jugador-izquierda">👤 Jugador 3</div>

        <div class="centro-mesa">
          DOMINO<br>
          <span>Partida iniciada</span>
        </div>

        <div class="jugador jugador-derecha">👤 Jugador 4</div>
        <div class="jugador jugador-abajo">👤 Tu</div>
      </div>

      <div class="mis-fichas">
  <div class="ficha-domino" onclick="seleccionarFicha(this, 2, 5)">
    <span class="cara" data-num="2"></span><span class="cara" data-num="5"></span>
  </div>

  <div class="ficha-domino" onclick="seleccionarFicha(this, 6, 1)">
    <span class="cara" data-num="6"></span><span class="cara" data-num="1"></span>
  </div>

  <div class="ficha-domino" onclick="seleccionarFicha(this, 4, 4)">
    <span class="cara" data-num="4"></span><span class="cara" data-num="4"></span>
  </div>

  <div class="ficha-domino" onclick="seleccionarFicha(this, 5, 3)">
    <span class="cara" data-num="5"></span><span class="cara" data-num="3"></span>
  </div>

  <div class="ficha-domino" onclick="seleccionarFicha(this, 0, 6)">
    <span class="cara" data-num="0"></span><span class="cara" data-num="6"></span>
  </div>

  <div class="ficha-domino" onclick="seleccionarFicha(this, 3, 2)">
    <span class="cara" data-num="3"></span><span class="cara" data-num="2"></span>
  </div>

  <div class="ficha-domino" onclick="seleccionarFicha(this, 4, 1)">
    <span class="cara" data-num="4"></span><span class="cara" data-num="1"></span>
  </div>
</div>
  `;
  
  dibujarFichas();
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
  const yaSeleccionada = elemento.classList.contains("seleccionada");

  document.querySelectorAll(".mis-fichas .ficha-domino").forEach(ficha => {
    ficha.classList.remove("seleccionada");
    ficha.style.transform = "";
    ficha.style.borderColor = "";
    ficha.style.boxShadow = "";
    ficha.style.zIndex = "";
  });

  if (yaSeleccionada) {
    jugarFicha(elemento);
    return;
  }

  elemento.classList.add("seleccionada");
  elemento.style.transform = "translateY(-14px) scale(1.08)";
  elemento.style.borderColor = "#f5c542";
  elemento.style.boxShadow = "0 12px 22px rgba(0,0,0,.55)";
  elemento.style.zIndex = "5";
}

function jugarFicha(elemento) {
  const centro = document.querySelector(".centro-mesa");
  if (!centro || !elemento) return;

  elemento.classList.remove("seleccionada");
  elemento.style.transform = "";
  elemento.style.borderColor = "";
  elemento.style.boxShadow = "";
  elemento.style.zIndex = "";

  elemento.removeAttribute("onclick");
  elemento.classList.add("ficha-jugada");

  centro.innerHTML = "";
  centro.appendChild(elemento);

  const texto = document.createElement("span");
  texto.textContent = "Ficha jugada";
  centro.appendChild(texto);
}
function jugarFicha(elemento) {
  const centro = document.querySelector(".centro-mesa");
  if (!centro || !elemento) return;

  elemento.classList.remove("seleccionada");
  elemento.style.transform = "";
  elemento.style.borderColor = "";
  elemento.style.boxShadow = "";
  elemento.style.zIndex = "";

  elemento.removeAttribute("onclick");
  elemento.classList.add("ficha-jugada");

  centro.innerHTML = "";
  centro.appendChild(elemento);

  const texto = document.createElement("span");
  texto.textContent = "Ficha jugada";
  centro.appendChild(texto);
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

const tables = [
  { name: "Mesa Principiantes", entry: 100 },
  { name: "Mesa Clásica", entry: 500 },
  { name: "Mesa VIP", entry: 1000 }
];

function render() {
  const contenedor = document.querySelector("#tables");

  if (!contenedor) return;

  contenedor.innerHTML = tables.map((t, i) => `
    <div class="table">
      <div>
        <b>${t.name}</b><br>
        <small>Entrada: ${t.entry} 🪙</small>
      </div>

      <button type="button" onclick="joinTable(${i})">
        Entrar
      </button>
    </div>
  `).join("");
}

function joinTable(i) {
  const mesa = tables[i];

  if (!mesa) return;

  const avisoAnterior = document.querySelector(".aviso-mesa");
  if (avisoAnterior) avisoAnterior.remove();

  const aviso = document.createElement("div");
  aviso.className = "aviso-mesa";

  aviso.innerHTML = `
    <div class="aviso-contenido">
      <div class="aviso-icono">🎲</div>
      <h2>Entrando a la mesa</h2>
      <p>${mesa.name}</p>
      <button type="button" onclick="abrirPartida(${i})">
        Continuar
      </button>
    </div>
  `;

  document.body.appendChild(aviso);
}

function abrirPartida(i) {
  const mesa = tables[i];

  if (!mesa) return;

  document.body.innerHTML = `
    <div class="partida">

      <div class="partida-superior">
        <button type="button" onclick="location.reload()">← Salir</button>

        <div>
          <strong>${mesa.name}</strong>
          <small>Mesa de dominó</small>
        </div>

        <div>🪙 10,000</div>
      </div>

      <div class="mesa-domino">

        <div class="jugador jugador-arriba">
          👤 Jugador 2
        </div>

        <div class="jugador jugador-izquierda">
          👤 Jugador 3
        </div>

        <div class="centro-mesa">
          DOMINÓ
          <br>
          <span>Partida iniciada</span>
        </div>

        <div class="jugador jugador-derecha">
          👤 Jugador 4
        </div>

        <div class="jugador jugador-abajo">
          👤 Tú
        </div>

      </div>

      <div class="mis-fichas">
        <div class="ficha-domino"><span>2</span><span>5</span></div>
        <div class="ficha-domino"><span>6</span><span>1</span></div>
        <div class="ficha-domino"><span>4</span><span>4</span></div>
        <div class="ficha-domino"><span>5</span><span>3</span></div>
        <div class="ficha-domino"><span>0</span><span>6</span></div>
        <div class="ficha-domino"><span>3</span><span>2</span></div>
        <div class="ficha-domino"><span>4</span><span>1</span></div>
      </div>

    </div>
  `;
}

function createTable() {
  const stake = document.querySelector("#stake");
  const entrada = stake ? Number(stake.value) : 100;

  tables.push({
    name: "Mi mesa",
    entry: entrada
  });

  render();
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

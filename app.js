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

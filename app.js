const tables = [
  { name: 'Mesa Principiantes', entry: 100 },
  { name: 'Mesa Clásica', entry: 500 },
  { name: 'Mesa VIP', entry: 1000 }
];

function render() {
  document.querySelector('#tables').innerHTML = tables.map((t, i) => `
    <div class="table">
      <div>
        <b>${t.name}</b><br>
        <small>Entrada: ${t.entry} 🪙</small>
      </div>
      <button onclick="joinTable(${i})">Entrar</button>
    </div>
  `).join('');
}

function joinTable(i) {
  const aviso = document.createElement('div');
aviso.className = 'aviso-mesa';
aviso.innerHTML = `
  <div class="aviso-contenido">
    <div class="aviso-icono">🎲</div>
    <h2>Entrando a la mesa</h2>
    <p>${tables[i].name}</p>
    <button onclick="abrirPartida(${i})">Continuar</button>
  </div>
`;
document.body.appendChild(aviso);
}

function createTable() {
  const n = prompt('Nombre de la mesa:');
  if (n) {
    tables.push({ name: n, entry: 100 });
    render();
  }
}
function abrirPartida(i) {
  document.querySelector('.aviso-mesa')?.remove();

  document.body.innerHTML = `
    <div class="partida">
      <div class="partida-superior">
        <button onclick="location.reload()">← Salir</button>
        <div>
          <strong>${tables[i].name}</strong>
          <small>Mesa de dominó</small>
        </div>
        <div>🪙 10,000</div>
      </div>

      <div class="mesa-domino">
        <div class="jugador jugador-arriba">👤 Jugador 2</div>
        <div class="jugador jugador-izquierda">👤 Jugador 3</div>
        <div class="centro-mesa">DOMINÓ<br><span>Esperando partida...</span></div>
        <div class="jugador jugador-derecha">👤 Jugador 4</div>
        <div class="jugador jugador-abajo">👤 Tú</div>
      </div>

      <div class="mis-fichas">
        🁣 🁬 🁵 🂋 🂒 🂚 🂝
      </div>
    </div>
  `;
  iniciarPartida();
}
function iniciarPartida() {
  const fichas = document.querySelector('.mis-fichas');

  if (fichas) {
    fichas.innerHTML = `
      <div class="ficha">⚀</div>
      <div class="ficha">⚁</div>
      <div class="ficha">⚂</div>
      <div class="ficha">⚃</div>
      <div class="ficha">⚄</div>
      <div class="ficha">⚅</div>
      <div class="ficha">⚀</div>
    `;
  }
}
render();

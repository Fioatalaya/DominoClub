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
    <button onclick="this.closest('.aviso-mesa').remove()">Continuar</button>
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

render();

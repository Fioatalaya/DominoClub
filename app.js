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
  alert(`Entrando a ${tables[i].name}. Esta versión usa monedas virtuales.`);
}

function createTable() {
  const n = prompt('Nombre de la mesa:');
  if (n) {
    tables.push({ name: n, entry: 100 });
    render();
  }
}

render();

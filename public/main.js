const api = {
  list: () => fetch('/api/todos').then(r => r.json()),
  create: text => fetch('/api/todos', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ text }) }).then(r => r.json()),
  update: (id, body) => fetch(`/api/todos/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  remove: id => fetch(`/api/todos/${id}`, { method: 'DELETE' }).then(r => r.json()),
};

const $ = sel => document.querySelector(sel);
const $all = sel => document.querySelectorAll(sel);

async function load() {
  const todos = await api.list();
  const list = $('#todos');
  list.innerHTML = '';
  todos.forEach(t => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    li.className = t.done ? 'done' : '';
    li.innerHTML = `
      <label>
        <input type="checkbox" ${t.done ? 'checked' : ''} class="toggle" />
        <span class="text"></span>
      </label>
      <div class="actions">
        <button class="edit">Edit</button>
        <button class="delete">Hapus</button>
      </div>
    `;
    li.querySelector('.text').textContent = t.text;
    list.appendChild(li);
  });
}

async function add(text) {
  if (!text.trim()) return;
  await api.create(text);
  $('#todo-input').value = '';
  await load();
}

document.addEventListener('click', async (e) => {
  if (e.target.matches('.delete')) {
    const id = e.target.closest('li').dataset.id;
    await api.remove(id);
    await load();
  }
  if (e.target.matches('.edit')) {
    const li = e.target.closest('li');
    const id = li.dataset.id;
    const current = li.querySelector('.text').textContent;
    const val = prompt('Edit tugas:', current);
    if (val !== null) {
      await api.update(id, { text: val });
      await load();
    }
  }
});

document.addEventListener('change', async (e) => {
  if (e.target.matches('.toggle')) {
    const li = e.target.closest('li');
    const id = li.dataset.id;
    await api.update(id, { done: e.target.checked });
    await load();
  }
});

document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = document.getElementById('todo-input').value;
  await add(v);
});

window.addEventListener('load', load);

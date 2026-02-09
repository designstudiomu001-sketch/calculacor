const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let todos = [];
let nextId = 1;

app.get('/api/todos', (req, res) => {
	res.json(todos);
});

app.post('/api/todos', (req, res) => {
	const { text } = req.body;
	if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });
	const todo = { id: nextId++, text: text.trim(), done: false };
	todos.push(todo);
	res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
	const id = Number(req.params.id);
	const { text, done } = req.body;
	const t = todos.find(item => item.id === id);
	if (!t) return res.status(404).json({ error: 'Not found' });
	if (typeof text === 'string') t.text = text.trim();
	if (typeof done === 'boolean') t.done = done;
	res.json(t);
});

app.delete('/api/todos/:id', (req, res) => {
	const id = Number(req.params.id);
	const idx = todos.findIndex(item => item.id === id);
	if (idx === -1) return res.status(404).json({ error: 'Not found' });
	const [removed] = todos.splice(idx, 1);
	res.json(removed);
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));

# Todo List Sederhana

Ini aplikasi todo list full-stack ringan.

Cara menjalankan:

1. Pasang dependensi:

```bash
npm install
```

2. Jalankan dalam mode pengembangan (dengan `nodemon`):

```bash
npm run dev
```

3. Buka browser: http://localhost:3000

API endpoints:
- `GET /api/todos` — daftar todos
- `POST /api/todos` — buat todo { text }
- `PUT /api/todos/:id` — update todo { text?, done? }
- `DELETE /api/todos/:id` — hapus todo

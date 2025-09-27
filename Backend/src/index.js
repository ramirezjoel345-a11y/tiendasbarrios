const express = require('express');
const app = express();

app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', require('./routes/auth.routes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));

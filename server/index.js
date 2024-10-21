const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Statik dosya sunumu için
app.use(express.static(path.join(__dirname, '../dist')));

// API endpointleri
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// Vite tarafından oluşturulan React uygulamasını sunmak için
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

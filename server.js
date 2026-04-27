const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Posluzi sve staticke datoteke iz mape "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta za pocetnu stranicu
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server pokrenut na: http://localhost:${PORT}`);
});

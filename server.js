const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('banco_de_dados.db', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    db.run(`
      CREATE TABLE IF NOT EXISTS mangas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        autor TEXT,
        preco REAL,
        genero TEXT
      )
    `);
  }
});

app.post('/api/mangas', (req, res) => {
  const { nome, autor, preco, genero } = req.body;
  db.run(
    'INSERT INTO mangas (nome, autor, preco, genero) VALUES (?, ?, ?, ?)',
    [nome, autor, preco, genero],
    (err) => {
      if (err) {
        console.error('Erro ao inserir os dados no banco de dados:', err.message);
        res.sendStatus(500);
      } else {
        res.render('cadastrado');
      }
    }
  );
});

app.get('/consulta', (req, res) => {
  const searchTerm = req.query.search;
  if (searchTerm) {
    const query = `SELECT * FROM mangas WHERE nome LIKE '%${searchTerm}%'`;
    db.all(query, (err, rows) => {
      if (err) {
        console.error('Erro ao ler os dados do banco de dados:', err.message);
        res.sendStatus(500);
      } else {
        res.render('consulta', { mangas: rows });
      }
    });
  } else {
    db.all('SELECT * FROM mangas', (err, rows) => {
      if (err) {
        console.error('Erro ao ler os dados do banco de dados:', err.message);
        res.sendStatus(500);
      } else {
        res.render('consulta', { mangas: rows });
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

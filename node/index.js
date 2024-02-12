const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'fc-mysql',
  user: 'root',
  password: 'root',
  database: 'fcdb',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL', err);
    return;
  }
  console.log('MySQL connected');

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
  `;
  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('Error creating users table', err);
      return;
    }
    console.log('Users table created or already exists');
  });
});

app.get('/', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching users', err);
      res.status(500).send('Server error');
      return;
    }
    fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading index.html file', err);
        res.status(500).send('Server error');
        return;
      }
      let output = data;
      const usersHtml = result.map(user => `<li>${user.name}</li>`).join('');
      output = output.replace('<!-- USERS -->', usersHtml);
      res.send(output);
    });
  });
});

app.post('/alunos', (req, res) => {
  const nome = req.body.nome;
  if (!nome) {
    res.status(400).send('Nome é obrigatório');
    return;
  }
  
  const sql = 'INSERT INTO users (name) VALUES (?)';
  db.query(sql, [nome], (err, result) => {
    if (err) {
      console.error('Error inserting user into database', err);
      res.status(500).send('Erro ao inserir usuário no banco de dados');
      return;
    }
    console.log('Usuário inserido com sucesso', result);
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

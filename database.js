const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'vnorisiu_pedidos',
  password: 'Cbe3HDDnz9kS',
  database: 'vnorisiu_pedidos'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Create Users table
  connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(255)
    )
  `, (err, results) => {
    if (err) {
      console.error('Error creating Users table:', err);
      return;
    }
    console.log('Users table created or already exists');
  });

  // Create Requests table
  connection.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      type VARCHAR(50),
      name VARCHAR(255),
      category VARCHAR(50),
      date_added DATE,
      count INT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err, results) => {
    if (err) {
      console.error('Error creating Requests table:', err);
      return;
    }
    console.log('Requests table created or already exists');
  });
});

module.exports = connection;

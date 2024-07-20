const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/api/request', (req, res) => {
  const { name, email, phone, type, movieName, seriesName, category } = req.body;
  const requestName = type === 'movie' ? movieName : seriesName;
  const dateAdded = new Date().toISOString().split('T')[0];

  // Insert or update user
  db.query(`INSERT INTO users (name, email, phone) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone)`,
    [name, email, phone], (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error inserting user', error: err });
      }

      // Get the user ID
      db.query(`SELECT id FROM users WHERE email = ?`, [email], (err, results) => {
        if (err) {
          console.error('Error fetching user:', err);
          return res.status(500).json({ message: 'Error fetching user', error: err });
        }
        const userId = results[0].id;

        // Insert or update request
        db.query(`
          INSERT INTO requests (user_id, type, name, category, date_added, count)
          VALUES (?, ?, ?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE count = count + 1
        `, [userId, type, requestName, category || '', dateAdded], (err, results) => {
          if (err) {
            console.error('Error inserting request:', err);
            return res.status(500).json({ message: 'Error inserting request', error: err });
          }
          res.json({ message: 'Request submitted successfully!' });
        });
      });
    });
});

app.get('/api/top-movies', (req, res) => {
  db.query(`
    SELECT name, SUM(count) as requests, MAX(date_added) as added
    FROM requests
    WHERE type = 'movie'
    GROUP BY name
    ORDER BY requests DESC
    LIMIT 50
  `, (err, results) => {
    if (err) {
      console.error('Error fetching top movies:', err);
      return res.status(500).json({ message: 'Error fetching top movies', error: err });
    }
    res.json(results);
  });
});

app.get('/api/top-series', (req, res) => {
  db.query(`
    SELECT name, SUM(count) as requests, MAX(date_added) as added
    FROM requests
    WHERE type = 'series'
    GROUP BY name
    ORDER BY requests DESC
    LIMIT 50
  `, (err, results) => {
    if (err) {
      console.error('Error fetching top series:', err);
      return res.status(500).json({ message: 'Error fetching top series', error: err });
    }
    res.json(results);
  });
});

app.get('/api/requests', (req, res) => {
  db.query(`
    SELECT users.name as user, requests.type, requests.name, requests.category, requests.date_added, requests.count
    FROM requests
    JOIN users ON requests.user_id = users.id
  `, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      return res.status(500).json({ message: 'Error fetching requests', error: err });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { promisify } = require('util');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./votes.db');

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      elo_rating REAL DEFAULT 1000,
      PRIMARY KEY (category, image)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      voter_name TEXT NOT NULL,
      vote_type TEXT CHECK(vote_type IN ('fan', 'hater')),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.post('/vote', async (req, res) => {
  const { category, winner, loser, voter_name } = req.body;
  if (!category || !winner || !loser || !voter_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const winnerRow = await get('SELECT elo_rating FROM ratings WHERE category = ? AND image = ?', [category, winner]) || { elo_rating: 1000 };
    const loserRow = await get('SELECT elo_rating FROM ratings WHERE category = ? AND image = ?', [category, loser]) || { elo_rating: 1000 };

    const k = 32;
    const winnerProb = 1 / (1 + Math.pow(10, (loserRow.elo_rating - winnerRow.elo_rating) / 400));
    const loserProb = 1 / (1 + Math.pow(10, (winnerRow.elo_rating - loserRow.elo_rating) / 400));

    const newWinnerRating = winnerRow.elo_rating + k * (1 - winnerProb);
    const newLoserRating = loserRow.elo_rating + k * (0 - loserProb);

    await run('INSERT INTO ratings (category, image, elo_rating) VALUES (?, ?, ?) ON CONFLICT(category, image) DO UPDATE SET elo_rating = ?',
      [category, winner, newWinnerRating, newWinnerRating]);
    await run('INSERT INTO ratings (category, image, elo_rating) VALUES (?, ?, ?) ON CONFLICT(category, image) DO UPDATE SET elo_rating = ?',
      [category, loser, newLoserRating, newLoserRating]);

    await run('INSERT INTO votes (category, image, voter_name, vote_type) VALUES (?, ?, ?, ?)', [category, winner, voter_name, 'fan']);
    await run('INSERT INTO votes (category, image, voter_name, vote_type) VALUES (?, ?, ?, ?)', [category, loser, voter_name, 'hater']);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/rankings/:category', async (req, res) => {
    const { category } = req.params;
    try {
      const rows = await all(`
        SELECT r.image, r.elo_rating,
          (SELECT voter_name FROM votes WHERE image = r.image AND vote_type = 'fan' AND category = r.category AND voter_name != ' ' GROUP BY voter_name ORDER BY COUNT(*) DESC, RANDOM() LIMIT 1) AS biggest_fan,
          (SELECT voter_name FROM votes WHERE image = r.image AND vote_type = 'hater' AND category = r.category AND voter_name != ' ' GROUP BY voter_name ORDER BY COUNT(*) DESC, RANDOM() LIMIT 1) AS biggest_hater
        FROM ratings r
        WHERE category = ?
        ORDER BY r.elo_rating DESC
      `, [category]);
  
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

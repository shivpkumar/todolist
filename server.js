const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath);

// Create todos table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API Routes

// Get all todos
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  
  if (!text || text.trim() === '') {
    res.status(400).json({ error: 'Todo text is required' });
    return;
  }

  const stmt = db.prepare('INSERT INTO todos (text) VALUES (?)');
  stmt.run(text.trim(), function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Return the created todo
    db.get('SELECT * FROM todos WHERE id = ?', this.lastID, (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
  stmt.finalize();
});

// Update a todo (toggle completion or edit text)
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed, text } = req.body;
  
  let query = 'UPDATE todos SET ';
  let params = [];
  
  if (completed !== undefined) {
    query += 'completed = ?';
    params.push(completed ? 1 : 0);
  }
  
  if (text !== undefined) {
    if (params.length > 0) query += ', ';
    query += 'text = ?';
    params.push(text.trim());
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  const stmt = db.prepare(query);
  stmt.run(params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    
    // Return the updated todo
    db.get('SELECT * FROM todos WHERE id = ?', id, (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
  stmt.finalize();
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    
    res.json({ message: 'Todo deleted successfully' });
  });
  stmt.finalize();
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
const express = require('express');
const app = express();
const PORT = 3000;
const { Pool } = require ('pg');
app.use(express.json());

const pool = new Pool({
    user: 'postgres',  
    host: 'localhost',            
    database: 'qap3',    
    password: '200LostBillScarlett', 
    port: 5432,              
});

module.exports = pool;
async function createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `;
    await pool.query(query);
    console.log('Tasks table created or already exists.');
  }
  
  createTable();

// Connect to MongoDB....
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);


async function connectToMongo() {
    try {
        await client.connect();
        const db = client.db('QAP3');
        const booksCollection = db.collection('books');

        // Ensure the collection has an index
        await booksCollection.createIndex({ title: 1 }, { unique: true });
        console.log('Connected to MongoDB and Books Collection ready.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToMongo();

// GET /tasks - Get all tasks
app.get('/tasks', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { description, status } = request.body;

    if (!description || description.trim() === '' || !status || status.trim() === '') {
        return response.status(400).json({ error: 'Both description and status are required.'});
    }
    try{
    const result = await pool.query(
        'INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *', [description, status]
    );
    response.status(201).json({ message: 'Task added successfully' });
    } catch (error) {
        console.error('Error adding task: ', error);
        response.status(500).json({ error: 'Failed to add task. '});
    }
}); 

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
    //const task = tasks.find(t => t.id === taskId);
    const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', 
        [status, taskId]
    );

    if (!task) {
        return response.status(404).json({ error: 'Task not found' });
    }
    response.json({ message: 'Task updated successfully' });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);

        if (result.rowCount === 0) {
            return response.status(404).json({ error: 'Task Not Found '});
        }

        response.json({ message: 'Task deleted', deletedTask: result.rows[0] });
    } catch (error) { 
        console.error('Error deleting task: ', error);
        response.status(500).json({ error: "Failed to delete task"});

    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

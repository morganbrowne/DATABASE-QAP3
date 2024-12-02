const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Connect to MongoDB....
const { mongoClient, MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectToDB() {
    await client.connect();
    console.log('MongoDB is Connected');
    return client.db('QAP3');
}
module.exports = connectToDB;

// Initilaize the collection...
//const connectToDB = require('./db');
let booksCollection;

async function initializeDB() {
    const db = await connectToDB();
    booksCollection = db.collection('books');
    console.log('Books Collection Ready.');
}
initializeDB();


let tasks = [
    { id: 1, description: 'Buy groceries', status: 'incomplete' },
    { id: 2, description: 'Read a book', status: 'complete' },
];

// GET /tasks - Get all tasks
app.get('/tasks', async(req, res) => {
    const result = await Pool.query('SELECT * FROM tasks');
    res.json(result.rows);
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { id, description, status } = request.body;
    const result = await Pool.query(
        'INSERT INTO tasks (description, status) VALUES ($1, &2) RETURNING *', [description, status]
    );
    if (!id || !description || !status) {
        return response.status(400).json({ error: 'All fields (id, description, status) are required' });
    }

    tasks.push({ id, description, status });
    response.status(201).json({ message: 'Task added successfully' });
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
    const task = tasks.find(t => t.id === taskId);
    const result = await Pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', 
        [status, id]
    );

    if (!task) {
        return response.status(404).json({ error: 'Task not found' });
    }
    task.status = status;
    response.json({ message: 'Task updated successfully' });
});

// DELETE /tasks/:id - Delete a task
// app.delete('/tasks/:id', async (request, response) => {
//     const taskId = parseInt(request.params.id, 10);
//     const initialLength = tasks.length;
//     tasks = tasks.filter(t => t.id !== taskId);
//     const resutl = await Pool.query('DELETE FROM tasks WHERE id = $1 RETURNING * ', [id]);

//     if (tasks.length === initialLength) {
//         return response.status(404).json({ error: 'Task not found' });
//     }
//     response.json({ message: 'Task deleted successfully' });
// });


app.delete('./tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    try {
        const result = await Pool.query('DELETE FROM * tasks id = $1 RETURNIUNG *', [taskId]);

        if (ressult.rowCount === 0) {
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

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  morgan('dev', {
    skip: () => process.env.NODE_ENV === 'test',
  })
);

// Initialize in-memory SQLite database
const db = new Database(':memory:');

const validStatuses = new Set(['active', 'done']);
const validSorts = new Set(['title', 'created', 'dueDate']);
const validDirections = new Set(['asc', 'desc']);

const sanitizeOptionalText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  return value.trim();
};

const buildOrderBy = (sort, direction = 'desc') => {
  const normalizedDirection = direction === 'asc' ? 'ASC' : 'DESC';

  if (!sort || !validSorts.has(sort)) {
    return 'ORDER BY created_at DESC';
  }

  if (sort === 'title') {
    return `ORDER BY title COLLATE NOCASE ${normalizedDirection}, created_at DESC`;
  }

  if (sort === 'dueDate') {
    return `ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC, due_date ${normalizedDirection}, created_at DESC`;
  }

  return `ORDER BY created_at ${normalizedDirection}`;
};

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialTasks = [
  {
    title: 'Plan sprint tasks',
    description: 'Prepare task breakdown for the week',
    dueDate: '2026-02-22',
    notes: 'Align with team goals',
    status: 'active',
  },
  {
    title: 'Review pull request',
    description: 'Check coding guidelines adherence',
    dueDate: '2026-02-21',
    notes: '',
    status: 'done',
  },
];

const insertTaskStmt = db.prepare(
  'INSERT INTO tasks (title, description, due_date, notes, status) VALUES (?, ?, ?, ?, ?)'
);

initialTasks.forEach((task) => {
  insertTaskStmt.run(task.title, task.description, task.dueDate, task.notes, task.status);
});

if (process.env.NODE_ENV !== 'test') {
  console.log('In-memory database initialized with sample tasks');
}

const mapTaskFromBody = (body, { partial = false } = {}) => {
  const mappedTask = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, 'title')) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return { error: 'Task title is required' };
    }
    mappedTask.title = body.title.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    mappedTask.description = sanitizeOptionalText(body.description);
  } else if (!partial) {
    mappedTask.description = null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'dueDate')) {
    if (body.dueDate !== null && typeof body.dueDate !== 'string') {
      return { error: 'Due date must be a string in YYYY-MM-DD format or null' };
    }
    mappedTask.dueDate = body.dueDate ? body.dueDate.trim() : null;
  } else if (!partial) {
    mappedTask.dueDate = null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'notes')) {
    mappedTask.notes = sanitizeOptionalText(body.notes);
  } else if (!partial) {
    mappedTask.notes = null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    if (!validStatuses.has(body.status)) {
      return { error: 'Status must be active or done' };
    }
    mappedTask.status = body.status;
  } else if (!partial) {
    mappedTask.status = 'active';
  }

  return { mappedTask };
};

const getTaskById = db.prepare('SELECT * FROM tasks WHERE id = ?');

// API Routes
app.get('/api/tasks', (req, res) => {
  try {
    const { status, sort, direction } = req.query;

    if (status && !validStatuses.has(status)) {
      return res.status(400).json({ error: 'Status must be active or done' });
    }

    if (direction && !validDirections.has(direction)) {
      return res.status(400).json({ error: 'Direction must be asc or desc' });
    }

    const orderBy = buildOrderBy(sort, direction || 'desc');

    if (status) {
      const tasks = db.prepare(`SELECT * FROM tasks WHERE status = ? ${orderBy}`).all(status);
      return res.json(tasks);
    }

    const tasks = db.prepare(`SELECT * FROM tasks ${orderBy}`).all();
    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const task = getTaskById.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { mappedTask, error } = mapTaskFromBody(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const result = insertTaskStmt.run(
      mappedTask.title,
      mappedTask.description,
      mappedTask.dueDate,
      mappedTask.notes,
      mappedTask.status
    );
    const id = result.lastInsertRowid;

    const newTask = getTaskById.get(id);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = getTaskById.get(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { mappedTask, error } = mapTaskFromBody(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const updateStmt = db.prepare(
      'UPDATE tasks SET title = ?, description = ?, due_date = ?, notes = ?, status = ? WHERE id = ?'
    );
    updateStmt.run(
      mappedTask.title,
      mappedTask.description,
      mappedTask.dueDate,
      mappedTask.notes,
      mappedTask.status,
      taskId
    );

    const updatedTask = getTaskById.get(taskId);
    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = getTaskById.get(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { status } = req.body;

    if (!validStatuses.has(status)) {
      return res.status(400).json({ error: 'Status must be active or done' });
    }

    const updateStatusStmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
    updateStatusStmt.run(status, taskId);

    const updatedTask = getTaskById.get(taskId);
    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return res.status(500).json({ error: 'Failed to update task status' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = getTaskById.get(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    deleteStmt.run(taskId);

    return res.json({ message: 'Task deleted successfully', id: taskId });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/api/items', (req, res) => {
  return res.redirect('/api/tasks');
});

module.exports = { app, db };
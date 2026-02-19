const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTask = async (title = 'Temp Task') => {
  const response = await request(app)
    .post('/api/tasks')
    .send({
      title,
      description: 'Task description',
      dueDate: '2026-03-01',
      notes: 'Task notes',
    })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('Task API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return tasks with expected structure', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('due_date');
      expect(task).toHaveProperty('notes');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('created_at');
    });

    it('should filter tasks by status', async () => {
      const response = await request(app).get('/api/tasks?status=active');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((task) => {
        expect(task.status).toBe('active');
      });
    });

    it('should return 400 for invalid status filter', async () => {
      const response = await request(app).get('/api/tasks?status=invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Status must be active or done');
    });

    it('should return 400 for invalid sort direction', async () => {
      const response = await request(app).get('/api/tasks?sort=title&direction=invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Direction must be asc or desc');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with default active status', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'Description',
        dueDate: '2026-04-15',
        notes: 'Notes',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.status).toBe('active');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', status: 'paused' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Status must be active or done');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const task = await createTask('Task To Update');

      const updateResponse = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({
          title: 'Updated Task',
          description: 'Updated description',
          dueDate: '2026-06-20',
          notes: 'Updated notes',
          status: 'done',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Task');
      expect(updateResponse.body.status).toBe('done');
    });

    it('should return 404 if task does not exist', async () => {
      const response = await request(app)
        .put('/api/tasks/999999')
        .send({ title: 'Updated', status: 'active' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should switch task status from active to done', async () => {
      const task = await createTask('Task To Complete');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: 'done' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'done');
    });

    it('should return 400 for invalid status payload', async () => {
      const task = await createTask('Task With Invalid Status');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Status must be active or done');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask('Task To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid task ID is required');
    });
  });

  describe('Sorting', () => {
    it('should sort by title ascending when requested', async () => {
      await createTask('Alpha Task');
      await createTask('Zulu Task');

      const response = await request(app).get('/api/tasks?sort=title&direction=asc');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      for (let index = 1; index < response.body.length; index += 1) {
        const previous = response.body[index - 1].title.toLowerCase();
        const current = response.body[index].title.toLowerCase();
        expect(previous <= current).toBe(true);
      }
    });

    it('should sort by title descending when requested', async () => {
      await createTask('Alpha Desc Task');
      await createTask('Zulu Desc Task');

      const response = await request(app).get('/api/tasks?sort=title&direction=desc');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      for (let index = 1; index < response.body.length; index += 1) {
        const previous = response.body[index - 1].title.toLowerCase();
        const current = response.body[index].title.toLowerCase();
        expect(previous >= current).toBe(true);
      }
    });

    it('should sort by due date ascending when requested', async () => {
      await createTask('Task Due Later');
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task Due Sooner', dueDate: '2026-02-20' })
        .set('Accept', 'application/json');

      const response = await request(app).get('/api/tasks?sort=dueDate&direction=asc');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const tasksWithDueDate = response.body.filter((task) => Boolean(task.due_date));
      for (let index = 1; index < tasksWithDueDate.length; index += 1) {
        expect(tasksWithDueDate[index - 1].due_date <= tasksWithDueDate[index].due_date).toBe(true);
      }
    });

    it('should sort by due date descending when requested', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Old Due Date', dueDate: '2026-01-10' })
        .set('Accept', 'application/json');
      await request(app)
        .post('/api/tasks')
        .send({ title: 'New Due Date', dueDate: '2026-05-10' })
        .set('Accept', 'application/json');

      const response = await request(app).get('/api/tasks?sort=dueDate&direction=desc');

      expect(response.status).toBe(200);
      const tasksWithDueDate = response.body.filter((task) => Boolean(task.due_date));
      for (let index = 1; index < tasksWithDueDate.length; index += 1) {
        expect(tasksWithDueDate[index - 1].due_date >= tasksWithDueDate[index].due_date).toBe(true);
      }
    });
  });
});
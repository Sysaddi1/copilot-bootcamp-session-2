import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const seedTasks = [
  {
    id: 1,
    title: 'Write tests',
    description: 'Cover core flow',
    due_date: '2026-02-20',
    notes: 'Use msw',
    status: 'active',
    created_at: '2026-02-19T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Ship feature',
    description: 'Deploy to production',
    due_date: '2026-02-21',
    notes: '',
    status: 'done',
    created_at: '2026-02-19T11:00:00.000Z',
  },
  {
    id: 3,
    title: 'Alpha task',
    description: 'A description',
    due_date: '2026-02-15',
    notes: '',
    status: 'active',
    created_at: '2026-02-18T08:00:00.000Z',
  },
];

let taskStore = [];

const resetTaskStore = () => {
  taskStore = seedTasks.map((task) => ({ ...task }));
};

const getNextId = () => {
  if (taskStore.length === 0) {
    return 1;
  }

  return Math.max(...taskStore.map((task) => task.id)) + 1;
};

const sortByQuery = (tasks, sort, direction = 'desc') => {
  const sorted = [...tasks];
  const isAsc = direction === 'asc';

  if (sort === 'title') {
    sorted.sort((first, second) => {
      const value = first.title.localeCompare(second.title);
      return isAsc ? value : -value;
    });
    return sorted;
  }

  if (sort === 'dueDate') {
    sorted.sort((first, second) => {
      if (!first.due_date && !second.due_date) {
        return 0;
      }
      if (!first.due_date) {
        return 1;
      }
      if (!second.due_date) {
        return -1;
      }
      const value = first.due_date.localeCompare(second.due_date);
      return isAsc ? value : -value;
    });
    return sorted;
  }

  sorted.sort((first, second) => {
    const value = first.created_at.localeCompare(second.created_at);
    return isAsc ? value : -value;
  });
  return sorted;
};

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    const status = req.url.searchParams.get('status');
    const sort = req.url.searchParams.get('sort');
    const direction = req.url.searchParams.get('direction');
    const filteredTasks = status
      ? taskStore.filter((task) => task.status === status)
      : [...taskStore];

    return res(
      ctx.status(200),
      ctx.json(sortByQuery(filteredTasks, sort, direction || 'desc'))
    );
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    const { title, description, dueDate, notes, status } = req.body;

    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Task title is required' })
      );
    }

    const newTask = {
      id: getNextId(),
      title: title.trim(),
      description: description || null,
      due_date: dueDate || null,
      notes: notes || null,
      status: status || 'active',
      created_at: '2026-02-19T12:00:00.000Z',
    };
    taskStore.push(newTask);

    return res(
      ctx.status(201),
      ctx.json(newTask)
    );
  }),

  rest.put('/api/tasks/:id', (req, res, ctx) => {
    const id = Number.parseInt(req.params.id, 10);
    const taskIndex = taskStore.findIndex((task) => task.id === id);

    if (taskIndex < 0) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    const { title, description, dueDate, notes, status } = req.body;
    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    taskStore[taskIndex] = {
      ...taskStore[taskIndex],
      title: title.trim(),
      description: description || null,
      due_date: dueDate || null,
      notes: notes || null,
      status,
    };

    return res(ctx.status(200), ctx.json(taskStore[taskIndex]));
  }),

  rest.patch('/api/tasks/:id/status', (req, res, ctx) => {
    const id = Number.parseInt(req.params.id, 10);
    const { status } = req.body;
    const taskIndex = taskStore.findIndex((task) => task.id === id);

    if (taskIndex < 0) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    taskStore[taskIndex] = {
      ...taskStore[taskIndex],
      status,
    };

    return res(ctx.status(200), ctx.json(taskStore[taskIndex]));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const id = Number.parseInt(req.params.id, 10);
    const taskIndex = taskStore.findIndex((task) => task.id === id);

    if (taskIndex < 0) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    taskStore.splice(taskIndex, 1);
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id }));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => {
  resetTaskStore();
  server.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

beforeEach(() => {
  resetTaskStore();
});

describe('App Component', () => {
  test('renders header and tab navigation', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('ToDo App')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  test('loads and displays active tasks by default', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });

    expect(screen.queryByText('Ship feature')).not.toBeInTheDocument();
  });

  test('switches to done tab and shows done tasks', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Done' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Ship feature')).toBeInTheDocument();
    });
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
  });

  test('creates a new active task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Create' }));
    });

    await act(async () => {
      await user.type(screen.getByLabelText('Title *'), 'New Task');
      await user.type(screen.getByLabelText('Description'), 'New Description');
      await user.type(screen.getByLabelText('Due date'), '2026-02-25');
      await user.click(screen.getByRole('button', { name: 'Create task' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Task created successfully.')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Active' }));
    });

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('edits a task by clicking a task row', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByText('Write tests'));
    });

    const titleInput = screen.getByLabelText('Title *');
    await act(async () => {
      await user.clear(titleInput);
      await user.type(titleInput, 'Write more tests');
      await user.click(screen.getByRole('button', { name: 'Save task' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Task updated successfully.')).toBeInTheDocument();
      expect(screen.getByText('Write more tests')).toBeInTheDocument();
    });
  });

  test('moves active task to done with direct status action', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });

    const writeTestsRow = screen.getByText('Write tests').closest('tr');
    const markDoneButton = within(writeTestsRow).getByRole('button', { name: 'Mark done' });

    await act(async () => {
      await user.click(markDoneButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
      expect(screen.getByText('Task moved to done.')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Done' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  test('handles API load error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('shows empty state when no active tasks exist', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        const status = req.url.searchParams.get('status');
        if (status === 'active') {
          return res(ctx.status(200), ctx.json([]));
        }
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No active tasks found.')).toBeInTheDocument();
    });
  });

  test('shows created date in active overview', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('19.02.2026')).toBeInTheDocument();
    });
  });

  test('toggles title sorting direction with arrow button', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(screen.getByText('Alpha task')).toBeInTheDocument();
    });

    const rowsBeforeSort = screen.getAllByRole('row').slice(1);
    expect(rowsBeforeSort[0]).toHaveTextContent('Write tests');

    const titleHeader = screen.getByText('Title').closest('th');
    const titleSortButton = within(titleHeader).getByRole('button');

    await act(async () => {
      await user.click(titleSortButton);
    });

    await waitFor(() => {
      const rowsAfterAscSort = screen.getAllByRole('row').slice(1);
      expect(rowsAfterAscSort[0]).toHaveTextContent('Alpha task');
    });

    const refreshedTitleHeader = screen.getByText('Title').closest('th');
    const refreshedTitleSortButton = within(refreshedTitleHeader).getByRole('button');

    await act(async () => {
      await user.click(refreshedTitleSortButton);
    });

    await waitFor(() => {
      const rowsAfterDescSort = screen.getAllByRole('row').slice(1);
      expect(rowsAfterDescSort[0]).toHaveTextContent('Write tests');
    });
  });
});
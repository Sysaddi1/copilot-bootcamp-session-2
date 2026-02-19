import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [sortConfig, setSortConfig] = useState({
    field: 'created',
    direction: 'desc',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskStatus, setEditingTaskStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    notes: '',
  });

  const parseDateInput = (dateText) => {
    if (!dateText || typeof dateText !== 'string') {
      return null;
    }

    const normalizedDateText = dateText.includes(' ') ? dateText.replace(' ', 'T') : dateText;
    const parsedDate = new Date(normalizedDateText);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  };

  const formatDateEu = (dateText) => {
    if (!dateText) {
      return '-';
    }

    const date = parseDateInput(dateText);
    if (!date) {
      return '-';
    }

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setEditingTaskStatus(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      notes: '',
    });
  };

  useEffect(() => {
    if (activeTab === 'create') {
      setLoading(false);
      return;
    }

    fetchData(activeTab);
  }, [activeTab, sortConfig]);

  const fetchData = async (statusView = activeTab) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: statusView,
        sort: sortConfig.field,
        direction: sortConfig.direction,
      });

      const response = await fetch(`/api/tasks?${query.toString()}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const isEditing = editingTaskId !== null;
      const url = isEditing ? `/api/tasks/${editingTaskId}` : '/api/tasks';
      const method = isEditing ? 'PUT' : 'POST';
      const statusForSave = isEditing ? editingTaskStatus || 'active' : 'active';
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        dueDate: formData.dueDate || null,
        notes: formData.notes,
        status: statusForSave,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.error || 'Failed to save task');
      }

      setSuccessMessage(isEditing ? 'Task updated successfully.' : 'Task created successfully.');
      setError(null);

      if (isEditing) {
        setActiveTab(statusForSave);
        await fetchData(statusForSave);
      }

      resetForm();
    } catch (err) {
      setError('Error saving task: ' + err.message);
      console.error('Error saving task:', err);
    }
  };

  const handleStatusChange = async (task, targetStatus) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setSuccessMessage(`Task moved to ${targetStatus}.`);
      setError(null);
      if (editingTaskId === task.id) {
        resetForm();
      }
      await fetchData(activeTab);
    } catch (err) {
      setError('Error updating status: ' + err.message);
      console.error('Error updating status:', err);
    }
  };

  const handleEdit = (task) => {
    setActiveTab('create');
    setEditingTaskId(task.id);
    setEditingTaskStatus(task.status);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.due_date || '',
      notes: task.notes || '',
    });
    setSuccessMessage('');
    setError(null);
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setSuccessMessage('Task deleted successfully.');
      setError(null);
      if (editingTaskId === taskId) {
        resetForm();
      }
      await fetchData(activeTab);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const toggleSort = (field) => {
    setSortConfig((currentSort) => {
      if (currentSort.field === field) {
        return {
          field,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        field,
        direction: 'asc',
      };
    });
  };

  const getSortArrow = (field) => {
    if (sortConfig.field !== field) {
      return '↕';
    }

    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ToDo App</h1>
        <p>Manage active and done tasks</p>
      </header>

      <main>
        <section className="nav-section">
          <h2>Overview</h2>
          <div className="tabs" role="tablist" aria-label="Task status tabs">
            <button
              type="button"
              className={activeTab === 'create' ? 'tab-btn tab-btn-active' : 'tab-btn'}
              onClick={() => {
                setActiveTab('create');
                setSuccessMessage('');
                setError(null);
                resetForm();
              }}
            >
              Create
            </button>
            <button
              type="button"
              className={activeTab === 'active' ? 'tab-btn tab-btn-active' : 'tab-btn'}
              onClick={() => {
                setActiveTab('active');
                setSuccessMessage('');
                setError(null);
              }}
            >
              Active
            </button>
            <button
              type="button"
              className={activeTab === 'done' ? 'tab-btn tab-btn-active' : 'tab-btn'}
              onClick={() => {
                setActiveTab('done');
                setSuccessMessage('');
                setError(null);
              }}
            >
              Done
            </button>
          </div>
        </section>

        {activeTab === 'create' && (
          <section className="task-form-section">
            <h2>{editingTaskId ? 'Edit Task' : 'Create Task'}</h2>
            {error && <p className="error">{error}</p>}
            {successMessage && !error && <p className="success">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="title-input">Title *</label>
              <input
                id="title-input"
                type="text"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                placeholder="Task title"
                required
              />

              <label htmlFor="description-input">Description</label>
              <textarea
                id="description-input"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Task description"
              />

              <label htmlFor="due-date-input">Due date</label>
              <input
                id="due-date-input"
                type="date"
                value={formData.dueDate}
                onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
              />

              <label htmlFor="notes-input">Notes</label>
              <textarea
                id="notes-input"
                value={formData.notes}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                placeholder="Additional notes"
              />

              <div className="form-actions">
                <button type="submit">{editingTaskId ? 'Save task' : 'Create task'}</button>
                {editingTaskId && (
                  <button type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {(activeTab === 'active' || activeTab === 'done') && (
          <section className="tasks-section">
            <h2>{activeTab === 'active' ? 'Active Tasks' : 'Done Tasks'}</h2>
            {loading && <p>Loading data...</p>}
            {error && <p className="error">{error}</p>}
            {successMessage && !error && <p className="success">{successMessage}</p>}
            {!loading && !error && (
              <div>
                {tasks.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Title
                          <button type="button" className="sort-btn" onClick={() => toggleSort('title')}>
                            {getSortArrow('title')}
                          </button>
                        </th>
                        <th>
                          Created
                          <button type="button" className="sort-btn" onClick={() => toggleSort('created')}>
                            {getSortArrow('created')}
                          </button>
                        </th>
                        <th>
                          Due date
                          <button type="button" className="sort-btn" onClick={() => toggleSort('dueDate')}>
                            {getSortArrow('dueDate')}
                          </button>
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} onClick={() => handleEdit(task)}>
                          <td>{task.title}</td>
                          <td>{formatDateEu(task.created_at)}</td>
                          <td>{formatDateEu(task.due_date)}</td>
                          <td>{task.status}</td>
                          <td>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStatusChange(task, task.status === 'active' ? 'done' : 'active');
                              }}
                            >
                              {task.status === 'active' ? 'Mark done' : 'Mark active'}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(task.id);
                              }}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>{activeTab === 'active' ? 'No active tasks found.' : 'No done tasks found.'}</p>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
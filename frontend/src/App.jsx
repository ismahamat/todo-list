import { useState, useEffect } from 'react';
import './App.css';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import TaskDetailModal from './components/TaskDetailModal';

const API_URL = 'http://localhost:8080/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tasks:", err);
        setLoading(false);
      });
  }, []);

  // Add Task
  const addTask = async (taskData) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Toggle Task Completion
  const toggleTask = async (id, completed) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));

      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
    } catch (err) {
      console.error("Error updating task:", err);
      // Revert on error would go here
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      // If deleting selected task, close modal
      if (selectedTask?.id === id) setSelectedTask(null);

      // Optimistic update
      setTasks(tasks.filter(t => t.id !== id));

      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Todo Master</h1>
        <p className="subtitle">Organize your life with style</p>
      </header>

      <TaskForm onAdd={addTask} />

      <div className="task-list">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onClick={() => setSelectedTask(task)}
            />
          ))
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './App.css';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import TaskDetailModal from './components/TaskDetailModal';
import FilterBar from './components/FilterBar';
import { useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

const API_URL = '/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const { theme, toggleTheme } = useTheme();

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch tasks
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // Ensure data is always an array
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tasks:", err);
        setTasks([]); // Reset to empty array on error
        setLoading(false);
      });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          // Focus on new task input
          const taskInput = document.querySelector('.task-form .input-primary');
          if (taskInput) taskInput.focus();
          break;
        case 't':
          toggleTheme();
          break;
        case 'escape':
          if (selectedTask) setSelectedTask(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask, toggleTheme]);

  // Filter Logic - ensure tasks is always an array
  const tasksList = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = tasksList.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority;
    const matchesCategory = filterCategory === "All" || task.category === filterCategory;
    const matchesCompleted = showCompleted || !task.completed;
    const matchesArchived = showArchived ? task.isArchived : !task.isArchived;

    return matchesSearch && matchesPriority && matchesCategory && matchesCompleted && matchesArchived;
  });

  // Progress Stats
  const completedCount = tasksList.filter(t => t.completed).length;
  const totalCount = tasksList.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // DnD Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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

  // Update Task (Toggle completion or edit fields)
  const updateTask = async (id, updates) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

      // If updating current selection, update it too
      if (selectedTask?.id === id) {
        setSelectedTask(prev => ({ ...prev, ...updates }));
      }

      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      if (selectedTask?.id === id) setSelectedTask(null);

      setTasks(prev => prev.filter(t => t.id !== id));

      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="container">
      <header className="header" style={{ position: 'relative' }}>
        <button
          onClick={toggleTheme}
          className="btn-icon"
          style={{ position: 'absolute', right: 0, top: 0, background: 'var(--color-surface)', padding: '0.5rem' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <h1>Todo Least</h1>
        <p className="subtitle">Organisez votre vie en créant des tâches simples et efficaces.</p>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-header">
          <span>Progression</span>
          <span>{progressPercentage}% ({completedCount}/{totalCount})</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <TaskForm onAdd={addTask} />

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
      />

      <div className="task-list">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>Chargement des tâches...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <p>Aucune tâche trouvée.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(id, completed) => updateTask(id, { completed })}
                  onDelete={deleteTask}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onUpdate={updateTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

export default App;

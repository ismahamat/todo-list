import { X, Pencil, Save, Archive, Clock, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

const TaskDetailModal = ({ task, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...task,
    subtasks: task.subtasks || [],
    timeEstimate: task.timeEstimate || 0
  });
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    setFormData({
      ...task,
      subtasks: task.subtasks || [],
      timeEstimate: task.timeEstimate || 0
    });
  }, [task]);

  if (!task) return null;

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(task.id, formData);
    setIsEditing(false);
  };

  const toggleArchive = () => {
    // Toggle archive status
    const newStatus = !task.isArchived;
    onUpdate(task.id, { isArchived: newStatus });
    // Close modal if archiving
    if (newStatus) onClose();
  };

  const addSubtask = (e) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      e.preventDefault();
      const newItem = { id: Date.now(), text: newSubtask, completed: false };
      setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, newItem] }));
      setNewSubtask("");
    }
  };

  const toggleSubtask = (subTaskId) => {
    const updatedSubtasks = formData.subtasks.map(st =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    setFormData(prev => ({ ...prev, subtasks: updatedSubtasks }));

    // If in view mode, auto-save subtask changes
    if (!isEditing) {
      onUpdate(task.id, { subtasks: updatedSubtasks });
    }
  };

  const removeSubtask = (subTaskId) => {
    const updatedSubtasks = formData.subtasks.filter(st => st.id !== subTaskId);
    setFormData(prev => ({ ...prev, subtasks: updatedSubtasks }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Edit Task" : "Task Details"}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEditing && (
              <button
                className="btn-icon"
                onClick={toggleArchive}
                title={task.isArchived ? "Unarchive" : "Archive"}
                style={{ color: task.isArchived ? 'var(--color-warning)' : 'inherit' }}
              >
                <Archive size={20} />
              </button>
            )}
            <button
              className="btn-icon"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              title={isEditing ? "Save" : "Edit"}
            >
              {isEditing ? <Save size={20} /> : <Pencil size={20} />}
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div className="task-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="input-primary"
                placeholder="Task title"
              />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                >
                  <option value="Low">Faible Priorité</option>
                  <option value="Medium">Moyenne Priorité</option>
                  <option value="High">Haute Priorité</option>
                  <option value="Urgent">Urgente Priorité</option>
                </select>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                >
                  <option value="Général">Général</option>
                  <option value="Travail">Travail</option>
                  <option value="Personnel">Personnel</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ''}
                  onChange={handleChange}
                  className="input-primary"
                  style={{ flex: 1 }}
                />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--color-text-dim)" />
                  <input
                    type="number"
                    name="timeEstimate"
                    value={formData.timeEstimate}
                    onChange={handleChange}
                    className="input-primary"
                    placeholder="Min"
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>min</span>
                </div>
              </div>

              <textarea
                name="details"
                value={formData.details || ''}
                onChange={handleChange}
                className="input-primary"
                placeholder="Add details..."
                rows={4}
                style={{ fontFamily: 'inherit' }}
              />

              {/* Subtasks Edit Mode */}
              <div className="subtasks-section">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-dim)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  <CheckSquare size={16} /> Sous-tâches
                </h4>
                <div className="input-group">
                  <input
                    type="text"
                    className="input-primary"
                    placeholder="Add subtask (Press Enter)"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={addSubtask}
                  />
                </div>
                <div className="subtasks-list" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formData.subtasks.map(st => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(st.id)}
                      />
                      <span style={{ flex: 1, textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--color-text-dim)' : 'inherit' }}>
                        {st.text}
                      </span>
                      <button type="button" onClick={() => removeSubtask(st.id)} className="btn-icon" style={{ color: 'var(--color-danger)', padding: '0.2rem' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="task-title" style={{ textDecoration: task.isArchived ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {task.text}
                {task.isArchived && <span className="tag" style={{ background: 'var(--color-warning)', color: '#000' }}>Archivée</span>}
              </h3>

              <div className="tags modal-tags">
                {task.priority && (
                  <span className={`tag ${task.priority.toLowerCase()}`}>
                    {task.priority} Priorité
                  </span>
                )}
                {task.category && (
                  <span className="tag">{task.category}</span>
                )}
                {task.dueDate && (
                  <span className="tag">Due: {task.dueDate}</span>
                )}
                {task.timeEstimate > 0 && (
                  <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {task.timeEstimate} min
                  </span>
                )}
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <p className="detail-text">
                  {task.details || "Pas de description fournie."}
                </p>
              </div>

              {/* Subtasks View Mode */}
              {formData.subtasks && formData.subtasks.length > 0 && (
                <div className="detail-section" style={{ marginTop: '1.5rem' }}>
                  <h4>
                    Subtasks ({formData.subtasks.filter(t => t.completed).length}/{formData.subtasks.length})
                  </h4>
                  <div className="progress-track" style={{ marginBottom: '1rem', height: '4px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(formData.subtasks.filter(t => t.completed).length / formData.subtasks.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="subtasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.subtasks.map(st => (
                      <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleSubtask(st.id)}
                        />
                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--color-text-dim)' : 'inherit' }}>
                          {st.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

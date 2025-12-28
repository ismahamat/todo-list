import { Trash2, Check } from 'lucide-react';

const TaskItem = ({ task, onToggle, onDelete, onClick }) => {
    return (
        <div className="task-item" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="task-main">
                <div className="task-content">
                    <div
                        className={`checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(task.id, !task.completed);
                        }}
                    >
                        {task.completed && <Check size={14} color="white" />}
                    </div>

                    <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                        {task.text}
                    </span>
                </div>

                <div className="tags">
                    {task.priority && (
                        <span className={`tag ${task.priority.toLowerCase()}`}>
                            {task.priority}
                        </span>
                    )}
                    {task.category && (
                        <span className="tag">{task.category}</span>
                    )}
                    {task.dueDate && (
                        <span className="tag">{task.dueDate}</span>
                    )}
                </div>

                <div className="actions">
                    <button
                        className="btn-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        title="Delete task"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;

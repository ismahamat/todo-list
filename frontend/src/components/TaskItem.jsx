import { Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const TaskItem = ({ task, onToggle, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`task-item ${expanded ? 'expanded' : ''}`}>
            <div className="task-main">
                <div className="task-content">
                    <div
                        className={`checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => onToggle(task.id, !task.completed)}
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
                    {task.details && (
                        <button
                            className={`btn-icon ${expanded ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                            title={expanded ? "Hide details" : "Show details"}
                        >
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    )}
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

            {expanded && task.details && (
                <div className="task-details">
                    <p>{task.details}</p>
                </div>
            )}
        </div>
    );
};

export default TaskItem;

import { X } from 'lucide-react';
import { useEffect } from 'react';

const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Task Details</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <h3 className="task-title">{task.text}</h3>

                    <div className="tags modal-tags">
                        {task.priority && (
                            <span className={`tag ${task.priority.toLowerCase()}`}>
                                {task.priority} Priority
                            </span>
                        )}
                        {task.category && (
                            <span className="tag">{task.category}</span>
                        )}
                        {task.dueDate && (
                            <span className="tag">Due: {task.dueDate}</span>
                        )}
                    </div>

                    <div className="detail-section">
                        <h4>Description</h4>
                        <p className="detail-text">
                            {task.details || "No further details provided."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;

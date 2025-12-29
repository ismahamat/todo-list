import { Trash2, Check, GripVertical, Clock, CheckSquare, Archive, AlertCircle, CalendarClock, Repeat } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper to determine due date status
const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', class: 'overdue' };
    if (diffDays === 0) return { label: 'Today', class: 'due-today' };
    if (diffDays === 1) return { label: 'Tomorrow', class: 'due-tomorrow' };
    return null;
};

const TaskItem = ({ task, onToggle, onDelete, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
    };

    const dueDateStatus = getDueDateStatus(task.dueDate);

    return (
        <div
            className={`task-item ${dueDateStatus?.class || ''}`}
            ref={setNodeRef}
            style={style}
            onClick={onClick}
        >
            <div className="task-main">
                <div
                    {...attributes}
                    {...listeners}
                    style={{ cursor: 'grab', marginRight: '0.5rem', color: 'var(--color-text-dim)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={18} />
                </div>

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
                    {/* Due Date Status Badge */}
                    {dueDateStatus && !task.completed && (
                        <span className={`tag ${dueDateStatus.class}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} /> {dueDateStatus.label}
                        </span>
                    )}
                    {task.priority && (
                        <span className={`tag ${task.priority.toLowerCase()}`}>
                            {task.priority}
                        </span>
                    )}
                    {task.category && (
                        <span className="tag">{task.category}</span>
                    )}
                    {task.dueDate && !dueDateStatus && (
                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarClock size={12} /> {task.dueDate}
                        </span>
                    )}
                    {task.timeEstimate > 0 && (
                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {task.timeEstimate}m
                        </span>
                    )}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckSquare size={12} />
                            {task.subtasks.filter(t => t.completed).length}/{task.subtasks.length}
                        </span>
                    )}
                    {task.isArchived && (
                        <span className="tag" style={{ background: 'var(--color-warning)', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Archive size={12} /> Archivée
                        </span>
                    )}
                    {task.recurrence && (
                        <span className="tag recurrence" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Repeat size={12} /> {task.recurrence}
                        </span>
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

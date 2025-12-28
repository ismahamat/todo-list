import { useState } from 'react';
import { Plus } from 'lucide-react';

const TaskForm = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [details, setDetails] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onAdd({ text, details, priority, category, dueDate });
        setText('');
        setDetails('');
        setCategory('');
        setDueDate('');
        setPriority('Medium');
    };

    return (
        <form className="task-form glass-panel" onSubmit={handleSubmit}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <input
                    type="text"
                    className="input-primary"
                    placeholder="Nouvelle tâche..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <textarea
                    className="input-primary"
                    placeholder="Détails (optionnel)..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows="2"
                />
            </div>

            <select
                className="input-primary"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: 'auto' }}
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>

            <input
                type="date"
                className="input-primary"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: 'auto' }}
            />

            <button type="submit" className="btn-primary">
                <Plus size={20} />
            </button>
        </form>
    );
};

export default TaskForm;

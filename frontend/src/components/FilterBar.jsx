import React from 'react';

const FilterBar = ({ searchTerm, setSearchTerm, filterPriority, setFilterPriority, filterCategory, setFilterCategory, showCompleted, setShowCompleted, showArchived, setShowArchived }) => {
    return (
        <div className="filter-bar">
            <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="All">Priorité : Toutes</option>
                <option value="High">Haute</option>
                <option value="Medium">Moyenne</option>
                <option value="Low">Basse</option>
            </select>

            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">Catégorie : Toutes</option>
                <option value="Travail">Travail</option>
                <option value="Personnel">Personnel</option>
                <option value="Général">Général</option>
            </select>

            <label className="checkbox-container">
                <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                />
                Afficher terminées
            </label>

            <label className="checkbox-container" style={{ marginLeft: '1rem', color: showArchived ? 'var(--color-warning)' : 'inherit' }}>
                <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                />
                {showArchived ? "Archives 📁" : "Voir Archives 📁"}
            </label>
        </div>
    );
};

export default FilterBar;

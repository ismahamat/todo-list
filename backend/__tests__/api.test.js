import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

const mockPool = {
  query: jest.fn(),
};

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await mockPool.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { text, details, priority, category, dueDate, subtasks, timeEstimate, recurrence } = req.body;
  try {
    const result = await mockPool.query(
      `INSERT INTO tasks (text, details, completed, priority, category, dueDate, subtasks, timeEstimate, isArchived, recurrence) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        text,
        details || "",
        false,
        priority || "Low",
        category || "Général",
        dueDate || "",
        JSON.stringify(subtasks || []),
        timeEstimate || 0,
        false,
        recurrence || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { text, details, completed, priority, category, dueDate, subtasks, timeEstimate, isArchived, recurrence } = req.body;

  try {
    const result = await mockPool.query(
      `UPDATE tasks 
       SET text = COALESCE($1, text), 
           details = COALESCE($2, details), 
           completed = COALESCE($3, completed), 
           priority = COALESCE($4, priority), 
           category = COALESCE($5, category), 
           dueDate = COALESCE($6, dueDate),
           subtasks = COALESCE($7, subtasks),
           timeEstimate = COALESCE($8, timeEstimate),
           isArchived = COALESCE($9, isArchived),
           recurrence = COALESCE($10, recurrence)
       WHERE id = $11 RETURNING *`,
      [text, details, completed, priority, category, dueDate, subtasks ? JSON.stringify(subtasks) : null, timeEstimate, isArchived, recurrence, id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await mockPool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Tests
describe('API Tasks Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('devrait retourner toutes les tâches', async () => {
      const mockTasks = [
        { id: 1, text: 'Task 1', completed: false },
        { id: 2, text: 'Task 2', completed: true }
      ];
      
      mockPool.query.mockResolvedValue({ rows: mockTasks });

      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(mockPool.query).toHaveBeenCalledWith("SELECT * FROM tasks ORDER BY id ASC");
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('POST /api/tasks', () => {
    it('devrait créer une nouvelle tâche', async () => {
      const newTask = {
        text: 'Nouvelle tâche',
        details: 'Détails de la tâche',
        priority: 'High',
        category: 'Travail',
        dueDate: '2025-12-31'
      };

      const mockCreatedTask = {
        id: 1,
        ...newTask,
        completed: false,
        subtasks: [],
        timeEstimate: 0,
        isArchived: false,
        recurrence: null
      };

      mockPool.query.mockResolvedValue({ rows: [mockCreatedTask] });

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(mockCreatedTask);
    });

    it('devrait créer une tâche avec valeurs par défaut', async () => {
      const minimalTask = { text: 'Tâche minimale' };
      
      mockPool.query.mockResolvedValue({ 
        rows: [{ 
          id: 2, 
          text: 'Tâche minimale', 
          details: '',
          completed: false,
          priority: 'Low',
          category: 'Général',
          dueDate: ''
        }] 
      });

      const response = await request(app)
        .post('/api/tasks')
        .send(minimalTask);

      expect(response.status).toBe(201);
      expect(mockPool.query).toHaveBeenCalled();
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('devrait mettre à jour une tâche existante', async () => {
      const updatedData = {
        text: 'Tâche mise à jour',
        completed: true
      };

      const mockUpdatedTask = {
        id: 1,
        ...updatedData,
        details: 'Old details',
        priority: 'Medium'
      };

      mockPool.query.mockResolvedValue({ rows: [mockUpdatedTask] });

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(mockUpdatedTask);
    });

    it('devrait retourner 404 si la tâche n\'existe pas', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/tasks/999')
        .send({ text: 'Update' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('devrait supprimer une tâche', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(204);
      expect(mockPool.query).toHaveBeenCalledWith("DELETE FROM tasks WHERE id = $1", ["1"]);
    });

    it('devrait gérer les erreurs de suppression', async () => {
      mockPool.query.mockRejectedValue(new Error('Delete failed'));

      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Delete failed');
    });
  });
});
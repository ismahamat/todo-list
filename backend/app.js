import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = 8080;

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Initialize Database
let db;
(async () => {
    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
        
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT,
                details TEXT,
                completed INTEGER,
                priority TEXT,
                category TEXT,
                dueDate TEXT
            )
        `);
        console.log("✅ Connected to SQLite database");
    } catch (e) {
        console.error("❌ Error connecting to database:", e);
    }
})();

// Routes

// GET all tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await db.all("SELECT * FROM tasks");
        // Convert integer boolean back to boolean for JSON
        const formattedTasks = tasks.map(t => ({
            ...t,
            completed: !!t.completed
        }));
        res.json(formattedTasks);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST new task
app.post("/api/tasks", async (req, res) => {
    const { text, details, priority, category, dueDate } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO tasks (text, details, completed, priority, category, dueDate) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [text, details || "", 0, priority || "Low", category || "Général", dueDate || ""]
        );
        const newTask = await db.get("SELECT * FROM tasks WHERE id = ?", result.lastID);
        res.status(201).json({ ...newTask, completed: false });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PUT update task
app.put("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    try {
        // Since we only toggle completion in this app mostly, but valid to support others.
        // For simplicity, let's just update completion if provided.
        // In a real app we might update other fields. 
        // Based on frontend 'toggleTask', it sends { completed }.
        
        // Convert boolean to integer for SQLite
        const isCompleted = completed ? 1 : 0;
        
        await db.run("UPDATE tasks SET completed = ? WHERE id = ?", [isCompleted, id]);
        
        const updatedTask = await db.get("SELECT * FROM tasks WHERE id = ?", id);
        
        if (updatedTask) {
             res.json({ ...updatedTask, completed: !!updatedTask.completed });
        } else {
             res.status(404).json({ message: "Task not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM tasks WHERE id = ?", id);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;
const app = express();
const PORT = 8080;

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Initialize Database Connection
const pool = new Pool({
  user: process.env.DB_USER || "user",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "todo_db",
  password: process.env.DB_PASSWORD || "password",
  port: 5432,
});

// Initialize Table with Retry Logic
const connectWithRetry = async () => {
    let retries = 50; 
    while (retries) {
        try {
            // Ensure table exists
            await pool.query(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    text TEXT,
                    details TEXT,
                    completed BOOLEAN DEFAULT FALSE,
                    priority TEXT,
                    category TEXT,
                    dueDate TEXT
                )
            `);
            
            // Migrate: Add new columns if they don't exist
            await pool.query(`
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS isArchived BOOLEAN DEFAULT FALSE;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS timeEstimate INTEGER DEFAULT 0;
                ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT NULL;
            `);

            console.log("✅ Connected to PostgreSQL database and schema verified");
            return; // Success
        } catch (err) {
            console.log("❌ Database connection failed. Retrying in 5s...", err.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error("❌ Could not connect to database after multiple retries");
    process.exit(1);
};

connectWithRetry();

// Routes

// GET all tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST new task
app.post("/api/tasks", async (req, res) => {
    const { text, details, priority, category, dueDate, subtasks, timeEstimate, recurrence } = req.body;
    try {
        const result = await pool.query(
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

// PUT update task
app.put("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { text, details, completed, priority, category, dueDate, subtasks, timeEstimate, isArchived, recurrence } = req.body;
    
    try {
        const result = await pool.query(
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
            [
                text, 
                details, 
                completed, 
                priority, 
                category, 
                dueDate, 
                subtasks ? JSON.stringify(subtasks) : null,
                timeEstimate,
                isArchived,
                recurrence,
                id
            ]
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

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

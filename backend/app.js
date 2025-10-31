import express from "express";
import cors from "cors";

const app = express();
const PORT = 8080;

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Bienvenue sur le backend Node.js 🚀" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});

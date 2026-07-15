import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory sessions map
const sessions = new Map<string, any>();
const SESSIONS_FILE = path.join(process.cwd(), "src", "data", "sessions.json");

// Helper to load sessions from disk on startup
const loadSessionsFromDisk = () => {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      Object.entries(parsed).forEach(([code, state]) => {
        sessions.set(code.toUpperCase(), state);
      });
      console.log(`Loaded ${sessions.size} sessions from disk.`);
    }
  } catch (error) {
    console.error("Failed to load sessions from disk:", error);
  }
};

// Helper to save sessions to disk
const saveSessionsToDisk = () => {
  try {
    const dir = path.dirname(SESSIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save sessions to disk:", error);
  }
};

// Initial load
loadSessionsFromDisk();

// Generate a random 6-character alphanumeric game code (uppercase, readable, avoiding ambiguous chars)
const generateGameCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitted 0, 1, I, O for readability
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// API: Save game session
app.post("/api/save-session", (req, res) => {
  try {
    const { state, code } = req.body;
    if (!state) {
      return res.status(400).json({ error: "Missing game state" });
    }

    let sessionCode = code ? code.toUpperCase() : generateGameCode();
    let currentSession = sessions.get(sessionCode) || { gameState: {}, chat: [] };
    
    // Save state inside gameState
    currentSession.gameState = state;
    currentSession.updatedAt = new Date().toISOString();

    sessions.set(sessionCode, currentSession);
    saveSessionsToDisk();

    console.log(`Session saved successfully under code: ${sessionCode}`);
    res.json({ success: true, code: sessionCode });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Send dynamic chat message
app.post("/api/chat/send", (req, res) => {
  try {
    const { code, sender, text, icon } = req.body;
    if (!code || !sender || !text) {
      return res.status(400).json({ error: "Chybí povinné parametry zprávy" });
    }

    const sessionCode = code.toUpperCase();
    let currentSession = sessions.get(sessionCode);
    if (!currentSession) {
      currentSession = { gameState: null, chat: [] };
    }

    if (!currentSession.chat) {
      currentSession.chat = [];
    }

    const newMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender,
      text,
      icon: icon || "💬",
      timestamp: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
    };

    currentSession.chat.push(newMessage);
    if (currentSession.chat.length > 60) {
      currentSession.chat.shift();
    }

    currentSession.updatedAt = new Date().toISOString();
    sessions.set(sessionCode, currentSession);
    saveSessionsToDisk();

    res.json({ success: true, chat: currentSession.chat });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Load game session
app.get("/api/load-session/:code", (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    if (!sessions.has(code)) {
      return res.status(404).json({ error: "Herní kód nebyl nalezen. Zkontrolujte prosím zadání." });
    }

    const sessionData = sessions.get(code);
    const state = sessionData.gameState !== undefined ? sessionData.gameState : sessionData;
    const chat = sessionData.chat || [];

    res.json({ success: true, state, chat });
  } catch (error) {
    console.error("Error loading session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Get quick session sync (state + chat)
app.get("/api/session-sync/:code", (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    if (!sessions.has(code)) {
      return res.status(404).json({ error: "Session not found" });
    }

    const sessionData = sessions.get(code);
    const state = sessionData.gameState !== undefined ? sessionData.gameState : sessionData;
    const chat = sessionData.chat || [];

    res.json({
      success: true,
      state,
      chat,
      updatedAt: sessionData.updatedAt
    });
  } catch (error) {
    console.error("Error syncing session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Integration with Vite
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite();

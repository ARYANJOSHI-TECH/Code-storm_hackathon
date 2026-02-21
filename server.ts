import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Supabase Setup
let supabaseClient: any = null;
const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
    }
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseClient;
};

// Auth Middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

import { getOpenAI, SYSTEM_PROMPT, ROADMAP_PROMPT } from "./src/services/openaiService";

// Generate Roadmap (OpenAI)
app.post("/api/generate-roadmap", authenticateUser, async (req: any, res: any) => {
  const userId = req.user.id;

  try {
    const supabase = getSupabase();
    
    // Get user's latest audit
    const { data: audits, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (auditError || !audits || audits.length === 0) {
      return res.status(404).json({ error: "No audit found. Please complete an audit first." });
    }

    const latestAudit = audits[0];
    const openai = getOpenAI();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ROADMAP_PROMPT },
        { 
          role: "user", 
          content: `Generate a roadmap for this user based on their latest audit: ${JSON.stringify(latestAudit)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const roadmap = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(roadmap);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate roadmap" });
  }
});

// Generate Audit (OpenAI + Supabase)
app.post("/api/generate-audit", authenticateUser, async (req: any, res: any) => {
  const inputData = req.body;
  const userId = req.user.id;

  console.log("Generating audit for user:", userId);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Analyze this user's life system using their data: ${JSON.stringify(inputData)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    console.log("AI Response generated successfully");

    // Save to Supabase
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("audits")
      .insert([
        {
          user_id: userId,
          input_data: inputData,
          ai_response: aiResponse,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    res.json(aiResponse);
  } catch (error: any) {
    console.error("Audit generation error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate audit",
      details: "Check if OPENAI_API_KEY and SUPABASE keys are set in Secrets."
    });
  }
});

// Get History
app.get("/api/my-audits", authenticateUser, async (req: any, res: any) => {
  const userId = req.user.id;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // Production static serving
      app.use(express.static("dist"));
      app.get("*", (req, res) => {
        res.sendFile("dist/index.html", { root: "." });
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

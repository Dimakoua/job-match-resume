const path = require("path");

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { optimizeResumeWithAI } = require("./server/ai");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Serve the frontend assets
app.use(express.static(path.join(__dirname, "public")));
app.use("/libs", express.static(path.join(__dirname, "libs")));

app.post("/api/optimize", async (req, res) => {
  const { resumeText, jobDescription, ai } = req.body;

  if (!resumeText || !jobDescription || !ai?.model) {
    return res.status(400).json({
      message: "Resume, job description, and AI settings are required."
    });
  }

  try {
    const result = await optimizeResumeWithAI(resumeText, jobDescription, ai);
    return res.json(result);
  } catch (error) {
    console.error("Error optimizing resume:", error);
    return res.status(500).json({
      message: error.message || "An unexpected error occurred while contacting the AI provider."
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`AI Resume Optimizer is running on http://localhost:${PORT}`);
});

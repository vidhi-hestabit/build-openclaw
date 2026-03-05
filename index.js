import express from "express";
import { run } from "./agent.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Agent server running");
});

app.post("/message", async (req, res) => {
  try {
    const message = req.body.message;

    const result = await run(message);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Agent failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });
  
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});
import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API endpoint for streaming chatbot responses
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).send("Message is required");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Replace with your desired model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/plain");

    // Stream response to the client
    for await (const chunk of completion) {
      const content = chunk.choices[0].delta.content || "";
      res.write(content);
    }

    res.end();
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
    res.status(500).send("Error communicating with ChatGPT");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

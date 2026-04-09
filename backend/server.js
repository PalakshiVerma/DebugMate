const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('DebugMate backend is running');
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/suggest-fix", async (req, res) => {
  try {
    const { language, code, error, expected } = req.body;

    if (!code || !error) {
      return res.status(400).json({
        error: "Code snippet and error message are required."
      });
    }

    const prompt = `
You are a debugging assistant for beginner developers.

The user will provide:
- Programming language
- Code snippet
- Error message
- Expected behavior

Your task:
1. Provide a short summary of the issue.
2. Identify the root cause.
3. Suggest 2 to 3 clear steps to fix it.
4. Provide a corrected code example if possible.
5. Generate a short auto session title (e.g., "JS null error", "Python index issue").

Return the response in valid JSON with this exact structure:
{
  "title": "short session title",
  "summary": "short explanation",
  "cause": "likely reason",
  "fixSteps": ["step 1", "step 2"],
  "fixedCode": "corrected code here"
}

Programming Language:
${language || "Not specified"}

Code Snippet:
${code}

Error Message:
${error}

Expected Behavior:
${expected || "Not provided"}

Keep the explanation beginner-friendly, concise, and practical. Avoid long overwhelming responses.
`;

    const modelName = "gemini-1.5-flash";
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("Gemini API error details:", JSON.stringify(data, null, 2));
      let userMessage = data.error?.message || "Unknown AI error";
      
      if (data.error?.code === 503) {
        userMessage = "The AI service is currently overloaded. Please wait a moment and try again.";
      } else if (data.error?.status === "PERMISSION_DENIED") {
        userMessage = "API Key error. Check your GEMINI_API_KEY.";
      }

      return res.status(aiResponse.status).json({
        error: "AI API request failed.",
        message: userMessage,
        details: data
      });
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return res.status(500).json({
        error: "No response received from AI."
      });
    }

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.status(500).json({
        error: "AI returned invalid JSON.",
        raw: content
      });
    }

    res.json(parsedResponse);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
});

app.post("/chat-debug", async (req, res) => {
  try {
    const { language, code, error, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemInstruction = `You are a beginner-friendly debugging assistant.
Language: ${language || "Not specified"}
Original Error: ${error || "Not specified"}
Original Code:
${code || "Not provided"}

Your job is to explain bugs simply, answer follow-up questions, give fixes when needed, and stay beginner-friendly.
RULES:
- Answer ONLY what the user asks.
- Do NOT repeat the full explanation of the original issue.
- Keep responses extremely concise. Avoid long, overwhelming responses.
- Prioritize clarity and step-by-step guidance.`;

    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const modelName = "gemini-1.5-flash";
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("Gemini API error details:", JSON.stringify(data, null, 2));
      let userMessage = data.error?.message || "Unknown AI error";
      
      if (data.error?.code === 503) {
        userMessage = "The AI service is currently overloaded. Please wait a moment and try again.";
      } else if (data.error?.status === "PERMISSION_DENIED") {
        userMessage = "API Key error. Check your GEMINI_API_KEY.";
      }

      return res.status(aiResponse.status).json({
        error: "AI API request failed.",
        message: userMessage,
        details: data
      });
    }

    const replyContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyContent) {
      return res.status(500).json({
        error: "No response received from AI."
      });
    }

    res.json({ reply: replyContent });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
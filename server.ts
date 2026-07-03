import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from "express-rate-limit";
import * as dotenv from "dotenv";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Rate limiter for AI endpoint
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});

// Auth middleware for AI endpoint
const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.OPERATOR_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// API routes FIRST
app.post("/api/analyze-equipment", aiLimiter, requireApiKey, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are an AI vision system for a plant-hire platform.  
Your task is to analyse an uploaded photo of a machine and estimate its ACCESS WIDTH (in millimetres).

Follow this structured process:

1. IDENTIFY THE MACHINE
From the image, determine:
- Brand (e.g., Kubota, JCB, Thwaites, Niftylift, Wacker Neuson)
- Model (if visible)
- Machine type (excavator, dumper, compactor, access platform, generator, etc.)
- Weight class (e.g., 1T, 1.5T, 3T)
- Track or wheel configuration
- Attachments or modifications that affect width (e.g., expandable tracks, wide bucket, stabilisers)

2. DETECT WIDTH CUES FROM THE IMAGE
Use visual cues to estimate physical width:
- Track-to-track distance
- Tyre-to-tyre distance
- Chassis width
- Bucket or attachment overhang
- Operator standing nearby (use human height as scale reference)
- Known proportions of common models
- Perspective correction (if angled)

3. CROSS‑CHECK AGAINST KNOWN MANUFACTURER SPECS
If the model is identifiable:
- Retrieve typical width range for that model
- Adjust estimate based on visible configuration (e.g., tracks expanded vs retracted)

If the model is NOT identifiable:
- Use typical width ranges for the machine class:
  - Micro digger: 700–760mm
  - 1.5T mini digger: 980–1050mm
  - 3T digger: 1500–1700mm
  - 1T dumper: 1100–1200mm
  - Track barrow: 650–750mm
  - Scissor lift (indoor): 760–820mm
  - Plate compactor: 400–600mm

4. OUTPUT A SINGLE ACCESS WIDTH VALUE
Return:
- access_width_mm (integer)
- confidence score (0–1)
- reasoning summary (1–2 sentences)

5. OUTPUT FORMAT (JSON)
{
  "access_width_mm": <number>,
  "confidence": <0–1>,
  "reasoning": "<short explanation>"
}

If confidence is below 0.4:
- Ask the user for brand + model to refine the estimate.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            access_width_mm: { type: Type.INTEGER },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["access_width_mm", "confidence", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), 'public')));
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

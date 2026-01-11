
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, MindMapData, ExamUpdate } from "../types";

// Always create a new instance right before use to get latest API key
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const SCHEMA_MINDMAP = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          group: { type: Type.NUMBER },
          details: { 
            type: Type.STRING, 
            description: "A concise definition and at least one exam-relevant example for this topic." 
          }
        },
        required: ['id', 'label', 'group', 'details']
      }
    },
    links: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING }
        },
        required: ['source', 'target']
      }
    }
  },
  required: ['nodes', 'links']
};

export const getTutorResponse = async (query: string, history: any[], imageBase64?: string) => {
  const ai = getAI();
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are an intelligent academic tutor for competitive exams (JEE/NEET). Provide clear, concise, and accurate step-by-step explanations. If an image is provided, analyze the problem or concept thoroughly.',
    },
    history: history.slice(-10).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  });

  const messageParts: any[] = [{ text: query }];
  if (imageBase64) {
    messageParts.push({
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg"
      }
    });
  }

  return await chat.sendMessageStream({ 
    message: { parts: messageParts } 
  });
};

export const getExamUpdates = async (): Promise<ExamUpdate[]> => {
  const ai = getAI();
  
  // Step 1: Search for comprehensive info including Private Entrances and NIAT
  const searchResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: 'Current status, exam dates, and application deadlines for: 1. JEE Main, JEE Advanced, NEET. 2. Major Private University Entrances (BITSAT, VITEEE, SRMJEEE, MET). 3. NIAT (National Institute of Applied Technology) exams. 4. Major State CETs. Find Exam Date and Application Last Date for each for the 2024-25 session.' }] }],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawInfo = searchResponse.text;

  // Step 2: Structure into JSON (Increased count to 12 to cover all requested categories)
  const structureResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Based on this information, create a JSON array of the top 12 most relevant exams. Ensure coverage of National, Private, and NIAT exams. For each, provide "name", "date", and "deadline" (Application Last Date). If a date is not specific, use "TBA".\n\nInfo: ${rawInfo}` }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            date: { type: Type.STRING },
            deadline: { type: Type.STRING }
          },
          required: ['name', 'date', 'deadline']
        }
      }
    }
  });

  try {
    return JSON.parse(structureResponse.text.trim());
  } catch (e) {
    console.error("Failed to parse exam updates", e);
    return [];
  }
};

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt || "Analyze this image accurately. Solve any problems or explain any diagrams shown." }
      ]
    }
  });
  return response.text;
};

export const generateMindMap = async (topic: string): Promise<MindMapData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate a detailed hierarchical mind map structure for the study topic: ${topic}. For every node, you MUST provide a detailed "details" field containing a definition and an example for competitive exams.` }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: SCHEMA_MINDMAP
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text || '{"nodes":[], "links":[]}');
  } catch (e) {
    console.error("Failed to parse mind map JSON", e);
    return { nodes: [{ id: "1", label: topic, group: 0, details: "Concept summary not available." }], links: [] };
  }
};

export const generateMindMapFromImage = async (base64Image: string, mimeType: string): Promise<MindMapData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Analyze these handwritten notes or diagram and convert them into a detailed hierarchical mind map structure. For every concept identified, include a 'details' field with a definition and example." }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: SCHEMA_MINDMAP
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text || '{"nodes":[], "links":[]}');
  } catch (e) {
    console.error("Failed to parse vision mind map JSON", e);
    return { nodes: [{ id: "1", label: "Scanned Notes", group: 0, details: "Content processed from image." }], links: [] };
  }
};

export const generateShortNotes = async (content: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Convert the following academic content into exam-focused short notes with key formulas and definitions: ${content}` }] }],
  });
  return response.text;
};

export const solveDoubt = async (doubt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Solve this competitive exam problem with a step-by-step derivation and clear explanation: ${doubt}` }] }],
  });
  return response.text;
};

export const generateQuiz = async (topic: string, difficulty: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate a high-quality 5-question MCQ quiz on ${topic} at a ${difficulty} difficulty level for JEE/NEET practice.` }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ['question', 'options', 'correctAnswer', 'explanation']
        }
      }
    }
  });
  
  try {
    const text = response.text.trim();
    return JSON.parse(text || '[]');
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    return [];
  }
};

export const generateImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAI();
  const model = 'gemini-2.5-flash-image';
  
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  
  throw new Error("Failed to generate image: No image part in model response");
};

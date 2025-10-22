// services/geminiService.ts

import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import type { ChatMessage, GroundingSource } from "../types.ts";

let ai: GoogleGenAI;
const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set. For video generation, please use the 'Select API Key' button.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};


// For Chatbot
let chat: Chat;

export const startChat = () => {
  const ai = getAI();
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
  });
};

export const sendMessage = async (message: string): Promise<ChatMessage> => {
  if (!chat) {
    startChat();
  }
  const response: GenerateContentResponse = await chat.sendMessage({ message });
  const text = response.text;
  return { id: `model-${Date.now()}`, role: 'model', text };
};

// For Image Generation
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// For Image Editing
export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image was generated.");
};


// For Video Generation
export const generateVideoFromImage = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    // A new instance must be created before each call to use the latest key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation did not produce a download link.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

// For Audio Transcription
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    // Gemini doesn't have a direct "transcribe" endpoint like this. We use generateContent.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using a powerful model for good transcription
        contents: {
            parts: [
                { inlineData: { data: audioBase64, mimeType } },
                { text: "Transcribe the following audio recording." }
            ]
        }
    });
    return response.text;
};

// For Text-to-Speech
export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("TTS generation failed, no audio data received.");
    }
    return base64Audio;
};

// For Grounded Search
export const runGroundedSearch = async (query: string): Promise<{ text: string, sources: GroundingSource[] }> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: query,
       config: {
         tools: [{googleSearch: {}}],
       },
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
        text: response.text,
        sources: groundingChunks as GroundingSource[],
    };
};

// For Complex Reasoning
export const runComplexReasoning = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Pro model for better reasoning
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
        }
    });
    return response.text;
};
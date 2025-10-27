

import { GoogleGenAI, Chat as ChatSession, Modality, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GroundingSource } from "../types.ts";

// NOTE: A new GoogleGenAI instance must be created for Veo models right before the API call.
// This instance is for all other models.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: ChatSession | null = null;
let liteChat: ChatSession | null = null;

export const startChat = () => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
    });
};

export const sendMessage = async (message: string): Promise<ChatMessage> => {
    if (!chat) {
        startChat();
    }
    if (!chat) { // startChat should initialize it, but as a fallback
        throw new Error("Chat session not initialized.");
    }

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return {
        id: `model-${Date.now()}`,
        role: 'model',
        text: response.text,
        timestamp: new Date(),
    };
};

export const startLiteChat = () => {
    liteChat = ai.chats.create({
        model: 'gemini-flash-lite-latest',
    });
};

export const sendLiteMessage = async (message: string): Promise<ChatMessage> => {
    if (!liteChat) {
        startLiteChat();
    }
    if (!liteChat) {
        throw new Error("Lite Chat session not initialized.");
    }
    const response: GenerateContentResponse = await liteChat.sendMessage({ message });
    return {
        id: `model-${Date.now()}`,
        role: 'model',
        text: response.text,
        timestamp: new Date(),
    };
};

export const generateText = async (
    prompt: string,
    config: {
        model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
        systemInstruction?: string;
        temperature?: number;
        topP?: number;
        topK?: number;
    } = {}
): Promise<string> => {
    const {
        model = 'gemini-2.5-flash',
        systemInstruction,
        temperature,
        topP,
        topK
    } = config;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction,
            temperature,
            topP,
            topK,
        },
    });

    return response.text;
};


export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
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

export const generateVideoFromImage = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    // Per Veo guidelines, create a new instance right before the call.
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await videoAI.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await videoAI.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed to produce a download link.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateVideoFromText = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await videoAI.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await videoAI.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed to produce a download link.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: audioBase64,
                        mimeType: mimeType,
                    }
                },
                {
                    text: "Transcribe the following audio.",
                }
            ]
        }
    });

    return response.text;
};

export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: text }] }],
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
        throw new Error("Failed to generate audio.");
    }
    return base64Audio;
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
    });

    return response.text;
};


export const runGroundedSearch = async (query: string): Promise<{ text: string, sources: GroundingSource[] }> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks.map(chunk => ({ web: chunk.web })).filter(s => s.web);

    return {
        text: response.text,
        sources: sources,
    };
};

export const runComplexReasoning = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: {
                thinkingBudget: 32768,
            },
        },
    });
    return response.text;
};
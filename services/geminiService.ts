import { GoogleGenAI } from "@google/genai";
import { Participant } from "../types";

// Note: In a real production app, API keys should be handled via a proxy server 
// to avoid exposing them in client-side code.
const apiKey = process.env.API_KEY || ''; 

export const analyzeAttendance = async (meetingName: string, participants: Participant[]): Promise<string> => {
  if (!apiKey) {
    return "Erro: Chave de API não configurada. Configure process.env.API_KEY.";
  }

  if (participants.length === 0) {
    return "Nenhum participante para analisar.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare data for the model
  const dataSummary = participants.map(p => `- ${p.fullName} (${p.entity})`).join('\n');

  const prompt = `
    Analise a lista de presença para a reunião "${meetingName}".
    
    Dados dos participantes:
    ${dataSummary}

    Por favor, forneça um resumo executivo curto e profissional em Markdown que inclua:
    1. Total de participantes.
    2. Principais entidades/organizações representadas (agrupamento).
    3. Uma breve observação sobre a diversidade do público.
    
    Mantenha o tom formal e corporativo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com a IA para análise.";
  }
};

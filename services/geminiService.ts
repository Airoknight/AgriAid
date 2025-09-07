import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { DiseaseInfo, SolutionInfo } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const predictDiseases = async (crop: string, daysPlanted: number): Promise<DiseaseInfo[]> => {
  const prompt = `
    You are an expert agricultural pathologist. A farmer planted ${crop} about ${daysPlanted} days ago.
    Based on the crop and its approximate growth stage, predict 2 to 4 of the most common potential diseases it might face.
    For each disease, provide a short, one-sentence description of its key visual symptom.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diseases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The common name of the plant disease." },
                description: { type: Type.STRING, description: "A brief, one-sentence description of the disease's appearance." },
              },
              required: ["name", "description"]
            }
          }
        },
        required: ["diseases"]
      }
    }
  });

  const jsonText = response.text.trim();
  const result = JSON.parse(jsonText);
  return result.diseases as DiseaseInfo[];
};

export const visualizeDisease = async (
  crop: string,
  diseaseName: string,
  plantImage?: { mimeType: string; data: string; }
): Promise<string> => {
  if (plantImage) {
    // Case 1: User provided an image, so we edit it.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: plantImage.data,
                        mimeType: plantImage.mimeType,
                    },
                },
                {
                    text: `This is a photo of a farmer's plant. Edit this image to show clear, distinct, and realistic visual symptoms of a plant disease called "${diseaseName}". The edit should be seamless and focus on the parts of the plant typically affected (leaves, stem, etc.). Make the symptoms obvious and easy for a farmer to identify on their own plant. Do not add any text or labels to the image.`,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error('Image editing failed: No image was returned by the model.');
  } else {
    // Case 2: No image provided, generate one from text.
    const prompt = `A photorealistic, high-resolution, close-up image of a ${crop} plant clearly showing the symptoms of ${diseaseName}. The image must focus on the affected parts of the plant (e.g., leaves, stem, fruit) with an accurate and detailed visual representation of the disease. The background should be a natural, slightly blurred farm or garden environment. The image should look like a real photograph.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    throw new Error('Image generation failed: No image was returned by the model.');
  }
};


export const getSolution = async (crop: string, diseaseName: string): Promise<SolutionInfo> => {
    const prompt = `
        You are an expert agricultural advisor. A farmer needs a simple, clear, and actionable treatment plan for their ${crop} plants, which are showing symptoms of ${diseaseName}.
        Provide a step-by-step guide with practical advice.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    immediateActions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Urgent first steps to contain the problem (e.g., isolate plant, remove affected leaves)."
                    },
                    recommendedTreatments: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Specific organic or conventional treatments to apply."
                    },
                    longTermPrevention: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Strategies to prevent the disease from recurring in the future (e.g., crop rotation, soil health)."
                    }
                },
                required: ["immediateActions", "recommendedTreatments", "longTermPrevention"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SolutionInfo;
};
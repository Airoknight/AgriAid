export enum AppState {
  UserInput,
  DiseaseSelection,
  Solution,
}

export interface UserData {
  crop: string;
  daysPlanted: number;
  plantImage?: {
    mimeType: string;
    data: string;
  };
}

export interface DiseaseInfo {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface SolutionInfo {
  immediateActions: string[];
  recommendedTreatments: string[];
  longTermPrevention: string[];
}
import React, { useEffect, useCallback } from 'react';
import { UserData, DiseaseInfo, SolutionInfo } from '../types';
import { getSolution } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { useTTS } from '../hooks/useTTS';
import { ArrowLeftIcon, SpeakerOnIcon, SpeakerOffIcon, CheckCircleIcon, BeakerIcon, ShieldCheckIcon } from './IconComponents';

interface Step3Props {
  disease: DiseaseInfo;
  userData: UserData;
  solution: SolutionInfo | null;
  setSolution: React.Dispatch<React.SetStateAction<SolutionInfo | null>>;
  onReset: () => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const SolutionCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="bg-slate-50 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        </div>
        <ul className="space-y-3 text-slate-600 list-disc list-inside">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);


const Step3Solution: React.FC<Step3Props> = ({
  disease,
  userData,
  solution,
  setSolution,
  onReset,
  isLoading,
  setIsLoading,
  setLoadingMessage,
  error,
  setError,
}) => {
  const { isSpeaking, isSupported, speak, stop } = useTTS();

  const fetchSolution = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage(`Generating a treatment plan for ${disease.name}...`);
    setError(null);
    try {
      const result = await getSolution(userData.crop, disease.name);
      setSolution(result);
    } catch (err)
 {
      const error = err as Error;
      setError(`Failed to get a solution: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [disease.name, userData.crop, setIsLoading, setLoadingMessage, setError, setSolution]);

  useEffect(() => {
    if (!solution) {
      fetchSolution();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solution, fetchSolution]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <LoadingSpinner className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold text-slate-700">Generating Action Plan...</p>
        <p className="text-slate-500">Crafting a detailed solution for you.</p>
      </div>
    );
  }
  
  const handleToggleSpeak = () => {
      if (isSpeaking) {
          stop();
      } else if(solution) {
          const textToRead = `
            Action plan for ${disease.name}.
            Immediate Actions: ${solution.immediateActions.join('. ')}.
            Recommended Treatments: ${solution.recommendedTreatments.join('. ')}.
            Long-Term Prevention: ${solution.longTermPrevention.join('. ')}.
          `;
          speak(textToRead);
      }
  }

  return (
    <div>
        <div className="relative mb-8 text-center">
            <button onClick={onReset} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors p-2 rounded-full hover:bg-slate-100">
                <ArrowLeftIcon className="w-6 h-6"/>
                <span className="sr-only">Start Over</span>
            </button>
            <h2 className="text-2xl font-semibold text-slate-700">Action Plan for {disease.name}</h2>
        </div>

        {error && (
             <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
                <button onClick={onReset} className="mt-4 bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                    Start Over
                </button>
            </div>
        )}

      {solution && (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
                 <img src={disease.imageUrl} alt={disease.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
                 <p className="text-sm text-slate-600 mt-4 italic">{disease.description}</p>
                 {isSupported && (
                    <button onClick={handleToggleSpeak} className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-slate-300">
                        {isSpeaking ? <SpeakerOffIcon className="w-5 h-5"/> : <SpeakerOnIcon className="w-5 h-5"/>}
                        {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                    </button>
                 )}
            </div>
            <div className="md:w-2/3">
                <SolutionCard 
                    title="Immediate Actions" 
                    items={solution.immediateActions}
                    icon={<CheckCircleIcon className="w-7 h-7 mr-3 text-red-500" />}
                />
                <SolutionCard 
                    title="Recommended Treatments" 
                    items={solution.recommendedTreatments}
                    icon={<BeakerIcon className="w-7 h-7 mr-3 text-blue-500" />}
                />
                <SolutionCard 
                    title="Long-Term Prevention" 
                    items={solution.longTermPrevention}
                    icon={<ShieldCheckIcon className="w-7 h-7 mr-3 text-green-500" />}
                />
            </div>
        </div>
      )}

      <div className="text-center mt-12">
        <button onClick={onReset} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors">
          Start a New Analysis
        </button>
      </div>
    </div>
  );
};

export default Step3Solution;

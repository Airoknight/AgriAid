import React, { useEffect, useCallback } from 'react';
import { UserData, DiseaseInfo } from '../types';
import { predictDiseases, visualizeDisease } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { ArrowLeftIcon } from './IconComponents';

interface Step2Props {
  userData: UserData;
  diseases: DiseaseInfo[];
  setDiseases: React.Dispatch<React.SetStateAction<DiseaseInfo[]>>;
  onSelect: (disease: DiseaseInfo) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImagePlaceholder: React.FC = () => (
    <div className="w-full h-48 bg-slate-200 rounded-lg animate-pulse flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    </div>
);


const Step2DiseaseSelection: React.FC<Step2Props> = ({
  userData,
  diseases,
  setDiseases,
  onSelect,
  onBack,
  isLoading,
  setIsLoading,
  // FIX: Destructure loadingMessage prop to make it available in the component.
  loadingMessage,
  setLoadingMessage,
  error,
  setError,
}) => {

  const fetchAndProcessDiseases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Identifying potential diseases...');
      const potentialDiseases = await predictDiseases(userData.crop, userData.daysPlanted);
      setDiseases(potentialDiseases.map(d => ({ ...d, imageUrl: undefined })));

      for (let i = 0; i < potentialDiseases.length; i++) {
        const disease = potentialDiseases[i];
        setLoadingMessage(`Visualizing ${disease.name} (${i + 1}/${potentialDiseases.length})...`);
        try {
          const imageUrl = await visualizeDisease(userData.crop, disease.name, userData.plantImage);
          setDiseases(prev =>
            prev.map(d => (d.name === disease.name ? { ...d, imageUrl } : d))
          );
        } catch (imageError) {
          console.error(`Failed to generate image for ${disease.name}:`, imageError);
          // Keep going even if one image fails
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(`Failed to predict diseases: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [userData, setIsLoading, setLoadingMessage, setError, setDiseases]);


  useEffect(() => {
    if (diseases.length === 0) {
      fetchAndProcessDiseases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && diseases.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <LoadingSpinner className="w-12 h-12 mb-4" />
            <p className="text-lg font-semibold text-slate-700">{loadingMessage || 'Analyzing...'}</p>
            <p className="text-slate-500">Please wait while we process your crop information.</p>
        </div>
     );
  }

  return (
    <div>
        <div className="relative mb-8 text-center">
            <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors p-2 rounded-full hover:bg-slate-100">
                <ArrowLeftIcon className="w-6 h-6"/>
                <span className="sr-only">Go Back</span>
            </button>
            <h2 className="text-2xl font-semibold text-slate-700">Potential Diseases</h2>
            <p className="text-slate-500 mt-1">Select the image that most closely matches your plant's symptoms.</p>
        </div>

      {isLoading && <p className="text-center text-emerald-600 font-semibold mb-4 animate-pulse">{loadingMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map((disease) => (
          <div
            key={disease.name}
            onClick={() => disease.imageUrl && onSelect(disease)}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${disease.imageUrl ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'cursor-wait'}`}
            role="button"
            tabIndex={disease.imageUrl ? 0 : -1}
            onKeyDown={(e) => disease.imageUrl && (e.key === 'Enter' || e.key === ' ') && onSelect(disease)}
          >
            {disease.imageUrl ? (
              <img src={disease.imageUrl} alt={`Visualization of ${disease.name}`} className="w-full h-48 object-cover" />
            ) : (
                <ImagePlaceholder />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-slate-800">{disease.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{disease.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step2DiseaseSelection;
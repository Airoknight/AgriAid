
import React, { useState } from 'react';
import { AppState, UserData, DiseaseInfo, SolutionInfo } from './types';
import Step1UserInput from './components/Step1_UserInput';
import Step2DiseaseSelection from './components/Step2_DiseaseSelection';
import Step3Solution from './components/Step3_Solution';
import { LeafIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [step, setStep] = useState<AppState>(AppState.UserInput);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [diseases, setDiseases] = useState<DiseaseInfo[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);
  const [solution, setSolution] = useState<SolutionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleStart = (data: UserData) => {
    setUserData(data);
    setStep(AppState.DiseaseSelection);
  };

  const handleDiseaseSelect = (disease: DiseaseInfo) => {
    setSelectedDisease(disease);
    setStep(AppState.Solution);
  };

  const handleReset = () => {
    setStep(AppState.UserInput);
    setUserData(null);
    setDiseases([]);
    setSelectedDisease(null);
    setSolution(null);
    setError(null);
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case AppState.UserInput:
        return (
          <Step1UserInput
            onStart={handleStart}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        );
      case AppState.DiseaseSelection:
        return (
          <Step2DiseaseSelection
            userData={userData!}
            onSelect={handleDiseaseSelect}
            onBack={handleReset}
            diseases={diseases}
            setDiseases={setDiseases}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            loadingMessage={loadingMessage}
            setLoadingMessage={setLoadingMessage}
            error={error}
            setError={setError}
          />
        );
      case AppState.Solution:
        return (
          <Step3Solution
            disease={selectedDisease!}
            userData={userData!}
            onReset={handleReset}
            solution={solution}
            setSolution={setSolution}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            loadingMessage={loadingMessage}
            setLoadingMessage={setLoadingMessage}
            error={error}
            setError={setError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <LeafIcon className="w-10 h-10 text-emerald-500" />
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">AgriAid</h1>
          </div>
          <p className="text-slate-600">Your AI-powered partner in crop health.</p>
        </header>
        <main className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 transition-all duration-500 min-h-[500px]">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          )}
          {renderStep()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by Gemini AI. For informational purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

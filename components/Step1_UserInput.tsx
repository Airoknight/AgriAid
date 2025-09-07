import React, { useState, useRef } from 'react';
import { UserData } from '../types';
import { CameraIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

interface Step1Props {
  onStart: (data: UserData) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const Step1UserInput: React.FC<Step1Props> = ({ onStart, isLoading, setIsLoading, setError }) => {
  const [crop, setCrop] = useState('');
  const [daysPlanted, setDaysPlanted] = useState('');
  const [plantImage, setPlantImage] = useState<{ mimeType: string, data: string, preview: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file (e.g., JPEG, PNG).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          setPlantImage({
            mimeType: file.type,
            data: base64String,
            preview: URL.createObjectURL(file)
          });
          setError(null);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop || !daysPlanted) {
      setError('Please fill in crop and planting day information.');
      return;
    }
    setError(null);
    setIsLoading(true);
    onStart({
      crop,
      daysPlanted: parseInt(daysPlanted, 10),
      plantImage: plantImage ? { mimeType: plantImage.mimeType, data: plantImage.data } : undefined
    });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-semibold text-slate-700 mb-2">Welcome, Farmer!</h2>
      <p className="text-slate-500 mb-8 max-w-md">Let's analyze your crop's health. Please provide some details below.</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <label htmlFor="crop" className="block text-sm font-medium text-slate-700 text-left mb-1">
            What crop did you plant?
          </label>
          <input
            type="text"
            id="crop"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder="e.g., Tomato, Corn, Wheat"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="days" className="block text-sm font-medium text-slate-700 text-left mb-1">
            How many days ago was it planted?
          </label>
          <input
            type="number"
            id="days"
            value={daysPlanted}
            onChange={(e) => setDaysPlanted(e.target.value)}
            placeholder="e.g., 30"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-slate-900"
            required
            min="1"
          />
        </div>
        
        <div>
          <label htmlFor="plant-photo" className="block text-sm font-medium text-slate-700 text-left mb-1">
            Photo of Your Plant (Optional)
          </label>
          <div 
            className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Upload a photo of your plant"
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="sr-only"
              id="plant-photo"
            />
            {plantImage ? (
              <img src={plantImage.preview} alt="Plant preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <CameraIcon className="w-10 h-10 mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-semibold">Add a Photo</p>
                <p className="text-xs">Click here to select an image</p>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !crop || !daysPlanted}
          className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : 'Analyze Crop Health'}
        </button>
      </form>
    </div>
  );
};

export default Step1UserInput;
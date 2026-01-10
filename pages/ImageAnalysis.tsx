
import React, { useState, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Upload, Loader2, Scan, Brain, Sparkles } from 'lucide-react';
import FormattedContent from '../components/FormattedContent';

interface ImageAnalysisProps {
  onApiError?: (err: any) => void;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ onApiError }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const base64 = selectedImage.split(',')[1];
      const res = await analyzeImage(base64, "image/jpeg", "Perform a deep, complex academic analysis of this image. Identify any problems, diagrams, or notes and explain them with 100% accuracy using professional reasoning.");
      setAnalysis(res);
    } catch (err) {
      onApiError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Scan size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Visual Problem Solver</h2>
        <p className="text-gray-500 mb-8">Upload a photo of any academic problem, diagram, or page from your textbook for deep analysis.</p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          {selectedImage ? (
            <img src={selectedImage} alt="Selected" className="max-h-64 mx-auto rounded-lg shadow-md" />
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto text-gray-400 group-hover:text-blue-500 transition-colors" size={48} />
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />

        <button 
          onClick={handleAnalyze}
          disabled={!selectedImage || loading}
          className="mt-8 w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Brain className="mr-2" />}
          {loading ? "Thinking Deeply..." : "Analyze with AI"}
        </button>
      </div>

      {analysis && (
        <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center space-x-2 mb-6 text-blue-600">
            <Sparkles size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Deep Analysis Report</h3>
          </div>
          <FormattedContent content={analysis} />
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;

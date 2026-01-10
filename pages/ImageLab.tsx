
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Sparkles, Download, RefreshCw } from 'lucide-react';

interface ImageLabProps {
  onApiError?: (err: any) => void;
}

const ImageLab: React.FC<ImageLabProps> = ({ onApiError }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const url = await generateImage(prompt, size);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("403") || err.message?.includes("permission") || err.message?.includes("not found")) {
        onApiError?.(err);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `gradly-diagram-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Sparkles className="text-blue-600 mr-2" size={20} />
              Visual Concept Lab
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Create high-quality diagrams, flowcharts, or conceptual art to better understand complex topics.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Diagram Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A detailed 3D scientific diagram of a human cell with labeled mitochondria and nucleus..."
                  className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Resolution Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["1K", "2K", "4K"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-2 rounded-lg border text-sm font-bold transition-all ${
                        size === s ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Higher resolution takes longer to generate.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <ImageIcon className="mr-2" />}
                Generate Diagram
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium">
                {error}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Pro Tips for Diagrams</h4>
            <ul className="text-[11px] text-blue-700 space-y-1 list-disc pl-4">
              <li>Specify colors for different components.</li>
              <li>Ask for a "clean white background".</li>
              <li>Include terms like "isometric view" or "cutaway".</li>
              <li>Mention "high detail" for complex structures.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={32} />
                </div>
                <p className="mt-6 font-bold text-gray-700">Brewing your visual aid...</p>
                <p className="text-sm text-gray-500 mt-1">Applying {size} resolution rendering</p>
              </div>
            ) : imageUrl ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-gray-900 flex items-center justify-center p-4">
                   <img src={imageUrl} alt="AI Generated" className="max-w-full max-h-[600px] rounded shadow-2xl" />
                </div>
                <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{size} Render</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs text-gray-400">Created just now</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleGenerate}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      title="Regenerate"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={downloadImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center hover:bg-blue-700 transition-all shadow-md"
                    >
                      <Download size={16} className="mr-2" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon size={40} className="opacity-20" />
                </div>
                <h4 className="text-xl font-bold text-gray-600 mb-2">Visualize Your Learning</h4>
                <p className="max-w-sm">Enter a prompt on the left to generate scientific diagrams or study visuals in high resolution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLab;

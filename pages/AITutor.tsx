
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Sparkles, Loader2, Image as ImageIcon, X } from 'lucide-react';
import FormattedContent from '../components/FormattedContent';

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, image: selectedImage || undefined };
    setMessages(prev => [...prev, userMsg]);
    
    const base64 = selectedImage?.split(',')[1];
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const stream = await getTutorResponse(input, messages, base64);
      let modelText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        modelText += chunk.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = modelText;
          return updated;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Encountered a limit or error. Please check your API connectivity.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"><Bot size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-800">AI Study Assistant</h3>
            <p className="text-xs text-blue-600 font-medium italic">Instant Academic Help Enabled</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Sparkles className="text-blue-200 mb-4" size={48} />
            <h4 className="text-xl font-bold text-gray-800">Hi, I'm your AI Study Partner</h4>
            <p className="text-gray-500 max-w-xs mt-2">Ask me anything about JEE, NEET, or complex concepts in Physics, Chemistry, and Math.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] sm:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed mx-2 ${m.role === 'user' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 border border-gray-100 shadow-sm'}`}>
                {m.image && <img src={m.image} className="max-w-xs rounded-lg mb-3 shadow-sm border border-white/20" alt="input" />}
                {m.text ? (
                   <FormattedContent content={m.text} className={m.role === 'user' ? 'text-white' : ''} />
                ) : (
                   isLoading && i === messages.length - 1 ? <Loader2 className="animate-spin" /> : null
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50/50">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} className="w-16 h-16 object-cover rounded-lg border-2 border-blue-500" alt="preview" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"><ImageIcon size={20}/></button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your academic query..." className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
          <button type="submit" disabled={isLoading} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"><Send size={20}/></button>
        </div>
      </form>
    </div>
  );
};

export default AITutor;

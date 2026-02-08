import React, { useState } from 'react';
import { Send, MessageSquarePlus } from 'lucide-react';

interface FooterProps {
  text: any;
}

const Footer: React.FC<FooterProps> = ({ text }) => {
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(suggestion.trim()) {
        alert("Thanks! Your suggestion has been recorded.");
        setSuggestion('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 relative overflow-hidden">
        {/* Decorative background blur in footer */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Branding */}
        <div className="text-center mb-12">
            <h2 className="text-white text-2xl font-black mb-2 tracking-wide">Sarkar Ki Naukari</h2>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase opacity-80">{text.madeFor}</p>
        </div>

        {/* Suggestion Box */}
        <div className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-md max-w-xl mx-auto shadow-2xl">
            <div className="flex items-center gap-3 mb-6 justify-center text-blue-400">
                <div className="p-2 bg-slate-900 rounded-lg shadow-inner">
                    <MessageSquarePlus size={24} />
                </div>
                <h3 className="font-bold text-white text-lg">{text.spotMistake}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="relative">
                <input 
                    type="text" 
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder={text.placeholder}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-5 pr-32 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
                <button 
                    type="submit" 
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-lg active:scale-95"
                >
                    {text.submit} <Send size={14} />
                </button>
            </form>
            <p className="text-xs text-center mt-4 text-slate-500 font-medium">
                {text.feedbackHelp}
            </p>
        </div>
        
        {/* Copyright */}
        <div className="mt-16 text-center text-xs text-slate-500 border-t border-slate-800 pt-8 font-medium">
            <p className="mb-2">Note: This is an informational tool. Always verify details on the official notification.</p>
            <p>&copy; {new Date().getFullYear()} Smart Govt Job Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
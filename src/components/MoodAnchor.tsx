import React, { useState } from 'react';
import { Heart, Zap, CloudRain, Flame, Frown, ShieldAlert, X, RefreshCw, Sparkles } from 'lucide-react';
import { Mood, AppMode } from '../../types';
import { askAIArchitectStream } from '../../geminiService';

const MOOD_QUOTES = {
  [Mood.GRATEFUL]: [
    { text: "If you are grateful, I will surely increase you [in favor]...", source: "Quran 14:7" },
    { text: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", source: "Epictetus" },
    { text: "Gratitude is not only the greatest of virtues, but the parent of all others.", source: "Cicero" }
  ],
  [Mood.ENERGETIC]: [
    { text: "The strong believer is better and more beloved to Allah than the weak believer...", source: "Hadith" },
    { text: "No man has the right to be an amateur in the matter of physical training.", source: "Socrates" },
    { text: "Energy and persistence conquer all things.", source: "Benjamin Franklin" }
  ],
  [Mood.SAD]: [
    { text: "So truly where there is hardship, there is also ease.", source: "Quran 94:5" },
    { text: "The word 'happy' would lose its meaning if it were not balanced by sadness.", source: "Carl Jung" },
    { text: "What we weep for is not the loss of a thing, but the loss of a part of ourselves.", source: "Unknown" }
  ],
  [Mood.ANGRY]: [
    { text: "The strong is the one who controls himself while in anger.", source: "Hadith" },
    { text: "Any person capable of angering you becomes your master.", source: "Epictetus" },
    { text: "For every minute you remain angry, you give up sixty seconds of peace of mind.", source: "Ralph Waldo Emerson" }
  ],
  [Mood.DEPRESSED]: [
    { text: "Allah does not burden a soul beyond that it can bear...", source: "Quran 2:286" },
    { text: "Sometimes you climb out of bed in the morning and you think, I'm not going to make it, but you laugh inside — remembering all the times you've felt that way.", source: "Charles Bukowski" },
    { text: "The oak fought the wind and was broken, the willow bent when it must and survived.", source: "Robert Jordan" }
  ]
};

export const MoodAnchor = ({ 
  currentMood, 
  setMood, 
  appMode, 
  setAppMode 
}: { 
  currentMood: Mood | null; 
  setMood: (m: Mood) => void; 
  appMode: AppMode;
  setAppMode: (m: AppMode) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [aiQuote, setAiQuote] = useState<{ text: string, source: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setMood(mood);
    setQuoteIndex(Math.floor(Math.random() * MOOD_QUOTES[mood].length));
    setAiQuote(null);
    setExpanded(true);
  };

  const cycleQuote = async () => {
    if (!currentMood) return;
    
    setIsGenerating(true);
    setAiQuote({ text: '', source: 'Oracle AI' });
    
    try {
      const prompt = `Generate a short, profound, 1-sentence piece of wisdom for someone feeling ${currentMood} while in ${appMode} mode. Include the source or author if applicable, or just attribute it to "Oracle AI". Format as: "Quote text here" - Source`;
      let fullResponse = "";
      for await (const chunk of askAIArchitectStream(prompt)) {
        fullResponse += chunk;
        
        // Try to parse out the quote and source as it streams
        const parts = fullResponse.split(' - ');
        if (parts.length > 1) {
          setAiQuote({ text: parts[0].replace(/"/g, '').trim(), source: parts.slice(1).join(' - ').trim() });
        } else {
          setAiQuote({ text: fullResponse.replace(/"/g, '').trim(), source: 'Oracle AI' });
        }
      }
    } catch (e) {
      console.error(e);
      setQuoteIndex((prev) => (prev + 1) % MOOD_QUOTES[currentMood].length);
      setAiQuote(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const getMoodContent = (mood: Mood | null) => {
    if (!mood) return null;
    const quoteData = aiQuote || MOOD_QUOTES[mood][quoteIndex] || MOOD_QUOTES[mood][0];

    switch (mood) {
      case Mood.GRATEFUL:
        return {
          icon: <Heart className="text-emerald-400" size={20} />,
          title: "Alhamdulillah",
          quote: quoteData.text,
          source: quoteData.source,
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-400"
        };
      case Mood.ENERGETIC:
        return {
          icon: <Zap className="text-amber-400" size={20} />,
          title: "High Energy",
          quote: quoteData.text,
          source: quoteData.source,
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          text: "text-amber-400"
        };
      case Mood.SAD:
        return {
          icon: <CloudRain className="text-blue-400" size={20} />,
          title: "Sadness",
          quote: quoteData.text,
          source: quoteData.source,
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          text: "text-blue-400"
        };
      case Mood.ANGRY:
        return {
          icon: <Flame className="text-red-400" size={20} />,
          title: "Anger",
          quote: quoteData.text,
          source: quoteData.source,
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          text: "text-red-400"
        };
      case Mood.DEPRESSED:
        return {
          icon: <Frown className="text-slate-400" size={20} />,
          title: "Overwhelmed",
          quote: quoteData.text,
          source: quoteData.source,
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          text: "text-slate-400"
        };
      default:
        return null;
    }
  };

  const content = getMoodContent(currentMood);
  const isNegative = currentMood === Mood.SAD || currentMood === Mood.DEPRESSED || currentMood === Mood.ANGRY;

  return (
    <div className="mb-6 space-y-3">
      {!expanded && !currentMood && (
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 text-center">Hey friend, what's your state of heart right now?</p>
          <div className="flex justify-between items-center px-2">
            <button title="Grateful" onClick={() => handleMoodSelect(Mood.GRATEFUL)} className="p-2 hover:bg-emerald-500/20 rounded-xl transition-all text-emerald-400/50 hover:text-emerald-400"><Heart size={20} /></button>
            <button title="Energetic" onClick={() => handleMoodSelect(Mood.ENERGETIC)} className="p-2 hover:bg-amber-500/20 rounded-xl transition-all text-amber-400/50 hover:text-amber-400"><Zap size={20} /></button>
            <button title="Sad" onClick={() => handleMoodSelect(Mood.SAD)} className="p-2 hover:bg-blue-500/20 rounded-xl transition-all text-blue-400/50 hover:text-blue-400"><CloudRain size={20} /></button>
            <button title="Angry" onClick={() => handleMoodSelect(Mood.ANGRY)} className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-red-400/50 hover:text-red-400"><Flame size={20} /></button>
            <button title="Overwhelmed" onClick={() => handleMoodSelect(Mood.DEPRESSED)} className="p-2 hover:bg-slate-500/20 rounded-xl transition-all text-slate-400/50 hover:text-slate-400"><Frown size={20} /></button>
          </div>
        </div>
      )}

      {(expanded || currentMood) && content && (
        <div className={`${content.bg} border ${content.border} rounded-2xl p-5 relative animate-in overflow-hidden`}>
          <button onClick={() => { setExpanded(false); setMood(null as any); }} className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl bg-black/20 ${content.text}`}>
              {content.icon}
            </div>
            <h3 className={`font-mono uppercase tracking-widest text-sm ${content.text}`}>{content.title}</h3>
          </div>
          
          <div className="relative group">
            <p className="text-sm font-serif italic text-white/90 leading-relaxed mb-1 pr-6">"{content.quote}"</p>
            <p className="text-[10px] font-mono text-white/50 mb-4">— {content.source}</p>
            <button onClick={cycleQuote} disabled={isGenerating} className={`absolute top-0 right-0 p-1.5 rounded-lg bg-black/20 text-white/40 hover:text-white transition-colors ${isGenerating ? 'animate-pulse opacity-50' : ''}`} title="Generate AI Wisdom">
              {isGenerating ? <Sparkles size={14} /> : <RefreshCw size={14} />}
            </button>
          </div>
          
          {isNegative && appMode !== AppMode.VACATION && (
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={14} className="text-indigo-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">Mercy Protocol Available</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">Your mental and spiritual health is the priority. Shall we activate Grace Mode for today to reduce expectations?</p>
              <button 
                onClick={() => setAppMode(AppMode.VACATION)}
                className="w-full py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-indigo-500/40 transition-all"
              >
                Activate Grace Mode
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

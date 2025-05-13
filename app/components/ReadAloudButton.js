'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Volume2 } from 'lucide-react';

import ParagraphItem from './ParagraphItem';

export default function ReadAloud({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);
  const [activeParagraph, setActiveParagraph] = useState('');
  const [checkedParagraphs, setCheckedParagraphs] = useState(() => {
    if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('readParagraphs');
            return saved ? JSON.parse(saved) : {};
        }
        return {};
        });

    useEffect(() => {
    localStorage.setItem('readParagraphs', JSON.stringify(checkedParagraphs));
    }, [checkedParagraphs]);



  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const availableVoices = synth.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(availableVoices);
      setSelectedVoice(availableVoices.find(v => v.name.toLowerCase().includes('female')) || availableVoices[0]);
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

    const speakText = (customText = text) => {
    if (!customText) return;
    const utterance = new SpeechSynthesisUtterance(customText);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setActiveParagraph(customText);
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveParagraph('');
    };
    utteranceRef.current = utterance;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    };

    const pauseSpeech = () => {
    speechSynthesis.pause();
    setIsPaused(true);
    };

    const resumeSpeech = () => {
    speechSynthesis.resume();
    setIsPaused(false);
    };


  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleVoiceChange = (e) => {
    const voice = voices.find(v => v.name === e.target.value);
    setSelectedVoice(voice);
  };

  const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');

  return (
    <div className="bg-[#F8F9FA] p-4 rounded-xl shadow-sm text-sm space-y-6">
    {/* Controls */}
    <div className="flex flex-wrap gap-x-4 gap-y-2">
        <button onClick={() => speakText()} className="btn flex items-center gap-1">
        <Play className="w-4 h-4" /> Play
        </button>
        <button onClick={pauseSpeech} disabled={!isSpeaking || isPaused} className="btn flex items-center gap-1">
        <Pause className="w-4 h-4" /> Pause
        </button>
        <button onClick={resumeSpeech} disabled={!isPaused} className="btn flex items-center gap-1">
        <Volume2 className="w-4 h-4" /> Resume
        </button>
        <button onClick={stopSpeech} disabled={!isSpeaking} className="btn flex items-center gap-1">
        <StopCircle className="w-4 h-4" /> Stop
        </button>
    </div>

    {/* Rate slider */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="font-medium text-gray-600">Speed:</label>
        <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={rate}
        onChange={(e) => setRate(parseFloat(e.target.value))}
        className="w-full sm:w-40"
        />
        <span className="text-gray-600">{rate.toFixed(1)}x</span>
    </div>

    {/* Voice selector */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="font-medium text-gray-600">Voice:</label>
        <select
        value={selectedVoice?.name || ''}
        onChange={handleVoiceChange}
        className="border rounded px-2 py-1 w-full sm:w-auto"
        >
        {voices.map((v, i) => (
            <option key={i} value={v.name}>
            {v.name.includes('Female') ? '👩 ' : '👨 '} {v.name}
            </option>
        ))}
        </select>
    </div>

    {/* Paragraph checkboxes & play */}
    <div className="space-y-4 mt-4">
        {paragraphs.map((p, idx) => (
        <ParagraphItem
            key={idx}
            paragraph={p}
            isActive={activeParagraph === p}
            isPaused={isPaused}
            onPlay={speakText}
            onPause={pauseSpeech}
            onResume={resumeSpeech}
            checked={checkedParagraphs[idx] || false}
            onCheckedChange={() => {
            setCheckedParagraphs((prev) => ({
                ...prev,
                [idx]: !prev[idx],
            }));
            }}
        />
        ))}
    </div>

    {/* Clear progress */}
    <button
        onClick={() => {
        localStorage.removeItem('readParagraphs');
        setCheckedParagraphs({});
        }}
        className="mt-4 mb-6 px-5 py-3 text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-[#D00000] focus:ring-offset-1 transition-colors duration-200 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-800 shadow-sm"
    >
        Clear Progress
    </button>
    </div>
  );
}

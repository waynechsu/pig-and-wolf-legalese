/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Play, 
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Rabbit,
  Snail,
  Star
} from 'lucide-react';
import audioDataRaw from './data/audioData.json';

const audioData = audioDataRaw as Record<string, string>;

type Character = 'DETECTIVE PIG' | 'WOLF' | 'LAWYER PIG';

interface DialogueLine {
  character: Character;
  text: string;
  translation?: string;
}

const SCRIPT: DialogueLine[] = [
  { character: 'DETECTIVE PIG', text: "Is that so, Wolfy? Well, I'm not afraid of you! And I'm taking you in!" },
  { character: 'WOLF', text: "Is that so?" },
  { character: 'DETECTIVE PIG', text: "Yeah, that's right!" },
  { character: 'WOLF', text: "For what crime?" },
  { character: 'DETECTIVE PIG', text: "For being a prowling, scheming wolf, that's what!" },
  { character: 'WOLF', text: "But surely it's no crime to be a wolf!" },
  { character: 'DETECTIVE PIG', text: "Yeah, yeah. Tell it to the judge! I've heard it all before. You're a danger to society!" },
  { character: 'WOLF', text: "But don't I have a right to an attorney or something?" },
  { character: 'DETECTIVE PIG', text: "Oh, all right. Fine." },
  { character: 'LAWYER PIG', text: "Hey! At-whay up-yay, etective-day?", translation: "Hey! What's up, detective?" },
  { character: 'DETECTIVE PIG', text: "Not much. Just got a perp here requesting a lawyer." },
  { character: 'LAWYER PIG', text: "Okay-yay. And what's his ory-stay?", translation: "Okay. And what's his story?" },
  { character: 'DETECTIVE PIG', text: "This is Big Bad Wolf. He's been prowling our meadow for days." },
  { character: 'WOLF', text: "Who's this?" },
  { character: 'DETECTIVE PIG', text: "Your lawyer." },
  { character: 'LAWYER PIG', text: "And the etective-day here tells me you're a persona non grata.", translation: "And the detective here tells me you're a persona non grata." },
  { character: 'WOLF', text: "What?" },
  { character: 'DETECTIVE PIG', text: "You're someone who's unwelcome here." },
  { character: 'LAWYER PIG', text: "Ergo, I'm not inclined-yay to help oo-yay out-yay.", translation: "Ergo, I'm not inclined to help you out." },
  { character: 'WOLF', text: "Come on! I have the right to an attorney!" },
  { character: 'LAWYER PIG', text: "Erhaps-pay, ut-bay I don't ork-way o-pray ono-bay, okay?", translation: "Perhaps, but I don't work pro bono, okay?" },
  { character: 'WOLF', text: "What?" },
  { character: 'DETECTIVE PIG', text: "She doesn't work for free." },
  { character: 'WOLF', text: "I'm confused. Why is she talking like that?" },
  { character: 'DETECTIVE PIG', text: "She's a lawyer. She speaks in Pig Latin. All lawyers do! Surely with a rap sheet like yours, you've had a lawyer before!" },
  { character: 'WOLF', text: "Well, yes, but I've never had a pig lawyer before." },
  { character: 'LAWYER PIG', text: "Vis-a-vis, pro tempore, we ould-cay oo-day a little id-quay o-pray, okay? Whaddaya say?", translation: "Vis-a-vis, pro tempore, we could do a little quid pro quo, okay? Whaddaya say?" },
  { character: 'WOLF', text: "That's what I want to know! What did she say?" },
  { character: 'DETECTIVE PIG', text: "She won't work for free, but in the meantime, she might help you out for a little something in exchange." },
  { character: 'LAWYER PIG', text: "Ergo, if I elp-hay oo-yay, you have to omise-pray to ever-nay eat ee-may.", translation: "Ergo, if I help you, you have to promise to never eat me." },
  { character: 'WOLF', text: "Huh?" },
  { character: 'DETECTIVE PIG', text: "You would have to promise to never eat her!" },
  { character: 'WOLF', text: "Okay, okay! Anything you want!" },
  { character: 'LAWYER PIG', text: "Ad-yay infinitum-yay!", translation: "Ad infinitum! (forever)" },
  { character: 'DETECTIVE PIG', text: "Forever." },
  { character: 'WOLF', text: "Yeah, yeah. Forever. I'll never eat you!" },
  { character: 'LAWYER PIG', text: "Ery-vay ell-way! Emove-ray the andcuffs-hay.", translation: "Very well! Remove the handcuffs." },
  { character: 'DETECTIVE PIG', text: "Are you serious?" },
  { character: 'LAWYER PIG', text: "Es-yay! My lient-cay has ommitted-cay no imes-cray.", translation: "Yes! My client has committed no crimes." },
  { character: 'DETECTIVE PIG', text: "But he's Big Bad Wolf!" },
  { character: 'LAWYER PIG', text: "And-yay it's-yay no ime-cray to be a ig-bay ad-bay olf-way!", translation: "And it's no crime to be a big bad wolf!" },
  { character: 'WOLF', text: "What'd she say?" },
  { character: 'DETECTIVE PIG', text: "She said it's no crime to be a Big Bad Wolf!" },
  { character: 'WOLF', text: "Aha! See?! That's what I said! Thanks, uh, eh?" },
  { character: 'DETECTIVE PIG', text: "Thanks a lot! You just let a big bad wolf get away." },
  { character: 'LAWYER PIG', text: "Unless he ommits-cay a ime-cray, you annot-cay etain-day im-hay.", translation: "Unless he commits a crime, you cannot detain him." },
  { character: 'DETECTIVE PIG', text: "You think so, eh? We'll see about that." },
  { character: 'LAWYER PIG', text: "Oo-yay an't-cay andle-hay the uth-tray!", translation: "You can't handle the truth!" },
  { character: 'DETECTIVE PIG', text: "Ugh! Lawyers. And all that legalese they speak!" },
  { character: 'WOLF', text: "Aha! That was a close one! Now, where might I find a little pig to eat!" },
];

export default function App() {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const [lawyerSpeed, setLawyerSpeed] = useState<'normal' | 'slow' | 'superslow'>('normal');
  const [highlightWordIndex, setHighlightWordIndex] = useState(-1);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [revealedLines, setRevealedLines] = useState<Record<number, boolean>>({});
  const [masteredLines, setMasteredLines] = useState<Record<number, boolean>>({});
  const [quizScript, setQuizScript] = useState<DialogueLine[]>([]);
  const [activeScript, setActiveScript] = useState<DialogueLine[]>(SCRIPT);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // iOS/iPadOS requires an explicit user gesture to unlock AudioContext and SpeechSynthesis
  const initializeAudio = async () => {
    try {
      // 1. Prime Web Audio (for AI Voice)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // 2. Prime Speech Synthesis (for System Voice Fallback)
      // On iPad, we need a "real" utterance to unlock the service
      window.speechSynthesis.cancel();
      const silent = new SpeechSynthesisUtterance("Unlocking audio.");
      silent.volume = 0; // Inaudible but "real" to the OS
      window.speechSynthesis.speak(silent);
      
      console.log("Audio systems primed for iPad");
    } catch (e) {
      console.warn("Audio unlock failed:", e);
    }
  };



  // Play PCM audio from Gemini
  const playPcm = async (base64: string, rate: number = 1.0) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Stop previous
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
    }

    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert 16-bit PCM to Float32
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.connect(ctx.destination);
    
    currentSourceRef.current = source;
    return source;
  };

  const speak = useCallback(async (lineIndex: number, force: boolean = false) => {
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    
    // Stop all audio
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
    }
    window.speechSynthesis.cancel(); 

    if (!isAudioEnabled || lineIndex < 0 || lineIndex >= activeScript.length) return;

    const line = activeScript[lineIndex];
    if (!line) return;

    if ((isInteractiveMode || isQuizMode) && line.character === 'LAWYER PIG' && !force) {
      if (isPlaying) setIsPlaying(false);
      return;
    }

    const speedSuffix = (line.character === 'LAWYER PIG' && (lawyerSpeed === 'normal' || lawyerSpeed === 'slow')) ? `:${lawyerSpeed}` : '';
    const cacheId = `${line.character}:${line.text}${speedSuffix}`;
    let base64 = audioData[cacheId];

    // Fallback to non-suffix key if speed key doesn't exist
    if (!base64 && speedSuffix) {
      base64 = audioData[`${line.character}:${line.text}`];
    }

    if (!base64) {
      console.warn("Audio not found in pre-generated data - falling back to system voice");
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.rate = 0.8;
      utterance.onend = () => {
        const nextIndex = lineIndex + 1;
        if (isPlaying && nextIndex < activeScript.length) {
          playIntervalRef.current = setTimeout(() => {
            setCurrentLineIndex(nextIndex);
          }, 800);
        } else {
          setIsPlaying(false);
        }
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    if (base64) {
      let rate = 1.0;
      if (line.character === 'LAWYER PIG') {
        rate = lawyerSpeed === 'superslow' ? 0.45 : 1.0;
      } else if (line.character === 'WOLF') {
        rate = 0.8;
      }

      const source = await playPcm(base64, rate);
      
      source.onended = () => {
        setHighlightWordIndex(-1);
        const nextIndex = lineIndex + 1;

        if (isPlaying && nextIndex < activeScript.length) {
          const nextLine = activeScript[nextIndex];
          if ((isInteractiveMode || isQuizMode) && nextLine.character === 'LAWYER PIG') {
            setIsPlaying(false);
            setCurrentLineIndex(nextIndex);
          } else {
            playIntervalRef.current = setTimeout(() => {
              setCurrentLineIndex(nextIndex);
            }, 800);
          }
        } else if (lineIndex >= activeScript.length - 1) {
          setIsPlaying(false);
        }
      };

      source.start();
      
      // Karaoke Highlighting
      const normalDuration = source.buffer?.duration || 0;
      const actualDuration = normalDuration / rate;
      const words = line.text.split(/\s+/);
      const audioCtx = audioContextRef.current;
      const startTime = audioCtx ? audioCtx.currentTime : 0;

      const updateHighlight = () => {
        if (!audioCtx) return;
        const elapsed = audioCtx.currentTime - startTime;
        if (elapsed < actualDuration) {
          const progress = elapsed / actualDuration;
          const wordIndex = Math.floor(progress * words.length);
          setHighlightWordIndex(wordIndex);
          requestAnimationFrame(updateHighlight);
        } else {
          setHighlightWordIndex(-1);
        }
      };
      if (audioCtx) {
        requestAnimationFrame(updateHighlight);
      }
    }
  }, [isAudioEnabled, lawyerSpeed, isPlaying, isInteractiveMode, isQuizMode, activeScript]);

  useEffect(() => {
    if (currentLineIndex > -1) {
      speak(currentLineIndex);
    }
  }, [currentLineIndex, speak]);

  useEffect(() => {
    if (currentLineIndex === -1) return;
    
    // Slight delay to allow DOM/Motion updates to settle, especially important for iPad Safari
    const scrollTask = setTimeout(() => {
      const activeLine = document.getElementById(`line-${currentLineIndex}`);
      if (activeLine) {
        // We use a more direct scroll target if possible, but scrollIntoView center is usually best
        // if the container is properly bounded.
        activeLine.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
    }, 100);

    return () => clearTimeout(scrollTask);
  }, [currentLineIndex]);

  const handleNext = () => {
    if (currentLineIndex < activeScript.length - 1) {
      // TRACK PERFORMANCE: If it was her turn and she didn't reveal the hint, mark as mastered
      const currentLine = activeScript[currentLineIndex];
      if ((isInteractiveMode || isQuizMode) && currentLine.character === 'LAWYER PIG' && !revealedLines[currentLineIndex]) {
        setMasteredLines(prev => ({ ...prev, [currentLineIndex]: true }));
      }

      if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
      window.speechSynthesis.cancel();
      setHighlightWordIndex(-1);
      setCurrentLineIndex(prev => prev + 1);
    }
  };

  const startQuiz = () => {
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    window.speechSynthesis.cancel();
    
    const lawyerLines = SCRIPT.filter(l => l.character === 'LAWYER PIG');
    // Fisher-Yates Shuffle for true randomness
    const shuffled = [...lawyerLines];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setQuizScript(shuffled);
    setActiveScript(shuffled);
    setIsQuizMode(true);
    setIsInteractiveMode(false);
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    setIsPlaying(false);
    setRevealedLines({});
    setMasteredLines({});
    setCurrentLineIndex(0);
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setCurrentLineIndex(-1);
    setIsPlaying(false);
    setHighlightWordIndex(-1);
    setRevealedLines({});
    setMasteredLines({});
    setIsQuizMode(false);
    setActiveScript(SCRIPT);
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
  };

  const getCharBgClass = (char: Character) => {
    switch (char) {
      case 'DETECTIVE PIG': return 'bg-ink text-paper';
      case 'WOLF': return 'bg-brutal-red text-paper';
      case 'LAWYER PIG': return 'bg-brutal-teal text-paper shadow-[4px_4px_0_0_#1A1A1A]';
    }
  };

  const isFinished = currentLineIndex >= activeScript.length - 1 && currentLineIndex !== -1;

  const renderWords = (text: string, isCurrent: boolean) => {
    const words = text.split(/\s+/);
    return words.map((word, i) => {
      const isHighlighted = isCurrent && i === highlightWordIndex;
      return (
        <motion.span 
          key={i} 
          animate={isHighlighted ? {
            scale: 1.2,
            color: '#1A1A1A',
            backgroundColor: '#FFEB3B', // Bright Yellow
            rotate: -2
          } : {
            scale: 1,
            color: 'inherit',
            backgroundColor: 'transparent',
            rotate: 0
          }}
          className={`transition-all duration-150 inline-block mr-[0.25em] px-1 rounded-sm ${
            isHighlighted ? 'font-black z-20 relative' : ''
          }`}
        >
          {word}
        </motion.span>
      );
    });
  };

  return (
    <div className={`h-screen bg-paper flex flex-col p-0 font-sans text-ink overflow-hidden transition-opacity opacity-100`}>
      {/* Header Container */}
      <header className="border-b-4 border-ink p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-paper sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.8] uppercase tracking-tight">
            THE PIG<br />LEGALEZE
          </h1>
          <div className="h-12 w-1.5 bg-ink/10 hidden md:block" />
          <div className="flex flex-wrap gap-2">

            <button 
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-3 border-4 border-ink transition-transform active:scale-95 shadow-[4px_4px_0_0_#1A1A1A] active:shadow-none ${
                isAudioEnabled ? 'bg-ink text-paper' : 'bg-brutal-red text-paper'
              }`}
            >
              {isAudioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <button 
              onClick={() => {
                const nextSpeed = lawyerSpeed === 'normal' ? 'slow' : lawyerSpeed === 'slow' ? 'superslow' : 'normal';
                setLawyerSpeed(nextSpeed);
              }}
              className={`flex items-center gap-2 px-6 py-2 border-4 border-ink font-black uppercase text-xs tracking-widest transition-colors shadow-[4px_4px_0_0_#1A1A1A] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                lawyerSpeed !== 'normal' ? 'bg-brutal-teal text-ink' : 'bg-ink text-paper'
              }`}
            >
              {lawyerSpeed === 'superslow' ? <Snail size={18} className="text-brutal-red" /> : lawyerSpeed === 'slow' ? <Snail size={18} /> : <Rabbit size={18} />}
              {lawyerSpeed === 'superslow' ? 'Lawyer: Step-by-Step' : lawyerSpeed === 'slow' ? 'Lawyer: Slowing Down' : 'Lawyer: Normal Speed'}
            </button>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between md:justify-end border-t-2 md:border-t-0 border-ink/5 pt-3 md:pt-0">
          <div className="flex items-center gap-3">
            {currentLineIndex > -1 && (
              <button 
                onClick={reset}
                className="p-1.5 border-2 border-ink hover:bg-ink hover:text-paper transition-all uppercase font-black text-[10px] shadow-[2px_2px_0_0_#1A1A1A] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <span className={`font-serif italic font-bold text-sm sm:text-base border-2 border-ink px-3 py-1 rounded-sm shadow-[4px_4px_0_0_#1A1A1A] ${
              isQuizMode ? 'bg-brutal-teal text-ink' : isInteractiveMode ? 'bg-brutal-red text-paper' : 'bg-white text-ink'
            }`}>
              {isQuizMode ? 'RANDOM QUIZ' : isInteractiveMode ? 'PRACTICE MODE' : 'STORY MODE'}
            </span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-ink text-paper px-2 py-0.5">
            CIRCUIT COURT OF THE MEADOW
          </div>
        </div>
      </header>

      {/* Transcript Area */}
      <main className="flex-1 relative overflow-hidden bg-paper/50 flex flex-col">
        <div className="flex-1 overflow-y-auto" id="scroll-container">
          <div 
            className="max-w-5xl mx-auto p-4 sm:p-8 md:p-12 space-y-8 md:space-y-16 py-[40vh]"
          >
          {currentLineIndex === -1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="w-32 h-32 border-8 border-ink rounded-full flex items-center justify-center bg-white shadow-[12px_12px_0_0_#1A1A1A] animate-bounce">
                <Star size={64} className="text-brutal-teal fill-current" />
              </div>
              <div className="space-y-6">
                <h2 className="font-display text-6xl sm:text-7xl uppercase leading-none">Practice Your Lines!</h2>
                <div className="p-8 border-4 border-ink bg-brutal-teal text-paper max-w-lg mx-auto shadow-[12px_12px_0_0_#1A1A1A] rotate-[-1deg]">
                  <p className="font-serif italic text-2xl font-bold leading-relaxed">
                    "Read along with the Lawyer Pig! Listen closely to the Pig Latin words. You can do it!"
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
                <button 
                  onClick={() => {
                    initializeAudio();
                    setIsInteractiveMode(false);
                    setIsQuizMode(false);
                    setActiveScript(SCRIPT);
                    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
                    setIsPlaying(true);
                    setCurrentLineIndex(0);
                  }}
                  className="font-display text-4xl bg-white text-ink px-10 py-6 uppercase tracking-wider hover:bg-brutal-teal hover:text-paper transition-all border-4 border-ink shadow-[12px_12px_0_0_#1A1A1A] active:shadow-none active:translate-x-2 active:translate-y-2 flex flex-col items-center gap-2 group"
                >
                  <span className="text-sm font-black tracking-[0.2em] opacity-40">Just Listen</span>
                  <div className="flex items-center gap-3">
                    <Rabbit size={32} /> STORY MODE
                  </div>
                </button>

                <button 
                  onClick={() => {
                    initializeAudio();
                    setIsInteractiveMode(true);
                    setIsQuizMode(false);
                    setActiveScript(SCRIPT);
                    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
                    setIsPlaying(true);
                    setCurrentLineIndex(0);
                  }}
                  className="font-display text-4xl bg-ink text-paper px-10 py-6 uppercase tracking-wider hover:bg-brutal-red transition-all border-4 border-ink shadow-[12px_12px_0_0_#1A1A1A] active:shadow-none active:translate-x-2 active:translate-y-2 flex flex-col items-center gap-2"
                >
                  <span className="text-sm font-black tracking-[0.2em] text-brutal-teal">Your Turn to Speak</span>
                  <div className="flex items-center gap-3">
                    <Star size={32} className="fill-current text-brutal-teal" /> PRACTICE MODE
                  </div>
                </button>

                <button 
                  onClick={() => {
                    initializeAudio();
                    startQuiz();
                  }}
                  className="font-display text-4xl bg-brutal-teal text-paper px-10 py-6 uppercase tracking-wider hover:bg-white hover:text-ink transition-all border-4 border-ink shadow-[12px_12px_0_0_#1A1A1A] active:shadow-none active:translate-x-2 active:translate-y-2 flex flex-col items-center gap-2"
                >
                  <span className="text-sm font-black tracking-[0.2em] text-ink">Shuffle & Test</span>
                  <div className="flex items-center gap-3">
                    <Zap size={32} className="fill-current" /> RANDOM QUIZ
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          <div className="relative border-l-8 border-ink pl-6 sm:pl-16 space-y-16">
            <AnimatePresence mode="popLayout">
              {activeScript.slice(0, currentLineIndex + 1).map((line, idx) => {
                const isCurrent = idx === currentLineIndex;
                const isLawyer = line.character === 'LAWYER PIG';
                const isQuizActiveLine = isQuizMode && isCurrent;
                
                return (
                  <motion.div
                    key={idx}
                    id={`line-${idx}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className={`space-y-4 relative transition-opacity duration-700 ${isCurrent ? 'z-10 scale-[1.02] origin-left' : 'opacity-20 translate-x-[-10px]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <motion.span 
                        animate={isCurrent ? { 
                          scale: [1, 1.03, 1],
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`inline-block px-4 py-1 text-xs font-black uppercase tracking-[0.2em] border-2 border-ink shadow-[4px_4px_0_0_#1A1A1A] relative ${getCharBgClass(line.character)}`}
                      >
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            >
                              <Volume2 size={12} className="fill-current" />
                            </motion.div>
                          )}
                          {line.character}
                        </div>
                        {isCurrent && (
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: [0, 0.2, 0] }}
                             transition={{ repeat: Infinity, duration: 2 }}
                             className="absolute inset-0 bg-white"
                           />
                        )}
                      </motion.span>
                      {(isLawyer && isCurrent && (isInteractiveMode || isQuizMode)) && (
                        <motion.span 
                          animate={{ scale: [1, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-sm font-black uppercase text-brutal-teal flex items-center gap-1"
                        >
                          <Star size={16} className="fill-current" /> {isQuizMode ? 'TRANSLATE THIS!' : 'YOUR TURN!'}
                        </motion.span>
                      )}
                    </div>
                    <div className={`font-serif leading-tight max-w-4xl italic transition-all duration-300 ${
                      isCurrent ? 'text-ink' : 'text-gray-300'
                    }`}>
                      {(isLawyer && (isInteractiveMode || isQuizMode) && !revealedLines[idx]) ? (
                        <div 
                          onClick={() => setRevealedLines(prev => ({ ...prev, [idx]: true }))}
                          className="group cursor-pointer p-6 border-4 border-dashed border-ink/20 hover:border-brutal-teal hover:bg-brutal-teal/5 transition-all bg-white/50 shadow-[8px_8px_0_0_rgba(0,0,0,0.05)]"
                        >
                          <div className="flex items-center gap-4 text-ink/60 text-2xl sm:text-4xl font-bold">
                            <span className="bg-brutal-teal text-paper px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#1A1A1A]">
                              {isQuizMode ? 'ENGLISH PROMPT' : 'HINT'}
                            </span>
                            <span>({line.translation || "???"})</span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase text-brutal-teal opacity-0 group-hover:opacity-100 transition-opacity tracking-[0.2em]">
                            <ChevronRight size={16} /> Tap to reveal Pig Latin
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl sm:text-5xl font-bold">
                          {renderWords(line.text, isCurrent)}
                        </div>
                      )}
                    </div>
                    {isCurrent && !isPlaying && (
                      <button 
                        onClick={() => {
                          initializeAudio();
                          speak(currentLineIndex, true);
                        }}
                        className="flex items-center gap-3 px-4 py-2 bg-ink text-paper font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_#1A1A1A] hover:bg-brutal-teal transition-colors"
                      >
                        <RotateCcw size={14} /> Listen Again
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            <div className="absolute top-0 -left-8 bottom-0 w-2 bg-ink/5" />
            <div ref={scrollAnchorRef} className="h-4" />
          </div>

          <AnimatePresence>
            {isFinished && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
              >
                <div className="bg-paper border-8 border-ink p-8 sm:p-12 max-w-2xl w-full shadow-[30px_30px_0_0_#1A1A1A] flex flex-col gap-8 relative overflow-hidden">
                  {/* Performance Ribbon */}
                  <div className="absolute top-10 -right-16 rotate-45 bg-brutal-red text-paper py-2 px-20 font-black uppercase text-xl shadow-[4px_4px_0_0_#1A1A1A]">
                    CASE CLOSED
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-7xl sm:text-8xl uppercase leading-none italic">MISSION COMPLETED</h2>
                    <p className="font-serif text-2xl opacity-60">Prosecution Performance Report</p>
                  </div>

                  {isInteractiveMode || isQuizMode ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-brutal-teal">
                          <Star size={32} className="fill-current" />
                          <span className="font-black text-2xl uppercase">{isQuizMode ? 'Correct Recalls' : 'Mastered Lines'}</span>
                        </div>
                        <div className="text-6xl font-display text-ink">
                          {Object.keys(masteredLines).length} <span className="text-3xl opacity-30">/ {activeScript.filter(l => l.character === 'LAWYER PIG').length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(masteredLines).map(key => (
                            <div key={key} className="w-8 h-8 bg-brutal-teal flex items-center justify-center text-paper font-black text-sm rotate-[-12deg] shadow-[2px_2px_0_0_#1A1A1A]">
                              ★
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-ink text-paper p-6 space-y-4 shadow-[8px_8px_0_0_#FF5F5F]">
                        <div className="font-black uppercase text-xs tracking-widest text-brutal-red underline">STICKER REWARD</div>
                        <div className="flex flex-col items-center gap-4 py-2">
                          {(() => {
                            const total = activeScript.filter(l => l.character === 'LAWYER PIG').length;
                            const score = Object.keys(masteredLines).length;
                            const percent = total > 0 ? (score / total) * 100 : 0;

                            if (percent === 100) return (
                              <>
                                <div className="text-8xl animate-bounce">🏆</div>
                                <div className="text-center font-display text-4xl uppercase text-brutal-teal">LEGAL LEGEND</div>
                                <p className="text-center text-xs opacity-60 font-serif italic">Perfect performance! No hints needed!</p>
                              </>
                            );
                            if (percent >= 70) return (
                              <>
                                <div className="text-8xl animate-pulse">🥇</div>
                                <div className="text-center font-display text-4xl uppercase text-brutal-teal">SUPER SOLICITOR</div>
                                <p className="text-center text-xs opacity-60 font-serif italic">Almost perfect! Great memory!</p>
                              </>
                            );
                            return (
                              <>
                                <div className="text-8xl">🥈</div>
                                <div className="text-center font-display text-4xl uppercase text-brutal-red">RISING STAR</div>
                                <p className="text-center text-xs opacity-60 font-serif italic">Great effort! Keep practicing!</p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-4 border-dashed border-ink/20 text-center">
                      <div className="text-6xl mb-4">📖</div>
                      <p className="font-serif italic text-xl">Good listening! Try <strong>Practice Mode</strong> next to win a sticker!</p>
                    </div>
                  )}

                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={reset}
                      className="flex-1 bg-ink text-paper font-display text-3xl py-4 uppercase hover:bg-brutal-teal transition-all shadow-[8px_8px_0_0_#1A1A1A] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </main>

      {/* Control Rail */}
      <footer className="border-t-4 border-ink bg-paper z-50 flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-ink shadow-[0_-10px_30px_rgba(0,0,0,0.1)] relative">
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <button 
              onClick={() => {
                if (isFinished) {
                  reset();
                } else if ((isInteractiveMode || isQuizMode) && activeScript[currentLineIndex]?.character === 'LAWYER PIG' && !isPlaying) {
                  // If it's her turn and she's done speaking, advance to the next character
                  setIsPlaying(true);
                  handleNext();
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              className={`font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider flex items-center gap-3 sm:gap-4 group px-6 sm:px-10 py-3 sm:py-5 border-4 border-ink shadow-[6px_6px_0_0_#1A1A1A] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
                isPlaying 
                  ? 'bg-ink text-paper' 
                  : ((isInteractiveMode || isQuizMode) && activeScript[currentLineIndex]?.character === 'LAWYER PIG')
                    ? 'bg-brutal-teal text-ink animate-bounce scale-110'
                    : 'bg-brutal-red text-paper'
              }`}
            >
              <span className={isPlaying ? 'hidden sm:inline' : 'inline'}>
                {isFinished ? 'Start Over' : isPlaying ? 'Pause' : ((isInteractiveMode || isQuizMode) && activeScript[currentLineIndex]?.character === 'LAWYER PIG') ? 'I finished speaking' : 'Auto Play'}
              </span>
              <span className={isPlaying ? 'inline sm:hidden' : 'hidden'}>Pause</span>
              {!isPlaying && !isFinished && ((isInteractiveMode || isQuizMode) && activeScript[currentLineIndex]?.character === 'LAWYER PIG' ? <Star size={24} className="fill-current" /> : <Play size={24} className="fill-current" />)}
            </button>
            <div className="hidden sm:flex flex-col">
              <span className="font-black uppercase text-[10px] tracking-[0.3em] opacity-40 mb-0.5">
                {isQuizMode ? 'Quiz Progress' : 'Dialogue Progress'}
              </span>
              <span className="font-display text-2xl md:text-4xl uppercase tracking-tighter opacity-40">
                {Math.min(currentLineIndex + 1, activeScript.length)} / {activeScript.length}
              </span>
            </div>
          </div>

          <button 
            onClick={handleNext}
            disabled={isFinished}
            className={`p-4 sm:p-6 border-4 border-ink transition-all shadow-[6px_6px_0_0_#1A1A1A] active:shadow-none active:translate-x-1 active:translate-y-1 ${
              isFinished 
              ? 'text-ink/20 bg-ink/5 border-ink/20 opacity-30 cursor-not-allowed' 
              : 'bg-white text-ink hover:bg-brutal-teal hover:text-paper transform hover:scale-105'
            }`}
          >
            <Zap size={28} className="fill-current sm:size-36" />
          </button>
        </div>

        {/* Global Progress */}
        <div className="w-full md:w-80 p-4 sm:p-6 bg-ink text-paper flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2 font-black uppercase text-[10px] tracking-[0.4em]">
            <span>{isQuizMode ? 'Recalling...' : 'Practice Progress'}</span>
            <span>{Math.round(((currentLineIndex + 1) / activeScript.length) * 100)}%</span>
          </div>
          <div className="h-6 w-full border-2 border-paper/30 p-0.5 bg-white/5">
            <motion.div 
              className="h-full bg-paper shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentLineIndex + 1) / activeScript.length) * 100}%` }}
            />
          </div>
        </div>
      </footer>

      {/* Property Tag */}
      <footer className="relative z-10 p-6 font-black uppercase text-xs text-center tracking-[0.5em] bg-ink text-paper border-t-8 border-paper">
        END OF TRANSCRIPT — PROPERTY OF MEADOW PD — FOR LEARNING PURPOSES
      </footer>

    </div>
  );
}

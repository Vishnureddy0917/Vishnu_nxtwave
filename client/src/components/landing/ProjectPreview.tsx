import React, { useState } from 'react';
import { Sparkles, Terminal, Play, CheckCircle2, ArrowRight, Code2, Zap } from 'lucide-react';

export const ProjectPreview: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Built a college library management system using Python and MySQL.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<{
    bullet: string;
    techStack: string[];
    architecture: string;
    interviewTip: string;
  } | null>({
    bullet:
      'Engineered an automated Library Resource Engine serving 1,200+ students; integrated semantic search querying 8,000+ catalog entries with 99.4% retrieval accuracy.',
    techStack: ['Python', 'FastAPI', 'Semantic Vector Search', 'PostgreSQL'],
    architecture: 'Client UI → REST Gateway → Local Embedding Pipeline → Vector Matcher',
    interviewTip: 'Emphasize how you solved catalog search latency using index caching rather than basic SQL LIKE queries.',
  });

  const sampleIdeas = [
    'Built a college library management system using Python and MySQL.',
    'Created a movie review sentiment analyzer with basic NLP.',
    'Made an automated attendance tracker using computer vision and OpenCV.',
  ];

  const handleRunSimulatedAI = (text: string) => {
    setInputText(text);
    setIsGenerating(true);
    setOutput(null);

    setTimeout(() => {
      if (text.includes('library')) {
        setOutput({
          bullet:
            'Engineered an automated Library Resource Engine serving 1,200+ students; integrated semantic search querying 8,000+ catalog entries with 99.4% retrieval accuracy.',
          techStack: ['Python', 'FastAPI', 'Semantic Vector Search', 'PostgreSQL'],
          architecture: 'Client UI → REST Gateway → Local Embedding Pipeline → Vector Matcher',
          interviewTip: 'Emphasize how you solved catalog search latency using index caching rather than basic SQL LIKE queries.',
        });
      } else if (text.includes('sentiment')) {
        setOutput({
          bullet:
            'Developed real-time Audience Sentiment Intelligence pipeline analyzing 5,000+ social text streams; achieved 91.2% F1-score with sub-120ms inference latency.',
          techStack: ['React', 'Node.js', 'Transformer Classifier', 'FastAPI'],
          architecture: 'Frontend Dashboard → WebSocket Stream → Tokenizer → Confidence Scorer',
          interviewTip: 'Explain your choice of precision vs recall for handling negative reviews in enterprise monitoring.',
        });
      } else {
        setOutput({
          bullet:
            'Architected edge-based Automated Attendance Verification system processing 60 FPS video feeds; reduced manual roll-call time by 85% across 4 department labs.',
          techStack: ['Python', 'OpenCV', 'FaceNet Embeddings', 'SQLite Cache'],
          architecture: 'Webcam Stream → Face Detector → Vector Embedder → Attendance Ledger',
          interviewTip: 'Highlight how you handled lighting variation and false positives using cosine distance thresholds.',
        });
      }
      setIsGenerating(false);
    }, 700);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Window Titlebar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 font-mono text-xs text-slate-400">
            workshop-project: resume-ai-bullet-optimizer.ts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
            60-Min Build
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Side: Student Input Simulator */}
        <div className="lg:col-span-5 p-5 space-y-4 bg-slate-900/60">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Step 1: Your Baseline Mini-Project Idea
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Select or type a common engineering project to see how we turn it into an interview-grade AI asset:
            </p>
            <div className="space-y-1.5 mb-3">
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunSimulatedAI(idea)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                    inputText === idea
                      ? 'bg-brand-950/60 border-brand-500/60 text-brand-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
              placeholder="Type your own project idea here..."
            />
          </div>

          <button
            onClick={() => handleRunSimulatedAI(inputText)}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-violet-electric hover:from-brand-500 hover:to-violet-glow flex items-center justify-center gap-2 transition-all shadow-glow-indigo active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Running AI Pipeline Simulation...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Generate AI Project Enhancement</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Working Output & Architecture Preview */}
        <div className="lg:col-span-7 p-5 bg-navy-950 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-accent flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-highlight" />
                <span>Step 2: Practical AI Engineering Output</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Production-Ready Structure</span>
              </span>
            </div>

            {output ? (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Resume Bullet */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Resume-Ready Bullet Point
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {output.bullet}
                  </p>
                </div>

                {/* Tech Stack Chips */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Integrated Architecture Components
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {output.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* System Architecture Flow */}
                <div className="p-3 rounded-lg bg-navy-900/80 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center gap-2 overflow-x-auto">
                  <Zap className="w-3.5 h-3.5 text-cyan-accent shrink-0" />
                  <span className="truncate">{output.architecture}</span>
                </div>

                {/* Technical Interview Tip */}
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300/90">
                  <span className="font-semibold text-amber-200">Interview Defense: </span>
                  {output.interviewTip}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-mono">
                Running neural prompt pipeline...
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Built completely in 60 minutes with zero paid cloud bills.</span>
            <span className="text-brand-400 font-medium">Free Live Hands-on Code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

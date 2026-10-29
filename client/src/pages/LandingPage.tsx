import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Users,
  Award,
  ChevronDown,
  ArrowRight,
  Shield,
  Layers,
  Code,
  Zap,
  Calendar,
} from 'lucide-react';
import { ProjectPreview } from '../components/landing/ProjectPreview';
import { RegistrationForm } from '../components/registration/RegistrationForm';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const learningOutcomes = [
    {
      title: 'AI Application Architecture',
      desc: 'Understand the end-to-end components of a modern AI app: frontend client, API orchestration layer, and model inference capability.',
      icon: Layers,
    },
    {
      title: 'Connecting Interfaces to AI',
      desc: 'Learn how to securely pass user prompts from a React or web UI into an AI backend without leaking API keys or stalling interfaces.',
      icon: Code,
    },
    {
      title: 'Build & Test a Working Project',
      desc: 'Follow live code execution to build and test a functional mini-project that processes inputs and returns structured AI results.',
      icon: Zap,
    },
    {
      title: 'Portfolio & Next Steps',
      desc: 'Identify concrete next steps to expand the mini-project into a full resume-ready capstone project for campus placements.',
      icon: Award,
    },
  ];

  const targetAudiences = [
    {
      title: 'Final-Year Engineering Students',
      desc: 'B.Tech/BE students (2025/2026 batches) preparing for upcoming technical placement interviews and resume reviews.',
    },
    {
      title: 'Students with Basic Programming Knowledge',
      desc: 'If you know basic JavaScript, Python, or standard programming loops, you are ready. No advanced math or tensor theory required.',
    },
    {
      title: 'Students Exploring Practical AI/ML',
      desc: 'Transition from passive video watching to hands-on software development with practical architectural insights.',
    },
    {
      title: 'Portfolio & Capstone Project Seekers',
      desc: 'Engineers who need concrete, defensible technical projects to talk about with tech recruiters and interviewers.',
    },
  ];

  const faqs = [
    {
      q: 'Is this workshop completely free?',
      a: 'Yes. The workshop is 100% free of charge. There are no registration fees, no hidden platform costs, and no requirement for paid cloud subscriptions.',
    },
    {
      q: 'Who is eligible to attend?',
      a: 'The session is specifically designed for final-year and pre-final-year engineering students (CSE, IT, AI/DS, ECE, and related branches) looking to build practical technical projects.',
    },
    {
      q: 'What will I build during the 60 minutes?',
      a: 'You will build a working AI-powered software application (such as an AI Resume Bullet & Project Optimizer) connecting a clean user interface to an AI capability with realistic architecture.',
    },
    {
      q: 'Has the workshop schedule been announced?',
      a: 'Date and time to be announced. Once the date is confirmed, registered participants will receive direct access links and reminders.',
    },
    {
      q: 'How does the student referral link work?',
      a: 'Immediately after registering, you will receive a unique referral code and shareable link. When your campus peers register using your link, you earn verified referral credit on the public leaderboard.',
    },
    {
      q: 'Do I need prior Machine Learning or Deep Learning experience?',
      a: 'No. The workshop is beginner-friendly. We focus on modern AI application development, architectural connectivity, and practical software engineering.',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section id="overview" className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Tag / Organizer */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span>Free Live Online Workshop by NxtWave</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your First AI Project.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-violet-electric">
                Built in 60 Minutes.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Go from idea to a working AI-powered mini project in a guided, beginner-friendly workshop.
              Understand the architecture, connect the interface to an AI capability, and build something
              you can continue exploring.
            </p>

            {/* Detail Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>60-Minute Duration</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>100% Free Workshop</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <Users className="w-4 h-4 text-violet-electric" />
                <span>Final-Year Engineering Focus</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700 font-semibold">Date and time to be announced</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Reserve My Free Spot</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#project-preview"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>See What You'll Build</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Build Section (Interactive CSS Widget) */}
      <section id="project-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Interactive Project Demonstration
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            What You'll Build in 60 Minutes
          </h2>
          <p className="text-sm text-slate-500">
            No dry slide decks. You will code and deploy a functional AI-powered application. Try our
            live simulation below:
          </p>
        </div>

        <ProjectPreview />
      </section>

      {/* Learning Outcomes Section */}
      <section id="outcomes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Structured Curriculum
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            What You Will Learn
          </h2>
          <p className="text-sm text-slate-500">
            Four practical engineering takeaways you can immediately apply to your resume and campus interviews:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningOutcomes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Who Should Attend
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Designed For Engineering Final Years
            </h2>
            <p className="text-sm text-slate-500">
              Tailored for students who want high-leverage practical skills without academic fluff:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {targetAudiences.map((aud, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-4"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{aud.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{aud.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <RegistrationForm />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Clear Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between font-semibold text-sm text-slate-900 hover:text-brand-600"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

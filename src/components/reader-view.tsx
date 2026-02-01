'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Clock, Plus, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TimerHUD from './timer-hud';
import SessionEndModal from './session-end-modal';
import ReviewPanel from './review-panel';

interface ReaderViewProps {
  content: {
    id: string;
    title: string;
    author: string;
    sessionDuration: number;
    content: string;
  };
}

export default function ReaderView({ content }: ReaderViewProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(content.sessionDuration * 60); // Convert to seconds
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (sessionEnded) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionEnded(true);
          setShowEndModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionEnded]);

  const handleExtendSession = () => {
    setShowExtendModal(false);
    setTimeRemaining((prev) => prev + 15 * 60); // Add 15 minutes
  };

  const handleExit = () => {
    setShowReviewPanel(true);
    setShowEndModal(false);
  };

  const handleReviewSubmit = () => {
    setShowReviewPanel(false);
    router.push('/browse');
  };

  const getTimerStatus = () => {
    if (timeRemaining <= 60) return 'critical';
    if (timeRemaining <= 120) return 'warning';
    return 'normal';
  };

  // Parse markdown-like content to HTML with better bullet point handling
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: { type: 'ul' | 'ol', items: string[] } | null = null;

    lines.forEach((line, index) => {
      // Check if this is a list item
      const isUnorderedItem = line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ');
      const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
      const isOrderedItem = !!orderedMatch;

      // If we were building a list and this line is not a list item, close the list
      if (listItems && !isUnorderedItem && !isOrderedItem) {
        if (listItems.type === 'ul') {
          elements.push(
            <ul key={`list-${index}`} className="space-y-2 my-4 ml-4">
              {listItems.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                  <span className="w-2 h-2 mt-2.5 bg-cyan-400 rounded-full flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`list-${index}`} className="space-y-2 my-4 ml-4">
              {listItems.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                  <span className="w-6 h-6 mt-1 bg-cyan-500/20 text-cyan-400 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        listItems = null;
      }

      // Handle list items
      if (isUnorderedItem) {
        const itemText = line.slice(2).trim();
        if (!listItems || listItems.type !== 'ul') {
          listItems = { type: 'ul', items: [] };
        }
        listItems.items.push(itemText);
        return;
      }

      if (isOrderedItem && orderedMatch) {
        const itemText = orderedMatch[2];
        if (!listItems || listItems.type !== 'ol') {
          listItems = { type: 'ol', items: [] };
        }
        listItems.items.push(itemText);
        return;
      }

      // Handle other elements
      if (line.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-4xl font-bold font-display text-white mb-8 mt-12 first:mt-0">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-2xl font-bold font-display text-white mb-6 mt-10">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl font-semibold text-white mb-4 mt-8">{line.slice(4)}</h3>);
      } else if (line.startsWith('*') && line.endsWith('*')) {
        elements.push(<p key={index} className="text-gray-400 italic mb-4">{line.slice(1, -1)}</p>);
      } else if (line.startsWith('---')) {
        elements.push(<hr key={index} className="border-white/10 my-8" />);
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-4" />);
      } else {
        elements.push(<p key={index} className="text-gray-300 leading-relaxed mb-4 font-reading text-lg">{line}</p>);
      }
    });

    // Close any remaining list
    if (listItems) {
      if (listItems.type === 'ul') {
        elements.push(
          <ul key="final-list" className="space-y-2 my-4 ml-4">
            {listItems.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                <span className="w-2 h-2 mt-2.5 bg-cyan-400 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key="final-list" className="space-y-2 my-4 ml-4">
            {listItems.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                <span className="w-6 h-6 mt-1 bg-cyan-500/20 text-cyan-400 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
    }

    return elements;
  };

  return (
    <div className={`min-h-screen bg-white ${sessionEnded ? 'overflow-hidden' : ''}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-white line-clamp-1">{content.title}</h1>
              <p className="text-sm text-gray-400">by {content.author}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExtendModal(true)}
              className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-cyan-400 hover:bg-white/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Extend Time</span>
            </button>
          </div>
        </div>
      </header>

      {/* Timer HUD */}
      <TimerHUD
        timeRemaining={timeRemaining}
        totalTime={content.sessionDuration * 60}
        status={getTimerStatus()}
        onClick={() => setShowExtendModal(true)}
      />

      {/* Content */}
      <main className={`pt-24 pb-16 transition-all duration-500 ${sessionEnded ? 'blur-xl' : ''}`}>
        <article className="container mx-auto px-6 max-w-3xl">
          <div className="prose prose-invert max-w-none">
            {renderContent(content.content)}
          </div>
        </article>
      </main>

      {/* Extend Time Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowExtendModal(false)} />
          <div className="relative w-full max-w-md glass-strong rounded-2xl p-8">
            <button
              onClick={() => setShowExtendModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white font-display mb-2">Extend Your Session</h3>
              <p className="text-gray-400">Add more time to continue reading</p>
            </div>
            
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">+15 minutes</div>
                  <div className="text-sm text-gray-400">Current: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining</div>
                </div>
                <span className="text-2xl font-bold font-mono gradient-text">$1.99</span>
              </div>
            </div>
            
            <button
              onClick={handleExtendSession}
              className="w-full btn-glow py-4 rounded-xl text-white font-semibold"
            >
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Session End Modal */}
      {showEndModal && (
        <SessionEndModal
          onExtend={() => {
            setShowEndModal(false);
            setShowExtendModal(true);
          }}
          onExit={handleExit}
          pagesRead={12}
          timeSpent={content.sessionDuration}
        />
      )}

      {/* Review Panel */}
      {showReviewPanel && (
        <ReviewPanel
          contentTitle={content.title}
          onSubmit={handleReviewSubmit}
          onClose={() => {
            setShowReviewPanel(false);
            router.push('/browse');
          }}
        />
      )}
    </div>
  );
}

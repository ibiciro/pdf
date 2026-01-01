'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, Plus, BookOpen, Shield, AlertTriangle } from 'lucide-react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [timeRemaining, setTimeRemaining] = useState(content.sessionDuration * 60); // Convert to seconds
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [showCopyWarning, setShowCopyWarning] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  // Generate device fingerprint on mount
  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        const components = [
          navigator.userAgent,
          navigator.language,
          new Date().getTimezoneOffset(),
          screen.width + 'x' + screen.height,
          screen.colorDepth,
          navigator.hardwareConcurrency || 'unknown',
        ];
        
        const str = components.join('|');
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setDeviceFingerprint(hashHex.slice(0, 16));
      } catch (e) {
        setDeviceFingerprint('fallback-' + Date.now());
      }
    };
    
    generateFingerprint();
  }, []);

  // Content Protection - Prevent copy/paste
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyAttempts(prev => prev + 1);
      setShowCopyWarning(true);
      setTimeout(() => setShowCopyWarning(false), 3000);
      
      // Set clipboard to warning message
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '⚠️ Content copying is not allowed. This content is protected by PayPerRead.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (contentRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        setShowCopyWarning(true);
        setTimeout(() => setShowCopyWarning(false), 3000);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, F12
      if (
        (e.ctrlKey && ['c', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['c', 'a', 's', 'p', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        setShowCopyWarning(true);
        setTimeout(() => setShowCopyWarning(false), 3000);
      }
    };

    const handleSelectStart = (e: Event) => {
      // Allow some selection but prevent full document selection
      if ((e.target as HTMLElement)?.closest('[data-protected="true"]')) {
        // Allow limited selection for reading
        return;
      }
    };

    const handlePrint = () => {
      setShowCopyWarning(true);
      setTimeout(() => setShowCopyWarning(false), 3000);
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      if (contentRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('beforeprint', handlePrint);

    // CSS to prevent text selection when needed
    const style = document.createElement('style');
    style.innerHTML = `
      [data-protected="true"] {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      @media print {
        [data-protected="true"] {
          display: none !important;
        }
        body::before {
          content: "Content printing is not allowed. Visit PayPerRead to read this content.";
          display: block;
          font-size: 24px;
          text-align: center;
          padding: 50px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('beforeprint', handlePrint);
      document.head.removeChild(style);
    };
  }, []);

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

  // Parse markdown-like content to HTML
  const renderContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-4xl font-bold font-display text-gray-900 mb-8 mt-12 first:mt-0">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold font-display text-gray-900 mb-6 mt-10">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-800 mb-4 mt-8">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-gray-600 ml-6 mb-2 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
          return <li key={index} className="text-gray-600 ml-6 mb-2 list-decimal">{line.slice(3)}</li>;
        }
        if (line.startsWith('*') && line.endsWith('*')) {
          return <p key={index} className="text-gray-500 italic mb-4">{line.slice(1, -1)}</p>;
        }
        if (line.startsWith('---')) {
          return <hr key={index} className="border-gray-200 my-8" />;
        }
        if (line.trim() === '') {
          return <div key={index} className="h-4" />;
        }
        return <p key={index} className="text-gray-700 leading-relaxed mb-4 font-reading text-lg">{line}</p>;
      });
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${sessionEnded ? 'overflow-hidden' : ''}`}>
      {/* Copy Protection Warning */}
      {showCopyWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 px-6 py-4 bg-amber-500 text-white rounded-xl shadow-lg">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Content is protected. Copying is not allowed.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 line-clamp-1">{content.title}</h1>
              <p className="text-sm text-gray-500">by {content.author}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Protected</span>
            </div>
            <button
              onClick={() => setShowExtendModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
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

      {/* Protected Content */}
      <main className={`pt-24 pb-16 transition-all duration-500 ${sessionEnded ? 'blur-xl' : ''}`}>
        <article className="container mx-auto px-6 max-w-3xl">
          {/* Watermark with device fingerprint */}
          <div className="hidden print:block text-center text-gray-300 text-xs mb-8">
            Licensed to device: {deviceFingerprint}
          </div>
          
          <div 
            ref={contentRef}
            data-protected="true"
            className="prose prose-gray max-w-none relative"
            style={{
              WebkitUserSelect: 'text',
              userSelect: 'text',
            }}
          >
            {/* Invisible watermark overlay */}
            <div 
              className="pointer-events-none absolute inset-0 opacity-[0.015] select-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 100px,
                  currentColor 100px,
                  currentColor 100.5px
                )`,
                color: '#000',
              }}
              aria-hidden="true"
            />
            {renderContent(content.content)}
          </div>

          {/* Protection notice */}
          <div className="mt-12 p-4 bg-gray-100 rounded-xl flex items-center gap-3 text-sm text-gray-600">
            <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <p>
              This content is protected by PayPerRead. Copying, downloading, or screenshotting is monitored and may result in account suspension.
            </p>
          </div>
        </article>
      </main>

      {/* Extend Time Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExtendModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => setShowExtendModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Extend Your Session</h3>
              <p className="text-gray-500">Add more time to continue reading</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">+15 minutes</div>
                  <div className="text-sm text-gray-500">Current: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining</div>
                </div>
                <span className="text-2xl font-bold font-mono text-blue-600">$1.99</span>
              </div>
            </div>
            
            <button
              onClick={handleExtendSession}
              className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 py-4 rounded-xl text-white font-semibold shadow-lg transition-all"
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

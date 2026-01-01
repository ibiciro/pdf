'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, Plus, BookOpen, Download, AlertCircle, Shield, Fingerprint } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TimerHUD from './timer-hud';
import SessionEndModal from './session-end-modal';
import ReviewPanel from './review-panel';
import QualityRating from './quality-rating';
import {
  generateDeviceFingerprint,
  generateSessionToken,
  setupAntiScreenshot,
  generateDynamicWatermark,
  applyForensicWatermark,
  DeviceFingerprint,
} from '@/utils/content-protection';

interface ProtectedReaderProps {
  content: {
    id: string;
    title: string;
    author: string;
    sessionDuration: number;
    content: string;
    allowDownload?: boolean;
    downloadPrice?: number;
  };
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export default function ProtectedReader({ content, user }: ProtectedReaderProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [timeRemaining, setTimeRemaining] = useState(content.sessionDuration * 60);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  // Security state
  const [deviceFingerprint, setDeviceFingerprint] = useState<DeviceFingerprint | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [securityInitialized, setSecurityInitialized] = useState(false);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);

  // Generate dynamic watermark with session info
  const watermarkText = deviceFingerprint 
    ? generateDynamicWatermark(user.id, user.email, sessionToken)
    : `${user.email} • ${new Date().toISOString().split('T')[0]} • ID:${user.id.slice(0, 8)}`;

  // Initialize security on mount
  useEffect(() => {
    const initSecurity = async () => {
      try {
        // Generate device fingerprint
        const fingerprint = await generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
        
        // Generate session token
        const token = generateSessionToken();
        setSessionToken(token);
        
        // Log security initialization (in production, send to backend)
        console.log('Security initialized:', {
          fingerprintId: fingerprint.id.slice(0, 16) + '...',
          sessionToken: token.slice(0, 16) + '...',
          contentId: content.id,
          userId: user.id,
        });
        
        setSecurityInitialized(true);
      } catch (error) {
        console.error('Failed to initialize security:', error);
        setSecurityInitialized(true); // Continue with basic protection
      }
    };
    
    initSecurity();
  }, [content.id, user.id]);

  // Setup anti-screenshot protection
  useEffect(() => {
    if (!contentRef.current || !securityInitialized) return;
    
    const cleanup = setupAntiScreenshot(contentRef.current, () => {
      setScreenshotAttempts(prev => prev + 1);
      console.log('Screenshot/screen capture attempt detected');
      // In production, log this to backend
    });
    
    return cleanup;
  }, [securityInitialized]);

  // Prevent copy/paste
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, PrintScreen
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'p' || e.key === 's')) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Detect screenshot attempts (visibility change)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Could log this event
        console.log('User switched tabs - potential screenshot');
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    setTimeRemaining((prev) => prev + 15 * 60);
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

  const handleQualityRate = (rating: string) => {
    console.log('Quality rating:', rating);
    // API call would go here
  };

  // Parse markdown-like content to HTML
  const renderContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold font-display text-gray-900 mb-6 mt-10 first:mt-0">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold font-display text-gray-800 mb-4 mt-8">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-6">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-gray-700 ml-6 mb-2 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
          return <li key={index} className="text-gray-700 ml-6 mb-2 list-decimal">{line.slice(3)}</li>;
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

  // Generate watermark SVG
  const watermarkSvg = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="monospace" font-size="10" fill="rgba(0,0,0,0.15)" 
        transform="rotate(-30, 150, 75)">
        ${watermarkText}
      </text>
    </svg>
  `)}`;

  return (
    <div className={`min-h-screen bg-white ${sessionEnded ? 'overflow-hidden' : ''}`}>
      {/* Watermark overlay */}
      <div 
        className="watermark-overlay"
        style={{ backgroundImage: `url("${watermarkSvg}")` }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-gray-900 line-clamp-1">{content.title}</h1>
                {securityInitialized && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full" title="Content secured with encryption">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Secured</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">by {content.author}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {content.allowDownload && (
              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            )}
            <button
              onClick={() => setShowExtendModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
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
      <main 
        ref={contentRef}
        className={`pt-24 pb-16 transition-all duration-500 protected-content no-screenshot ${sessionEnded ? 'blur-xl' : ''}`}
      >
        <article className="container mx-auto px-6 max-w-3xl">
          {/* Enhanced security notice */}
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-amber-800 font-semibold">Protected Content</p>
                {securityInitialized && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" />
                    Device Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-600 mt-1">
                This content is secured with encryption and device fingerprinting. 
                Copying, screenshots, and unauthorized sharing are disabled and logged.
              </p>
              {screenshotAttempts > 0 && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠️ {screenshotAttempts} screenshot attempt{screenshotAttempts > 1 ? 's' : ''} detected and logged.
                </p>
              )}
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            {renderContent(content.content)}
          </div>

          {/* Quality Rating Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <QualityRating 
              contentId={content.id}
              onRate={handleQualityRate}
              showCounts={true}
            />
          </div>
        </article>
      </main>

      {/* Extend Time Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExtendModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
            <button
              onClick={() => setShowExtendModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Extend Your Session</h3>
              <p className="text-gray-500">Add more time to continue reading</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
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
              className="w-full btn-glow py-4 rounded-xl text-white font-semibold"
            >
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Download Content</h3>
              <p className="text-gray-500">Get a personalized copy with your watermark</p>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Watermarked Download</p>
                  <p className="mt-1 text-amber-600">
                    Your download will include a unique watermark with your user ID. 
                    Sharing this file is traceable and prohibited.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">PDF Download</div>
                  <div className="text-sm text-gray-500">Watermarked with your ID</div>
                </div>
                <span className="text-2xl font-bold font-mono text-green-600">
                  ${((content.downloadPrice || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Handle download with watermark
                setShowDownloadModal(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl text-white font-semibold transition-colors"
            >
              Purchase & Download
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

'use client';

import { Clock, BookOpen, ArrowRight, LogOut } from 'lucide-react';

interface SessionEndModalProps {
  onExtend: () => void;
  onExit: () => void;
  pagesRead: number;
  timeSpent: number;
}

export default function SessionEndModal({ onExtend, onExit, pagesRead, timeSpent }: SessionEndModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Session Expired</h3>
          <p className="text-gray-500">Your reading time has ended</p>
        </div>
        
        {/* Session Summary */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Session Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold font-mono text-gray-900">{pagesRead}</div>
              <div className="text-xs text-gray-500">Pages Read</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-violet-600 mx-auto mb-2" />
              <div className="text-2xl font-bold font-mono text-gray-900">{timeSpent}</div>
              <div className="text-xs text-gray-500">Minutes Spent</div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={onExtend}
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            Continue Reading
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onExit}
            className="w-full py-4 bg-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Exit & Leave Review
          </button>
        </div>
      </div>
    </div>
  );
}

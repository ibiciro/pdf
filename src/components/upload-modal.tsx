'use client';

import { useState, useCallback } from 'react';
import { X, Upload, FileText, Edit3, Clock, DollarSign, Loader2, Check, Download, Shield } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [step, setStep] = useState<'choose' | 'upload' | 'write' | 'settings' | 'success'>('choose');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '4.99',
    duration: '30',
    content: '',
    allowDownload: false,
    downloadPrice: '9.99',
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateUpload();
  }, []);

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setStep('settings');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handlePublish = async () => {
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {step === 'success' ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Content Published!</h3>
            <p className="text-gray-500">Your content is now live and ready for readers.</p>
          </div>
        ) : step === 'choose' ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Create New Content</h3>
              <p className="text-gray-500 text-sm mt-1">Choose how you want to add your content</p>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep('upload')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center hover:bg-gray-100 hover:border-gray-300 transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload PDF</h4>
                <p className="text-sm text-gray-500">Upload an existing PDF document</p>
              </button>
              
              <button
                onClick={() => setStep('write')}
                className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center hover:bg-gray-100 hover:border-gray-300 transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Edit3 className="w-8 h-8 text-violet-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Write Content</h4>
                <p className="text-sm text-gray-500">Create content using our editor</p>
              </button>
            </div>
          </>
        ) : step === 'upload' ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Upload PDF</h3>
              <p className="text-gray-500 text-sm mt-1">Drag and drop your PDF file</p>
            </div>
            
            <div className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isUploading ? (
                  <div>
                    <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 mt-4">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <>
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-700 mb-2">Drag and drop your PDF here</p>
                    <p className="text-gray-400 text-sm mb-4">or</p>
                    <button
                      onClick={simulateUpload}
                      className="px-6 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : step === 'write' ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Write Content</h3>
              <p className="text-gray-500 text-sm mt-1">Create your content using our editor</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your content title"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your content here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 resize-none font-reading"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('settings')}
                  className="btn-glow px-6 py-3 rounded-xl text-white font-semibold"
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Content Settings</h3>
              <p className="text-gray-500 text-sm mt-1">Set pricing and access duration</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your content title"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your content..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price per Session
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 font-mono"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Session Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              {/* Download Option */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Allow Downloads</div>
                      <div className="text-sm text-gray-500">Users can purchase a watermarked copy</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, allowDownload: !formData.allowDownload })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.allowDownload ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.allowDownload ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {formData.allowDownload && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Download Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="text"
                        value={formData.downloadPrice}
                        onChange={(e) => setFormData({ ...formData, downloadPrice: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Downloads include user-specific watermarks for protection
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 py-4 bg-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 btn-glow py-4 rounded-xl text-white font-semibold"
                >
                  Publish Content
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

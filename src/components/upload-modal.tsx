'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileText, Edit3, Clock, DollarSign, Loader2, Check, Download, Shield, AlertCircle } from 'lucide-react';
import { createContentAction } from '@/app/actions';

interface UploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [step, setStep] = useState<'choose' | 'upload' | 'write' | 'settings' | 'success'>('choose');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'text' | 'pdf'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }
    
    setError(null);
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setContentType('pdf');
          setStep('settings');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handlePublish = async (saveAsDraft = false) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      const downloadPriceInCents = formData.allowDownload 
        ? Math.round(parseFloat(formData.downloadPrice) * 100) 
        : undefined;
      
      const result = await createContentAction({
        title: formData.title,
        description: formData.description,
        content_type: contentType,
        content_body: contentType === 'text' ? formData.content : undefined,
        pdf_url: contentType === 'pdf' && selectedFile ? `uploads/${selectedFile.name}` : undefined,
        price_cents: priceInCents,
        session_duration_minutes: parseInt(formData.duration),
        allow_download: formData.allowDownload,
        download_price_cents: downloadPriceInCents,
        status: saveAsDraft ? 'draft' : 'published',
      });

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to publish content. Please try again.');
      setIsSubmitting(false);
    }
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
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Text & PDF Only</h4>
                    <p className="text-sm text-blue-700">This platform is optimized for text articles and PDF documents. Choose your content type below.</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('upload')}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center hover:bg-gray-100 hover:border-gray-300 transition-all group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Upload PDF</h4>
                  <p className="text-sm text-gray-500">Upload an existing PDF document (max 10MB)</p>
                </button>
                
                <button
                  onClick={() => {
                    setContentType('text');
                    setStep('write');
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center hover:bg-gray-100 hover:border-gray-300 transition-all group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit3 className="w-8 h-8 text-violet-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Write Text</h4>
                  <p className="text-sm text-gray-500">Create text content using our editor</p>
                </button>
              </div>
            </div>
          </>
        ) : step === 'upload' ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Upload PDF</h3>
              <p className="text-gray-500 text-sm mt-1">Drag and drop your PDF file (max 10MB)</p>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isUploading ? (
                  <div>
                    <Loader2 className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
                    <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 mt-4">
                      {selectedFile ? `Uploading ${selectedFile.name}...` : 'Uploading...'} {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-50 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">Drag and drop your PDF here</p>
                    <p className="text-gray-400 text-sm mb-4">Supported format: PDF (max 10MB)</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium hover:bg-red-100 transition-colors"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
              
              <div className="mt-4 flex justify-start">
                <button
                  onClick={() => setStep('choose')}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  ← Back to options
                </button>
              </div>
            </div>
          </>
        ) : step === 'write' ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Write Text Content</h3>
              <p className="text-gray-500 text-sm mt-1">Create your article or text content</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your content title"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                  <span className="text-gray-400 font-normal ml-2">({formData.content.length} characters)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your article or text content here. You can use plain text formatting..."
                  rows={10}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 resize-none font-reading leading-relaxed"
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep('choose')}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  ← Back to options
                </button>
                <button
                  onClick={() => setStep('settings')}
                  disabled={!formData.content.trim()}
                  className="btn-glow px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Download className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Enable Secure Downloads</div>
                      <div className="text-sm text-gray-500">Users can purchase encrypted, device-locked copies</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, allowDownload: !formData.allowDownload })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.allowDownload ? 'bg-violet-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.allowDownload ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {formData.allowDownload && (
                  <div className="mt-3 pt-3 border-t border-violet-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Download Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="text"
                          value={formData.downloadPrice}
                          onChange={(e) => setFormData({ ...formData, downloadPrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-3">
                      <p className="text-xs font-medium text-violet-800 mb-2">Protection Features:</p>
                      <ul className="text-xs text-violet-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          AES-256 encryption with personal password
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          Device fingerprint binding (cannot share)
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          Copy & screenshot prevention
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Content Type Badge */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    contentType === 'pdf' ? 'bg-red-100' : 'bg-violet-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      contentType === 'pdf' ? 'text-red-600' : 'text-violet-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {contentType === 'pdf' ? 'PDF Document' : 'Text Article'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contentType === 'pdf' && selectedFile 
                        ? selectedFile.name 
                        : `${formData.content.length} characters`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep('choose')}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={() => handlePublish(true)}
                  disabled={isSubmitting || !formData.title.trim()}
                  className="py-4 px-6 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handlePublish(false)}
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex-1 btn-glow py-4 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Content'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

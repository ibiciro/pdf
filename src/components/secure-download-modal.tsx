'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Lock, 
  Shield, 
  Fingerprint,
  Key,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';
import { 
  generateDeviceFingerprint, 
  createProtectedDownload, 
  generateSecurePassword,
  storeDeviceBinding
} from '@/lib/content-protection';

interface SecureDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    contentType: 'text' | 'pdf';
    downloadPrice: number;
    contentBody?: string;
    pdfUrl?: string;
  };
  user: {
    id: string;
    email: string;
  };
  onPurchaseComplete?: () => void;
}

type Step = 'payment' | 'processing' | 'password' | 'download' | 'success';

export default function SecureDownloadModal({ 
  isOpen, 
  onClose, 
  content, 
  user,
  onPurchaseComplete 
}: SecureDownloadModalProps) {
  const [step, setStep] = useState<Step>('payment');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateDeviceFingerprint().then(fp => setDeviceFingerprint(fp));
      setPassword(generateSecurePassword());
      setStep('payment');
      setError(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(r => setTimeout(r, 2000));
      
      // In production, this would integrate with Stripe
      // For now, we'll proceed to password step
      setStep('password');
    } catch (err) {
      setError('Payment failed. Please try again.');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateDownload = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get content to encrypt
      let contentToEncrypt: string;
      
      if (content.contentType === 'pdf' && content.pdfUrl) {
        // For PDF, we'd fetch the file and encrypt it
        // For demo, we'll create a placeholder
        contentToEncrypt = `Protected PDF: ${content.title}\n\nThis is a demonstration of the protected download feature.`;
      } else {
        contentToEncrypt = content.contentBody || 'Demo content for protected download.';
      }
      
      // Create protected download package
      const protectedBlob = await createProtectedDownload(
        contentToEncrypt,
        password,
        user.id,
        content.id,
        content.title
      );
      
      // Store device binding
      storeDeviceBinding(content.id, deviceFingerprint);
      
      // Create download URL
      const url = URL.createObjectURL(protectedBlob);
      setDownloadUrl(url);
      setStep('download');
      onPurchaseComplete?.();
    } catch (err) {
      setError('Failed to generate protected download. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${content.title.replace(/[^a-z0-9]/gi, '_')}.ppr`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStep('success');
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">Secure Download</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download "{content.title}"</h3>
                <p className="text-gray-500 text-sm">
                  Get a secure, encrypted copy locked to your device
                </p>
              </div>
              
              {/* Protection Features */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Protection includes:</h4>
                {[
                  { icon: Lock, text: 'Password-protected encryption' },
                  { icon: Fingerprint, text: 'Device fingerprint binding' },
                  { icon: Smartphone, text: 'Cannot be shared or opened on other devices' },
                  { icon: Shield, text: 'Screenshot & copy prevention' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <feature.icon className="w-4 h-4 text-green-600" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Price */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <span className="text-blue-800 font-medium">Download Price</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${(content.downloadPrice / 100).toFixed(2)}
                </span>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <button
                onClick={handlePayment}
                className="w-full btn-glow py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Pay & Generate Download
              </button>
            </div>
          )}
          
          {/* Processing Step */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-gray-500 text-sm">Please wait while we secure your transaction</p>
            </div>
          )}
          
          {/* Password Step */}
          {step === 'password' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-500 text-sm">
                  Save your personal decryption password below
                </p>
              </div>
              
              {/* Password Display */}
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Your Password</span>
                  <button
                    onClick={copyPassword}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <code className={`flex-1 text-lg font-mono ${showPassword ? 'text-green-400' : 'text-gray-500'}`}>
                    {showPassword ? password : '••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Important!</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Save this password securely. You'll need it to open the file. The download will only work on THIS device.
                  </p>
                </div>
              </div>
              
              {/* Device Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Device Fingerprint</span>
                </div>
                <code className="text-xs text-gray-400 font-mono break-all">
                  {deviceFingerprint}
                </code>
              </div>
              
              <button
                onClick={handleGenerateDownload}
                disabled={isProcessing}
                className="w-full btn-glow py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Key className="w-5 h-5" />
                )}
                {isProcessing ? 'Generating...' : 'Generate Protected File'}
              </button>
            </div>
          )}
          
          {/* Download Step */}
          {step === 'download' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Download!</h3>
                <p className="text-gray-500 text-sm">
                  Your protected file is ready. Click below to download.
                </p>
              </div>
              
              {/* File Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{content.title}</p>
                    <p className="text-xs text-gray-500">.ppr (Protected Format)</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                className="w-full btn-glow py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Protected File
              </button>
              
              <p className="text-xs text-gray-400 text-center">
                Remember: Use password <code className="text-gray-600">{password.slice(0, 4)}...</code> to open
              </p>
            </div>
          )}
          
          {/* Success Step */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Download Complete!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Your protected file has been downloaded. Use your saved password to open it.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

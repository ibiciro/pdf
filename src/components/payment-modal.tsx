'use client';

import { useState } from 'react';
import { X, Clock, CreditCard, Check, Loader2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createReadingSessionAction } from '@/app/actions';

interface PaymentModalProps {
  content: {
    id: string;
    title: string;
    price: number;
    sessionDuration: number;
  };
  onClose: () => void;
}

export default function PaymentModal({ content, onClose }: PaymentModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create reading session in database
      const result = await createReadingSessionAction(content.id, content.price);
      
      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect to reader view after success animation
      setTimeout(() => {
        router.push(`/read/${content.id}`);
      }, 1500);
    } catch (err) {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {isSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Payment Successful!</h3>
            <p className="text-gray-500 mb-4">Redirecting to reader view...</p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
        ) : (
          // Payment Form
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-display">Complete Payment</h3>
              <p className="text-gray-500 text-sm mt-1">Unlock timed access to this content</p>
            </div>
            
            {/* Content Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{content.title}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{content.sessionDuration} min session</span>
                  </div>
                  <span className="text-2xl font-bold font-mono gradient-text">
                    ${(content.price / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Payment Method</h4>
              
              <div className="space-y-3">
                {/* Card Option */}
                <label className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl cursor-pointer border-2 border-blue-200">
                  <input type="radio" name="payment" defaultChecked className="sr-only" />
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Credit / Debit Card</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, Amex</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  </div>
                </label>
                
                {/* Apple Pay Option */}
                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                  <input type="radio" name="payment" className="sr-only" />
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-700 font-bold text-sm"></span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Apple Pay</div>
                    <div className="text-sm text-gray-500">Quick checkout</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                </label>
              </div>
            </div>
            
            {/* Card Details */}
            <div className="p-6 border-b border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${(content.price / 100).toFixed(2)}
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                <Shield className="w-4 h-4" />
                <p>Secure payment. Your session starts immediately after payment.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

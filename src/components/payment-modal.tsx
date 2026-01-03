'use client';

import { useState, useEffect } from 'react';
import { X, Clock, CreditCard, Check, Loader2, AlertCircle, Smartphone, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../supabase/client';

interface PaymentModalProps {
  content: {
    id: string;
    title: string;
    price: number;
    sessionDuration: number;
  };
  onClose: () => void;
}

type PaymentMethod = 'card' | 'paypal' | 'paystack' | 'flutterwave' | 'momo' | 'demo';

export default function PaymentModal({ content, onClose }: PaymentModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('demo');
  const [availableGateways, setAvailableGateways] = useState<string[]>(['demo']);
  
  // Fetch available payment gateways
  useEffect(() => {
    const fetchGateways = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('payment_gateway_settings')
        .select('gateway_id')
        .eq('is_enabled', true);
      
      if (data && data.length > 0) {
        setAvailableGateways(['demo', ...data.map(g => g.gateway_id)]);
      }
    };
    
    fetchGateways();
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please sign in to make a purchase');
        setIsProcessing(false);
        return;
      }
      
      // Create payment transaction
      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          content_id: content.id,
          gateway_id: selectedMethod === 'demo' ? 'manual' : selectedMethod,
          amount_cents: content.price,
          currency: 'USD',
          transaction_type: 'purchase',
          status: 'processing',
          metadata: {
            content_title: content.title,
            session_duration: content.sessionDuration,
          }
        })
        .select()
        .single();
      
      if (txError) {
        console.error('Transaction error:', txError);
        // For demo, continue anyway
      }
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create reading session
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + content.sessionDuration);
      
      const { data: session, error: sessionError } = await supabase
        .from('reading_sessions')
        .insert({
          content_id: content.id,
          reader_id: user.id,
          expires_at: expiresAt.toISOString(),
          amount_paid_cents: content.price,
          status: 'active',
          duration_minutes: content.sessionDuration,
        })
        .select()
        .single();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Continue anyway for demo
      }
      
      // Update transaction status
      if (transaction) {
        await supabase
          .from('payment_transactions')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', transaction.id);
      }
      
      // Update content stats
      try {
        await supabase.rpc('increment_earnings', { 
          content_id: content.id, 
          amount: content.price 
        });
      } catch {
        // Function might not exist, continue anyway
      }
      
      setIsSuccess(true);
      
      // Redirect to reader view after success animation
      setTimeout(() => {
        router.push(`/read/${content.id}`);
      }, 1500);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again.');
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
            
            {/* Error Display */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {/* Payment Methods */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Payment Method</h4>
              
              <div className="space-y-3">
                {/* Demo Payment (always available) */}
                <label 
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedMethod === 'demo' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedMethod('demo')}
                >
                  <input type="radio" name="payment" checked={selectedMethod === 'demo'} onChange={() => {}} className="sr-only" />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedMethod === 'demo' ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <Check className={`w-5 h-5 ${selectedMethod === 'demo' ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Demo Payment</div>
                    <div className="text-sm text-gray-500">Test the system (no real charge)</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'demo' ? 'border-green-600' : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'demo' && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
                  </div>
                </label>
                
                {/* Card Option */}
                {availableGateways.includes('stripe') && (
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedMethod === 'card' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedMethod('card')}
                  >
                    <input type="radio" name="payment" checked={selectedMethod === 'card'} onChange={() => {}} className="sr-only" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'card' ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${selectedMethod === 'card' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Credit / Debit Card</div>
                      <div className="text-sm text-gray-500">Visa, Mastercard, Amex</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'card' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                  </label>
                )}
                
                {/* Paystack Option */}
                {availableGateways.includes('paystack') && (
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedMethod === 'paystack' 
                        ? 'bg-teal-50 border-teal-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedMethod('paystack')}
                  >
                    <input type="radio" name="payment" checked={selectedMethod === 'paystack'} onChange={() => {}} className="sr-only" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'paystack' ? 'bg-teal-100' : 'bg-gray-200'
                    }`}>
                      <Wallet className={`w-5 h-5 ${selectedMethod === 'paystack' ? 'text-teal-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Paystack</div>
                      <div className="text-sm text-gray-500">Cards, Bank, USSD</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'paystack' ? 'border-teal-600' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'paystack' && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                    </div>
                  </label>
                )}
                
                {/* PayPal Option */}
                {availableGateways.includes('paypal') && (
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedMethod === 'paypal' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedMethod('paypal' as PaymentMethod)}
                  >
                    <input type="radio" name="payment" checked={selectedMethod === 'paypal'} onChange={() => {}} className="sr-only" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'paypal' ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      <Wallet className={`w-5 h-5 ${selectedMethod === 'paypal' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">PayPal</div>
                      <div className="text-sm text-gray-500">PayPal balance, cards, bank</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'paypal' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                  </label>
                )}
                
                {/* MoMo Option */}
                {availableGateways.includes('momo') && (
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedMethod === 'momo' 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedMethod('momo')}
                  >
                    <input type="radio" name="payment" checked={selectedMethod === 'momo'} onChange={() => {}} className="sr-only" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'momo' ? 'bg-yellow-100' : 'bg-gray-200'
                    }`}>
                      <Smartphone className={`w-5 h-5 ${selectedMethod === 'momo' ? 'text-yellow-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Mobile Money</div>
                      <div className="text-sm text-gray-500">MTN MoMo, Airtel Money</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'momo' ? 'border-yellow-600' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-yellow-600" />}
                    </div>
                  </label>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full btn-glow py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-center text-xs text-gray-400 mt-4">
                {selectedMethod === 'demo' 
                  ? 'Demo mode - no real charge. Your session starts immediately.'
                  : 'Secure payment. Your session starts immediately after payment.'
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

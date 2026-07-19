'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Banknote, ShieldCheck, Loader2 } from 'lucide-react';
import { CartItem } from '../../data/menuData';

interface CustomerPaymentProps {
  cart: CartItem[];
  onBack: () => void;
  onPaymentSuccess: (paymentMethod: 'UPI' | 'Card' | 'Cash') => void;
  error?: string | null;
  setError?: (val: string | null) => void;
}

export const CustomerPayment: React.FC<CustomerPaymentProps> = ({
  cart,
  onBack,
  onPaymentSuccess,
  error,
  setError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const handlePay = async () => {
    setIsProcessing(true);
    if (setError) setError(null);
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await onPaymentSuccess(selectedMethod);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'UPI' as const, name: 'UPI / Scan QR', desc: 'Google Pay, PhonePe, Paytm', icon: Smartphone },
    { id: 'Card' as const, name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
    { id: 'Cash' as const, name: 'Cash Deposit', desc: 'Insert notes in the pod slot', icon: Banknote },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-strokedark px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (setError) setError(null);
              onBack();
            }}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-sm text-bodydark2 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>
          <h2 className="text-base font-bold text-white tracking-tight">Checkout</h2>
          <div className="w-12"></div> {/* spacer */}
        </div>
      </div>

      {/* Checkout Content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6 relative z-10">
        
        {/* Order Summary */}
        <div className="rounded-2xl border border-strokedark bg-boxdark p-5 shadow-default">
          <h3 className="text-xs font-mono font-bold text-bodydark2 uppercase tracking-wider mb-4">
            Order Summary
          </h3>
          <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{item.emoji}</span>
                  <span className="text-white font-medium truncate">{item.name}</span>
                  <span className="text-xs font-mono text-bodydark2 shrink-0">x{item.quantity}</span>
                </div>
                <span className="font-mono text-white font-semibold shrink-0">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-strokedark mt-4 pt-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Grand Total</span>
            <span className="text-xl font-extrabold text-white font-mono">
              ₹{totalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-bodydark2 uppercase tracking-wider pl-1">
            Select Payment Method
          </h3>
          
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-md'
                    : 'bg-boxdark border-strokedark hover:border-bodydark2/45'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-xl border ${
                    isSelected ? 'bg-primary/10 text-primary border-primary/20' : 'bg-black/30 text-bodydark2 border-strokedark'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-white leading-tight">
                      {method.name}
                    </span>
                    <span className="block text-[10px] text-bodydark2 font-mono mt-0.5 leading-none">
                      {method.desc}
                    </span>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-primary' : 'border-strokedark'
                }`}>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl border border-meta-1/20 bg-meta-1/10 text-xs text-meta-1 text-center font-mono">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            Complete Payment · ₹{totalPrice.toLocaleString('en-IN')}
          </motion.button>
        </div>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-99999 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Processing Transaction</h3>
            <span className="text-xs font-mono text-bodydark2 tracking-widest uppercase">
              Please do not close this screen
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

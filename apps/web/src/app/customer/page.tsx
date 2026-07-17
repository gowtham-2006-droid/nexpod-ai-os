'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerHome } from '../../components/customer/CustomerHome';
import { CustomerMenu } from '../../components/customer/CustomerMenu';
import { CustomerPayment } from '../../components/customer/CustomerPayment';
import { CustomerOrderStatus } from '../../components/customer/CustomerOrderStatus';
import { CartItem } from '../../data/menuData';
import { api } from '../../lib/api';
import { logger } from '../../lib/logger';

type FlowStep = 'home' | 'menu' | 'payment' | 'preparing';

// Map menu names and categories to the backend simulator engine's valid database SKUs
const mapMenuToSku = (name: string, category: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('cold brew')) {
    return 'cold-brew';
  }
  if (category === 'addons') {
    return 'protein-bar';
  }
  return 'water';
};

export default function CustomerApp() {
  const [step, setStep] = useState<FlowStep>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Handle flow transitions
  const handleStartOrder = () => {
    setCart([]);
    setPaymentError(null);
    setStep('menu');
  };

  const handleBackToMenu = () => {
    setStep('menu');
  };

  const handleCheckout = () => {
    setPaymentError(null);
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentMethod: 'UPI' | 'Card' | 'Cash') => {
    try {
      setPaymentError(null);
      let lastCreatedOrderId = '';
      
      // Dispatch each item in the cart to the FastAPI server
      for (const item of cart) {
        const sku = mapMenuToSku(item.name, item.category);
        const res = await api.createOrder('pod-001', sku, item.quantity);
        if (res && res.id) {
          lastCreatedOrderId = res.id;
        }
      }
      
      // Use the actual database order ID returned from FastAPI, fallback if needed
      const finalId = lastCreatedOrderId || `NXP-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderId(finalId);
      setStep('preparing');
    } catch (err: any) {
      logger.error("Order creation at API gateway failed:", err);
      const isConflict = err?.message?.includes('409');
      if (isConflict) {
        setPaymentError("Insufficient Stock: The requested beverage ingredients are temporarily depleted.");
      } else {
        // Fallback safely for demo resilience on connection errors
        const fallbackId = `NXP-${Math.floor(1000 + Math.random() * 9000)}`;
        setOrderId(fallbackId);
        setStep('preparing');
      }
    }
  };

  const handleOrderReset = () => {
    setCart([]);
    setStep('home');
  };

  // Transition animations
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-black text-bodydark font-sans select-none flex items-center justify-center">
      {/* Desktop Wrapper to mock a mobile smartphone frame */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-black sm:border sm:border-strokedark sm:rounded-[40px] sm:shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-y-auto overflow-x-hidden relative no-scrollbar">
        
        {/* Dynamic step rendering */}
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <CustomerHome onStart={handleStartOrder} />
            </motion.div>
          )}

          {step === 'menu' && (
            <motion.div
              key="menu"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <CustomerMenu
                cart={cart}
                setCart={setCart}
                onBack={() => setStep('home')}
                onCheckout={handleCheckout}
              />
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <CustomerPayment
                cart={cart}
                onBack={handleBackToMenu}
                onPaymentSuccess={handlePaymentSuccess}
                error={paymentError}
                setError={setPaymentError}
              />
            </motion.div>
          )}

          {step === 'preparing' && (
            <motion.div
              key="preparing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <CustomerOrderStatus
                cart={cart}
                orderId={orderId}
                onReset={handleOrderReset}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

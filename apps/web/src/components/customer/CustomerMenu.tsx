'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { menuItems, categories, MenuItem, CartItem } from '../../data/menuData';

interface CustomerMenuProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onBack: () => void;
  onCheckout: () => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  cart,
  setCart,
  onBack,
  onCheckout,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('coffee');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [milk, setMilk] = useState<'Whole' | 'Oat' | 'Almond'>('Whole');
  const [sweetness, setSweetness] = useState<'None' | 'Half' | 'Regular'>('Regular');

  const filteredItems = menuItems.filter((i) => i.category === activeCategory);

  const getCartQty = (id: string) => cart.find((c) => c.id === id)?.quantity || 0;

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) =>
        c.id === id ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const tagColors: Record<string, string> = {
    Bestseller: 'bg-chart-4/15 text-chart-4 border-chart-4/25',
    New: 'bg-chart-2/15 text-chart-2 border-chart-2/25',
    Popular: 'bg-chart-1/15 text-chart-1 border-chart-1/25',
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-strokedark px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-bodydark2 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-base font-bold text-white tracking-tight">Menu</h2>
          <div className="flex items-center gap-1.5 text-sm text-bodydark2">
            <ShoppingCart className="w-4 h-4" />
            <span className="font-mono font-bold text-white">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[65px] z-40 bg-black/60 backdrop-blur-lg border-b border-strokedark">
        <div className="max-w-lg mx-auto flex gap-1 px-4 py-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-boxdark text-bodydark2 border border-strokedark hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {filteredItems.map((item, i) => {
              const qty = getCartQty(item.id);
              return (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  onClick={() => {
                    setActiveItem(item);
                    setMilk('Whole');
                    setSweetness('Regular');
                  }}
                  className="rounded-2xl border border-strokedark bg-boxdark p-5 shadow-default relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer text-left flex gap-4"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

                  {/* Emoji avatar */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 border border-strokedark text-2xl shrink-0">
                    {item.emoji}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white truncate">
                        {item.name}
                      </h3>
                      <span className="text-sm font-extrabold text-white font-mono shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex gap-1.5 mb-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              tagColors[tag] || 'bg-meta-4 text-bodydark2 border-strokedark'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-bodydark leading-relaxed mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-primary font-bold">Customize & Add</span>
                      {qty > 0 && (
                        <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">
                          {qty} in Cart
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="sticky bottom-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onCheckout}
              className="w-full max-w-lg mx-auto flex items-center justify-between px-6 py-4 rounded-2xl bg-primary text-primary-foreground shadow-xl cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {totalItems} item{totalItems > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold font-mono">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Modal Detail Overlay */}
      <AnimatePresence>
        {activeItem && (() => {
          const qty = getCartQty(activeItem.id);
          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveItem(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Customization card */}
              <motion.div
                layoutId={`item-${activeItem.id}`}
                className="relative w-full max-w-md bg-boxdark border border-strokedark rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 text-left overflow-hidden"
              >
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/80 border border-strokedark flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer z-20"
                >
                  ✕
                </button>

                <div className="space-y-5 relative z-10">
                  {/* Header */}
                  <div className="flex gap-4 items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/40 border border-strokedark text-3xl shrink-0">
                      {activeItem.emoji}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {activeItem.name}
                      </h3>
                      <span className="text-sm font-extrabold text-primary font-mono">
                        ₹{activeItem.price}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-bodydark2 leading-relaxed border-b border-strokedark/50 pb-4">
                    {activeItem.description}
                  </p>

                  {/* Customizations */}
                  <div className="space-y-4">
                    {/* Milk selection */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-bodydark2 uppercase tracking-wider block">Milk Option</span>
                      <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-strokedark">
                        {(['Whole', 'Oat', 'Almond'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMilk(m)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                              milk === m ? 'bg-primary text-black font-bold' : 'text-bodydark2 hover:text-white'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sweetness selection */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-bodydark2 uppercase tracking-wider block">Sweetness</span>
                      <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-strokedark">
                        {(['None', 'Half', 'Regular'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setSweetness(s)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                              sweetness === s ? 'bg-primary text-black font-bold' : 'text-bodydark2 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nutrition/Ingredient overview */}
                  <div className="text-[10px] font-mono text-bodydark2 bg-black/20 p-3 rounded-xl border border-strokedark leading-relaxed">
                    <span>Ingredients: Freshly ground beans, filtered water, {milk.toLowerCase()} milk, {sweetness.toLowerCase()} sweetness level.</span>
                  </div>

                  {/* Quantity Controls and Add to Cart */}
                  <div className="flex items-center justify-between border-t border-strokedark/50 pt-4">
                    <span className="text-[10px] font-mono text-bodydark2">
                      Selected: {milk} · {sweetness}
                    </span>
                    <div className="flex items-center gap-3">
                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-black/30 rounded-xl px-2.5 py-1.5 border border-strokedark">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(activeItem.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-boxdark text-bodydark2 hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </motion.button>
                          <span className="text-sm font-bold text-white font-mono w-5 text-center">
                            {qty}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(activeItem)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(activeItem)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Cart
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

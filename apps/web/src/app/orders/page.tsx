'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  TrendingUp,
  Coffee,
} from 'lucide-react';

import { api, OrderItem } from '../../lib/api';
import { OrdersTable } from '../../components/OrdersTable';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/skeleton';
import { usePolling } from '../../hooks/usePolling';
import { logger } from '../../lib/logger';

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(1);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    todaysOrders: '0',
    completed: '0',
    preparing: '0',
    revenue: '₹0',
  });

  const triggerAction = () => {};

  const fetchOrders = async () => {
    try {
      const dashboard = await api.getDashboard();
      const res = await api.getOrders();
      
      setNotifications(dashboard.alerts);
      
      // Map backend list to match table schema
      // OrderRecord has properties: id, pod_id, created_at, total_inr, lines: { items: [...] }
      const mappedOrders = res.orders || [];
      setOrdersList(mappedOrders);

      // 2. Count orders based on their status fields returned from the backend
      const rawOrders = mappedOrders as any[];
      const completedCount = rawOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      const preparingCount = rawOrders.filter(o => o.status === 'preparing' || o.status === 'brewing').length;

      setKpis({
        todaysOrders: dashboard.orders.toString(),
        completed: completedCount.toString() || '0',
        preparing: preparingCount.toString() || '0',
        revenue: `₹${dashboard.revenue.toLocaleString('en-IN')}`,
      });
    } catch (err) {
      logger.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  usePolling(fetchOrders, 5000);

  // Map API OrderItems to components/OrdersTable Order type
  // Components Order type requires: id, customer, product, price, status, time, payment
  const displayOrders = ordersList.map((order: any) => {
    // Extract customer, product, payment from lines or metadata
    const items = order.lines?.items || [];
    const productName = items.map((i: any) => i.sku).join(', ') || 'Espresso';
    
    // Parse time
    const timeStr = new Date(order.created_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return {
      id: order.id,
      customer: order.customer || 'Walk-up Guest',
      product: productName,
      price: order.total_inr,
      status: (order.status || 'completed') as any,
      time: timeStr,
      payment: (order.payment_method || 'UPI') as any,
    };
  });

  const kpiCards = [
    {
      label: "Today's Orders",
      value: kpis.todaysOrders,
      icon: ShoppingCart,
      change: '+12.5%',
      changeColor: 'text-chart-2',
    },
    {
      label: 'Completed',
      value: kpis.completed,
      icon: CheckCircle,
      change: '81.2%',
      changeColor: 'text-chart-2',
    },
    {
      label: 'Preparing',
      value: kpis.preparing,
      icon: Clock,
      change: 'In Queue',
      changeColor: 'text-chart-4',
    },
    {
      label: 'Revenue',
      value: kpis.revenue,
      icon: TrendingUp,
      change: '+18.4%',
      changeColor: 'text-chart-2',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-bodydark">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          triggerAction={triggerAction}
        />

        <main className="p-4 md:p-6 2xl:p-10 max-w-[1500px] w-full mx-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Orders
                </h2>
                <span className="text-xs text-bodydark2 font-mono">
                  Real-time order management
                </span>
              </div>
            </div>
            <nav className="text-xs font-medium text-bodydark2 font-mono flex items-center gap-1.5">
              <span className="hover:text-white cursor-default">Operations</span>
              <span>/</span>
              <span className="text-primary">Orders</span>
            </nav>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-7.5">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)
              : kpiCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                      className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-meta-4 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <h4 className="text-2xl font-extrabold text-white font-mono">
                            {card.value}
                          </h4>
                          <span className="text-xs font-semibold text-bodydark2 mt-1 block">
                            {card.label}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold font-mono ${card.changeColor}`}>
                          {card.change}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default space-y-3">
              <div className="flex justify-between items-center pb-4 border-b border-strokedark">
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
              </div>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TableRowSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <OrdersTable orders={displayOrders} />
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-[1500px] mx-auto px-6 py-6 border-t border-strokedark w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-bodydark2">
          <span>NexPod Orders Console v1.0.0-PROTOTYPE</span>
          <div className="flex gap-6">
            <span>POS LINK: ACTIVE</span>
            <span>PAYMENT GATEWAY: VERIFIED</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

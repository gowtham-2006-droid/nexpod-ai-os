'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type OrderStatus = 'completed' | 'preparing' | 'pending' | 'cancelled';
export type PaymentMethod = 'UPI' | 'Card' | 'Cash';

export interface Order {
  id: string;
  customer: string;
  product: string;
  price: number;
  status: OrderStatus;
  time: string;
  payment: PaymentMethod;
}

interface OrdersTableProps {
  orders: Order[];
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  completed: {
    label: 'Completed',
    bg: 'bg-chart-2/10',
    text: 'text-chart-2',
    dot: 'bg-chart-2',
  },
  preparing: {
    label: 'Preparing',
    bg: 'bg-chart-4/10',
    text: 'text-chart-4',
    dot: 'bg-chart-4',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-chart-1/10',
    text: 'text-chart-1',
    dot: 'bg-chart-1',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
};

const paymentIcons: Record<string, React.ElementType> = {
  UPI: Smartphone,
  Card: CreditCard,
  Cash: Banknote,
};

const filterTabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' },
];

type SortField = 'id' | 'customer' | 'product' | 'price' | 'time';
type SortDir = 'asc' | 'desc';

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  };

  const filtered = useMemo(() => {
    let result = [...orders];

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter((o) => o.status === activeFilter);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [orders, activeFilter, search, sortField, sortDir]);

  return (
    <div className="rounded-2xl border border-strokedark bg-boxdark shadow-default overflow-hidden">
      {/* Toolbar: Search + Filters */}
      <div className="p-5 border-b border-strokedark flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bodydark2" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/30 border border-strokedark rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-bodydark2 focus:outline-none focus:border-primary/50 transition-colors font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            const cfg = tab.value !== 'all' ? statusConfig[tab.value] : null;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-black/20 text-bodydark2 border-strokedark hover:border-bodydark2 hover:text-white'
                }`}
              >
                {cfg && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-white' : cfg.dot}`} />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-strokedark text-left">
              {[
                { label: 'Order ID', field: 'id' as SortField },
                { label: 'Customer', field: 'customer' as SortField },
                { label: 'Product', field: 'product' as SortField },
                { label: 'Price', field: 'price' as SortField },
                { label: 'Status', field: null },
                { label: 'Time', field: 'time' as SortField },
                { label: 'Payment', field: null },
              ].map((col) => (
                <th
                  key={col.label}
                  onClick={() => col.field && toggleSort(col.field)}
                  className={`px-5 py-4 text-[10px] font-mono font-bold text-bodydark2 uppercase tracking-wider ${
                    col.field ? 'cursor-pointer hover:text-white select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.field && <SortIcon field={col.field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-bodydark2 font-mono">
                  No orders match your search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => {
                const sCfg = statusConfig[order.status];
                const PayIcon = paymentIcons[order.payment] || CreditCard;

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="border-b border-strokedark/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-bold text-primary">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-white">
                        {order.customer}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-bodydark font-medium">
                        {order.product}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-white font-mono">
                        ₹{order.price}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${sCfg.bg} ${sCfg.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-bodydark2">
                        {order.time}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-bodydark font-medium">
                        <PayIcon className="w-3.5 h-3.5 text-bodydark2" />
                        {order.payment}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: count */}
      <div className="px-5 py-3 border-t border-strokedark flex justify-between items-center">
        <span className="text-[10px] font-mono text-bodydark2">
          Showing {filtered.length} of {orders.length} orders
        </span>
        <span className="text-[10px] font-mono text-bodydark2">
          Total: ₹{filtered.reduce((s, o) => s + o.price, 0).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};

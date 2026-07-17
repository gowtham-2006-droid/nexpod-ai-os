export interface MetricItem {
  label: string;
  value: string | number;
  change: string; // e.g., "+12.4%" or "-2.1%"
  trend: 'up' | 'down' | 'neutral';
  status: 'nominal' | 'warning' | 'critical';
  details: string; // e.g., "vs yesterday"
}

export interface ChartDataPoint {
  label: string; // e.g., "09:00", "Mon", "Week 1"
  revenue: number; // INR
}

export interface OrderDataPoint {
  hour: string; // e.g., "08:00"
  orders: number;
  profile: 'Morning' | 'Afternoon' | 'Evening Rush';
}

export interface InventoryItem {
  id: string;
  name: string;
  current: number; // percentage, 0-100
  unit: string;    // e.g., "Liters", "Kg"
  actualValue: number; // e.g., 2.4
  maxValue: number;    // e.g., 10.0
  status: 'nominal' | 'warning' | 'critical';
}

export interface AIRecommendation {
  title: string;
  message: string;
  confidence: number; // percentage, e.g., 94
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction: string;
}

export interface AlertItem {
  id: string;
  code: string;
  title: string;
  message: string;
  severity: 'warning' | 'critical' | 'info';
  timestamp: string; // e.g., "14:32"
  action: string;
}

export interface DashboardData {
  podName: string;
  podStatus: 'online' | 'degraded' | 'offline';
  currentTime: string;
  notificationCount: number;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  kpis: {
    revenue: MetricItem;
    orders: MetricItem;
    machineHealth: MetricItem;
    inventoryHealth: MetricItem;
    customerRating: MetricItem;
    activeAlertsCount: MetricItem;
  };
  charts: {
    revenue: {
      today: ChartDataPoint[];
      week: ChartDataPoint[];
      month: ChartDataPoint[];
    };
    hourlyOrders: OrderDataPoint[];
  };
  inventory: InventoryItem[];
  aiRecommendation: AIRecommendation;
  alerts: AlertItem[];
}

export interface AIInsightInfo {
  priority: string;
  risk: string;
  confidence: number;
  message: string;
  action: string;
}

export interface DashboardData {
  revenue: number;
  orders: number;
  machineHealth: number;
  inventoryHealth: number;
  alerts: number;
  customerRating: number;
  simulationMode: string;
  podStatus: string;
  lastUpdated: string;
  aiInsight: AIInsightInfo;
}

export interface OrderItem {
  id: string;
  pod_id: string;
  created_at: string;
  total_inr: number;
  lines: { items: Array<{ sku: string; quantity: number; unit_price_inr: number }> };
  status?: string;
}

export interface OrdersResponse {
  currency: string;
  orders: OrderItem[];
}

export interface InventoryItem {
  sku: string;
  name: string;
  quantity: number;
  capacity: number;
  reorder_point: number;
  unit_price_inr: number;
}

export interface PodInventory {
  pod_id: string;
  inventory: InventoryItem[];
}

export interface InventoryResponse {
  pods: PodInventory[];
  currency: string;
}

export interface MachineHealthDetail {
  score: number;
  temperature_c: number;
  power_draw_w: number;
  network_latency_ms: number;
  online?: boolean;
  door_locked?: boolean;
}

export interface PodMachineHealth {
  pod_id: string;
  status: string;
  health: MachineHealthDetail;
}

export interface TelemetryData {
  pod_id: string;
  recorded_at: string;
  temperature_c: number;
  power_draw_w: number;
  network_latency_ms: number;
}

export interface IntelligenceInsight {
  priority: string;
  risk: string;
  confidence: number;
  message: string;
  action: string;
  summary?: string;
  recommendation?: string;
  inventoryInsight?: string;
  maintenanceInsight?: string;
  businessInsight?: string;
  demandForecast?: string;
  generatedAt?: string;
  cached?: boolean;
  context?: {
    active_alerts: Array<{ id: string; severity: string; code: string; message: string; timestamp: string }>;
    low_stock: Array<{ sku: string; name: string; quantity: number; capacity: number }>;
  };
}

export interface SettingsData {
  pod_name: string;
  simulation_mode: string;
  alerts_inventory: boolean;
  alerts_maintenance: boolean;
  alerts_revenue: boolean;
  notify_email: boolean;
  notify_push: boolean;
  ai_enabled: boolean;
  ai_auto_reorder: boolean;
  insight_frequency: string;
  confidence_threshold: number;
  location_code?: string;
  simulation_speed?: string;
  timezone?: string;
  language?: string;
}

export interface RuntimeInfo {
  engineStatus: string;
  simulationMode: string;
  runtimeTick: number;
  uptime: string;
  ordersGenerated: number;
  lastTick: string;
  profile: string;
  engineVersion?: string;
  backendStatus?: string;
}

export interface HealthStatus {
  backendStatus: string;
  databaseStatus: string;
  runtimeStatus: string;
  apiStatus: string;
  timestamp: string;
}

export interface AnomalyFeature {
  value: number;
  mean: number;
  std: number;
  z_score: number;
  is_anomaly: boolean;
}

export interface AnomalyReport {
  pod_id: string;
  detected_at: string;
  model_status: 'warming_up' | 'trained';
  samples_collected: number;
  anomaly_detected: boolean;
  composite_risk_score: number;
  confidence: number;
  features: {
    temperature_c?: AnomalyFeature;
    network_latency_ms?: AnomalyFeature;
    power_draw_w?: AnomalyFeature;
  };
  isolation_forest_score: number | null;
  diagnosis: string;
  generated_by: string;
}

/** Shape of every message pushed from ws://host/ws/telemetry */
export interface WsTelemetrySnapshot {
  type: 'telemetry_snapshot' | 'connected' | 'ping' | 'pong';
  tick: number;
  timestamp: string;
  telemetry: TelemetryData[];
  dashboard: {
    revenue: number;
    orders: number;
    machineHealth: number;
    inventoryHealth: number;
    alerts: number;
    podStatus: string;
    simulationMode: string;
    averageOrderValue: number;
  };
  alerts: Array<{ id: string; code: string; severity: string; message: string }>;
  inventory: Array<{ sku: string; name: string; quantity: number; capacity: number; reorder_point: number }>;
  runtime: RuntimeInfo;
  health: Pick<HealthStatus, 'backendStatus' | 'runtimeStatus'>;
  anomaly: Pick<AnomalyReport, 'model_status' | 'anomaly_detected' | 'composite_risk_score' | 'confidence' | 'diagnosis' | 'samples_collected' | 'generated_by'>;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardData>('/api/dashboard'),
  getOrders: () => request<OrdersResponse>('/api/orders'),
  getInventory: () => request<InventoryResponse>('/api/inventory'),
  getMachine: () => request<PodMachineHealth[]>('/api/machine'),
  getTelemetry: () => request<TelemetryData[]>('/api/telemetry'),
  getIntelligence: () => request<IntelligenceInsight>('/api/intelligence'),
  
  createOrder: (podId: string, sku: string, quantity: number) =>
    request<OrderItem>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ pod_id: podId, sku, quantity }),
    }),
    
  replenishInventory: (podId: string, sku?: string) =>
    request<any>('/api/inventory/replenish', {
      method: 'POST',
      body: JSON.stringify({ pod_id: podId, sku }),
    }),
     
  tickSimulation: (minutes: number = 1) =>
    request<any>(`/api/internal/tick?minutes=${minutes}`, {
      method: 'POST',
    }),
    
  getSettings: () => request<SettingsData>('/api/settings'),
  updateSettings: (data: Partial<SettingsData>) =>
    request<SettingsData>('/api/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetSettings: () =>
    request<SettingsData>('/api/settings/reset', {
      method: 'POST',
    }),
  getRuntime: () => request<RuntimeInfo>('/api/runtime'),
  getHealth: () => request<HealthStatus>('/api/health'),
  getAnomaly: () => request<AnomalyReport>('/api/anomaly'),
  
  postChat: (messages: Array<{ role: string; content: string }>) =>
    request<{ response: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
};

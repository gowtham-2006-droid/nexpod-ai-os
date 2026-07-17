export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface AIInsight {
  id: string;
  prediction: string;
  confidence: number; // 0-100
  priority: Priority;
  recommendation: string;
  sparklineData: number[];
  metric?: string;
  metricValue?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface IntelligenceDomain {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  insights: AIInsight[];
}

export interface IntelligencePageData {
  overallConfidence: number;
  modelVersion: string;
  lastInference: string;
  totalPredictions: number;
  domains: IntelligenceDomain[];
}

export const intelligencePageData: IntelligencePageData = {
  overallConfidence: 91,
  modelVersion: 'NexPod-LLM v3.2.1-prod',
  lastInference: '< 30 seconds ago',
  totalPredictions: 847,

  domains: [
    {
      id: 'demand',
      title: 'Demand Intelligence',
      subtitle: 'Predictive demand forecasting & customer behavior analysis',
      icon: 'trending-up',
      insights: [
        {
          id: 'di-1',
          prediction: 'Coffee demand will increase by 24% after 6 PM due to evening rush pattern detected across last 14 days.',
          confidence: 94,
          priority: 'high',
          recommendation: 'Pre-brew 40 additional espresso shots between 5:30–6:00 PM to reduce wait times during peak.',
          sparklineData: [12, 15, 14, 18, 22, 28, 35, 48, 52, 45, 38, 30],
          metric: 'Predicted Orders',
          metricValue: '+24%',
          trend: 'up',
        },
        {
          id: 'di-2',
          prediction: 'Tea demand declining 8% week-over-week. Weekend patterns show sustained drop since July 5.',
          confidence: 87,
          priority: 'low',
          recommendation: 'Consider introducing seasonal iced tea variants to reverse declining trend. A/B test pricing at ₹10 discount.',
          sparklineData: [45, 42, 40, 38, 36, 35, 34, 32, 30, 29, 28, 27],
          metric: 'Weekly Trend',
          metricValue: '-8%',
          trend: 'down',
        },
        {
          id: 'di-3',
          prediction: 'Saturday foot traffic projected to peak at 2:30 PM with 120+ concurrent visitors in the atrium zone.',
          confidence: 78,
          priority: 'medium',
          recommendation: 'Deploy express queue mode and activate secondary dispensing unit by 2:00 PM Saturday.',
          sparklineData: [20, 35, 55, 80, 95, 120, 110, 85, 60, 40, 25, 15],
          metric: 'Peak Visitors',
          metricValue: '120+',
          trend: 'up',
        },
      ],
    },
    {
      id: 'inventory',
      title: 'Inventory Intelligence',
      subtitle: 'Predictive stock management & automated reorder signals',
      icon: 'layers',
      insights: [
        {
          id: 'ii-1',
          prediction: 'Milk inventory will deplete to critical levels by 5:30 PM today based on current consumption rate of 0.45L/hr.',
          confidence: 96,
          priority: 'critical',
          recommendation: 'Dispatch immediate drone refill order. Estimated delivery: 45 minutes. Route: Warehouse Delta → Pod Atrium.',
          sparklineData: [100, 92, 85, 78, 65, 52, 40, 28, 18, 10, 5, 2],
          metric: 'Time to Depletion',
          metricValue: '2.5 hrs',
          trend: 'down',
        },
        {
          id: 'ii-2',
          prediction: 'Sugar consumption rate is 12% below forecast. Current reserves will last 30+ hours without intervention.',
          confidence: 89,
          priority: 'low',
          recommendation: 'No action required. Defer sugar reorder to standard Saturday maintenance window.',
          sparklineData: [90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79],
          metric: 'Reserve Level',
          metricValue: '90%',
          trend: 'stable',
        },
        {
          id: 'ii-3',
          prediction: 'Water tank TDS reading trending upward — projected to exceed 60ppm quality threshold in 18 hours.',
          confidence: 82,
          priority: 'medium',
          recommendation: 'Schedule UV sterilization cycle and filter flush during next low-traffic window (tomorrow 06:00 AM).',
          sparklineData: [42, 43, 44, 45, 46, 48, 49, 51, 53, 55, 57, 59],
          metric: 'TDS Level',
          metricValue: '45→59 ppm',
          trend: 'up',
        },
      ],
    },
    {
      id: 'machine',
      title: 'Machine Intelligence',
      subtitle: 'Predictive maintenance & subsystem anomaly detection',
      icon: 'activity',
      insights: [
        {
          id: 'mi-1',
          prediction: 'Machine health remains excellent at 94%. All 7 subsystems are operating within nominal parameters.',
          confidence: 97,
          priority: 'low',
          recommendation: 'Continue standard monitoring cadence. No preemptive maintenance required for the next 72 hours.',
          sparklineData: [94, 94, 95, 94, 93, 94, 95, 94, 94, 95, 94, 94],
          metric: 'Health Score',
          metricValue: '94%',
          trend: 'stable',
        },
        {
          id: 'mi-2',
          prediction: 'Water pump filter efficiency declining — flow rate dropped 10% over 72 hours. Failure probability: 15% within 5 days.',
          confidence: 88,
          priority: 'high',
          recommendation: 'Schedule preemptive filter replacement during Wed 06:00–08:00 AM maintenance window. Parts already in inventory.',
          sparklineData: [100, 98, 97, 95, 94, 93, 92, 91, 90, 89, 88, 87],
          metric: 'Pump Efficiency',
          metricValue: '-10%',
          trend: 'down',
        },
      ],
    },
    {
      id: 'business',
      title: 'Business Intelligence',
      subtitle: 'Revenue optimization & operational performance insights',
      icon: 'bar-chart',
      insights: [
        {
          id: 'bi-1',
          prediction: 'Business performance increased 18% compared to same period last month. Revenue trajectory exceeding quarterly target.',
          confidence: 92,
          priority: 'low',
          recommendation: 'Maintain current pricing strategy. Consider premium add-on upsell during peak hours to capitalize on momentum.',
          sparklineData: [180, 195, 210, 225, 240, 255, 268, 280, 295, 310, 325, 340],
          metric: 'Revenue Growth',
          metricValue: '+18%',
          trend: 'up',
        },
        {
          id: 'bi-2',
          prediction: 'Average order value dropped ₹8 during afternoon slot (1–4 PM). Customers skipping add-ons in this window.',
          confidence: 85,
          priority: 'medium',
          recommendation: 'Activate "Afternoon Combo" bundle pricing (Coffee + Snack at ₹15 discount) to lift AOV during 1–4 PM slot.',
          sparklineData: [145, 142, 138, 135, 130, 128, 125, 122, 120, 118, 115, 112],
          metric: 'Avg Order Value',
          metricValue: '-₹8',
          trend: 'down',
        },
        {
          id: 'bi-3',
          prediction: 'Customer satisfaction score stable at 4.7/5.0. Wait time is the #1 complaint driver (mentioned in 34% of feedback).',
          confidence: 91,
          priority: 'medium',
          recommendation: 'Reduce average wait time from 3.2 min to <2.5 min by enabling predictive pre-brewing during identified rush windows.',
          sparklineData: [4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.8, 4.7, 4.7, 4.7, 4.7, 4.7],
          metric: 'CSAT Score',
          metricValue: '4.7/5.0',
          trend: 'stable',
        },
      ],
    },
  ],
};

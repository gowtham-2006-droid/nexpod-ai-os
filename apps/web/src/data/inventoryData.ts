export interface DetailedInventoryItem {
  id: string;
  name: string;
  current: number; // percentage
  actualValue: number;
  maxValue: number;
  unit: string;
  rate: number; // units consumed per hour
  timeRemaining: string; // hours remaining formatted
  status: 'nominal' | 'warning' | 'critical';
  aiRecommendation: string;
  icon: string;
}

export interface ConsumptionDataPoint {
  label: string; // e.g. "Mon" or "08:00"
  Milk: number;
  CoffeeBeans: number;
  TeaPowder: number;
  Sugar: number;
  Water: number;
}

export interface InventoryPageData {
  healthScore: number;
  lastUpdated: string;
  nextRecommendedRefill: string;
  items: DetailedInventoryItem[];
  charts: {
    daily: ConsumptionDataPoint[];
    weekly: ConsumptionDataPoint[];
  };
}

export const inventoryPageData: InventoryPageData = {
  healthScore: 72,
  lastUpdated: '14:32',
  nextRecommendedRefill: 'Milk Refill Required (before 5:30 PM)',
  items: [
    {
      id: 'inv-milk',
      name: 'Milk',
      current: 28,
      actualValue: 2.8,
      maxValue: 10.0,
      unit: 'Liters',
      rate: 0.45,
      timeRemaining: '2.5 Hours',
      status: 'critical',
      aiRecommendation: 'Reorder immediately. Reserves will deplete before evening rush (5:30 PM). Refill route drone standard v2.',
      icon: 'milk'
    },
    {
      id: 'inv-beans',
      name: 'Coffee Beans',
      current: 85,
      actualValue: 4.25,
      maxValue: 5.0,
      unit: 'Kg',
      rate: 0.12,
      timeRemaining: '35.4 Hours',
      status: 'nominal',
      aiRecommendation: 'Reserves optimal. Projected stock sufficient for the next 2 full operational days.',
      icon: 'beans'
    },
    {
      id: 'inv-tea',
      name: 'Tea Powder',
      current: 75,
      actualValue: 1.5,
      maxValue: 2.0,
      unit: 'Kg',
      rate: 0.05,
      timeRemaining: '30.0 Hours',
      status: 'nominal',
      aiRecommendation: 'Reserves stable. Recommended replenishment during standard maintenance cycle on Saturday.',
      icon: 'tea'
    },
    {
      id: 'inv-sugar',
      name: 'Sugar',
      current: 90,
      actualValue: 4.5,
      maxValue: 5.0,
      unit: 'Kg',
      rate: 0.15,
      timeRemaining: '30.0 Hours',
      status: 'nominal',
      aiRecommendation: 'Sugar reserves high. Current load allowance is stable. No action required.',
      icon: 'sugar'
    },
    {
      id: 'inv-water',
      name: 'Water',
      current: 62,
      actualValue: 15.5,
      maxValue: 25.0,
      unit: 'Liters',
      rate: 1.10,
      timeRemaining: '14.1 Hours',
      status: 'nominal',
      aiRecommendation: 'Water reserves satisfactory. Depletion rate is normal. Next auto-plumb cycle in 12h.',
      icon: 'water'
    }
  ],
  charts: {
    daily: [
      { label: '06:00', Milk: 0.2, CoffeeBeans: 0.05, TeaPowder: 0.02, Sugar: 0.05, Water: 0.5 },
      { label: '08:00', Milk: 0.8, CoffeeBeans: 0.20, TeaPowder: 0.08, Sugar: 0.22, Water: 2.1 },
      { label: '10:00', Milk: 1.5, CoffeeBeans: 0.38, TeaPowder: 0.12, Sugar: 0.40, Water: 4.0 },
      { label: '12:00', Milk: 2.1, CoffeeBeans: 0.52, TeaPowder: 0.18, Sugar: 0.60, Water: 6.2 },
      { label: '14:00', Milk: 2.8, CoffeeBeans: 0.70, TeaPowder: 0.25, Sugar: 0.82, Water: 8.5 },
      { label: '16:00', Milk: 3.4, CoffeeBeans: 0.88, TeaPowder: 0.32, Sugar: 1.05, Water: 11.2 },
      { label: '18:00', Milk: 4.8, CoffeeBeans: 1.25, TeaPowder: 0.45, Sugar: 1.45, Water: 15.8 },
      { label: '20:00', Milk: 6.5, CoffeeBeans: 1.70, TeaPowder: 0.58, Sugar: 1.95, Water: 21.0 },
      { label: '22:00', Milk: 7.2, CoffeeBeans: 1.90, TeaPowder: 0.65, Sugar: 2.15, Water: 23.4 }
    ],
    weekly: [
      { label: 'Mon', Milk: 6.2, CoffeeBeans: 1.6, TeaPowder: 0.5, Sugar: 1.8, Water: 18.5 },
      { label: 'Tue', Milk: 6.8, CoffeeBeans: 1.8, TeaPowder: 0.6, Sugar: 2.0, Water: 20.2 },
      { label: 'Wed', Milk: 6.5, CoffeeBeans: 1.7, TeaPowder: 0.5, Sugar: 1.9, Water: 19.8 },
      { label: 'Thu', Milk: 7.1, CoffeeBeans: 1.9, TeaPowder: 0.7, Sugar: 2.2, Water: 22.0 },
      { label: 'Fri', Milk: 8.2, CoffeeBeans: 2.1, TeaPowder: 0.8, Sugar: 2.5, Water: 25.4 },
      { label: 'Sat', Milk: 9.5, CoffeeBeans: 2.5, TeaPowder: 0.9, Sugar: 2.9, Water: 29.1 },
      { label: 'Sun', Milk: 8.8, CoffeeBeans: 2.3, TeaPowder: 0.8, Sugar: 2.7, Water: 27.5 }
    ]
  }
};

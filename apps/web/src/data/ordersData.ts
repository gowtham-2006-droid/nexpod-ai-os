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

export interface OrdersKPI {
  todaysOrders: number;
  completed: number;
  preparing: number;
  revenue: string;
}

export interface OrdersPageData {
  kpi: OrdersKPI;
  orders: Order[];
}

export const ordersPageData: OrdersPageData = {
  kpi: {
    todaysOrders: 384,
    completed: 312,
    preparing: 18,
    revenue: '₹42,850',
  },
  orders: [
    { id: 'NXP-4821', customer: 'Arjun Mehta', product: 'Cappuccino', price: 180, status: 'completed', time: '14:32', payment: 'UPI' },
    { id: 'NXP-4820', customer: 'Priya Sharma', product: 'Espresso Double', price: 150, status: 'completed', time: '14:28', payment: 'Card' },
    { id: 'NXP-4819', customer: 'Rahul Verma', product: 'Masala Chai', price: 80, status: 'preparing', time: '14:25', payment: 'UPI' },
    { id: 'NXP-4818', customer: 'Sneha Patel', product: 'Latte + Cookie', price: 250, status: 'preparing', time: '14:22', payment: 'Card' },
    { id: 'NXP-4817', customer: 'Vikram Singh', product: 'Americano', price: 140, status: 'completed', time: '14:18', payment: 'Cash' },
    { id: 'NXP-4816', customer: 'Ananya Gupta', product: 'Green Tea', price: 90, status: 'completed', time: '14:12', payment: 'UPI' },
    { id: 'NXP-4815', customer: 'Karan Joshi', product: 'Mocha', price: 200, status: 'pending', time: '14:08', payment: 'Card' },
    { id: 'NXP-4814', customer: 'Divya Nair', product: 'Flat White', price: 170, status: 'completed', time: '14:02', payment: 'UPI' },
    { id: 'NXP-4813', customer: 'Rohit Kapoor', product: 'Iced Coffee', price: 160, status: 'cancelled', time: '13:55', payment: 'Cash' },
    { id: 'NXP-4812', customer: 'Meera Iyer', product: 'Cappuccino + Muffin', price: 280, status: 'completed', time: '13:48', payment: 'UPI' },
    { id: 'NXP-4811', customer: 'Aditya Rao', product: 'Espresso', price: 120, status: 'completed', time: '13:42', payment: 'Card' },
    { id: 'NXP-4810', customer: 'Ishita Banerjee', product: 'Chai Latte', price: 110, status: 'preparing', time: '13:38', payment: 'UPI' },
    { id: 'NXP-4809', customer: 'Siddharth Das', product: 'Cold Brew', price: 190, status: 'completed', time: '13:30', payment: 'Card' },
    { id: 'NXP-4808', customer: 'Pooja Reddy', product: 'Matcha Latte', price: 220, status: 'completed', time: '13:22', payment: 'UPI' },
    { id: 'NXP-4807', customer: 'Nikhil Tiwari', product: 'Americano', price: 140, status: 'pending', time: '13:15', payment: 'Cash' },
    { id: 'NXP-4806', customer: 'Riya Choudhary', product: 'Cappuccino', price: 180, status: 'completed', time: '13:08', payment: 'Card' },
    { id: 'NXP-4805', customer: 'Amit Saxena', product: 'Double Espresso', price: 150, status: 'completed', time: '12:55', payment: 'UPI' },
    { id: 'NXP-4804', customer: 'Kavitha Menon', product: 'Iced Matcha', price: 210, status: 'cancelled', time: '12:48', payment: 'Card' },
    { id: 'NXP-4803', customer: 'Deepak Kumar', product: 'Masala Chai', price: 80, status: 'completed', time: '12:40', payment: 'Cash' },
    { id: 'NXP-4802', customer: 'Shruti Agarwal', product: 'Latte', price: 160, status: 'completed', time: '12:32', payment: 'UPI' },
  ],
};

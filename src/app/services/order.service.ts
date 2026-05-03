import { Injectable, signal } from '@angular/core';
import { db } from '../firebase.config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
} from 'firebase/firestore';

export type OrderStatus =
  | 'requested'
  | 'accepted'
  | 'sorting'
  | 'packed'
  | 'in_transit'
  | 'delivered'
  | 'payment_pending'
  | 'paid'
  | 'rejected'
  | 'cancelled';

export interface Order {
  id?: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerDistrict: string;
  merchantId: string;
  merchantName: string;
  crop: string;
  mandi: string;
  grade: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  commission: number;
  netAmount: number;
  totalAmount: number;
  status: OrderStatus;
  updatedAt?: Timestamp;
  notes?: string;
  statusHistory?: StatusEntry[];
  transportPartner?: string;
  vehicleNumber?: string;
  pickupDate?: string;
  pickupTime?: string;
  estimatedDelivery?: string;
  expectedPaymentDate?: string;
  rejectionReason?: string;
  paymentMethod?: string;
  paymentReference?: string;
  farmerNotes?: string;
  merchantNotes?: string;
}

export interface StatusEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

const STATUS_FLOW: OrderStatus[] = [
  'requested',
  'accepted',
  'sorting',
  'packed',
  'in_transit',
  'delivered',
  'payment_pending',
  'paid',
];

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersCollection = collection(db, 'orders');

  farmerOrders = signal<Order[]>([]);
  merchantOrders = signal<Order[]>([]);

  readonly STATUS_FLOW = STATUS_FLOW;

  listenToFarmerOrders(farmerId: string) {
    const q = query(
      this.ordersCollection,
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((d) => {
          orders.push({ id: d.id, ...d.data() } as Order);
        });
        this.farmerOrders.set(orders);
      },
      (error) => {
        console.error('Error listening to farmer orders:', error.message);
        if (error.code === 'failed-precondition') {
          const fallbackQ = query(this.ordersCollection, where('farmerId', '==', farmerId));
          onSnapshot(fallbackQ, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach((d) => {
              orders.push({ id: d.id, ...d.data() } as Order);
            });
            this.farmerOrders.set(orders);
          });
        }
      },
    );
  }

  listenToMerchantOrders(merchantId: string) {
    const q = query(
      this.ordersCollection,
      where('merchantId', '==', merchantId),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((d) => {
          orders.push({ id: d.id, ...d.data() } as Order);
        });
        this.merchantOrders.set(orders);
      },
      (error) => {
        console.error('Error listening to merchant orders:', error.message);
        if (error.code === 'failed-precondition') {
          const fallbackQ = query(this.ordersCollection, where('merchantId', '==', merchantId));
          onSnapshot(fallbackQ, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach((d) => {
              orders.push({ id: d.id, ...d.data() } as Order);
            });
            this.merchantOrders.set(orders);
          });
        }
      },
    );
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) {
    const now = new Date().toISOString();
    return addDoc(this.ordersCollection, {
      ...order,
      status: 'requested',
      statusHistory: [{ status: 'requested', timestamp: now }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string) {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const current = docSnap.data() as Order;
    const now = new Date().toISOString();
    const entry: StatusEntry = { status: newStatus, timestamp: now };
    if (note) entry.note = note;

    const updates: Record<string, unknown> = {
      status: newStatus,
      statusHistory: [...(current.statusHistory || []), entry],
      updatedAt: serverTimestamp(),
    };

    // Auto-set expected payment date when delivered
    if (newStatus === 'delivered' && !current.expectedPaymentDate) {
      const payDate = new Date();
      payDate.setDate(payDate.getDate() + 5);
      updates['expectedPaymentDate'] = payDate.toISOString().split('T')[0];
    }

    return updateDoc(docRef, updates);
  }

  async acceptOrder(orderId: string, note?: string) {
    return this.updateOrderStatus(orderId, 'accepted', note);
  }

  async rejectOrder(orderId: string, reason: string) {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const current = docSnap.data() as Order;
    const now = new Date().toISOString();

    return updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason,
      statusHistory: [
        ...(current.statusHistory || []),
        { status: 'rejected', timestamp: now, note: reason },
      ],
      updatedAt: serverTimestamp(),
    });
  }

  async cancelOrder(orderId: string) {
    return this.updateOrderStatus(orderId, 'cancelled', 'Cancelled by farmer');
  }

  async updateLogistics(
    orderId: string,
    logistics: {
      transportPartner?: string;
      vehicleNumber?: string;
      pickupDate?: string;
      pickupTime?: string;
      estimatedDelivery?: string;
    },
  ) {
    const docRef = doc(db, 'orders', orderId);
    return updateDoc(docRef, {
      ...logistics,
      updatedAt: serverTimestamp(),
    });
  }

  async markPayment(
    orderId: string,
    payment: { paymentMethod: string; paymentReference: string; paymentDate: string },
  ) {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const current = docSnap.data() as Order;
    const now = new Date().toISOString();

    return updateDoc(docRef, {
      ...payment,
      status: 'paid',
      statusHistory: [
        ...(current.statusHistory || []),
        { status: 'paid', timestamp: now, note: `Paid via ${payment.paymentMethod}` },
      ],
      updatedAt: serverTimestamp(),
    });
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  }

  formatAmount(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

import { Injectable, signal } from '@angular/core';
import { db } from '../firebase.config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { CropRate } from './rates.service';
import { Order, OrderStatus, StatusEntry } from './order.service';
import { MerchantProfile, FarmerProfile } from './auth.service';

export interface UserRecord {
  uid: string;
  role: 'merchant' | 'farmer';
  profile: MerchantProfile | FarmerProfile;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  allRates = signal<CropRate[]>([]);
  allOrders = signal<Order[]>([]);
  allUsers = signal<UserRecord[]>([]);

  private unsubRates: (() => void) | null = null;
  private unsubOrders: (() => void) | null = null;

  listenToAllRates() {
    this.unsubRates?.();
    const q = query(collection(db, 'rates'), orderBy('updatedAt', 'desc'));
    this.unsubRates = onSnapshot(
      q,
      (snapshot) => {
        const rates: CropRate[] = [];
        snapshot.forEach((d) => rates.push({ id: d.id, ...d.data() } as CropRate));
        this.allRates.set(rates);
      },
      () => {
        const fallback = query(collection(db, 'rates'));
        onSnapshot(fallback, (snapshot) => {
          const rates: CropRate[] = [];
          snapshot.forEach((d) => rates.push({ id: d.id, ...d.data() } as CropRate));
          this.allRates.set(rates);
        });
      },
    );
  }

  listenToAllOrders() {
    this.unsubOrders?.();
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    this.unsubOrders = onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((d) => orders.push({ id: d.id, ...d.data() } as Order));
        this.allOrders.set(orders);
      },
      () => {
        const fallback = query(collection(db, 'orders'));
        onSnapshot(fallback, (snapshot) => {
          const orders: Order[] = [];
          snapshot.forEach((d) => orders.push({ id: d.id, ...d.data() } as Order));
          this.allOrders.set(orders);
        });
      },
    );
  }

  async loadAllUsers() {
    const users: UserRecord[] = [];
    const merchantSnap = await getDocs(collection(db, 'merchants'));
    merchantSnap.forEach((d) =>
      users.push({ uid: d.id, role: 'merchant', profile: d.data() as MerchantProfile }),
    );
    const farmerSnap = await getDocs(collection(db, 'farmers'));
    farmerSnap.forEach((d) =>
      users.push({ uid: d.id, role: 'farmer', profile: d.data() as FarmerProfile }),
    );
    this.allUsers.set(users);
  }

  async updateRate(id: string, data: Partial<CropRate>) {
    return updateDoc(doc(db, 'rates', id), { ...data, updatedAt: serverTimestamp() });
  }

  async deleteRate(id: string) {
    return deleteDoc(doc(db, 'rates', id));
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string) {
    const docRef = doc(db, 'orders', orderId);
    const snapshot = await getDocs(query(collection(db, 'orders')));
    let current: Order | null = null;
    snapshot.forEach((d) => {
      if (d.id === orderId) current = { id: d.id, ...d.data() } as Order;
    });
    if (!current) return;

    const now = new Date().toISOString();
    const entry: StatusEntry = { status: newStatus, timestamp: now };
    if (note) entry.note = note;

    const order = current as Order;
    return updateDoc(docRef, {
      status: newStatus,
      statusHistory: [...(order.statusHistory || []), entry],
      updatedAt: serverTimestamp(),
    });
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

  async updateUserProfile(
    uid: string,
    role: 'merchant' | 'farmer',
    profile: Partial<MerchantProfile | FarmerProfile>,
  ) {
    const collectionName = role === 'merchant' ? 'merchants' : 'farmers';
    const docRef = doc(db, collectionName, uid);
    return updateDoc(docRef, profile);
  }

  async updateOrderDetails(
    orderId: string,
    details: {
      quantity?: number;
      pricePerUnit?: number;
      totalAmount?: number;
      commission?: number;
      netAmount?: number;
    },
  ) {
    const docRef = doc(db, 'orders', orderId);
    return updateDoc(docRef, {
      ...details,
      updatedAt: serverTimestamp(),
    });
  }

  cleanup() {
    this.unsubRates?.();
    this.unsubOrders?.();
  }
}

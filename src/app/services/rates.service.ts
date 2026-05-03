import { Injectable, signal } from '@angular/core';
import { db } from '../firebase.config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export type RateStatus = 'pending' | 'approved' | 'rejected';

export interface Grade {
  name: string;
  price: number;
}

export interface CropRate {
  id?: string;
  merchantId: string;
  merchantName: string;
  mandi: string;
  crop: string;
  emoji: string;
  photo?: string;
  grades: Grade[];
  platformFee?: number;
  status?: RateStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

@Injectable({ providedIn: 'root' })
export class RatesService {
  private ratesCollection = collection(db, 'rates');

  allRates = signal<CropRate[]>([]);
  merchantRates = signal<CropRate[]>([]);

  private cropImageMap: Record<string, string> = {
    Onion: 'assets/images/crops/onion.jpg',
    Tomato: 'assets/images/crops/tomato.jpg',
    Broccoli: 'assets/images/crops/broccoli.jpg',
    Potato: 'assets/images/crops/potato.jpg',
    Cauliflower: 'assets/images/crops/cauliflower.jpg',
    'Green Chilli': 'assets/images/crops/chilli.jpg',
  };

  getCropImage(cropName: string): string {
    return this.cropImageMap[cropName] || 'assets/images/crops/default.jpg';
  }

  listenToAllRates(mandi?: string, status?: RateStatus) {
    let q;
    if (mandi && status) {
      q = query(
        this.ratesCollection,
        where('mandi', '==', mandi),
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
      );
    } else if (mandi) {
      q = query(this.ratesCollection, where('mandi', '==', mandi), orderBy('updatedAt', 'desc'));
    } else if (status) {
      q = query(this.ratesCollection, where('status', '==', status), orderBy('updatedAt', 'desc'));
    } else {
      q = query(this.ratesCollection, orderBy('updatedAt', 'desc'));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const rates: CropRate[] = [];
        snapshot.forEach((doc) => {
          rates.push({ id: doc.id, ...doc.data() } as CropRate);
        });
        this.allRates.set(rates);
      },
      (error) => {
        console.error('Error listening to all rates:', error.message);
        // Signal empty rates so the component can show fallback
        this.allRates.set([]);
        // If index is missing, try without orderBy
        if (error.code === 'failed-precondition') {
          const fallbackQ =
            mandi && status
              ? query(
                  this.ratesCollection,
                  where('mandi', '==', mandi),
                  where('status', '==', status),
                )
              : mandi
                ? query(this.ratesCollection, where('mandi', '==', mandi))
                : status
                  ? query(this.ratesCollection, where('status', '==', status))
                  : query(this.ratesCollection);
          onSnapshot(fallbackQ, (snapshot) => {
            const rates: CropRate[] = [];
            snapshot.forEach((doc) => {
              rates.push({ id: doc.id, ...doc.data() } as CropRate);
            });
            this.allRates.set(rates);
          });
        }
      },
    );
  }

  listenToMerchantRates(merchantId: string) {
    const q = query(
      this.ratesCollection,
      where('merchantId', '==', merchantId),
      orderBy('updatedAt', 'desc'),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const rates: CropRate[] = [];
        snapshot.forEach((doc) => {
          rates.push({ id: doc.id, ...doc.data() } as CropRate);
        });
        this.merchantRates.set(rates);
      },
      (error) => {
        console.error('Error listening to merchant rates:', error.message);
        // If index is missing, try without orderBy
        if (error.code === 'failed-precondition') {
          const fallbackQ = query(this.ratesCollection, where('merchantId', '==', merchantId));
          onSnapshot(fallbackQ, (snapshot) => {
            const rates: CropRate[] = [];
            snapshot.forEach((doc) => {
              rates.push({ id: doc.id, ...doc.data() } as CropRate);
            });
            this.merchantRates.set(rates);
          });
        }
      },
    );
  }

  async addRate(rate: Omit<CropRate, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(this.ratesCollection, {
      ...rate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateRate(id: string, rate: Partial<CropRate>) {
    const docRef = doc(db, 'rates', id);
    return updateDoc(docRef, {
      ...rate,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteRate(id: string) {
    const docRef = doc(db, 'rates', id);
    return deleteDoc(docRef);
  }

  formatPrice(price: number): string {
    return `₹ ${price.toLocaleString('en-IN')}`;
  }
}

import { Injectable, signal } from '@angular/core';
import { db } from '../firebase.config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface Testimonial {
  name: string;
  role: string;
  text: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Stat {
  value: string;
  label: string;
  icon: string;
}

export interface AppSettings {
  heroLocation?: string;
  phoneNumber?: string;
  testimonials?: Testimonial[];
  faqs?: FAQ[];
  defaultMandi?: string;
  mandiList?: string[];
  stats?: Stat[];
}

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private settings = signal<AppSettings>({});
  settingsSignal = this.settings.asReadonly();
  private unsub: (() => void) | null = null;

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    const docRef = doc(db, 'appSettings', 'default');
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      this.settings.set(snapshot.data() as AppSettings);
    } else {
      // Initialize with default values
      const defaultSettings: AppSettings = {
        heroLocation: 'Now connecting farmers in Dhule district!',
        phoneNumber: '9432446384',
        defaultMandi: 'Azadpur Mandi',
        mandiList: ['Azadpur Mandi', 'Vashi Mandi', 'Lasalgaon Mandi'],
        stats: [
          { value: '120+', label: 'Farmers', icon: '👨‍🌾' },
          { value: '85+', label: 'APMCs', icon: '🏛️' },
          { value: '6+', label: 'Countries', icon: '🌍' },
        ],
        testimonials: [
          {
            name: 'Ramesh Kumar',
            role: 'Farmer, Uttar Pradesh',
            text: 'Seedha Bazaar has transformed how I sell my produce. I get better prices and the payment is always on time.',
          },
          {
            name: 'Priya Sharma',
            role: 'Merchant, Delhi',
            text: 'The quality of vegetables I receive is consistently excellent. The platform makes procurement so much easier.',
          },
          {
            name: 'Amit Patel',
            role: 'Agri Trader, Gujarat',
            text: 'Finally, a platform that understands the needs of both farmers and buyers. Transparent and reliable.',
          },
        ],
        faqs: [
          {
            question: 'How does Seedha Bazaar work?',
            answer:
              'Seedha Bazaar connects farmers directly with merchants, eliminating middlemen and ensuring better prices for both parties.',
          },
          {
            question: 'Is there any commission fee?',
            answer:
              'Yes, we charge a small platform fee on each transaction to maintain and improve our services.',
          },
          {
            question: 'How are payments handled?',
            answer:
              'Payments are processed securely through our platform. Merchants pay farmers directly after delivery is confirmed.',
          },
        ],
      };
      await setDoc(docRef, defaultSettings);
      this.settings.set(defaultSettings);
    }

    // Listen for real-time updates
    this.unsub = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        this.settings.set(doc.data() as AppSettings);
      }
    });
  }

  async updateHeroLocation(message: string) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { heroLocation: message }, { merge: true });
  }

  async updatePhoneNumber(phone: string) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { phoneNumber: phone }, { merge: true });
  }

  async updateTestimonials(testimonials: Testimonial[]) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { testimonials }, { merge: true });
  }

  async updateFAQs(faqs: FAQ[]) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { faqs }, { merge: true });
  }

  getHeroLocation(): string {
    return this.settings().heroLocation || 'Now connecting farmers in Dhule district!';
  }

  getPhoneNumber(): string {
    return this.settings().phoneNumber || '9432446384';
  }

  getTestimonials(): Testimonial[] {
    return (
      this.settings().testimonials || [
        {
          name: 'Ramesh Kumar',
          role: 'Farmer, Uttar Pradesh',
          text: 'Seedha Bazaar has transformed how I sell my produce. I get better prices and the payment is always on time.',
        },
        {
          name: 'Priya Sharma',
          role: 'Merchant, Delhi',
          text: 'The quality of vegetables I receive is consistently excellent. The platform makes procurement so much easier.',
        },
        {
          name: 'Amit Patel',
          role: 'Agri Trader, Gujarat',
          text: 'Finally, a platform that understands the needs of both farmers and buyers. Transparent and reliable.',
        },
      ]
    );
  }

  getFAQs(): FAQ[] {
    return (
      this.settings().faqs || [
        {
          question: 'How does Seedha Bazaar work?',
          answer:
            'Seedha Bazaar connects farmers directly with merchants, eliminating middlemen and ensuring better prices for both parties.',
        },
        {
          question: 'Is there any commission fee?',
          answer:
            'Yes, we charge a small platform fee on each transaction to maintain and improve our services.',
        },
        {
          question: 'How are payments handled?',
          answer:
            'Payments are processed securely through our platform. Merchants pay farmers directly after delivery is confirmed.',
        },
      ]
    );
  }

  getDefaultMandi(): string {
    return this.settings().defaultMandi || 'Azadpur Mandi';
  }

  getMandiList(): string[] {
    return this.settings().mandiList || ['Azadpur Mandi', 'Vashi Mandi', 'Lasalgaon Mandi'];
  }

  async updateDefaultMandi(mandi: string) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { defaultMandi: mandi }, { merge: true });
  }

  async updateMandiList(mandiList: string[]) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { mandiList }, { merge: true });
  }

  getStats(): Stat[] {
    return (
      this.settings().stats || [
        { value: '120+', label: 'Farmers', icon: '👨‍🌾' },
        { value: '85+', label: 'APMCs', icon: '🏛️' },
        { value: '6+', label: 'Countries', icon: '🌍' },
      ]
    );
  }

  async updateStats(stats: Stat[]) {
    const docRef = doc(db, 'appSettings', 'default');
    await setDoc(docRef, { stats }, { merge: true });
  }

  cleanup() {
    this.unsub?.();
  }
}

import { Injectable, signal } from '@angular/core';
import { auth, db } from '../firebase.config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type UserRole = 'merchant' | 'farmer' | 'admin';

export interface MerchantProfile {
  displayName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  taluka: string;
  pincode: string;
}

export interface FarmerProfile {
  displayName: string;
  email: string;
  phone: string;
  village: string;
  district: string;
  taluka: string;
  pincode: string;
  crops: string[];
  acreage: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  merchantProfile = signal<MerchantProfile | null>(null);
  farmerProfile = signal<FarmerProfile | null>(null);
  userRole = signal<UserRole | null>(null);
  loading = signal(true);

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser.set(user);
      if (user) {
        await this.loadUserProfile(user.uid);
      } else {
        this.merchantProfile.set(null);
        this.farmerProfile.set(null);
        this.userRole.set(null);
      }
      this.loading.set(false);
    });
  }

  private async loadUserProfile(uid: string) {
    try {
      // Check admin first
      const adminRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        this.userRole.set('admin');
        return;
      }
      // Check merchant profile
      const merchantRef = doc(db, 'merchants', uid);
      const merchantSnap = await getDoc(merchantRef);
      if (merchantSnap.exists()) {
        this.merchantProfile.set(merchantSnap.data() as MerchantProfile);
        this.userRole.set('merchant');
        return;
      }
      // Check farmer profile
      const farmerRef = doc(db, 'farmers', uid);
      const farmerSnap = await getDoc(farmerRef);
      if (farmerSnap.exists()) {
        this.farmerProfile.set(farmerSnap.data() as FarmerProfile);
        this.userRole.set('farmer');
        return;
      }
    } catch {
      // Profile not found is ok
    }
  }

  private sanitizeInput(value: string): string {
    return value.replace(/<[^>]*>/g, '').trim();
  }

  async register(email: string, password: string, profile: Omit<MerchantProfile, 'email'>) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const sanitizedName = this.sanitizeInput(profile.displayName);
    await updateProfile(cred.user, { displayName: sanitizedName });

    // Store full profile in Firestore
    const merchantData: MerchantProfile = {
      displayName: sanitizedName,
      phone: this.sanitizeInput(profile.phone),
      address: this.sanitizeInput(profile.address),
      district: this.sanitizeInput(profile.district),
      taluka: this.sanitizeInput(profile.taluka),
      pincode: this.sanitizeInput(profile.pincode),
      email,
    };
    await setDoc(doc(db, 'merchants', cred.user.uid), merchantData);
    this.merchantProfile.set(merchantData);
    this.userRole.set('merchant');

    return cred;
  }

  async registerFarmer(email: string, password: string, profile: Omit<FarmerProfile, 'email'>) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const sanitizedName = this.sanitizeInput(profile.displayName);
    await updateProfile(cred.user, { displayName: sanitizedName });

    const farmerData: FarmerProfile = {
      displayName: sanitizedName,
      phone: this.sanitizeInput(profile.phone),
      village: this.sanitizeInput(profile.village),
      district: this.sanitizeInput(profile.district),
      taluka: this.sanitizeInput(profile.taluka),
      pincode: this.sanitizeInput(profile.pincode),
      crops: profile.crops.map(c => this.sanitizeInput(c)),
      acreage: profile.acreage,
      email,
    };
    await setDoc(doc(db, 'farmers', cred.user.uid), farmerData);
    this.farmerProfile.set(farmerData);
    this.userRole.set('farmer');

    return cred;
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async logout() {
    this.merchantProfile.set(null);
    this.farmerProfile.set(null);
    this.userRole.set(null);
    return signOut(auth);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isMerchant(): boolean {
    return this.userRole() === 'merchant';
  }

  isFarmer(): boolean {
    return this.userRole() === 'farmer';
  }

  isAdmin(): boolean {
    return this.userRole() === 'admin';
  }
}

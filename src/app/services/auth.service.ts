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
      console.log('[AuthService] onAuthStateChanged fired, user:', user?.uid || 'null');
      this.currentUser.set(user);
      if (user) {
        await this.loadUserProfile(user.uid);
      } else {
        this.merchantProfile.set(null);
        this.farmerProfile.set(null);
        this.userRole.set(null);
      }
      this.loading.set(false);
      console.log(
        '[AuthService] Auth state resolved. Role:',
        this.userRole(),
        'Loading:',
        this.loading(),
      );
    });
  }

  /**
   * Wait until the user role is resolved after login.
   * Waits for loading to complete AND role to be set, then returns the role.
   */
  waitForRole(timeoutMs = 10000): Promise<UserRole | null> {
    return new Promise((resolve) => {
      console.log(
        '[AuthService] waitForRole started. Current loading:',
        this.loading(),
        'role:',
        this.userRole(),
      );
      const start = Date.now();
      const check = () => {
        // Wait for loading to complete AND role to be set (or confirmed null)
        if (!this.loading() && (this.userRole() !== null || !this.currentUser())) {
          console.log('[AuthService] waitForRole resolved with role:', this.userRole());
          resolve(this.userRole());
        } else if (Date.now() - start > timeoutMs) {
          // Timeout - resolve with current role
          console.warn(
            '[AuthService] waitForRole TIMEOUT after',
            timeoutMs,
            'ms. Role:',
            this.userRole(),
          );
          resolve(this.userRole());
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  private async loadUserProfile(uid: string) {
    try {
      console.log('[AuthService] Loading profile for uid:', uid);

      // Check admin first
      const adminRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        this.userRole.set('admin');
        console.log('[AuthService] Loaded admin profile for uid:', uid);
        return;
      }

      // Check merchant profile
      const merchantRef = doc(db, 'merchants', uid);
      const merchantSnap = await getDoc(merchantRef);
      if (merchantSnap.exists()) {
        this.merchantProfile.set(merchantSnap.data() as MerchantProfile);
        this.userRole.set('merchant');
        console.log('[AuthService] Loaded merchant profile for uid:', uid);
        return;
      }

      // Check farmer profile
      const farmerRef = doc(db, 'farmers', uid);
      const farmerSnap = await getDoc(farmerRef);
      if (farmerSnap.exists()) {
        this.farmerProfile.set(farmerSnap.data() as FarmerProfile);
        this.userRole.set('farmer');
        console.log('[AuthService] Loaded farmer profile for uid:', uid);
        return;
      }

      console.warn('[AuthService] No profile found for uid:', uid);
    } catch (error) {
      console.error('[AuthService] Error loading profile for uid:', uid, error);
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
      crops: profile.crops.map((c) => this.sanitizeInput(c)),
      acreage: profile.acreage,
      email,
    };

    console.log('[AuthService] Saving farmer profile for uid:', cred.user.uid);
    await setDoc(doc(db, 'farmers', cred.user.uid), farmerData);
    console.log('[AuthService] Farmer profile saved successfully for uid:', cred.user.uid);

    // Manually load the profile to ensure it's set
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

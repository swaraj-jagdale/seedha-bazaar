import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-farmer-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './farmer-login.html',
  styleUrl: './farmer-login.scss',
})
export class FarmerLogin {
  isRegistering = signal(true);
  isLoading = signal(false);
  error = signal('');
  showForgotPassword = signal(false);
  resetEmail = '';
  resetSuccess = signal('');

  // Login
  loginEmail = '';
  loginPassword = '';

  // Registration
  displayName = '';
  email = '';
  password = '';
  phone = '';
  village = '';
  district = '';
  taluka = '';
  pincode = '';
  cropsInput = '';
  acreage = 1;

  readonly cropOptions = [
    'Broccoli', 'Grapes', 'Muskmelon', 'Apple Ber',
    'Onion', 'Tomato', 'Potato', 'Cauliflower', 'Green Chilli',
  ];
  selectedCrops = signal<string[]>([]);

  constructor(
    public authService: AuthService,
    private router: Router,
    public lang: LanguageService
  ) {}

  toggleCrop(crop: string) {
    const current = this.selectedCrops();
    if (current.includes(crop)) {
      this.selectedCrops.set(current.filter(c => c !== crop));
    } else {
      this.selectedCrops.set([...current, crop]);
    }
  }

  async onRegister() {
    if (!this.displayName || !this.email || !this.password || !this.phone) {
      this.error.set('Please fill all required fields');
      return;
    }
    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error.set('Please enter a valid email address');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (!this.displayName.trim()) {
      this.error.set('Your name is required');
      return;
    }
    if (this.displayName.length > 100) {
      this.error.set('Name is too long');
      return;
    }
    if (this.phone && !/^[6-9]\d{9}$/.test(this.phone)) {
      this.error.set('Please enter a valid 10-digit phone number');
      return;
    }
    if (this.pincode && !/^\d{6}$/.test(this.pincode)) {
      this.error.set('Please enter a valid 6-digit pincode');
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    try {
      await this.authService.registerFarmer(this.email, this.password, {
        displayName: this.displayName,
        phone: this.phone,
        village: this.village,
        district: this.district,
        taluka: this.taluka,
        pincode: this.pincode,
        crops: this.selectedCrops(),
        acreage: this.acreage,
      });
      this.router.navigate(['/farmer/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Registration failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.error.set('Please enter email and password');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginEmail)) {
      this.error.set('Please enter a valid email address');
      return;
    }
    if (this.loginPassword.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
      // Wait briefly for profile to load and check role
      await new Promise(r => setTimeout(r, 500));
      if (this.authService.isMerchant()) {
        this.error.set('This is a merchant account. Please use Merchant Login.');
        await this.authService.logout();
        this.isLoading.set(false);
        return;
      }
      this.router.navigate(['/farmer/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Login failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendResetEmail() {
    if (!this.resetEmail) {
      this.error.set('Please enter your email address');
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    this.resetSuccess.set('');
    try {
      await this.authService.resetPassword(this.resetEmail);
      this.resetSuccess.set('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      this.error.set(err.message || 'Failed to send reset email');
    } finally {
      this.isLoading.set(false);
    }
  }
}

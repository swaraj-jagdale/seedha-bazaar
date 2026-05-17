import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-merchant-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './merchant-login.html',
  styleUrl: './merchant-login.scss',
})
export class MerchantLogin {
  isRegister = signal(false);
  showForgotPassword = signal(false);
  resetEmail = '';
  resetSuccess = signal('');
  email = '';
  password = '';
  displayName = '';
  phone = '';
  address = '';
  district = '';
  taluka = '';
  pincode = '';
  error = signal('');
  loading = signal(false);

  constructor(
    public authService: AuthService,
    private router: Router,
    public lang: LanguageService,
  ) {
    if (this.authService.isLoggedIn() && this.authService.isMerchant()) {
      this.router.navigate(['/merchant/dashboard']);
    }
  }

  toggleMode() {
    this.isRegister.update((v) => !v);
    this.error.set('');
  }

  async onSubmit() {
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
    if (this.isRegister()) {
      if (!this.displayName.trim()) {
        this.error.set('Business name is required');
        return;
      }
      if (this.displayName.length > 100) {
        this.error.set('Business name is too long');
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
    }

    this.error.set('');
    this.loading.set(true);

    try {
      if (this.isRegister()) {
        if (!this.displayName.trim()) {
          this.error.set('Please enter your business name');
          this.loading.set(false);
          return;
        }
        if (!this.phone.trim()) {
          this.error.set('Please enter your phone number');
          this.loading.set(false);
          return;
        }
        await this.authService.register(this.email, this.password, {
          displayName: this.displayName,
          phone: this.phone,
          address: this.address,
          district: this.district,
          taluka: this.taluka,
          pincode: this.pincode,
        });
      } else {
        await this.authService.login(this.email, this.password);
        const role = await this.authService.waitForRole();

        if (role === 'farmer') {
          this.error.set('This is a farmer account. Please use Farmer Login.');
          await this.authService.logout();
          this.loading.set(false);
          return;
        }
        if (role === 'admin') {
          this.error.set('This is an admin account. Please use Admin Login.');
          await this.authService.logout();
          this.loading.set(false);
          return;
        }
        if (role !== 'merchant') {
          this.error.set('No merchant profile found for this account. Please register first.');
          await this.authService.logout();
          this.loading.set(false);
          return;
        }
      }
      this.router.navigate(['/merchant/dashboard']);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        this.error.set('This email is already registered. Please login.');
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        this.error.set('Invalid email or password.');
      } else if (code === 'auth/weak-password') {
        this.error.set('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        this.error.set('Please enter a valid email address.');
      } else {
        this.error.set('Something went wrong. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async sendResetEmail() {
    this.error.set('');
    this.resetSuccess.set('');
    if (!this.resetEmail.trim()) {
      this.error.set('Please enter your email address.');
      return;
    }
    this.loading.set(true);
    try {
      await this.authService.resetPassword(this.resetEmail);
      this.resetSuccess.set('Password reset email sent! Check your inbox.');
    } catch {
      this.error.set('Could not send reset email. Check the email address.');
    } finally {
      this.loading.set(false);
    }
  }
}

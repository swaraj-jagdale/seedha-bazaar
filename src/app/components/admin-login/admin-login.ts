import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    public lang: LanguageService,
  ) {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);

    if (!this.email || !this.password) {
      this.error.set('Please enter email and password.');
      this.loading.set(false);
      return;
    }

    try {
      await this.authService.login(this.email, this.password);

      // Check if user is admin after login
      const role = await this.authService.waitForRole();
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error.set('Access denied. Admin access only.');
        await this.authService.logout();
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      this.error.set(err.message || 'Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}

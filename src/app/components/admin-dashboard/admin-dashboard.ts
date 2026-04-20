import { Component, OnDestroy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, UserRecord } from '../../services/admin.service';
import { RatesService, CropRate } from '../../services/rates.service';
import { OrderStatus } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnDestroy {
  activeTab = signal<'rates' | 'orders' | 'users'>('rates');
  searchQuery = signal('');

  // Rate editing
  editingRate = signal<CropRate | null>(null);
  editForm = {
    gradeAMin: 0, gradeAMax: 0,
    gradeBMin: 0, gradeBMax: 0,
    gradeCMin: 0, gradeCMax: 0,
  };

  // Order status update
  updatingOrderId = signal<string | null>(null);
  newStatus = '';
  statusNote = '';

  statusOptions: OrderStatus[] = [
    'requested', 'accepted', 'sorting', 'packed',
    'in_transit', 'delivered', 'payment_pending', 'paid',
    'rejected', 'cancelled',
  ];

  constructor(
    public authService: AuthService,
    public adminService: AdminService,
    public ratesService: RatesService,
    private router: Router,
    public lang: LanguageService
  ) {
    this.adminService.listenToAllRates();
    this.adminService.listenToAllOrders();
    this.adminService.loadAllUsers();
  }

  ngOnDestroy() {
    this.adminService.cleanup();
  }

  filteredRates = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const rates = this.adminService.allRates();
    if (!q) return rates;
    return rates.filter(r =>
      r.crop.toLowerCase().includes(q) ||
      r.mandi.toLowerCase().includes(q) ||
      r.merchantName.toLowerCase().includes(q)
    );
  });

  filteredOrders = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const orders = this.adminService.allOrders();
    if (!q) return orders;
    return orders.filter(o =>
      o.crop.toLowerCase().includes(q) ||
      o.farmerName.toLowerCase().includes(q) ||
      o.merchantName.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const users = this.adminService.allUsers();
    if (!q) return users;
    return users.filter(u =>
      u.profile.displayName.toLowerCase().includes(q) ||
      u.profile.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    );
  });

  setTab(tab: 'rates' | 'orders' | 'users') {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.editingRate.set(null);
    this.updatingOrderId.set(null);
  }

  // Rates
  startEditRate(rate: CropRate) {
    this.editingRate.set(rate);
    this.editForm = {
      gradeAMin: rate.gradeAMin, gradeAMax: rate.gradeAMax,
      gradeBMin: rate.gradeBMin, gradeBMax: rate.gradeBMax,
      gradeCMin: rate.gradeCMin, gradeCMax: rate.gradeCMax,
    };
  }

  cancelEditRate() {
    this.editingRate.set(null);
  }

  async saveRate() {
    const rate = this.editingRate();
    if (!rate?.id) return;
    await this.adminService.updateRate(rate.id, this.editForm);
    this.editingRate.set(null);
  }

  async deleteRate(rate: CropRate) {
    if (!rate.id) return;
    await this.adminService.deleteRate(rate.id);
  }

  formatPrice(min: number, max: number): string {
    return this.ratesService.formatPrice(min, max);
  }

  // Orders
  startUpdateOrder(orderId: string, currentStatus: string) {
    this.updatingOrderId.set(orderId);
    this.newStatus = currentStatus;
    this.statusNote = '';
  }

  cancelUpdateOrder() {
    this.updatingOrderId.set(null);
  }

  async saveOrderStatus() {
    const id = this.updatingOrderId();
    if (!id) return;
    await this.adminService.updateOrderStatus(id, this.newStatus as OrderStatus, this.statusNote || undefined);
    this.updatingOrderId.set(null);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      requested: 'status-requested',
      accepted: 'status-accepted',
      sorting: 'status-sorting',
      packed: 'status-packed',
      in_transit: 'status-transit',
      delivered: 'status-delivered',
      payment_pending: 'status-payment',
      paid: 'status-paid',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}

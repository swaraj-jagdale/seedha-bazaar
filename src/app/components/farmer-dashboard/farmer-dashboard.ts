import { Component, OnDestroy, signal, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RatesService, CropRate } from '../../services/rates.service';
import { OrderService, Order } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-farmer-dashboard',
  imports: [FormsModule],
  templateUrl: './farmer-dashboard.html',
  styleUrl: './farmer-dashboard.scss',
})
export class FarmerDashboard implements OnDestroy {
  activeTab = signal<'rates' | 'orders'>('rates');
  showOrderForm = signal(false);
  selectedRate = signal<CropRate | null>(null);
  filterCrop = signal('');
  filterMandi = signal('');
  submittingOrder = signal(false);
  orderError = signal('');
  orderSuccess = signal(false);
  showConfirmDialog = signal(false);
  confirmDialogTitle = signal('');
  confirmDialogMessage = signal('');
  confirmDialogAction = signal<(() => void) | null>(null);

  // Order form fields
  orderGrade = 'Grade A';
  orderQuantity = 100;
  orderUnit: 'kg' | 'ton' | 'box' = 'kg';
  orderNotes = '';

  private unsubRates: (() => void) | null = null;
  private unsubOrders: (() => void) | null = null;

  readonly mandis = ['', 'Azadpur Mandi', 'Vashi Mandi', 'Lasalgaon Mandi'];

  filteredRates = computed(() => {
    let rates = this.ratesService.allRates();
    const crop = this.filterCrop();
    const mandi = this.filterMandi();
    if (crop) rates = rates.filter((r) => r.crop.toLowerCase().includes(crop.toLowerCase()));
    if (mandi) rates = rates.filter((r) => r.mandi === mandi);
    return rates;
  });

  activeOrders = computed(() =>
    this.orderService
      .farmerOrders()
      .filter((o) => !['paid', 'rejected', 'cancelled'].includes(o.status)),
  );

  pastOrders = computed(() =>
    this.orderService
      .farmerOrders()
      .filter((o) => ['paid', 'rejected', 'cancelled'].includes(o.status)),
  );

  constructor(
    public authService: AuthService,
    public ratesService: RatesService,
    public orderService: OrderService,
    private router: Router,
    public lang: LanguageService,
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        if (this.unsubRates) this.unsubRates();
        if (this.unsubOrders) this.unsubOrders();
        this.unsubRates = this.ratesService.listenToAllRates(undefined, 'approved');
        this.unsubOrders = this.orderService.listenToFarmerOrders(user.uid);
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubRates) this.unsubRates();
    if (this.unsubOrders) this.unsubOrders();
  }

  openOrderForm(rate: CropRate) {
    if (!rate.grades || rate.grades.length === 0) {
      alert('This rate has no grades available. Please contact the merchant.');
      return;
    }
    this.selectedRate.set(rate);
    this.orderGrade = rate.grades[0].name;
    this.orderQuantity = 100;
    this.orderUnit = 'kg';
    this.orderNotes = '';
    this.showOrderForm.set(true);
  }

  closeOrderForm() {
    this.showOrderForm.set(false);
    this.selectedRate.set(null);
  }

  getGradePrice(rate: CropRate, gradeName: string): number {
    const grade = rate.grades.find((g) => g.name === gradeName);
    return grade?.price || 0;
  }

  getNetPrice(rate: CropRate, gradeName: string): number {
    const grade = rate.grades.find((g) => g.name === gradeName);
    const merchantPrice = grade?.price || 0;
    const platformFee = rate.platformFee ?? 0;
    return Math.max(0, merchantPrice - platformFee);
  }

  get estimatedPrice(): number {
    const rate = this.selectedRate();
    if (!rate) return 0;
    const price = this.getGradePrice(rate, this.orderGrade);
    let qty = this.orderQuantity;
    if (this.orderUnit === 'ton') qty *= 1000;
    if (this.orderUnit === 'box') qty *= 20;
    return Math.round(price * qty);
  }

  get estimatedCommission(): { commission: number; commissionRate: number } {
    const rate = this.selectedRate();
    if (!rate) return { commission: 0, commissionRate: 0 };
    let qty = this.orderQuantity;
    if (this.orderUnit === 'ton') qty *= 1000;
    if (this.orderUnit === 'box') qty *= 20;
    const commissionRate = rate.platformFee || 0;
    const commission = commissionRate * qty;
    return { commission: Math.round(commission), commissionRate };
  }

  openConfirmDialog(title: string, message: string, action: () => void) {
    this.confirmDialogTitle.set(title);
    this.confirmDialogMessage.set(message);
    this.confirmDialogAction.set(action);
    this.showConfirmDialog.set(true);
  }

  executeConfirm() {
    const action = this.confirmDialogAction();
    if (action) action();
    this.closeConfirmDialog();
  }

  closeConfirmDialog() {
    this.showConfirmDialog.set(false);
    this.confirmDialogAction.set(null);
  }

  async submitOrder() {
    if (this.submittingOrder()) return;
    const user = this.authService.currentUser();
    const farmer = this.authService.farmerProfile();
    const rate = this.selectedRate();
    if (!user || !farmer || !rate) return;
    if (this.orderQuantity <= 0) {
      this.orderError.set('Quantity must be greater than 0');
      return;
    }

    const notes = this.orderNotes.trim();

    this.submittingOrder.set(true);
    this.orderError.set('');

    try {
      const pricePerUnit = this.getGradePrice(rate, this.orderGrade);
      let qtyKg = this.orderQuantity;
      if (this.orderUnit === 'ton') qtyKg *= 1000;
      if (this.orderUnit === 'box') qtyKg *= 20;

      const totalAmount = pricePerUnit * qtyKg;
      const platformFee = rate.platformFee ?? 0;
      const commission = platformFee * qtyKg;
      const commissionRate: number = platformFee;

      const orderData = {
        farmerId: user.uid,
        farmerName: farmer.displayName,
        farmerPhone: farmer.phone,
        farmerVillage: farmer.village || '',
        farmerDistrict: farmer.district || '',
        merchantId: rate.merchantId,
        merchantName: rate.merchantName,
        merchantPhone: '',
        crop: rate.crop,
        mandi: rate.mandi,
        grade: this.orderGrade,
        quantity: qtyKg,
        unit: 'kg' as const,
        pricePerUnit,
        totalAmount,
        commission,
        commissionRate,
        netAmount: totalAmount - commission,
        status: 'requested' as const,
        farmerNotes: notes,
      };

      await this.orderService.createOrder(orderData);

      this.closeOrderForm();
      this.activeTab.set('orders');
      this.orderSuccess.set(true);
      setTimeout(() => this.orderSuccess.set(false), 4000);
    } catch (error) {
      console.error('Order placement error:', error);
      this.orderError.set('Failed to place order. Please try again.');
    } finally {
      this.submittingOrder.set(false);
    }
  }

  async cancelOrder(order: Order) {
    if (!order.id) return;
    this.openConfirmDialog(
      this.lang.t('farmerDashboard.cancelOrder'),
      this.lang.t('farmerDashboard.confirmCancel'),
      async () => {
        await this.orderService.cancelOrder(order.id!);
      },
    );
  }

  getStatusLabel(status: string): string {
    return this.lang.t(`order.status.${status}`);
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
    this.openConfirmDialog(
      this.lang.t('dashboard.logout'),
      'Are you sure you want to logout?',
      async () => {
        await this.authService.logout();
        this.router.navigate(['/']);
      },
    );
  }

  formatPrice(price: number): string {
    return `₹ ${price.toLocaleString('en-IN')}`;
  }
}

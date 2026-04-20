import { Component, OnDestroy, signal, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RatesService, CropRate } from '../../services/rates.service';
import { OrderService, Order, OrderStatus } from '../../services/order.service';
import { RateForm } from '../rate-form/rate-form';
import { OrderTracking } from '../order-tracking/order-tracking';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-merchant-dashboard',
  imports: [RateForm, OrderTracking, FormsModule],
  templateUrl: './merchant-dashboard.html',
  styleUrl: './merchant-dashboard.scss',
})
export class MerchantDashboard implements OnDestroy {
  activeTab = signal<'rates' | 'orders'>('rates');
  showForm = signal(false);
  editingRate = signal<CropRate | null>(null);
  showLogisticsModal = signal(false);
  showPaymentModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  rejectReason = '';
  showConfirmDialog = signal(false);
  confirmDialogTitle = signal('');
  confirmDialogMessage = signal('');
  confirmDialogAction = signal<(() => void) | null>(null);
  showRejectDialog = signal(false);

  // Logistics form
  transportPartner = '';
  vehicleNumber = '';
  pickupDate = '';
  pickupTime = '';
  estimatedDelivery = '';

  // Payment form
  paymentMethod = '';
  paymentReference = '';
  paymentDate = '';

  private unsubRates: (() => void) | null = null;
  private unsubOrders: (() => void) | null = null;

  pendingOrders = computed(() =>
    this.orderService.merchantOrders().filter(o => o.status === 'requested')
  );

  activeOrders = computed(() =>
    this.orderService.merchantOrders().filter(o =>
      !['requested', 'paid', 'rejected', 'cancelled'].includes(o.status)
    )
  );

  completedOrders = computed(() =>
    this.orderService.merchantOrders().filter(o =>
      ['paid', 'rejected', 'cancelled'].includes(o.status)
    )
  );

  constructor(
    public authService: AuthService,
    public ratesService: RatesService,
    public orderService: OrderService,
    private router: Router,
    public lang: LanguageService
  ) {
    // Use effect to reactively listen when user becomes available
    // This handles the case where auth state resolves after component init
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        // Clean up previous listener
        if (this.unsubRates) this.unsubRates();
        if (this.unsubOrders) this.unsubOrders();
        this.unsubRates = this.ratesService.listenToMerchantRates(user.uid);
        this.unsubOrders = this.orderService.listenToMerchantOrders(user.uid);
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubRates) this.unsubRates();
    if (this.unsubOrders) this.unsubOrders();
  }

  openAddForm() {
    this.editingRate.set(null);
    this.showForm.set(true);
  }

  openEditForm(rate: CropRate) {
    this.editingRate.set(rate);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingRate.set(null);
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

  async deleteRate(rate: CropRate) {
    if (!rate.id) return;
    this.openConfirmDialog(
      'Delete Rate',
      `Are you sure you want to delete the rate for ${rate.crop}? This cannot be undone.`,
      async () => {
        try {
          await this.ratesService.deleteRate(rate.id!);
        } catch {
          alert('Failed to delete rate. Please try again.');
        }
      }
    );
  }

  async acceptOrder(order: Order) {
    if (order.id) {
      try {
        await this.orderService.acceptOrder(order.id);
      } catch {
        alert('Failed to accept order. Please try again.');
      }
    }
  }

  async rejectOrder(order: Order) {
    if (!order.id) return;
    this.selectedOrder.set(order);
    this.rejectReason = '';
    this.showRejectDialog.set(true);
  }

  async confirmReject() {
    const order = this.selectedOrder();
    if (!order?.id) return;
    try {
      await this.orderService.rejectOrder(order.id, this.rejectReason || 'No reason provided');
      this.showRejectDialog.set(false);
    } catch {
      alert('Failed to reject order. Please try again.');
    }
  }

  async advanceStatus(order: Order) {
    if (!order.id) return;
    const next = this.orderService.getNextStatus(order.status);
    if (next) {
      try {
        await this.orderService.updateOrderStatus(order.id, next);
      } catch {
        alert('Failed to update order status. Please try again.');
      }
    }
  }

  openLogisticsModal(order: Order) {
    this.selectedOrder.set(order);
    this.transportPartner = order.transportPartner || '';
    this.vehicleNumber = order.vehicleNumber || '';
    this.pickupDate = order.pickupDate || '';
    this.pickupTime = order.pickupTime || '';
    this.estimatedDelivery = order.estimatedDelivery || '';
    this.showLogisticsModal.set(true);
  }

  async saveLogistics() {
    const order = this.selectedOrder();
    if (!order?.id) return;
    try {
      await this.orderService.updateLogistics(order.id, {
        transportPartner: this.transportPartner,
        vehicleNumber: this.vehicleNumber,
        pickupDate: this.pickupDate,
        pickupTime: this.pickupTime,
        estimatedDelivery: this.estimatedDelivery,
      });
      this.showLogisticsModal.set(false);
    } catch {
      alert('Failed to save logistics. Please try again.');
    }
  }

  openPaymentModal(order: Order) {
    this.selectedOrder.set(order);
    this.paymentMethod = '';
    this.paymentReference = '';
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.showPaymentModal.set(true);
  }

  async savePayment() {
    const order = this.selectedOrder();
    if (!order?.id || !this.paymentMethod) return;
    try {
      await this.orderService.markPayment(order.id, {
        paymentMethod: this.paymentMethod,
        paymentReference: this.paymentReference,
        paymentDate: this.paymentDate,
      });
      this.showPaymentModal.set(false);
    } catch {
      alert('Failed to record payment. Please try again.');
    }
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
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        await this.authService.logout();
        this.router.navigate(['/']);
      }
    );
  }

  formatPrice(min: number, max: number): string {
    return this.ratesService.formatPrice(min, max);
  }
}

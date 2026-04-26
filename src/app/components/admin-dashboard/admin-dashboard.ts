import { Component, OnDestroy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, UserRecord } from '../../services/admin.service';
import { RatesService, CropRate } from '../../services/rates.service';
import { Order, OrderStatus } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';
import { AppSettingsService } from '../../services/app-settings.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnDestroy {
  activeTab = signal<'rates' | 'orders' | 'users' | 'settings'>('rates');
  searchQuery = signal('');

  // App Settings
  editingHeroLocation = signal(false);
  heroLocationForm = '';
  editingPhoneNumber = signal(false);
  phoneNumberForm = '';
  editingTestimonials = signal(false);
  testimonialsForm: any[] = [];
  editingFAQs = signal(false);
  faqsForm: any[] = [];

  // Rate editing
  editingRate = signal<CropRate | null>(null);
  editForm = {
    gradeAMin: 0,
    gradeAMax: 0,
    gradeBMin: 0,
    gradeBMax: 0,
    gradeCMin: 0,
    gradeCMax: 0,
  };

  // Order status update
  updatingOrderId = signal<string | null>(null);
  newStatus = '';
  statusNote = '';

  // Order details update
  editingOrderDetails = signal<string | null>(null);
  orderDetailsForm = {
    quantity: 0,
    pricePerUnit: 0,
    totalAmount: 0,
    commission: 0,
    netAmount: 0,
  };

  // Logistics form
  logisticsForm = {
    transportPartner: '',
    vehicleNumber: '',
    pickupDate: '',
    pickupTime: '',
    estimatedDelivery: '',
  };

  // User profile update
  editingUserId = signal<string | null>(null);
  userForm = {
    displayName: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    taluka: '',
    pincode: '',
    village: '',
    crops: [] as string[],
    acreage: 0,
  };

  statusOptions: OrderStatus[] = [
    'requested',
    'accepted',
    'sorting',
    'packed',
    'in_transit',
    'delivered',
    'payment_pending',
    'paid',
    'rejected',
    'cancelled',
  ];

  constructor(
    public authService: AuthService,
    public adminService: AdminService,
    public ratesService: RatesService,
    private router: Router,
    public lang: LanguageService,
    private appSettingsService: AppSettingsService,
  ) {
    this.adminService.listenToAllRates();
    this.adminService.listenToAllOrders();
    this.adminService.loadAllUsers();
    this.heroLocationForm = this.appSettingsService.getHeroLocation();
    this.phoneNumberForm = this.appSettingsService.getPhoneNumber();
    this.testimonialsForm = JSON.parse(JSON.stringify(this.appSettingsService.getTestimonials()));
    this.faqsForm = JSON.parse(JSON.stringify(this.appSettingsService.getFAQs()));
  }

  ngOnDestroy() {
    this.adminService.cleanup();
  }

  filteredRates = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const rates = this.adminService.allRates();
    if (!q) return rates;
    return rates.filter(
      (r) =>
        r.crop.toLowerCase().includes(q) ||
        r.mandi.toLowerCase().includes(q) ||
        r.merchantName.toLowerCase().includes(q),
    );
  });

  filteredOrders = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const orders = this.adminService.allOrders();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.crop.toLowerCase().includes(q) ||
        o.farmerName.toLowerCase().includes(q) ||
        o.merchantName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  });

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const users = this.adminService.allUsers();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.profile.displayName.toLowerCase().includes(q) ||
        u.profile.email.toLowerCase().includes(q) ||
        u.role.includes(q),
    );
  });

  setTab(tab: 'rates' | 'orders' | 'users' | 'settings') {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.editingRate.set(null);
    this.updatingOrderId.set(null);
    this.editingOrderDetails.set(null);
    this.editingUserId.set(null);
  }

  // Rates
  startEditRate(rate: CropRate) {
    this.editingRate.set(rate);
    this.editForm = {
      gradeAMin: rate.gradeAMin,
      gradeAMax: rate.gradeAMax,
      gradeBMin: rate.gradeBMin,
      gradeBMax: rate.gradeBMax,
      gradeCMin: rate.gradeCMin,
      gradeCMax: rate.gradeCMax,
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
  startUpdateOrder(orderId: string, currentStatus: string, currentOrder?: any) {
    this.updatingOrderId.set(orderId);
    this.newStatus = currentStatus;
    this.statusNote = '';
    if (currentOrder) {
      this.logisticsForm = {
        transportPartner: currentOrder.transportPartner || '',
        vehicleNumber: currentOrder.vehicleNumber || '',
        pickupDate: currentOrder.pickupDate || '',
        pickupTime: currentOrder.pickupTime || '',
        estimatedDelivery: currentOrder.estimatedDelivery || '',
      };
    }
  }

  cancelUpdateOrder() {
    this.updatingOrderId.set(null);
    this.logisticsForm = {
      transportPartner: '',
      vehicleNumber: '',
      pickupDate: '',
      pickupTime: '',
      estimatedDelivery: '',
    };
  }

  async saveOrderStatus() {
    const id = this.updatingOrderId();
    if (!id) return;
    await this.adminService.updateOrderStatus(
      id,
      this.newStatus as OrderStatus,
      this.statusNote || undefined,
    );
    await this.adminService.updateLogistics(id, this.logisticsForm);
    this.updatingOrderId.set(null);
  }

  // Order details editing
  startEditOrderDetails(order: Order) {
    this.editingOrderDetails.set(order.id!);
    this.orderDetailsForm = {
      quantity: order.quantity,
      pricePerUnit: order.pricePerUnit,
      totalAmount: order.totalAmount,
      commission: order.commission,
      netAmount: order.netAmount,
    };
  }

  cancelEditOrderDetails() {
    this.editingOrderDetails.set(null);
  }

  async saveOrderDetails() {
    const id = this.editingOrderDetails();
    if (!id) return;
    await this.adminService.updateOrderDetails(id, this.orderDetailsForm);
    this.editingOrderDetails.set(null);
  }

  // User profile editing
  startEditUser(user: UserRecord) {
    this.editingUserId.set(user.uid);
    const profile = user.profile as any;
    this.userForm = {
      displayName: profile.displayName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      district: profile.district || '',
      taluka: profile.taluka || '',
      pincode: profile.pincode || '',
      village: profile.village || '',
      crops: profile.crops || [],
      acreage: profile.acreage || 0,
    };
  }

  cancelEditUser() {
    this.editingUserId.set(null);
  }

  async saveUserProfile() {
    const uid = this.editingUserId();
    if (!uid) return;

    const user = this.adminService.allUsers().find((u) => u.uid === uid);
    if (!user) return;

    const profileData: any = {
      displayName: this.userForm.displayName,
      email: this.userForm.email,
      phone: this.userForm.phone,
      district: this.userForm.district,
      taluka: this.userForm.taluka,
      pincode: this.userForm.pincode,
    };

    if (user.role === 'merchant') {
      profileData.address = this.userForm.address;
    } else {
      profileData.village = this.userForm.village;
      profileData.crops = this.userForm.crops;
      profileData.acreage = this.userForm.acreage;
    }

    await this.adminService.updateUserProfile(uid, user.role, profileData);
    await this.adminService.loadAllUsers();
    this.editingUserId.set(null);
  }

  addCrop() {
    const cropInput = prompt('Enter crop name:');
    if (cropInput && cropInput.trim()) {
      this.userForm.crops = [...this.userForm.crops, cropInput.trim()];
    }
  }

  removeCrop(index: number) {
    this.userForm.crops = this.userForm.crops.filter((_, i) => i !== index);
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

  getUserAddress(user: UserRecord): string {
    if (user.role === 'merchant') {
      return (user.profile as any).address || 'N/A';
    }
    return 'N/A';
  }

  getUserDistrict(user: UserRecord): string {
    return (user.profile as any).district || 'N/A';
  }

  getUserVillage(user: UserRecord): string {
    if (user.role === 'farmer') {
      return (user.profile as any).village || 'N/A';
    }
    return 'N/A';
  }

  getUserCrops(user: UserRecord): string {
    if (user.role === 'farmer') {
      const crops = (user.profile as any).crops;
      return crops && Array.isArray(crops) ? crops.join(', ') : 'N/A';
    }
    return 'N/A';
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  // App Settings
  startEditHeroLocation() {
    this.editingHeroLocation.set(true);
    this.heroLocationForm = this.appSettingsService.getHeroLocation();
  }

  cancelEditHeroLocation() {
    this.editingHeroLocation.set(false);
    this.heroLocationForm = this.appSettingsService.getHeroLocation();
  }

  async saveHeroLocation() {
    await this.appSettingsService.updateHeroLocation(this.heroLocationForm);
    this.editingHeroLocation.set(false);
  }

  get currentHeroLocation(): string {
    return this.appSettingsService.getHeroLocation();
  }

  startEditPhoneNumber() {
    this.editingPhoneNumber.set(true);
    this.phoneNumberForm = this.appSettingsService.getPhoneNumber();
  }

  cancelEditPhoneNumber() {
    this.editingPhoneNumber.set(false);
    this.phoneNumberForm = this.appSettingsService.getPhoneNumber();
  }

  async savePhoneNumber() {
    await this.appSettingsService.updatePhoneNumber(this.phoneNumberForm);
    this.editingPhoneNumber.set(false);
  }

  get currentPhoneNumber(): string {
    return this.appSettingsService.getPhoneNumber();
  }

  // Testimonials editing
  startEditTestimonials() {
    this.editingTestimonials.set(true);
    this.testimonialsForm = JSON.parse(JSON.stringify(this.appSettingsService.getTestimonials()));
  }

  cancelEditTestimonials() {
    this.editingTestimonials.set(false);
    this.testimonialsForm = JSON.parse(JSON.stringify(this.appSettingsService.getTestimonials()));
  }

  async saveTestimonials() {
    await this.appSettingsService.updateTestimonials(this.testimonialsForm);
    this.editingTestimonials.set(false);
  }

  addTestimonial() {
    this.testimonialsForm.push({ name: '', role: '', text: '' });
  }

  removeTestimonial(index: number) {
    this.testimonialsForm.splice(index, 1);
  }

  get currentTestimonials(): any[] {
    return this.appSettingsService.getTestimonials();
  }

  // FAQs editing
  startEditFAQs() {
    this.editingFAQs.set(true);
    this.faqsForm = JSON.parse(JSON.stringify(this.appSettingsService.getFAQs()));
  }

  cancelEditFAQs() {
    this.editingFAQs.set(false);
    this.faqsForm = JSON.parse(JSON.stringify(this.appSettingsService.getFAQs()));
  }

  async saveFAQs() {
    await this.appSettingsService.updateFAQs(this.faqsForm);
    this.editingFAQs.set(false);
  }

  addFAQ() {
    this.faqsForm.push({ question: '', answer: '' });
  }

  removeFAQ(index: number) {
    this.faqsForm.splice(index, 1);
  }

  get currentFAQs(): any[] {
    return this.appSettingsService.getFAQs();
  }
}

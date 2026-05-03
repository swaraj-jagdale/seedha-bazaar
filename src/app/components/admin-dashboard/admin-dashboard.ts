import { Component, OnDestroy, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RatesService, CropRate, Grade } from '../../services/rates.service';
import { OrderService, Order, OrderStatus } from '../../services/order.service';
import { AdminService, UserRecord } from '../../services/admin.service';
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
  editingDefaultMandi = signal(false);
  defaultMandiForm = '';
  editingMandiList = signal(false);
  mandiListForm: string[] = [];
  editingStats = signal(false);
  statsForm: any[] = [];

  // Rate editing
  editingRate = signal<CropRate | null>(null);
  editingRatePhoto = signal<CropRate | null>(null);
  photoPreview = '';
  editForm = {
    grades: [] as Grade[],
  };

  // Order status update
  updatingOrderId = signal<string | null>(null);
  isUpdatingOrder = signal(false);
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
    this.defaultMandiForm = this.appSettingsService.getDefaultMandi();
    this.mandiListForm = [...this.appSettingsService.getMandiList()];
    this.statsForm = JSON.parse(JSON.stringify(this.appSettingsService.getStats()));
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
      grades: [...rate.grades],
    };
  }

  cancelEditRate() {
    this.editingRate.set(null);
  }

  async saveRate() {
    const rate = this.editingRate();
    if (!rate?.id) return;
    try {
      await this.adminService.updateRate(rate.id, { grades: this.editForm.grades });
      this.editingRate.set(null);
    } catch (error) {
      console.error('Failed to save rate:', error);
      alert('Failed to save rate. Please try again.');
    }
  }

  // Rate approval
  async approveRate(rate: CropRate) {
    if (!rate.id) return;
    if (confirm(`Are you sure you want to approve the rate for ${rate.crop}?`)) {
      await this.adminService.updateRate(rate.id, { status: 'approved' as const });
    }
  }

  async savePlatformFee(rate: CropRate) {
    if (!rate.id) return;
    await this.adminService.updateRate(rate.id, { platformFee: rate.platformFee ?? 0 });
  }

  updatePlatformFee(rateId: string, value: number) {
    const rates = this.adminService.allRates();
    const rate = rates.find((r: CropRate) => r.id === rateId);
    if (rate) {
      rate.platformFee = value;
    }
  }

  // ...
  async rejectRate(rate: CropRate) {
    if (!rate.id) return;
    if (confirm(`Are you sure you want to reject the rate for ${rate.crop}?`)) {
      await this.adminService.updateRate(rate.id, { status: 'rejected' as const });
    }
  }

  async deleteRate(rate: CropRate) {
    if (!rate.id) return;
    if (
      confirm(
        `Are you sure you want to delete the rate for ${rate.crop}? This action cannot be undone.`,
      )
    ) {
      await this.adminService.deleteRate(rate.id);
    }
  }

  // Rate photo editing
  startEditRatePhoto(rate: CropRate) {
    this.editingRatePhoto.set(rate);
    this.photoPreview = rate.photo || '';
  }

  cancelEditRatePhoto() {
    this.editingRatePhoto.set(null);
    this.photoPreview = '';
  }

  onPhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async saveRatePhoto() {
    const rate = this.editingRatePhoto();
    if (!rate?.id) return;
    try {
      await this.adminService.updateRate(rate.id, { photo: this.photoPreview || undefined });
      this.editingRatePhoto.set(null);
      this.photoPreview = '';
    } catch (error) {
      console.error('Failed to update rate photo:', error);
      alert('Failed to update photo. Please try again.');
    }
  }

  async removeRatePhoto(rate: CropRate) {
    if (!rate.id) return;
    if (confirm(`Are you sure you want to remove the photo for ${rate.crop}?`)) {
      await this.adminService.updateRate(rate.id, { photo: undefined });
    }
  }

  formatPrice(price: number): string {
    return this.ratesService.formatPrice(price);
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
    if (!id || this.isUpdatingOrder()) return;
    if (confirm(`Are you sure you want to update the order status to '${this.newStatus}'?`)) {
      this.isUpdatingOrder.set(true);
      try {
        await this.adminService.updateOrderStatus(
          id,
          this.newStatus as OrderStatus,
          this.statusNote || undefined,
        );
        await this.adminService.updateLogistics(id, this.logisticsForm);
        this.updatingOrderId.set(null);
      } catch (error) {
        console.error('Failed to update order status:', error);
        alert('Failed to update order status. Please try again.');
      } finally {
        this.isUpdatingOrder.set(false);
      }
    }
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
    try {
      await this.adminService.updateOrderDetails(id, this.orderDetailsForm);
      this.editingOrderDetails.set(null);
    } catch (error) {
      console.error('Failed to update order details:', error);
      alert('Failed to update order details. Please try again.');
    }
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

    try {
      await this.adminService.updateUserProfile(uid, user.role, profileData);
      await this.adminService.loadAllUsers();
      this.editingUserId.set(null);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      alert('Failed to update user profile. Please try again.');
    }
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
    try {
      await this.appSettingsService.updateHeroLocation(this.heroLocationForm);
      this.editingHeroLocation.set(false);
    } catch (error) {
      console.error('Failed to update hero location:', error);
      alert('Failed to update hero location. Please try again.');
    }
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
    try {
      await this.appSettingsService.updatePhoneNumber(this.phoneNumberForm);
      this.editingPhoneNumber.set(false);
    } catch (error) {
      console.error('Failed to update phone number:', error);
      alert('Failed to update phone number. Please try again.');
    }
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
    try {
      await this.appSettingsService.updateTestimonials(this.testimonialsForm);
      this.editingTestimonials.set(false);
    } catch (error) {
      console.error('Failed to update testimonials:', error);
      alert('Failed to update testimonials. Please try again.');
    }
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
    try {
      await this.appSettingsService.updateFAQs(this.faqsForm);
      this.editingFAQs.set(false);
    } catch (error) {
      console.error('Failed to update FAQs:', error);
      alert('Failed to update FAQs. Please try again.');
    }
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

  // Mandi settings editing
  startEditDefaultMandi() {
    this.editingDefaultMandi.set(true);
    this.defaultMandiForm = this.appSettingsService.getDefaultMandi();
  }

  cancelEditDefaultMandi() {
    this.editingDefaultMandi.set(false);
    this.defaultMandiForm = this.appSettingsService.getDefaultMandi();
  }

  async saveDefaultMandi() {
    try {
      await this.appSettingsService.updateDefaultMandi(this.defaultMandiForm);
      this.editingDefaultMandi.set(false);
    } catch (error) {
      console.error('Failed to update default mandi:', error);
      alert('Failed to update default mandi. Please try again.');
    }
  }

  startEditMandiList() {
    this.editingMandiList.set(true);
    this.mandiListForm = [...this.appSettingsService.getMandiList()];
  }

  cancelEditMandiList() {
    this.editingMandiList.set(false);
    this.mandiListForm = [...this.appSettingsService.getMandiList()];
  }

  async saveMandiList() {
    try {
      await this.appSettingsService.updateMandiList(this.mandiListForm);
      this.editingMandiList.set(false);
    } catch (error) {
      console.error('Failed to update mandi list:', error);
      alert('Failed to update mandi list. Please try again.');
    }
  }

  addMandi() {
    this.mandiListForm.push('');
  }

  removeMandi(index: number) {
    this.mandiListForm.splice(index, 1);
  }

  get currentDefaultMandi(): string {
    return this.appSettingsService.getDefaultMandi();
  }

  get currentMandiList(): string[] {
    return this.appSettingsService.getMandiList();
  }

  // Stats editing
  startEditStats() {
    this.editingStats.set(true);
    this.statsForm = JSON.parse(JSON.stringify(this.appSettingsService.getStats()));
  }

  cancelEditStats() {
    this.editingStats.set(false);
    this.statsForm = JSON.parse(JSON.stringify(this.appSettingsService.getStats()));
  }

  async saveStats() {
    try {
      await this.appSettingsService.updateStats(this.statsForm);
      this.editingStats.set(false);
    } catch (error) {
      console.error('Failed to update statistics:', error);
      alert('Failed to update statistics. Please try again.');
    }
  }

  addStat() {
    this.statsForm.push({ value: '', label: '', icon: '' });
  }

  removeStat(index: number) {
    this.statsForm.splice(index, 1);
  }

  get currentStats(): any[] {
    return this.appSettingsService.getStats();
  }
}

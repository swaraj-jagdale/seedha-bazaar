import { Injectable, signal, computed } from '@angular/core';
import { AppSettingsService } from './app-settings.service';

export type Language = 'en' | 'hi' | 'mr';

interface TranslationMap {
  [key: string]: string;
}

const STORAGE_KEY = 'seedha-bazaar-lang';

const en: TranslationMap = {
  // Header
  'header.todaysRates': "Today's Rates",
  'header.howItWorks': 'How it Works',
  'header.faqs': 'FAQs',
  'header.merchantLogin': 'Merchant Login',
  'header.dashboard': 'Dashboard',

  // Hero
  'hero.title1': 'Direct Farm-to-Mandi',
  'hero.title2': 'Platform for Farmers',
  'hero.desc': 'Sell directly to verified merchants.\nNo hidden charges. Fair and fast payments.',
  'hero.location': 'Now connecting farmers in Dhule district!',

  // Mandi Rates
  'rates.title': 'Azadpur Mandi Rates',
  'rates.subtitle': 'Daily Market Rates for',
  'rates.updatedAt': 'Updated at 10 AM',
  'rates.crop': 'CROP',
  'rates.gradeA': 'GRADE A',
  'rates.gradeB': 'GRADE B',
  'rates.gradeC': 'GRADE C',
  'rates.callNow': 'CALL NOW',
  'rates.callSubtitle': 'Call or WhatsApp if any questions',

  // How It Works
  'howItWorks.title': 'How It Works',
  'howItWorks.step1Title': '1. CHECK RATES',
  'howItWorks.step1Desc': 'Call us or check todays rates online for your crop',
  'howItWorks.step2Title': '2. CALL & BOOK PICKUP',
  'howItWorks.step2Desc': 'Call us and confirm the quantity of crop you want to sell',
  'howItWorks.step3Title': '3. GET PAID FAST',
  'howItWorks.step3Desc': 'Quick pickup to mandi and you get paid within 3-7 days',

  // FAQ
  'faq.title': 'Frequently Asked Questions (FAQs)',
  'faq.q1': 'How often are rates updated?',
  'faq.a1':
    'Our rates are updated daily by 10 AM based on the latest mandi prices. We ensure you always get the most current market rates.',
  'faq.q2': 'Are there any fees or deductions?',
  'faq.a2':
    'No hidden charges! We believe in transparent pricing. The rate you see is the rate you get. Standard mandi commission applies as per government norms.',
  'faq.q3': 'How soon will I receive payment?',
  'faq.a3':
    'Payments are processed within 3-7 business days after your crop reaches the mandi. We ensure fast and reliable payments directly to your bank account.',
  'faq.q4': 'How much commission does the platform charge?',
  'faq.a4':
    'We charge a small platform fee of \u20B92-5/kg depending on the crop. This covers logistics, quality checks, and payment processing. No other hidden charges.',
  'faq.q5': 'How are disputes resolved?',
  'faq.a5':
    'For any dispute related to quality or quantity, our team mediates between the farmer and merchant. We ensure a fair resolution within 48 hours.',
  'faq.q6': 'Which mandis do you operate in?',
  'faq.a6':
    'Currently we operate in Azadpur Mandi (Delhi), Vashi Mandi (Mumbai), and Lasalgaon Mandi (Nashik). We are expanding to more mandis soon.',
  'faq.q7': 'How does transport work?',
  'faq.a7':
    'After order confirmation, the merchant arranges pickup from your farm. You can track the vehicle and delivery status in real-time from your dashboard.',
  'faq.viewAll': 'View All FAQs',

  // Footer
  'footer.callToSell': 'CALL 9432446384 TO SELL YOUR HARVEST DIRECTLY!',
  'footer.navigation': 'Navigation',
  'footer.todayRates': 'Today & Rates',
  'footer.aboutUs': 'About Us',
  'footer.aboutSB': 'About Seedha Bazaar',

  // Login / Registration
  'login.title': 'Merchant Login',
  'login.registerTitle': 'Merchant Registration',
  'login.registerSubtitle': 'Create your account to start posting rates',
  'login.loginSubtitle': 'Login to manage your crop rates',
  'login.businessName': 'Business Name',
  'login.email': 'Email Address',
  'login.password': 'Password',
  'login.createAccount': 'Create Account',
  'login.loginBtn': 'Login',
  'login.pleaseWait': 'Please wait...',
  'login.alreadyAccount': 'Already have an account?',
  'login.loginHere': 'Login here',
  'login.newMerchant': 'New merchant?',
  'login.registerHere': 'Register here',
  'login.phone': 'Phone Number',
  'login.address': 'Address',
  'login.district': 'District',
  'login.taluka': 'Taluka',
  'login.pincode': 'Pincode',

  // Dashboard
  'dashboard.title': 'Merchant Dashboard',
  'dashboard.welcome': 'Welcome',
  'dashboard.addRate': '+ Add New Rate',
  'dashboard.logout': 'Logout',
  'dashboard.yourRates': 'Your Submitted Rates',
  'dashboard.emptyState1': "You haven't submitted any rates yet.",
  'dashboard.emptyState2': 'Click "Add New Rate" to get started.',

  // Rate Form
  'rateForm.addTitle': 'Add New Rate',
  'rateForm.editTitle': 'Edit Rate',
  'rateForm.crop': 'Crop',
  'rateForm.selectCrop': 'Select crop',
  'rateForm.customCrop': 'Custom (other)',
  'rateForm.cropName': 'Crop Name',
  'rateForm.cropEmoji': 'Emoji (optional)',
  'rateForm.mandi': 'Mandi',
  'rateForm.gradeA': 'Grade A (Best Quality)',
  'rateForm.gradeB': 'Grade B (Medium Quality)',
  'rateForm.gradeC': 'Grade C (Standard Quality)',
  'rateForm.minPrice': 'Min Price',
  'rateForm.maxPrice': 'Max Price',
  'rateForm.cancel': 'Cancel',
  'rateForm.save': 'Add Rate',
  'rateForm.update': 'Update Rate',
  'rateForm.saving': 'Saving...',

  // Language Toggle
  'lang.switchTo': '\u0939\u093F\u0902\u0926\u0940',
  'lang.en': 'English',
  'lang.hi': '\u0939\u093F\u0902\u0926\u0940',
  'lang.mr': '\u092E\u0930\u093E\u0920\u0940',

  // Farmer Login
  'farmerLogin.registerTitle': 'Farmer Registration',
  'farmerLogin.registerSubtitle': 'Create your account to start selling directly to merchants',
  'farmerLogin.loginTitle': 'Farmer Login',
  'farmerLogin.loginSubtitle': 'Login to browse rates and place orders',
  'farmerLogin.farmerName': 'Your Name',
  'farmerLogin.phone': 'Phone Number',
  'farmerLogin.village': 'Village',
  'farmerLogin.acreage': 'Farm Size (acres)',
  'farmerLogin.selectCrops': 'Select Your Crops',
  'farmerLogin.newFarmer': 'New farmer?',
  'farmerLogin.areMerchant': 'Are you a merchant? Login here',
  'farmerLogin.areFarmer': 'Are you a farmer? Register here',

  // Farmer Dashboard
  'farmerDashboard.title': 'Farmer Dashboard',
  'farmerDashboard.browseRates': 'Browse Rates',
  'farmerDashboard.myOrders': 'My Orders',
  'farmerDashboard.searchCrop': 'Search crop...',
  'farmerDashboard.allMandis': 'All Mandis',
  'farmerDashboard.noRates': 'No rates available right now. Check back later.',
  'farmerDashboard.placeOrder': 'Place Order',
  'farmerDashboard.activeOrders': 'Active Orders',
  'farmerDashboard.pastOrders': 'Past Orders',
  'farmerDashboard.noOrders': 'You have no orders yet. Browse rates and place your first order!',
  'farmerDashboard.to': 'to',
  'farmerDashboard.quantity': 'Quantity',
  'farmerDashboard.price': 'Price',
  'farmerDashboard.total': 'Total',
  'farmerDashboard.commission': 'Platform Fee',
  'farmerDashboard.youGet': 'You Receive',
  'farmerDashboard.logistics': 'Logistics',
  'farmerDashboard.pickup': 'Pickup',
  'farmerDashboard.estDelivery': 'Est. Delivery',
  'farmerDashboard.expectedPayment': 'Expected Payment',
  'farmerDashboard.cancelOrder': 'Cancel Order',
  'farmerDashboard.confirmCancel': 'Are you sure you want to cancel this order?',
  'farmerDashboard.reason': 'Reason',
  'farmerDashboard.selectGrade': 'Select Quality Grade',
  'farmerDashboard.unit': 'Unit',
  'farmerDashboard.notes': 'Notes',
  'farmerDashboard.notesPlaceholder': 'Any special instructions...',
  'farmerDashboard.estimatedTotal': 'Estimated Total',
  'farmerDashboard.platformFee': 'Platform Fee',
  'farmerDashboard.confirmOrder': 'Confirm Order',

  // Merchant Dashboard (orders)
  'merchantDashboard.orders': 'Orders',
  'merchantDashboard.pendingOrders': 'Pending Orders',
  'merchantDashboard.activeOrders': 'Active Orders',
  'merchantDashboard.completedOrders': 'Completed Orders',
  'merchantDashboard.noOrders':
    'No orders yet. Farmers will place orders when they see your rates.',
  'merchantDashboard.from': 'from',
  'merchantDashboard.yourCommission': 'Commission Earned',
  'merchantDashboard.accept': 'Accept Order',
  'merchantDashboard.reject': 'Reject',
  'merchantDashboard.rejectReason': 'Enter reason for rejection:',
  'merchantDashboard.moveTo': 'Move to',
  'merchantDashboard.logistics': 'Logistics',
  'merchantDashboard.recordPayment': 'Record Payment',
  'merchantDashboard.transportPartner': 'Transport Partner',
  'merchantDashboard.vehicleNumber': 'Vehicle Number',
  'merchantDashboard.pickupDate': 'Pickup Date',
  'merchantDashboard.pickupTime': 'Pickup Time',
  'merchantDashboard.estDelivery': 'Est. Delivery Date',
  'merchantDashboard.paymentMethod': 'Payment Method',
  'merchantDashboard.selectMethod': 'Select payment method',
  'merchantDashboard.paymentRef': 'Payment Reference',
  'merchantDashboard.paymentDate': 'Payment Date',
  'merchantDashboard.payToFarmer': 'Pay to Farmer',
  'merchantDashboard.confirmPayment': 'Confirm Payment',

  // Order Statuses
  'order.status.requested': 'Requested',
  'order.status.accepted': 'Accepted',
  'order.status.sorting': 'Sorting',
  'order.status.packed': 'Packed',
  'order.status.in_transit': 'In Transit',
  'order.status.delivered': 'Delivered',
  'order.status.payment_pending': 'Payment Pending',
  'order.status.paid': 'Paid',
  'order.status.rejected': 'Rejected',
  'order.status.cancelled': 'Cancelled',

  // Header (new)
  'header.farmerLogin': 'Farmer Login',
  'header.farmerDashboard': 'Farmer Dashboard',

  // Currency
  'rates.currency': '\u20B9',

  // Hero (new)
  'hero.farmerCta': 'Start Selling',
  'hero.merchantCta': 'Merchant Login',
};

const hi: TranslationMap = {
  // Header
  'header.todaysRates': '\u0906\u091C \u0915\u0947 \u092D\u093E\u0935',
  'header.howItWorks':
    '\u0915\u0948\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948',
  'header.faqs': '\u0938\u0935\u093E\u0932-\u091C\u0935\u093E\u092C',
  'header.merchantLogin':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
  'header.dashboard': '\u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921',

  // Hero
  'hero.title1':
    '\u0938\u0940\u0927\u093E \u0916\u0947\u0924-\u0938\u0947-\u092E\u0902\u0921\u0940',
  'hero.title2':
    '\u0915\u093F\u0938\u093E\u0928\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E',
  'hero.desc':
    '\u0938\u0940\u0927\u0947 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u093F\u092F\u094B\u0902 \u0915\u094B \u092C\u0947\u091A\u0947\u0902\u0964\n\u0915\u094B\u0908 \u091B\u093F\u092A\u0947 \u0936\u0941\u0932\u094D\u0915 \u0928\u0939\u0940\u0902\u0964 \u0909\u091A\u093F\u0924 \u0914\u0930 \u0924\u0947\u095B \u092D\u0941\u0917\u0924\u093E\u0928\u0964',
  'hero.location':
    '\u0905\u092C \u0927\u0941\u0933\u0947 \u091C\u093F\u0932\u0947 \u0915\u0947 \u0915\u093F\u0938\u093E\u0928\u094B\u0902 \u0915\u094B \u091C\u094B\u0921\u093C \u0930\u0939\u0947 \u0939\u0948\u0902!',

  // Mandi Rates
  'rates.title':
    '\u0906\u095B\u093E\u0926\u092A\u0941\u0930 \u092E\u0902\u0921\u0940 \u092D\u093E\u0935',
  'rates.subtitle':
    '\u0926\u0948\u0928\u093F\u0915 \u092C\u093E\u091C\u093E\u0930 \u092D\u093E\u0935',
  'rates.updatedAt':
    '\u0938\u0941\u092C\u0939 10 \u092C\u091C\u0947 \u0905\u092A\u0921\u0947\u091F',
  'rates.crop': '\u092B\u0938\u0932',
  'rates.gradeA': '\u0917\u094D\u0930\u0947\u0921 A',
  'rates.gradeB': '\u0917\u094D\u0930\u0947\u0921 B',
  'rates.gradeC': '\u0917\u094D\u0930\u0947\u0921 C',
  'rates.callNow': '\u0905\u092D\u0940 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902',
  'rates.callSubtitle':
    '\u0915\u093F\u0938\u0940 \u092D\u0940 \u0938\u0935\u093E\u0932 \u0915\u0947 \u0932\u093F\u090F \u0915\u0949\u0932 \u092F\u093E \u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A \u0915\u0930\u0947\u0902',

  // How It Works
  'howItWorks.title':
    '\u0915\u0948\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948',
  'howItWorks.step1Title': '1. \u092D\u093E\u0935 \u0926\u0947\u0916\u0947\u0902',
  'howItWorks.step1Desc':
    '\u0939\u092E\u0947\u0902 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902 \u092F\u093E \u0905\u092A\u0928\u0940 \u092B\u0938\u0932 \u0915\u0947 \u0906\u091C \u0915\u0947 \u092D\u093E\u0935 \u0911\u0928\u0932\u093E\u0907\u0928 \u0926\u0947\u0916\u0947\u0902',
  'howItWorks.step2Title':
    '2. \u0915\u0949\u0932 \u0915\u0930\u0947\u0902 \u0914\u0930 \u092A\u093F\u0915\u0905\u092A \u092C\u0941\u0915 \u0915\u0930\u0947\u0902',
  'howItWorks.step2Desc':
    '\u0939\u092E\u0947\u0902 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902 \u0914\u0930 \u092C\u0947\u091A\u0928\u0947 \u0935\u093E\u0932\u0940 \u092B\u0938\u0932 \u0915\u0940 \u092E\u093E\u0924\u094D\u0930\u093E \u092C\u0924\u093E\u090F\u0902',
  'howItWorks.step3Title':
    '3. \u0924\u0947\u095B \u092D\u0941\u0917\u0924\u093E\u0928 \u092A\u093E\u090F\u0902',
  'howItWorks.step3Desc':
    '\u092E\u0902\u0921\u0940 \u0924\u0915 \u091C\u0932\u094D\u0926\u0940 \u092A\u093F\u0915\u0905\u092A \u0914\u0930 3-7 \u0926\u093F\u0928\u094B\u0902 \u092E\u0947\u0902 \u092D\u0941\u0917\u0924\u093E\u0928',

  // FAQ
  'faq.title':
    '\u0905\u0915\u094D\u0938\u0930 \u092A\u0942\u091B\u0947 \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u0947 \u0938\u0935\u093E\u0932',
  'faq.q1':
    '\u092D\u093E\u0935 \u0915\u093F\u0924\u0928\u0940 \u092C\u093E\u0930 \u0905\u092A\u0921\u0947\u091F \u0939\u094B\u0924\u0947 \u0939\u0948\u0902?',
  'faq.a1':
    '\u0939\u092E\u093E\u0930\u0947 \u092D\u093E\u0935 \u0930\u094B\u095B \u0938\u0941\u092C\u0939 10 \u092C\u091C\u0947 \u0924\u0915 \u0928\u0935\u0940\u0928\u0924\u092E \u092E\u0902\u0921\u0940 \u0915\u0940\u092E\u0924\u094B\u0902 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0905\u092A\u0921\u0947\u091F \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964',
  'faq.q2':
    '\u0915\u094D\u092F\u093E \u0915\u094B\u0908 \u0936\u0941\u0932\u094D\u0915 \u092F\u093E \u0915\u091F\u094C\u0924\u0940 \u0939\u0948?',
  'faq.a2':
    '\u0915\u094B\u0908 \u091B\u093F\u092A\u0947 \u0936\u0941\u0932\u094D\u0915 \u0928\u0939\u0940\u0902! \u0939\u092E \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0915\u0940\u092E\u0924\u094B\u0902 \u092E\u0947\u0902 \u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964 \u0938\u0930\u0915\u093E\u0930\u0940 \u0928\u093F\u092F\u092E\u094B\u0902 \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u092E\u093E\u0928\u0915 \u092E\u0902\u0921\u0940 \u0915\u092E\u0940\u0936\u0928 \u0932\u093E\u0917\u0942\u0964',
  'faq.q3':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u093F\u0924\u0928\u0940 \u091C\u0932\u094D\u0926\u0940 \u092E\u093F\u0932\u0947\u0917\u093E?',
  'faq.a3':
    '\u0906\u092A\u0915\u0940 \u092B\u0938\u0932 \u092E\u0902\u0921\u0940 \u092A\u0939\u0941\u0902\u091A\u0928\u0947 \u0915\u0947 3-7 \u0915\u093E\u0930\u094D\u092F\u0926\u093F\u0935\u0938\u094B\u0902 \u092E\u0947\u0902 \u092D\u0941\u0917\u0924\u093E\u0928 \u0938\u0940\u0927\u0947 \u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u0947 \u092E\u0947\u0902\u0964',
  'faq.q4':
    '\u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u0915\u093F\u0924\u0928\u093E \u0915\u092E\u0940\u0936\u0928 \u0932\u0947\u0924\u093E \u0939\u0948?',
  'faq.a4':
    '\u0939\u092E \u092B\u0938\u0932 \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u20B92-5/kg \u0915\u093E \u091B\u094B\u091F\u093E \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u0936\u0941\u0932\u094D\u0915 \u0932\u0947\u0924\u0947 \u0939\u0948\u0902\u0964 \u0907\u0938\u092E\u0947\u0902 \u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938, \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u091C\u093E\u0902\u091A \u0914\u0930 \u092D\u0941\u0917\u0924\u093E\u0928 \u092A\u094D\u0930\u0938\u0902\u0938\u094D\u0915\u0930\u0923 \u0936\u093E\u092E\u093F\u0932 \u0939\u0948\u0964 \u0915\u094B\u0908 \u0905\u0928\u094D\u092F \u091B\u093F\u092A\u0947 \u0936\u0941\u0932\u094D\u0915 \u0928\u0939\u0940\u0902\u0964',
  'faq.q5':
    '\u0935\u093F\u0935\u093E\u0926 \u0915\u0948\u0938\u0947 \u0938\u0941\u0932\u091D\u093E\u090F \u091C\u093E\u0924\u0947 \u0939\u0948\u0902?',
  'faq.a5':
    '\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u092F\u093E \u092E\u093E\u0924\u094D\u0930\u093E \u0938\u0947 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0915\u093F\u0938\u0940 \u092D\u0940 \u0935\u093F\u0935\u093E\u0926 \u092E\u0947\u0902 \u0939\u092E\u093E\u0930\u0940 \u091F\u0940\u092E \u0915\u093F\u0938\u093E\u0928 \u0914\u0930 \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0915\u0947 \u092C\u0940\u091A \u092E\u0927\u094D\u092F\u0938\u094D\u0925\u0924\u093E \u0915\u0930\u0924\u0940 \u0939\u0948\u0964 48 \u0918\u0902\u091F\u094B\u0902 \u092E\u0947\u0902 \u0928\u093F\u0937\u094D\u092A\u0915\u094D\u0937 \u0938\u092E\u093E\u0927\u093E\u0928 \u0938\u0941\u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964',
  'faq.q6':
    '\u0906\u092A \u0915\u093F\u0928 \u092E\u0902\u0921\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u0915\u093E\u092E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902?',
  'faq.a6':
    '\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u0939\u092E \u0906\u095B\u093E\u0926\u092A\u0941\u0930 \u092E\u0902\u0921\u0940 (\u0926\u093F\u0932\u094D\u0932\u0940), \u0935\u093E\u0936\u0940 \u092E\u0902\u0921\u0940 (\u092E\u0941\u0902\u092C\u0908), \u0914\u0930 \u0932\u093E\u0938\u0932\u0917\u093E\u0902\u0935 \u092E\u0902\u0921\u0940 (\u0928\u093E\u0938\u093F\u0915) \u092E\u0947\u0902 \u0915\u093E\u092E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964 \u091C\u0932\u094D\u0926 \u0939\u0940 \u0914\u0930 \u092E\u0902\u0921\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u0935\u093F\u0938\u094D\u0924\u093E\u0930 \u0939\u094B\u0917\u093E\u0964',
  'faq.q7':
    '\u092A\u0930\u093F\u0935\u0939\u0928 \u0915\u0948\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948?',
  'faq.a7':
    '\u0911\u0930\u094D\u0921\u0930 \u0915\u0928\u094D\u092B\u0930\u094D\u092E \u0939\u094B\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0906\u092A\u0915\u0947 \u0916\u0947\u0924 \u0938\u0947 \u092A\u093F\u0915\u0905\u092A \u0915\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0915\u0930\u0924\u093E \u0939\u0948\u0964 \u0906\u092A \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921 \u0938\u0947 \u0935\u093E\u0939\u0928 \u0914\u0930 \u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u0930\u093F\u092F\u0932-\u091F\u093E\u0907\u092E \u092E\u0947\u0902 \u091F\u094D\u0930\u0948\u0915 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964',
  'faq.viewAll': '\u0938\u092D\u0940 \u0938\u0935\u093E\u0932 \u0926\u0947\u0916\u0947\u0902',

  // Footer
  'footer.callToSell':
    '\u0905\u092A\u0928\u0940 \u092B\u0938\u0932 \u0938\u0940\u0927\u0947 \u092C\u0947\u091A\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F 9432446384 \u092A\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902!',
  'footer.navigation': '\u0928\u0947\u0935\u093F\u0917\u0947\u0936\u0928',
  'footer.todayRates': '\u0906\u091C \u0914\u0930 \u092D\u093E\u0935',
  'footer.aboutUs': '\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902',
  'footer.aboutSB':
    '\u0938\u0940\u0927\u093E \u092C\u093E\u091C\u093E\u0930 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902',

  // Login / Registration
  'login.title': '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
  'login.registerTitle':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u092A\u0902\u091C\u0940\u0915\u0930\u0923',
  'login.registerSubtitle':
    '\u092D\u093E\u0935 \u092A\u094B\u0938\u094D\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0916\u093E\u0924\u093E \u092C\u0928\u093E\u090F\u0902',
  'login.loginSubtitle':
    '\u0905\u092A\u0928\u0947 \u092B\u0938\u0932 \u092D\u093E\u0935 \u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902',
  'login.businessName':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u0915\u093E \u0928\u093E\u092E',
  'login.email': '\u0908\u092E\u0947\u0932 \u092A\u0924\u093E',
  'login.password': '\u092A\u093E\u0938\u0935\u0930\u094D\u0921',
  'login.createAccount': '\u0916\u093E\u0924\u093E \u092C\u0928\u093E\u090F\u0902',
  'login.loginBtn': '\u0932\u0949\u0917\u093F\u0928',
  'login.pleaseWait':
    '\u0915\u0943\u092A\u092F\u093E \u092A\u094D\u0930\u0924\u0940\u0915\u094D\u0937\u093E \u0915\u0930\u0947\u0902...',
  'login.alreadyAccount':
    '\u092A\u0939\u0932\u0947 \u0938\u0947 \u0916\u093E\u0924\u093E \u0939\u0948?',
  'login.loginHere':
    '\u092F\u0939\u093E\u0902 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902',
  'login.newMerchant': '\u0928\u090F \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940?',
  'login.registerHere':
    '\u092F\u0939\u093E\u0902 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902',
  'login.phone': '\u092B\u094B\u0928 \u0928\u0902\u092C\u0930',
  'login.address': '\u092A\u0924\u093E',
  'login.district': '\u091C\u093F\u0932\u093E',
  'login.taluka': '\u0924\u093E\u0932\u0941\u0915\u093E',
  'login.pincode': '\u092A\u093F\u0928\u0915\u094B\u0921',

  // Dashboard
  'dashboard.title':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921',
  'dashboard.welcome': '\u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948',
  'dashboard.addRate':
    '+ \u0928\u092F\u093E \u092D\u093E\u0935 \u091C\u094B\u0921\u093C\u0947\u0902',
  'dashboard.logout': '\u0932\u0949\u0917\u0906\u0909\u091F',
  'dashboard.yourRates': '\u0906\u092A\u0915\u0947 \u092D\u093E\u0935',
  'dashboard.emptyState1':
    '\u0906\u092A\u0928\u0947 \u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u092D\u093E\u0935 \u0928\u0939\u0940\u0902 \u0926\u093F\u090F\u0964',
  'dashboard.emptyState2':
    '\u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F "\u0928\u092F\u093E \u092D\u093E\u0935 \u091C\u094B\u0921\u093C\u0947\u0902" \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964',

  // Rate Form
  'rateForm.addTitle': '\u0928\u092F\u093E \u092D\u093E\u0935 \u091C\u094B\u0921\u093C\u0947\u0902',
  'rateForm.editTitle':
    '\u092D\u093E\u0935 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902',
  'rateForm.crop': '\u092B\u0938\u0932',
  'rateForm.selectCrop': '\u092B\u0938\u0932 \u091A\u0941\u0928\u0947\u0902',
  'rateForm.customCrop': '\u0905\u0928\u094D\u092F (\u0915\u0938\u094D\u091F\u092E)',
  'rateForm.cropName': '\u092B\u0938\u0932 \u0915\u093E \u0928\u093E\u092E',
  'rateForm.cropEmoji':
    '\u0907\u092E\u094B\u091C\u0940 (\u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915)',
  'rateForm.mandi': '\u092E\u0902\u0921\u0940',
  'rateForm.gradeA':
    '\u0917\u094D\u0930\u0947\u0921 A (\u0938\u0930\u094D\u0935\u0936\u094D\u0930\u0947\u0937\u094D\u0920 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E)',
  'rateForm.gradeB':
    '\u0917\u094D\u0930\u0947\u0921 B (\u092E\u0927\u094D\u092F\u092E \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E)',
  'rateForm.gradeC':
    '\u0917\u094D\u0930\u0947\u0921 C (\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E)',
  'rateForm.minPrice': '\u0928\u094D\u092F\u0942\u0928\u0924\u092E \u092E\u0942\u0932\u094D\u092F',
  'rateForm.maxPrice': '\u0905\u0927\u093F\u0915\u0924\u092E \u092E\u0942\u0932\u094D\u092F',
  'rateForm.cancel': '\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902',
  'rateForm.save': '\u092D\u093E\u0935 \u091C\u094B\u0921\u093C\u0947\u0902',
  'rateForm.update': '\u092D\u093E\u0935 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0947\u0902',
  'rateForm.saving': '\u0938\u0939\u0947\u091C \u0930\u0939\u0947 \u0939\u0948\u0902...',

  // Language Toggle
  'lang.switchTo': '\u092E\u0930\u093E\u0920\u0940',
  'lang.en': 'English',
  'lang.hi': '\u0939\u093F\u0902\u0926\u0940',
  'lang.mr': '\u092E\u0930\u093E\u0920\u0940',

  // Farmer Login
  'farmerLogin.registerTitle':
    '\u0915\u093F\u0938\u093E\u0928 \u092A\u0902\u091C\u0940\u0915\u0930\u0923',
  'farmerLogin.registerSubtitle':
    '\u0938\u0940\u0927\u0947 \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u093F\u092F\u094B\u0902 \u0915\u094B \u092C\u0947\u091A\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0916\u093E\u0924\u093E \u092C\u0928\u093E\u090F\u0902',
  'farmerLogin.loginTitle': '\u0915\u093F\u0938\u093E\u0928 \u0932\u0949\u0917\u093F\u0928',
  'farmerLogin.loginSubtitle':
    '\u092D\u093E\u0935 \u0926\u0947\u0916\u0928\u0947 \u0914\u0930 \u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902',
  'farmerLogin.farmerName': '\u0906\u092A\u0915\u093E \u0928\u093E\u092E',
  'farmerLogin.phone': '\u092B\u094B\u0928 \u0928\u0902\u092C\u0930',
  'farmerLogin.village': '\u0917\u093E\u0902\u0935',
  'farmerLogin.acreage':
    '\u0916\u0947\u0924 \u0915\u093E \u0906\u0915\u093E\u0930 (\u090F\u0915\u0921\u093C)',
  'farmerLogin.selectCrops':
    '\u0905\u092A\u0928\u0940 \u092B\u0938\u0932\u0947\u0902 \u091A\u0941\u0928\u0947\u0902',
  'farmerLogin.newFarmer': '\u0928\u090F \u0915\u093F\u0938\u093E\u0928?',
  'farmerLogin.areMerchant':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0939\u0948\u0902? \u092F\u0939\u093E\u0902 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902',
  'farmerLogin.areFarmer':
    '\u0915\u093F\u0938\u093E\u0928 \u0939\u0948\u0902? \u092F\u0939\u093E\u0902 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902',

  // Farmer Dashboard
  'farmerDashboard.title':
    '\u0915\u093F\u0938\u093E\u0928 \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921',
  'farmerDashboard.browseRates': '\u092D\u093E\u0935 \u0926\u0947\u0916\u0947\u0902',
  'farmerDashboard.myOrders': '\u092E\u0947\u0930\u0947 \u0911\u0930\u094D\u0921\u0930',
  'farmerDashboard.searchCrop': '\u092B\u0938\u0932 \u0916\u094B\u091C\u0947\u0902...',
  'farmerDashboard.allMandis': '\u0938\u092D\u0940 \u092E\u0902\u0921\u0940',
  'farmerDashboard.noRates':
    '\u0905\u092D\u0940 \u0915\u094B\u0908 \u092D\u093E\u0935 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902\u0964 \u092C\u093E\u0926 \u092E\u0947\u0902 \u091C\u093E\u0902\u091A\u0947\u0902\u0964',
  'farmerDashboard.placeOrder': '\u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0902',
  'farmerDashboard.activeOrders':
    '\u0938\u0915\u094D\u0930\u093F\u092F \u0911\u0930\u094D\u0921\u0930',
  'farmerDashboard.pastOrders': '\u092A\u093F\u091B\u0932\u0947 \u0911\u0930\u094D\u0921\u0930',
  'farmerDashboard.noOrders':
    '\u0905\u092D\u0940 \u0915\u094B\u0908 \u0911\u0930\u094D\u0921\u0930 \u0928\u0939\u0940\u0902\u0964 \u092D\u093E\u0935 \u0926\u0947\u0916\u0947\u0902 \u0914\u0930 \u092A\u0939\u0932\u093E \u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0902!',
  'farmerDashboard.to': '\u0915\u094B',
  'farmerDashboard.quantity': '\u092E\u093E\u0924\u094D\u0930\u093E',
  'farmerDashboard.price': '\u092E\u0942\u0932\u094D\u092F',
  'farmerDashboard.total': '\u0915\u0941\u0932',
  'farmerDashboard.commission':
    '\u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u0936\u0941\u0932\u094D\u0915',
  'farmerDashboard.youGet': '\u0906\u092A\u0915\u094B \u092E\u093F\u0932\u0947\u0917\u093E',
  'farmerDashboard.logistics': '\u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938',
  'farmerDashboard.pickup': '\u092A\u093F\u0915\u0905\u092A',
  'farmerDashboard.estDelivery':
    '\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u0921\u093F\u0932\u0940\u0935\u0930\u0940',
  'farmerDashboard.expectedPayment':
    '\u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924 \u092D\u0941\u0917\u0924\u093E\u0928',
  'farmerDashboard.cancelOrder':
    '\u0911\u0930\u094D\u0921\u0930 \u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902',
  'farmerDashboard.confirmCancel':
    '\u0915\u094D\u092F\u093E \u0906\u092A \u0907\u0938 \u0911\u0930\u094D\u0921\u0930 \u0915\u094B \u0930\u0926\u094D\u0926 \u0915\u0930\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?',
  'farmerDashboard.reason': '\u0915\u093E\u0930\u0923',
  'farmerDashboard.selectGrade':
    '\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0917\u094D\u0930\u0947\u0921 \u091A\u0941\u0928\u0947\u0902',
  'farmerDashboard.unit': '\u0907\u0915\u093E\u0908',
  'farmerDashboard.notes': '\u0928\u094B\u091F\u094D\u0938',
  'farmerDashboard.notesPlaceholder':
    '\u0915\u094B\u0908 \u0935\u093F\u0936\u0947\u0937 \u0928\u093F\u0930\u094D\u0926\u0947\u0936...',
  'farmerDashboard.estimatedTotal':
    '\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u0915\u0941\u0932',
  'farmerDashboard.platformFee':
    '\u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u0936\u0941\u0932\u094D\u0915',
  'farmerDashboard.confirmOrder':
    '\u0911\u0930\u094D\u0921\u0930 \u0915\u0940 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902',

  // Merchant Dashboard (orders)
  'merchantDashboard.orders': '\u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.pendingOrders':
    '\u092A\u0947\u0902\u0921\u093F\u0902\u0917 \u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.activeOrders':
    '\u0938\u0915\u094D\u0930\u093F\u092F \u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.completedOrders':
    '\u092A\u0942\u0930\u094D\u0923 \u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.noOrders':
    '\u0905\u092D\u0940 \u0915\u094B\u0908 \u0911\u0930\u094D\u0921\u0930 \u0928\u0939\u0940\u0902\u0964 \u0915\u093F\u0938\u093E\u0928 \u0906\u092A\u0915\u0947 \u092D\u093E\u0935 \u0926\u0947\u0916\u0915\u0930 \u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0902\u0917\u0947\u0964',
  'merchantDashboard.from': '\u0938\u0947',
  'merchantDashboard.yourCommission': '\u0915\u092E\u0940\u0936\u0928',
  'merchantDashboard.accept': '\u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902',
  'merchantDashboard.reject': '\u0905\u0938\u094D\u0935\u0940\u0915\u093E\u0930',
  'merchantDashboard.rejectReason':
    '\u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u0915\u093E \u0915\u093E\u0930\u0923 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902:',
  'merchantDashboard.moveTo': '\u0906\u0917\u0947 \u092C\u0922\u093C\u093E\u090F\u0902',
  'merchantDashboard.logistics':
    '\u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938',
  'merchantDashboard.recordPayment':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902',
  'merchantDashboard.transportPartner':
    '\u091F\u094D\u0930\u093E\u0902\u0938\u092A\u094B\u0930\u094D\u091F \u092A\u093E\u0930\u094D\u091F\u0928\u0930',
  'merchantDashboard.vehicleNumber': '\u0935\u093E\u0939\u0928 \u0928\u0902\u092C\u0930',
  'merchantDashboard.pickupDate': '\u092A\u093F\u0915\u0905\u092A \u0924\u093E\u0930\u0940\u0916',
  'merchantDashboard.pickupTime': '\u092A\u093F\u0915\u0905\u092A \u0938\u092E\u092F',
  'merchantDashboard.estDelivery':
    '\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u0921\u093F\u0932\u0940\u0935\u0930\u0940',
  'merchantDashboard.paymentMethod':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u092E\u093E\u0927\u094D\u092F\u092E',
  'merchantDashboard.selectMethod':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u092E\u093E\u0927\u094D\u092F\u092E \u091A\u0941\u0928\u0947\u0902',
  'merchantDashboard.paymentRef':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u0938\u0902\u0926\u0930\u094D\u092D',
  'merchantDashboard.paymentDate':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u0924\u093E\u0930\u0940\u0916',
  'merchantDashboard.payToFarmer':
    '\u0915\u093F\u0938\u093E\u0928 \u0915\u094B \u092D\u0941\u0917\u0924\u093E\u0928',
  'merchantDashboard.confirmPayment':
    '\u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0940 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902',

  // Order Statuses
  'order.status.requested': '\u0905\u0928\u0941\u0930\u094B\u0927',
  'order.status.accepted': '\u0938\u094D\u0935\u0940\u0915\u0943\u0924',
  'order.status.sorting': '\u091B\u0902\u091F\u093E\u0908',
  'order.status.packed': '\u092A\u0948\u0915',
  'order.status.in_transit': '\u0930\u093E\u0938\u094D\u0924\u0947 \u092E\u0947\u0902',
  'order.status.delivered': '\u092A\u0939\u0941\u0902\u091A\u093E',
  'order.status.payment_pending': '\u092D\u0941\u0917\u0924\u093E\u0928 \u092C\u093E\u0915\u0940',
  'order.status.paid': '\u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u094B \u0917\u092F\u093E',
  'order.status.rejected': '\u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924',
  'order.status.cancelled': '\u0930\u0926\u094D\u0926',

  // Header (new)
  'header.farmerLogin': '\u0915\u093F\u0938\u093E\u0928 \u0932\u0949\u0917\u093F\u0928',
  'header.farmerDashboard':
    '\u0915\u093F\u0938\u093E\u0928 \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921',

  // Currency
  'rates.currency': '\u20B9',

  // Hero (new)
  'hero.farmerCta':
    '\u092C\u0947\u091A\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902',
  'hero.merchantCta':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
};

const mr: TranslationMap = {
  // Header
  'header.todaysRates': '\u0906\u091C\u091A\u0947 \u092D\u093E\u0935',
  'header.howItWorks': '\u0915\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u0947',
  'header.faqs': '\u092A\u094D\u0930\u0936\u094D\u0928-\u0909\u0924\u094D\u0924\u0930\u0947',
  'header.merchantLogin':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
  'header.dashboard': '\u0921\u0945\u0936\u092C\u094B\u0930\u094D\u0921',

  // Hero
  'hero.title1':
    '\u0925\u0947\u091F \u0936\u0947\u0924\u093E\u0924\u0942\u0928 \u092E\u0902\u0921\u0940\u0924',
  'hero.title2':
    '\u0936\u0947\u0924\u0915\u0931\u094D\u092F\u093E\u0902\u0938\u093E\u0920\u0940 \u092A\u094D\u0932\u0945\u091F\u092B\u0949\u0930\u094D\u092E',
  'hero.desc':
    '\u0925\u0947\u091F \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0935\u094D\u092F\u093E\u092A\u093E\u0931\u094D\u092F\u093E\u0902\u0928\u093E \u0935\u093F\u0915\u093E.\n\u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u091B\u0941\u092A\u0947 \u0936\u0941\u0932\u094D\u0915 \u0928\u093E\u0939\u0940. \u092F\u094B\u0917\u094D\u092F \u0906\u0923\u093F \u091C\u0932\u0926 \u092A\u0948\u0938\u093E.',
  'hero.location':
    '\u0906\u0924\u093E \u0927\u0941\u0933\u0947 \u091C\u093F\u0932\u094D\u0939\u094D\u092F\u093E\u0924\u0940\u0932 \u0936\u0947\u0924\u0915\u0931\u094D\u092F\u093E\u0902\u0928\u093E \u091C\u094B\u0921\u0924 \u0906\u0939\u094B\u0924!',

  // Mandi Rates
  'rates.title':
    '\u0906\u091C\u093E\u0926\u092A\u0942\u0930 \u092E\u0902\u0921\u0940 \u092D\u093E\u0935',
  'rates.subtitle':
    '\u0926\u0948\u0928\u093F\u0915 \u092C\u093E\u091C\u093E\u0930 \u092D\u093E\u0935',
  'rates.updatedAt':
    '\u0938\u0915\u093E\u0933\u0940 10 \u0935\u093E\u091C\u0924\u093E \u0905\u092A\u0921\u0947\u091F',
  'rates.crop': '\u092A\u0940\u0915',
  'rates.gradeA': '\u0917\u094D\u0930\u0947\u0921 A',
  'rates.gradeB': '\u0917\u094D\u0930\u0947\u0921 B',
  'rates.gradeC': '\u0917\u094D\u0930\u0947\u0921 C',
  'rates.callNow': '\u0906\u0924\u094D\u0924\u093E \u0915\u0949\u0932 \u0915\u0930\u093E',
  'rates.callSubtitle':
    '\u0915\u094B\u0923\u0924\u094D\u092F\u093E\u0939\u0940 \u092A\u094D\u0930\u0936\u094D\u0928\u093E\u0938\u093E\u0920\u0940 \u0915\u0949\u0932 \u0915\u093F\u0902\u0935\u093E \u0935\u094D\u0939\u0949\u091F\u094D\u0938\u0905\u0945\u092A \u0915\u0930\u093E',

  // How It Works
  'howItWorks.title': '\u0915\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u0947',
  'howItWorks.step1Title': '1. \u092D\u093E\u0935 \u092A\u0939\u093E',
  'howItWorks.step1Desc':
    '\u0906\u092E\u094D\u0939\u093E\u0932\u093E \u0915\u0949\u0932 \u0915\u0930\u093E \u0915\u093F\u0902\u0935\u093E \u0924\u0941\u092E\u091A\u094D\u092F\u093E \u092A\u093F\u0915\u093E\u091A\u0947 \u0906\u091C\u091A\u0947 \u092D\u093E\u0935 \u0911\u0928\u0932\u093E\u0907\u0928 \u092A\u0939\u093E',
  'howItWorks.step2Title':
    '2. \u0915\u0949\u0932 \u0915\u0930\u093E \u0906\u0923\u093F \u092A\u093F\u0915\u0905\u092A \u092C\u0941\u0915 \u0915\u0930\u093E',
  'howItWorks.step2Desc':
    '\u0906\u092E\u094D\u0939\u093E\u0932\u093E \u0915\u0949\u0932 \u0915\u0930\u093E \u0906\u0923\u093F \u0935\u093F\u0915\u093E\u092F\u091A\u094D\u092F\u093E \u092A\u093F\u0915\u093E\u091A\u0947 \u092A\u094D\u0930\u092E\u093E\u0923 \u0938\u093E\u0902\u0917\u093E',
  'howItWorks.step3Title':
    '3. \u091C\u0932\u0926 \u092A\u0948\u0938\u0947 \u092E\u093F\u0933\u0935\u093E',
  'howItWorks.step3Desc':
    '\u092E\u0902\u0921\u0940\u0932\u093E \u091C\u0932\u0926 \u092A\u093F\u0915\u0905\u092A \u0906\u0923\u093F 3-7 \u0926\u093F\u0935\u0938\u093E\u0924 \u092A\u0948\u0938\u0947',

  // FAQ
  'faq.title':
    '\u0935\u093E\u0930\u0902\u0935\u093E\u0930 \u0935\u093F\u091A\u093E\u0930\u0932\u0947 \u091C\u093E\u0923\u093E\u0930\u0947 \u092A\u094D\u0930\u0936\u094D\u0928',
  'faq.q1':
    '\u092D\u093E\u0935 \u0915\u093F\u0924\u0940 \u0935\u0947\u0933\u093E \u0905\u092A\u0921\u0947\u091F \u0939\u094B\u0924\u093E\u0924?',
  'faq.a1':
    '\u0906\u092E\u091A\u0947 \u092D\u093E\u0935 \u0926\u0930\u0930\u094B\u091C \u0938\u0915\u093E\u0933\u0940 10 \u0935\u093E\u091C\u0924\u093E \u0928\u0935\u0940\u0928\u0924\u092E \u092E\u0902\u0921\u0940 \u092D\u093E\u0935\u093E\u0902\u0935\u0930 \u0906\u0927\u093E\u0930\u093F\u0924 \u0905\u092A\u0921\u0947\u091F \u0939\u094B\u0924\u093E\u0924.',
  'faq.q2':
    '\u0915\u093E\u0939\u0940 \u0936\u0941\u0932\u094D\u0915 \u0915\u093F\u0902\u0935\u093E \u0915\u092A\u093E\u0924 \u0906\u0939\u0947 \u0915\u093E?',
  'faq.a2':
    '\u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u091B\u0941\u092A\u0947 \u0936\u0941\u0932\u094D\u0915 \u0928\u093E\u0939\u0940! \u0906\u092E\u094D\u0939\u0940 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0915 \u0915\u093F\u092E\u0924\u0940\u0935\u0930 \u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u0920\u0947\u0935\u0924\u094B. \u0938\u0930\u0915\u093E\u0930\u0940 \u0928\u093F\u092F\u092E\u093E\u0928\u0941\u0938\u093E\u0930 \u092E\u093E\u0928\u0915 \u092E\u0902\u0921\u0940 \u0915\u092E\u093F\u0936\u0928 \u0932\u093E\u0917\u0942.',
  'faq.q3':
    '\u092A\u0948\u0938\u0947 \u0915\u093F\u0924\u0940 \u0932\u0935\u0915\u0930 \u092E\u093F\u0933\u0924\u0940\u0932?',
  'faq.a3':
    '\u0924\u0941\u092E\u091A\u0947 \u092A\u0940\u0915 \u092E\u0902\u0921\u0940\u0932\u093E \u092A\u094B\u0939\u094B\u091A\u0932\u094D\u092F\u093E\u0935\u0930 3-7 \u0915\u093E\u0930\u094D\u092F\u0926\u093F\u0935\u0938\u093E\u0924 \u092A\u0948\u0938\u0947 \u0925\u0947\u091F \u092C\u0901\u0915 \u0916\u093E\u0924\u094D\u092F\u093E\u0924.',
  'faq.q4':
    '\u092A\u094D\u0932\u0945\u091F\u092B\u0949\u0930\u094D\u092E \u0915\u093F\u0924\u0940 \u0915\u092E\u093F\u0936\u0928 \u0918\u0947\u0924\u094B?',
  'faq.a4':
    '\u0906\u092E\u094D\u0939\u0940 \u092A\u093F\u0915\u093E\u0928\u0941\u0938\u093E\u0930 \u20B92-5/\u0915\u093F\u0932\u094B \u090F\u0935\u0922\u0947 \u091B\u094B\u091F\u0947 \u092A\u094D\u0932\u0945\u091F\u092B\u0949\u0930\u094D\u092E \u0936\u0941\u0932\u094D\u0915 \u0906\u0915\u093E\u0930\u0924\u094B. \u092F\u093E\u0924 \u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938, \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0924\u092A\u093E\u0938\u0923\u0940 \u0906\u0923\u093F \u092A\u0947\u092E\u0947\u0902\u091F \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E \u0938\u092E\u093E\u0935\u093F\u0937\u094D\u091F \u0906\u0939\u0947. \u0907\u0924\u0930 \u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u091B\u0941\u092A\u0947 \u0936\u0941\u0932\u094D\u0915 \u0928\u093E\u0939\u0940.',
  'faq.q5':
    '\u0935\u093E\u0926 \u0915\u0938\u0947 \u0938\u094B\u0921\u0935\u0932\u0947 \u091C\u093E\u0924\u093E\u0924?',
  'faq.a5':
    '\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0915\u093F\u0902\u0935\u093E \u092A\u094D\u0930\u092E\u093E\u0923\u093E\u092C\u093E\u092C\u0924 \u0915\u094B\u0923\u0924\u093E\u0939\u0940 \u0935\u093E\u0926 \u0905\u0938\u0932\u094D\u092F\u093E\u0938 \u0906\u092E\u091A\u0940 \u091F\u0940\u092E \u0936\u0947\u0924\u0915\u0930\u0940 \u0906\u0923\u093F \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u092F\u093E\u0902\u091A\u094D\u092F\u093E\u0924 \u092E\u0927\u094D\u092F\u0938\u094D\u0925\u0940 \u0915\u0930\u0924\u0947. \u096A\u096E \u0924\u093E\u0938\u093E\u0902\u0924 \u0928\u094D\u092F\u093E\u092F\u094D\u092F \u0924\u094B\u0921\u0917\u093E \u0915\u093E\u0922\u0932\u093E \u091C\u093E\u0924\u094B.',
  'faq.q6':
    '\u0924\u0941\u092E\u094D\u0939\u0940 \u0915\u094B\u0923\u0924\u094D\u092F\u093E \u092E\u0902\u0921\u0940\u092E\u0927\u094D\u092F\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E?',
  'faq.a6':
    '\u0938\u0927\u094D\u092F\u093E \u0906\u092E\u094D\u0939\u0940 \u0906\u091D\u093E\u0926\u092A\u0942\u0930 \u092E\u0902\u0921\u0940 (\u0926\u093F\u0932\u094D\u0932\u0940), \u0935\u093E\u0936\u0940 \u092E\u0902\u0921\u0940 (\u092E\u0941\u0902\u092C\u0908), \u0906\u0923\u093F \u0932\u093E\u0938\u0932\u0917\u093E\u0935 \u092E\u0902\u0921\u0940 (\u0928\u093E\u0936\u093F\u0915) \u092E\u0927\u094D\u092F\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u094B. \u0932\u0935\u0915\u0930\u091A \u0905\u0927\u093F\u0915 \u092E\u0902\u0921\u0940\u0924 \u0935\u093F\u0938\u094D\u0924\u093E\u0930 \u0939\u094B\u0908\u0932.',
  'faq.q7':
    '\u0935\u093E\u0939\u0924\u0942\u0915 \u0915\u0936\u0940 \u091A\u093E\u0932\u0924\u0947?',
  'faq.a7':
    '\u0911\u0930\u094D\u0921\u0930 \u0915\u0928\u094D\u092B\u0930\u094D\u092E \u091D\u093E\u0932\u094D\u092F\u093E\u0928\u0902\u0924\u0930, \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0924\u0941\u092E\u091A\u094D\u092F\u093E \u0936\u0947\u0924\u093E\u0924\u0942\u0928 \u092A\u093F\u0915\u0905\u092A\u091A\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0915\u0930\u0924\u094B. \u0924\u0941\u092E\u094D\u0939\u0940 \u0921\u0945\u0936\u092C\u094B\u0930\u094D\u0921\u0935\u0930\u0942\u0928 \u0935\u093E\u0939\u0928 \u0906\u0923\u093F \u0921\u093F\u0932\u093F\u0935\u094D\u0939\u0930\u0940 \u0938\u094D\u0925\u093F\u0924\u0940 \u0930\u093F\u0905\u0932-\u091F\u093E\u0907\u092E \u091F\u094D\u0930\u0945\u0915 \u0915\u0930\u0942 \u0936\u0915\u0924\u093E.',
  'faq.viewAll': '\u0938\u0930\u094D\u0935 \u092A\u094D\u0930\u0936\u094D\u0928 \u092A\u0939\u093E',

  // Footer
  'footer.callToSell':
    '\u0924\u0941\u092E\u091A\u0947 \u092A\u0940\u0915 \u0925\u0947\u091F \u0935\u093F\u0915\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 9432446384 \u0935\u0930 \u0915\u0949\u0932 \u0915\u0930\u093E!',
  'footer.navigation': '\u0928\u0947\u0935\u094D\u0939\u093F\u0917\u0947\u0936\u0928',
  'footer.todayRates': '\u0906\u091C\u091A\u0947 \u092D\u093E\u0935',
  'footer.aboutUs': '\u0906\u092E\u091A\u094D\u092F\u093E \u092C\u0926\u094D\u0926\u0932',
  'footer.aboutSB':
    '\u0938\u0940\u0927\u093E \u092C\u093E\u091C\u093E\u0930 \u092C\u0926\u094D\u0926\u0932',

  // Login / Registration
  'login.title': '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
  'login.registerTitle':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0928\u094B\u0902\u0926\u0923\u0940',
  'login.registerSubtitle':
    '\u092D\u093E\u0935 \u092A\u094B\u0938\u094D\u091F \u0915\u0930\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0916\u093E\u0924\u0947 \u0924\u092F\u093E\u0930 \u0915\u0930\u093E',
  'login.loginSubtitle':
    '\u0924\u0941\u092E\u091A\u0947 \u092A\u0940\u0915 \u092D\u093E\u0935 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u093F\u0924 \u0915\u0930\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u093E',
  'login.businessName':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u093E\u091A\u0947 \u0928\u093E\u0935',
  'login.email': '\u0908\u092E\u0947\u0932 \u092A\u0924\u094D\u0924\u093E',
  'login.password': '\u092A\u093E\u0938\u0935\u0930\u094D\u0921',
  'login.createAccount': '\u0916\u093E\u0924\u0947 \u0924\u092F\u093E\u0930 \u0915\u0930\u093E',
  'login.loginBtn': '\u0932\u0949\u0917\u093F\u0928',
  'login.pleaseWait': '\u0915\u0943\u092A\u092F\u093E \u0935\u093E\u091F \u092A\u0939\u093E...',
  'login.alreadyAccount': '\u0906\u0927\u0940\u091A \u0916\u093E\u0924\u0947 \u0906\u0939\u0947?',
  'login.loginHere': '\u0907\u0925\u0947 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u093E',
  'login.newMerchant': '\u0928\u0935\u0940\u0928 \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940?',
  'login.registerHere':
    '\u0907\u0925\u0947 \u0928\u094B\u0902\u0926\u0923\u0940 \u0915\u0930\u093E',
  'login.phone': '\u092B\u094B\u0928 \u0928\u0902\u092C\u0930',
  'login.address': '\u092A\u0924\u094D\u0924\u093E',
  'login.district': '\u091C\u093F\u0932\u094D\u0939\u093E',
  'login.taluka': '\u0924\u093E\u0932\u0941\u0915\u093E',
  'login.pincode': '\u092A\u093F\u0928\u0915\u094B\u0921',

  // Dashboard
  'dashboard.title':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0921\u0945\u0936\u092C\u094B\u0930\u094D\u0921',
  'dashboard.welcome': '\u0938\u094D\u0935\u093E\u0917\u0924 \u0906\u0939\u0947',
  'dashboard.addRate': '+ \u0928\u0935\u0940\u0928 \u092D\u093E\u0935 \u091C\u094B\u0921\u093E',
  'dashboard.logout': '\u0932\u0949\u0917\u0906\u0909\u091F',
  'dashboard.yourRates': '\u0924\u0941\u092E\u091A\u0947 \u092D\u093E\u0935',
  'dashboard.emptyState1':
    '\u0924\u0941\u092E\u094D\u0939\u0940 \u0905\u091C\u0942\u0928 \u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u092D\u093E\u0935 \u0926\u093F\u0932\u0947\u0932\u0947 \u0928\u093E\u0939\u0940\u0924.',
  'dashboard.emptyState2':
    '\u0938\u0941\u0930\u0942 \u0915\u0930\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 "\u0928\u0935\u0940\u0928 \u092D\u093E\u0935 \u091C\u094B\u0921\u093E" \u0935\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u093E.',

  // Rate Form
  'rateForm.addTitle': '\u0928\u0935\u0940\u0928 \u092D\u093E\u0935 \u091C\u094B\u0921\u093E',
  'rateForm.editTitle':
    '\u092D\u093E\u0935 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u093E',
  'rateForm.crop': '\u092A\u0940\u0915',
  'rateForm.selectCrop': '\u092A\u0940\u0915 \u0928\u093F\u0935\u0921\u093E',
  'rateForm.customCrop': '\u0907\u0924\u0930 (\u0915\u0938\u094D\u091F\u092E)',
  'rateForm.cropName': '\u092A\u093F\u0915\u093E\u091A\u0947 \u0928\u093E\u0935',
  'rateForm.cropEmoji': '\u0907\u092E\u094B\u091C\u0940 (\u0910\u091A\u094D\u091B\u093F\u0915)',
  'rateForm.mandi': '\u092E\u0902\u0921\u0940',
  'rateForm.gradeA':
    '\u0917\u094D\u0930\u0947\u0921 A (\u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E)',
  'rateForm.gradeB':
    '\u0917\u094D\u0930\u0947\u0921 B (\u092E\u0927\u094D\u092F\u092E \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E)',
  'rateForm.gradeC':
    '\u0917\u094D\u0930\u0947\u0921 C (\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E)',
  'rateForm.minPrice': '\u0915\u092E\u0940\u0924 \u0915\u092E\u0940 \u0915\u093F\u0902\u092E\u0924',
  'rateForm.maxPrice':
    '\u091C\u093E\u0938\u094D\u0924\u0940\u0924 \u091C\u093E\u0938\u094D\u0924 \u0915\u093F\u0902\u092E\u0924',
  'rateForm.cancel': '\u0930\u0926\u094D\u0926 \u0915\u0930\u093E',
  'rateForm.save': '\u092D\u093E\u0935 \u091C\u094B\u0921\u093E',
  'rateForm.update': '\u092D\u093E\u0935 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u093E',
  'rateForm.saving': '\u0938\u0947\u0935\u094D\u0939 \u0939\u094B\u0924 \u0906\u0939\u0947...',

  // Language Toggle
  'lang.switchTo': 'English',
  'lang.en': 'English',
  'lang.hi': '\u0939\u093F\u0902\u0926\u0940',
  'lang.mr': '\u092E\u0930\u093E\u0920\u0940',

  // Farmer Login
  'farmerLogin.registerTitle':
    '\u0936\u0947\u0924\u0915\u0930\u0940 \u0928\u094B\u0902\u0926\u0923\u0940',
  'farmerLogin.registerSubtitle':
    '\u0925\u0947\u091F \u0935\u094D\u092F\u093E\u092A\u093E\u0931\u094D\u092F\u093E\u0902\u0928\u093E \u0935\u093F\u0915\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0916\u093E\u0924\u0947 \u0924\u092F\u093E\u0930 \u0915\u0930\u093E',
  'farmerLogin.loginTitle': '\u0936\u0947\u0924\u0915\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
  'farmerLogin.loginSubtitle':
    '\u092D\u093E\u0935 \u092A\u093E\u0939\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0906\u0923\u093F \u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u093E',
  'farmerLogin.farmerName': '\u0924\u0941\u092E\u091A\u0947 \u0928\u093E\u0935',
  'farmerLogin.phone': '\u092B\u094B\u0928 \u0928\u0902\u092C\u0930',
  'farmerLogin.village': '\u0917\u093E\u0935',
  'farmerLogin.acreage':
    '\u0936\u0947\u0924\u093E\u091A\u093E \u0906\u0915\u093E\u0930 (\u090F\u0915\u0930)',
  'farmerLogin.selectCrops':
    '\u0924\u0941\u092E\u091A\u0940 \u092A\u093F\u0915\u0947 \u0928\u093F\u0935\u0921\u093E',
  'farmerLogin.newFarmer': '\u0928\u0935\u0940\u0928 \u0936\u0947\u0924\u0915\u0930\u0940?',
  'farmerLogin.areMerchant':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0906\u0939\u093E\u0924? \u0907\u0925\u0947 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u093E',
  'farmerLogin.areFarmer':
    '\u0936\u0947\u0924\u0915\u0930\u0940 \u0906\u0939\u093E\u0924? \u0907\u0925\u0947 \u0928\u094B\u0902\u0926\u0923\u0940 \u0915\u0930\u093E',

  // Farmer Dashboard
  'farmerDashboard.title':
    '\u0936\u0947\u0924\u0915\u0930\u0940 \u0921\u0945\u0936\u092C\u094B\u0930\u094D\u0921',
  'farmerDashboard.browseRates': '\u092D\u093E\u0935 \u092A\u0939\u093E',
  'farmerDashboard.myOrders': '\u092E\u093E\u091D\u0947 \u0911\u0930\u094D\u0921\u0930',
  'farmerDashboard.searchCrop': '\u092A\u0940\u0915 \u0936\u094B\u0927\u093E...',
  'farmerDashboard.allMandis': '\u0938\u0930\u094D\u0935 \u092E\u0902\u0921\u094D\u092F\u093E',
  'farmerDashboard.noRates':
    '\u0938\u0927\u094D\u092F\u093E \u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u092D\u093E\u0935 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u093E\u0939\u0940\u0924. \u0928\u0902\u0924\u0930 \u0924\u092A\u093E\u0938\u093E.',
  'farmerDashboard.placeOrder': '\u0911\u0930\u094D\u0921\u0930 \u0926\u094D\u092F\u093E',
  'farmerDashboard.activeOrders':
    '\u0938\u0915\u094D\u0930\u093F\u092F \u0911\u0930\u094D\u0921\u0930',
  'farmerDashboard.pastOrders': '\u092E\u093E\u0917\u0940\u0932 \u0911\u0930\u094D\u0921\u0930',
  'farmerDashboard.noOrders':
    '\u0905\u091C\u0942\u0928 \u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u0911\u0930\u094D\u0921\u0930 \u0928\u093E\u0939\u0940\u0924. \u092D\u093E\u0935 \u092A\u0939\u093E \u0906\u0923\u093F \u092A\u0939\u093F\u0932\u093E \u0911\u0930\u094D\u0921\u0930 \u0926\u094D\u092F\u093E!',
  'farmerDashboard.to': '\u0932\u093E',
  'farmerDashboard.quantity': '\u092A\u094D\u0930\u092E\u093E\u0923',
  'farmerDashboard.price': '\u0915\u093F\u0902\u092E\u0924',
  'farmerDashboard.total': '\u090F\u0915\u0942\u0923',
  'farmerDashboard.commission':
    '\u092A\u094D\u0932\u0945\u091F\u092B\u0949\u0930\u094D\u092E \u0936\u0941\u0932\u094D\u0915',
  'farmerDashboard.youGet':
    '\u0924\u0941\u092E\u094D\u0939\u093E\u0932\u093E \u092E\u093F\u0933\u0924\u0940\u0932',
  'farmerDashboard.logistics': '\u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938',
  'farmerDashboard.pickup': '\u092A\u093F\u0915\u0905\u092A',
  'farmerDashboard.estDelivery':
    '\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0921\u093F\u0932\u093F\u0935\u094D\u0939\u0930\u0940',
  'farmerDashboard.expectedPayment':
    '\u0905\u092A\u0947\u0915\u094D\u0937\u093F\u0924 \u092A\u0947\u092E\u0947\u0902\u091F',
  'farmerDashboard.cancelOrder':
    '\u0911\u0930\u094D\u0921\u0930 \u0930\u0926\u094D\u0926 \u0915\u0930\u093E',
  'farmerDashboard.confirmCancel':
    '\u0924\u0941\u092E\u094D\u0939\u093E\u0932\u093E \u0939\u093E \u0911\u0930\u094D\u0921\u0930 \u0930\u0926\u094D\u0926 \u0915\u0930\u093E\u092F\u091A\u093E \u0906\u0939\u0947 \u0915\u093E?',
  'farmerDashboard.reason': '\u0915\u093E\u0930\u0923',
  'farmerDashboard.selectGrade':
    '\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0917\u094D\u0930\u0947\u0921 \u0928\u093F\u0935\u0921\u093E',
  'farmerDashboard.unit': '\u090F\u0915\u0915',
  'farmerDashboard.notes': '\u0928\u094B\u091F\u094D\u0938',
  'farmerDashboard.notesPlaceholder':
    '\u0915\u093E\u0939\u0940 \u0935\u093F\u0936\u0947\u0937 \u0938\u0942\u091A\u0928\u093E...',
  'farmerDashboard.estimatedTotal':
    '\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u090F\u0915\u0942\u0923',
  'farmerDashboard.platformFee':
    '\u092A\u094D\u0932\u0945\u091F\u092B\u0949\u0930\u094D\u092E \u0936\u0941\u0932\u094D\u0915',
  'farmerDashboard.confirmOrder':
    '\u0911\u0930\u094D\u0921\u0930 \u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0915\u0930\u093E',

  // Merchant Dashboard (orders)
  'merchantDashboard.orders': '\u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.pendingOrders':
    '\u092A\u094D\u0930\u0932\u0902\u092C\u093F\u0924 \u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.activeOrders':
    '\u0938\u0915\u094D\u0930\u093F\u092F \u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.completedOrders':
    '\u092A\u0942\u0930\u094D\u0923 \u0911\u0930\u094D\u0921\u0930',
  'merchantDashboard.noOrders':
    '\u0905\u091C\u0942\u0928 \u0915\u094B\u0923\u0924\u0947\u0939\u0940 \u0911\u0930\u094D\u0921\u0930 \u0928\u093E\u0939\u0940\u0924. \u0936\u0947\u0924\u0915\u0930\u0940 \u0924\u0941\u092E\u091A\u0947 \u092D\u093E\u0935 \u092A\u093E\u0939\u0942\u0928 \u0911\u0930\u094D\u0921\u0930 \u0926\u0947\u0924\u0940\u0932.',
  'merchantDashboard.from': '\u0915\u0921\u0942\u0928',
  'merchantDashboard.yourCommission': '\u0915\u092E\u093F\u0936\u0928',
  'merchantDashboard.accept': '\u092E\u093E\u0928\u094D\u092F \u0915\u0930\u093E',
  'merchantDashboard.reject': '\u0928\u093E\u0915\u093E\u0930\u093E',
  'merchantDashboard.rejectReason':
    '\u0928\u0915\u093E\u0930\u093E\u091A\u0947 \u0915\u093E\u0930\u0923 \u0926\u094D\u092F\u093E:',
  'merchantDashboard.moveTo': '\u092A\u0941\u0922\u0947 \u0928\u094D\u092F\u093E',
  'merchantDashboard.logistics':
    '\u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938',
  'merchantDashboard.recordPayment':
    '\u092A\u0947\u092E\u0947\u0902\u091F \u0928\u094B\u0902\u0926\u0935\u093E',
  'merchantDashboard.transportPartner':
    '\u091F\u094D\u0930\u093E\u0928\u094D\u0938\u092A\u094B\u0930\u094D\u091F \u092A\u093E\u0930\u094D\u091F\u0928\u0930',
  'merchantDashboard.vehicleNumber': '\u0935\u093E\u0939\u0928 \u0928\u0902\u092C\u0930',
  'merchantDashboard.pickupDate': '\u092A\u093F\u0915\u0905\u092A \u0924\u093E\u0930\u0940\u0916',
  'merchantDashboard.pickupTime': '\u092A\u093F\u0915\u0905\u092A \u0935\u0947\u0933',
  'merchantDashboard.estDelivery':
    '\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0921\u093F\u0932\u093F\u0935\u094D\u0939\u0930\u0940',
  'merchantDashboard.paymentMethod':
    '\u092A\u0947\u092E\u0947\u0902\u091F \u092A\u0926\u094D\u0927\u0924',
  'merchantDashboard.selectMethod':
    '\u092A\u0947\u092E\u0947\u0902\u091F \u092A\u0926\u094D\u0927\u0924 \u0928\u093F\u0935\u0921\u093E',
  'merchantDashboard.paymentRef':
    '\u092A\u0947\u092E\u0947\u0902\u091F \u0938\u0902\u0926\u0930\u094D\u092D',
  'merchantDashboard.paymentDate':
    '\u092A\u0947\u092E\u0947\u0902\u091F \u0924\u093E\u0930\u0940\u0916',
  'merchantDashboard.payToFarmer':
    '\u0936\u0947\u0924\u0915\u0931\u094D\u092F\u093E\u0932\u093E \u092A\u0948\u0938\u0947',
  'merchantDashboard.confirmPayment':
    '\u092A\u0947\u092E\u0947\u0902\u091F \u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0915\u0930\u093E',

  // Order Statuses
  'order.status.requested': '\u0935\u093F\u0928\u0902\u0924\u0940',
  'order.status.accepted': '\u092E\u093E\u0928\u094D\u092F',
  'order.status.sorting': '\u0935\u0930\u094D\u0917\u0940\u0915\u0930\u0923',
  'order.status.packed': '\u092A\u0945\u0915',
  'order.status.in_transit': '\u092E\u093E\u0930\u094D\u0917\u093E\u0935\u0930',
  'order.status.delivered': '\u092A\u094B\u0939\u094B\u091A\u0932\u0947',
  'order.status.payment_pending': '\u092A\u0947\u092E\u0947\u0902\u091F \u092C\u093E\u0915\u0940',
  'order.status.paid': '\u092A\u0947\u092E\u0947\u0902\u091F \u091D\u093E\u0932\u0947',
  'order.status.rejected': '\u0928\u093E\u0915\u093E\u0930\u0932\u0947',
  'order.status.cancelled': '\u0930\u0926\u094D\u0926',

  // Header (new)
  'header.farmerLogin': '\u0936\u0947\u0924\u0915\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
  'header.farmerDashboard':
    '\u0936\u0947\u0924\u0915\u0930\u0940 \u0921\u0945\u0936\u092C\u094B\u0930\u094D\u0921',

  // Currency
  'rates.currency': '\u20B9',

  // Hero (new)
  'hero.farmerCta':
    '\u0935\u093F\u0915\u093E\u092F\u0932\u093E \u0938\u0941\u0930\u0941\u0935\u093E\u0924 \u0915\u0930\u093E',
  'hero.merchantCta':
    '\u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0932\u0949\u0917\u093F\u0928',
};

const LANG_CYCLE: Language[] = ['en', 'hi', 'mr'];
const TRANSLATIONS: Record<Language, TranslationMap> = { en, hi, mr };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private currentLang = signal<Language>(this.getStoredLang());
  langSignal = this.currentLang.asReadonly();

  constructor(private appSettingsService: AppSettingsService) {}

  private getStoredLang(): Language {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'hi' || stored === 'mr') {
      return stored;
    }
    return 'en';
  }

  private saveLang() {
    localStorage.setItem(STORAGE_KEY, this.currentLang());
  }

  setLang(lang: Language) {
    this.currentLang.set(lang);
    this.saveLang();
  }

  toggleLanguage() {
    const currentIndex = LANG_CYCLE.indexOf(this.currentLang());
    const nextIndex = (currentIndex + 1) % LANG_CYCLE.length;
    this.setLang(LANG_CYCLE[nextIndex]);
  }

  /**
   * Translate a key based on the current language.
   * Returns the key itself if no translation is found.
   */
  t(key: string): string {
    // For hero.location, fetch from Firebase
    if (key === 'hero.location') {
      return this.appSettingsService.getHeroLocation();
    }

    // For footer.callToSell, construct dynamically with phone number from Firebase
    if (key === 'footer.callToSell') {
      const phoneNumber = this.appSettingsService.getPhoneNumber();
      const baseText = TRANSLATIONS[this.currentLang()][key] ?? en[key] ?? key;
      return baseText.replace('9432446384', phoneNumber);
    }

    return TRANSLATIONS[this.currentLang()][key] ?? en[key] ?? key;
  }

  /** Load saved language preference from localStorage (defaults to English) */
  private loadLanguage(): Language {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'hi' || saved === 'en' || saved === 'mr' ? saved : 'en';
  }
}

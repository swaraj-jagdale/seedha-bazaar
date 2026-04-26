import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { MerchantLogin } from './components/merchant-login/merchant-login';
import { MerchantDashboard } from './components/merchant-dashboard/merchant-dashboard';
import { FarmerLogin } from './components/farmer-login/farmer-login';
import { FarmerDashboard } from './components/farmer-dashboard/farmer-dashboard';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth.guard';
import { farmerGuard } from './guards/farmer.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'merchant/login', component: MerchantLogin },
  { path: 'merchant/dashboard', component: MerchantDashboard, canActivate: [authGuard] },
  { path: 'farmer/login', component: FarmerLogin },
  { path: 'farmer/dashboard', component: FarmerDashboard, canActivate: [farmerGuard] },
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin/dashboard', component: AdminDashboard },
  { path: '**', redirectTo: '' },
];

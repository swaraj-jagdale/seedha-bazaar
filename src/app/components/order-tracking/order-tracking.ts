import { Component, input } from '@angular/core';
import { Order, OrderService, OrderStatus } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss',
})
export class OrderTracking {
  order = input.required<Order>();

  readonly steps: OrderStatus[] = [
    'requested',
    'accepted',
    'sorting',
    'packed',
    'in_transit',
    'delivered',
    'payment_pending',
    'paid',
  ];

  constructor(
    public lang: LanguageService,
    public orderService: OrderService,
  ) {}

  getStepIndex(status: OrderStatus): number {
    return this.steps.indexOf(status);
  }

  isStepCompleted(step: OrderStatus): boolean {
    const order = this.order();
    if (order.status === 'rejected' || order.status === 'cancelled') return false;
    return this.getStepIndex(order.status) >= this.getStepIndex(step);
  }

  isStepActive(step: OrderStatus): boolean {
    return this.order().status === step;
  }

  getTimestamp(status: OrderStatus): string {
    const order = this.order();
    const entry = order.statusHistory?.find((e) => e.status === status);
    if (!entry) return '';
    const d = new Date(entry.timestamp);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

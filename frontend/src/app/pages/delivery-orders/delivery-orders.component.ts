import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery-orders',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding:2rem"><h1>Delivery Orders</h1><p>View and manage your assigned delivery orders.</p></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryOrdersComponent {}

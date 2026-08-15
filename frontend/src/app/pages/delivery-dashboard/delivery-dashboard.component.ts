import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonNote,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  timeOutline,
  cashOutline,
  navigateOutline,
  checkmarkDoneOutline,
  alertCircleOutline,
} from 'ionicons/icons';

interface Order {
  id: number;
  number: string;
  client: string;
  amount: number;
  status: 'assigned' | 'in_progress' | 'completed';
  date: string;
}

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonNote,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
  ],
  templateUrl: './delivery-dashboard.component.html',
  styleUrl: './delivery-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryDashboardComponent {
  private readonly router = inject(Router);

  readonly todayDate = signal(new Date().toLocaleDateString());
  readonly assignedOrders = signal(5);
  readonly completedOrders = signal(12);
  readonly collectionDue = signal('24,500');

  readonly orders = signal<Order[]>([
    {
      id: 1,
      number: 'ORD-2024-045',
      client: 'City Hospital',
      amount: 12500,
      status: 'assigned',
      date: '2024-04-06',
    },
    {
      id: 2,
      number: 'ORD-2024-046',
      client: 'Medicare Clinic',
      amount: 8300,
      status: 'in_progress',
      date: '2024-04-06',
    },
    {
      id: 3,
      number: 'ORD-2024-044',
      client: 'Health Plus',
      amount: 15200,
      status: 'completed',
      date: '2024-04-05',
    },
  ]);

  readonly stats = computed(() => [
    {
      title: 'Assigned Orders',
      value: this.assignedOrders(),
      icon: 'navigate-outline',
      color: 'primary',
      subtitle: 'Pending delivery',
    },
    {
      title: 'Completed',
      value: this.completedOrders(),
      icon: 'checkmark-done-outline',
      color: 'success',
      subtitle: 'This month',
    },
    {
      title: 'Collection Due',
      value: `₹${this.collectionDue()}`,
      icon: 'cash-outline',
      color: 'warning',
      subtitle: 'To collect',
    },
  ]);

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      timeOutline,
      cashOutline,
      navigateOutline,
      checkmarkDoneOutline,
      alertCircleOutline,
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'assigned':
        return 'navigate-outline';
      case 'in_progress':
        return 'time-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'assigned':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'medium';
    }
  }

  viewOrder(id: number): void {
    this.router.navigate([`/delivery-agent/orders/${id}`]);
  }
}

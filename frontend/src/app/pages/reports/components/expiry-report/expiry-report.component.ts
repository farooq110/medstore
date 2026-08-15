import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';

interface ExpiryData {
  expiredCount: number;
  expiringSoonCount: number;
}

@Component({
  selector: 'app-expiry-report',
  templateUrl: './expiry-report.component.html',
  styleUrl: './expiry-report.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonAccordionGroup,
    IonAccordion,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpiryReportComponent {
  expiryData = input<ExpiryData>({
    expiredCount: 0,
    expiringSoonCount: 0,
  });
}

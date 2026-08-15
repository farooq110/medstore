import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonText, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonText, IonSpinner],
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss']
})
export class CustomButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() color: string = 'success';
  @Input() fill: string = 'outline';
  @Input() expand: string = 'block';
  @Input() disabled: boolean = false;
  @Input() class: string = '';
  @Input() loading: boolean = false;
  @Input() loadingLabel: string = 'Loading...';
  @Output() click = new EventEmitter<void>();

  onButtonClick() {
    if (!this.disabled) {
      this.click.emit();
    }
  }
}

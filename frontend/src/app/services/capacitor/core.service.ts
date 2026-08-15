import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private loadingCounter: number = 0;  // Reference counter for parallel requests
  loader: any;

  constructor(
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController
  ) {}

  async copyText(text: string) {
    try {
      await Clipboard.write({
        string: text,
      });
      await Toast.show({
        text: 'Text copied to clipboard!',
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      await Toast.show({
        text: 'Failed to copy text. Please try again.',
      });
    }
  }

  async showSuccessToast(text: string) {
    const toast = await this.toastController.create({
      color: 'success',
      message: text,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  async showErrorToast(text: string) {
    const toast = await this.toastController.create({
      color: 'danger',
      message: text,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  async showCapToast(text: string) {
    Toast.show({ text: text });
  }

  async showLoading() {
    this.loadingCounter++;
    if (this.loadingCounter === 1) {  // Only show when first request starts
      this.loader = await this.loadingController.create();
      await this.loader.present();
    }
  }

  async hideLoading() {
    this.loadingCounter--;
    if (this.loadingCounter === 0) {  // Only hide when all requests complete
      this.loader.dismiss();
    }
  }

  getErrorMessage(
    control: AbstractControl | null,
    capitalizeLabel: string
  ): string {
    if (control?.touched && control?.hasError('email')) {
      return 'Invalid email format';
    } else if (control?.touched && control?.hasError('required')) {
      return `${capitalizeLabel} is required`;
    } else if (control?.touched && control?.hasError('minlength')) {
      return `${capitalizeLabel} must be at least ${control?.errors?.['minlength']?.requiredLength} digits`;
    } else if (control?.touched && control?.hasError('maxlength')) {
      return `${capitalizeLabel} must not be above ${control?.errors?.['maxlength']?.requiredLength} digits`;
    } else if (control?.touched && control?.hasError('pattern')) {
      return `${capitalizeLabel} format is invalid`;
    } else if (control?.touched && control?.hasError('invalidNTN')) {
      return 'NTN must be 10 digits (e.g., 1234567890) or in format XXXXX-XXXXXXX-X';
    } else {
      return '';
    }
  }
}

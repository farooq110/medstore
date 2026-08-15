import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  OnDestroy,
  input,
  output,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed, Signal } from '@angular/core';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonModal,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

export interface TypeaheadItem {
  text: string;
  value: string;
  stockQuantity?: number;
  price?: number;
}

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonList,
    IonModal,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonIcon,
  ],
})
export class TypeaheadComponent implements OnInit, OnDestroy {
  @ViewChild('typeaheadModal') modal!: IonModal;

  // Signal inputs - using new input() API
  items = input<TypeaheadItem[]>([]);
  selectedItems = input<string[]>([]);
  title = input<string>('Select Items');
  triggerId = input<string>('typeahead-trigger');
  triggerLabel = input<string>('Search Items');
  debounceTime = input<number>(500);
  page = input<number>(1);
  hasMore = input<boolean>();
  isLoading = input<boolean>();
  isMultiSelect = input<boolean>(true);
  disabled = input<boolean>(false);

  // Output signals - using new output() API
  onSearch = output<string>();
  
  // Output signal emitted when user triggers infinite-scroll. Payload includes the raw event,
  // current search query and the current page number (if provided by parent)
  onLoadMore = output<{
    event: InfiniteScrollCustomEvent;
    search: string;
    page?: number;
  }>();

  // Signal outputs - using new output() API
  selectionCancel = output<void>();
  selectionChange = output<string[]>();

  // Internal state signals
  workingSelectedValues = signal<string[]>([]);
  search = signal<string>('');
  isSearching = signal<boolean>(false);
  noItemsFound = computed(
    () =>
      this.search().trim() !== '' &&
      this.displayItems().length === 0 &&
      !this.isSearching(),
  );

  // Computed signal for display items - single source of truth
  // Use `items` (parent-managed) as the only source of data
  displayItems = computed(() => this.items());

  // Computed signal for selected text display
  selectedText = computed(() => {
    const selected = this.selectedItems();
    
    if (!this.isMultiSelect()) {
      // For single select, show the item's text/name
      if (selected.length === 0) return '';
      const selectedValue = selected[0];
      const item = this.items().find(i => i.value === selectedValue);
      return item?.text || selectedValue || '';
    }
    
    // For multi-select, show count
    return selected.length > 0 ? `${selected.length} Items` : '';
  });

  private debounceTimer: any;

  constructor() {
    addIcons({
          close,
        })
    // Effect to watch selected values and log/perform side effects
    effect(() => {
      const selectedValues = this.workingSelectedValues();
      console.log('📋 Selected values changed:', selectedValues);
    });

    // Effect to watch selectedItems input and update working values
    effect(() => {
      const selectedInput = this.selectedItems();
      if (selectedInput && selectedInput.length > 0) {
        console.log(
          '✅ Selected items input changed, count:',
          selectedInput.length,
        );
        this.workingSelectedValues.set([...selectedInput]);
      }
    });
  }

  ngOnInit() {
    // Effects in constructor handle initialization now
    // Just set loading to false
  }

  ngOnDestroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  cancelChanges() {
    this.selectionCancel.emit();
    this.modal.dismiss();
  }

  confirmChanges() {
    this.selectionChange.emit(this.workingSelectedValues());
    this.modal.dismiss();
  }

  searchbarInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.search.set(query);

    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.onSearch.emit(query);
    }, this.debounceTime());
  }

  onLoadMoreScroll(event: InfiniteScrollCustomEvent) {
    if (!this.hasMore?.()) {
      event.target.complete();
      return;
    }

    this.onLoadMore.emit({
      event,
      search: this.search(),
      page: this.page(),
    });
  }

  isChecked(value: string): boolean {
    return this.workingSelectedValues().includes(value);
  }

   close(): void {
    this.modal.dismiss();
  }
}

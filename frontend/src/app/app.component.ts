import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { CheckAuthStatus } from './store/auth-store';
import { GetAppVersion, CompareAppVersion, SetError as SetConfigError } from './store/config-store/config.actions';
import { ConfigSelectors } from './store/config-store/config.selectors';
import { VersionUpdateModalComponent } from './modals/version-update-modal/version-update-modal.component';
import { PlayStoreService } from './services/capacitor/play-store.service';
import { AppExitService } from './services/capacitor/app-exit.service';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { APP_VERSION } from 'src/environments/version';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const VERSION_CHECK_FLAG = 'app_version_check_done';
const VERSION_CHECK_INTERVAL = 5000; // Check every 5 seconds after user updates

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [ IonApp, IonRouterOutlet, VersionUpdateModalComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly playStoreService = inject(PlayStoreService);
  private readonly appExitService = inject(AppExitService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly destroy$ = new Subject<void>();
  private versionCheckInterval$ = new Subject<void>();

  // Signals for modal state
  isVersionModalOpen = signal(false);
  isCheckingForUpdate = signal(false);
  localVersion = signal<string | null>(null);
  serverVersion = signal<string | null>(null);
  mismatchType = signal<'outdated' | 'newer' | null>(null);

  ngOnInit() {
    // Check auth status on app init
    this.store.dispatch(new CheckAuthStatus());

    // Fetch app version from server
    this.store.dispatch(new GetAppVersion());

    // Subscribe to version state and perform version check
    this.subscribeToVersionState();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.versionCheckInterval$.next();
    this.versionCheckInterval$.complete();
  }

  /**
   * Subscribe to version state and handle version mismatch
   */
  private subscribeToVersionState(): void {
    this.store
      .select(ConfigSelectors.appVersionString)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (serverVersion) => {
        if (!serverVersion) return;

        // Check if we're waiting for user to update
        // const isCheckingForUpdate = this.isCheckingForUpdate();
        // if (!isCheckingForUpdate) {
        //   // Regular check on app load
        //   const versionCheckDone = await this.localStorageService.getItem(VERSION_CHECK_FLAG);
        //   if (versionCheckDone) {
        //     console.log('[AppComponent] Version check already done this session');
        //     return;
        //   }
        // }

        // Perform version comparison
        this.store.dispatch(
          new CompareAppVersion({
            localVersion: APP_VERSION,
            serverVersion,
          })
        );
      });

    // Subscribe to version mismatch state and show modal if needed
    this.store
      .select(ConfigSelectors.versionMismatch)
      .pipe(takeUntil(this.destroy$))
      .subscribe((versionMismatch) => {
        if (versionMismatch && !this.isCheckingForUpdate()) {
          // Show modal only if not currently checking for update
          this.showVersionModal();
        } else if (!versionMismatch && this.isCheckingForUpdate()) {
          // Versions match after user updated!
          console.log('[AppComponent] Version now matches! Navigating to login...');
          this.isCheckingForUpdate.set(false);
          this.isVersionModalOpen.set(false);
          this.versionCheckInterval$.next(); // Stop the checking interval
          this.navigateToLogin();
        }
      });

    // Subscribe to update version state for modal
    this.store
      .select(ConfigSelectors.localVersion)
      .pipe(takeUntil(this.destroy$))
      .subscribe((version) => {
        this.localVersion.set(version);
      });

    this.store
      .select(ConfigSelectors.appVersionString)
      .pipe(takeUntil(this.destroy$))
      .subscribe((version) => {
        this.serverVersion.set(version);
      });

    this.store
      .select(ConfigSelectors.mismatchType)
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.mismatchType.set(type);
      });
  }

  /**
   * Show version update modal
   */
  private showVersionModal(): void {
    this.isVersionModalOpen.set(true);
  }

  /**
   * Handle update button click - redirect to Play Store
   */
  async handleVersionUpdate(): Promise<void> {
    console.log('[AppComponent] User clicked update, redirecting to Play Store...');
    
    // Start periodic version checking
    this.isCheckingForUpdate.set(true);
    this.startPeriodicVersionCheck();

    // Redirect to Play Store
    await this.playStoreService.redirectToPlayStore();
    await this.handleVersionExit();
  }

  /**
   * Start periodic version checking after user goes to Play Store
   * Checks every 5 seconds until version matches
   */
  private startPeriodicVersionCheck(): void {
    console.log('[AppComponent] Starting periodic version check...');
    
    interval(VERSION_CHECK_INTERVAL)
      .pipe(takeUntil(this.versionCheckInterval$))
      .subscribe(() => {
        console.log('[AppComponent] Checking for updated version...');
        
        // Get current server version and re-check
        const serverVersion = this.serverVersion();
        if (serverVersion) {
          this.store.dispatch(
            new CompareAppVersion({
              localVersion: APP_VERSION,
              serverVersion,
            })
          );
        }
      });
  }

  /**
   * Navigate to login page after version is updated
   */
  private navigateToLogin(): void {
    console.log('[AppComponent] Navigating to login...');
    this.router.navigate(['/login'], { replaceUrl: true }).catch((err) => {
      console.error('[AppComponent] Navigation to login failed:', err);
      // Fallback: navigate to auth
      this.router.navigate(['/auth'], { replaceUrl: true }).catch((authErr) => {
        console.error('[AppComponent] Navigation to auth also failed:', authErr);
      });
    });
  }

  /**
   * Handle exit button click - close the app
   */
  async handleVersionExit(): Promise<void> {
    console.log('[AppComponent] User clicked exit button');
    // this.isVersionModalOpen.set(false);
    await this.appExitService.exitApp();
  }
}

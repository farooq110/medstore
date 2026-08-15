/**
 * Config Store State
 * NGXS state for managing app configuration
 */

import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ConfigStoreService } from './config.service';
import { VersionComparisonService } from 'src/app/services/version/version-comparison.service';
import { ConfigStateModel, AppConfig } from './config.model';
import {
  GetAppVersion,
  GetAppVersionSuccess,
  GetAppVersionFailure,
  SetLoading,
  SetError,
  ClearConfig,
  CompareAppVersion,
  VersionMismatch,
} from './config.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const defaults: ConfigStateModel = {
  appVersion: null,
  loading: false,
  error: null,
  localVersion: null,
  versionMismatch: false,
  mismatchType: null,
  versionCheckDone: false,
};

@State<ConfigStateModel>({
  name: 'config',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class ConfigState {
  private readonly configService = inject(ConfigStoreService);

  @Action(GetAppVersion)
  getAppVersion(ctx: StateContext<ConfigStateModel>, action: GetAppVersion) {
    ctx.patchState({ loading: true, error: null });

    return this.configService.getAppVersion().pipe(
      tap((response) => {
        if (response?.data) {
          ctx.patchState({
            appVersion: response.data,
            loading: false,
            error: null,
          });
        }
      }),
      catchError((error) => {
        const errorMessage =
          error?.error?.message || 'Failed to fetch app version';
        ctx.patchState({
          loading: false,
          error: errorMessage,
        });
        return of(null);
      })
    );
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<ConfigStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<ConfigStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(ClearConfig)
  clearConfig(ctx: StateContext<ConfigStateModel>) {
    ctx.setState(defaults);
  }

  @Action(CompareAppVersion)
  compareAppVersion(ctx: StateContext<ConfigStateModel>, action: CompareAppVersion) {
    const versionComparison = inject(VersionComparisonService);
    const { localVersion, serverVersion } = action.payload;

    const mismatchType = versionComparison.compareVersions(localVersion, serverVersion);

    if (mismatchType !== 'match') {
      ctx.patchState({
        localVersion,
        versionMismatch: true,
        mismatchType,
      });

      // Dispatch VersionMismatch action to notify subscribers
      ctx.dispatch(
        new VersionMismatch({
          localVersion,
          serverVersion,
          mismatchType: mismatchType as 'outdated' | 'newer',
        })
      );
    } else {
      ctx.patchState({
        localVersion,
        versionMismatch: false,
        mismatchType: null,
      });
    }
  }

  @Action(VersionMismatch)
  versionMismatch(ctx: StateContext<ConfigStateModel>, action: VersionMismatch) {
    // This action is primarily for notification and logging
    console.log('[ConfigState] Version mismatch detected:', action.payload);
  }
}

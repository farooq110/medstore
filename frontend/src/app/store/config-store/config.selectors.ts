/**
 * Config Store Selectors
 * Selectors for accessing config state
 */

import { Selector } from '@ngxs/store';
import { ConfigState } from './config.state';
import { ConfigStateModel, AppConfig } from './config.model';

export class ConfigSelectors {
  @Selector([ConfigState])
  static appVersion(state: ConfigStateModel): AppConfig | null {
    return state.appVersion;
  }

  @Selector([ConfigState])
  static appVersionString(state: ConfigStateModel): string | null {
    return state.appVersion?.version || null;
  }

  @Selector([ConfigState])
  static loading(state: ConfigStateModel): boolean {
    return state.loading;
  }

  @Selector([ConfigState])
  static error(state: ConfigStateModel): string | null {
    return state.error;
  }

  @Selector([ConfigState])
  static versionMismatch(state: ConfigStateModel): boolean {
    return state.versionMismatch;
  }

  @Selector([ConfigState])
  static mismatchType(state: ConfigStateModel): 'outdated' | 'newer' | null {
    return state.mismatchType;
  }

  @Selector([ConfigState])
  static localVersion(state: ConfigStateModel): string | null {
    return state.localVersion;
  }

  @Selector([ConfigState])
  static versionCheckDone(state: ConfigStateModel): boolean {
    return state.versionCheckDone;
  }
}

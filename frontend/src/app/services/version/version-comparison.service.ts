/**
 * Version Comparison Service
 * Handles semantic version comparison logic
 */

import { Injectable } from '@angular/core';

export type VersionMismatchType = 'match' | 'outdated' | 'newer';

@Injectable({
  providedIn: 'root',
})
export class VersionComparisonService {
  /**
   * Parse version string into major, minor, patch numbers
   * @param version Version string (e.g., "1.0.5")
   * @returns Object with major, minor, patch properties or null if invalid format
   */
  private parseVersion(version: string): { major: number; minor: number; patch: number } | null {
    if (!version || typeof version !== 'string') {
      console.warn('[VersionComparison] Invalid version format:', version);
      return null;
    }

    const parts = version.trim().split('.');
    if (parts.length !== 3) {
      console.warn('[VersionComparison] Version must have 3 parts (major.minor.patch):', version);
      return null;
    }

    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10);

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      console.warn('[VersionComparison] Version parts must be numbers:', version);
      return null;
    }

    return { major, minor, patch };
  }

  /**
   * Compare two semantic versions
   * @param localVersion Current app version (e.g., "1.0.0")
   * @param serverVersion Server app version (e.g., "1.0.1")
   * @returns 'match' if same, 'outdated' if local < server, 'newer' if local > server
   */
  compareVersions(localVersion: string, serverVersion: string): VersionMismatchType {
    const local = this.parseVersion(localVersion);
    const server = this.parseVersion(serverVersion);

    // If parsing fails, assume they match to avoid blocking the app
    if (!local || !server) {
      console.warn('[VersionComparison] Failed to parse versions. Assuming match.');
      return 'match';
    }

    // Compare major version
    if (local.major > server.major) return 'newer';
    if (local.major < server.major) return 'outdated';

    // Compare minor version
    if (local.minor > server.minor) return 'newer';
    if (local.minor < server.minor) return 'outdated';

    // Compare patch version
    if (local.patch > server.patch) return 'newer';
    if (local.patch < server.patch) return 'outdated';

    // All versions match
    return 'match';
  }
}

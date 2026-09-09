/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const PASSCODE_STORAGE_KEY = 'jar_repo_admin_passcode_v1';
const ADMIN_ACTIVE_STORAGE_KEY = 'jar_repo_admin_active_v1';
const DEFAULT_PASSCODE = 'admin123';

/**
 * Retrieve the current admin passcode, initializing with the default if not set.
 */
export function getStoredPasscode(): string {
  try {
    const stored = localStorage.getItem(PASSCODE_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(PASSCODE_STORAGE_KEY, DEFAULT_PASSCODE);
      return DEFAULT_PASSCODE;
    }
    return stored;
  } catch {
    return DEFAULT_PASSCODE;
  }
}

/**
 * Verify whether the entered passcode matches the stored passcode.
 */
export function verifyAdminPasscode(input: string): boolean {
  const current = getStoredPasscode();
  return input.trim() === current.trim();
}

/**
 * Update the stored admin passcode.
 */
export function updateAdminPasscode(newPasscode: string): boolean {
  if (!newPasscode || newPasscode.trim().length < 4) {
    return false;
  }
  try {
    localStorage.setItem(PASSCODE_STORAGE_KEY, newPasscode.trim());
    return true;
  } catch (err) {
    console.error('Failed to update passcode in storage:', err);
    return false;
  }
}

/**
 * Check if the current browser session has active admin authorization.
 */
export function getIsAdminActive(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_ACTIVE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persist the active admin state in sessionStorage.
 */
export function setIsAdminActive(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(ADMIN_ACTIVE_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_ACTIVE_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to set admin session active state:', err);
  }
}

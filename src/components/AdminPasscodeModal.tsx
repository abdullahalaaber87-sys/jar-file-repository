/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, Eye, EyeOff, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { verifyAdminPasscode, updateAdminPasscode, getActiveAdminPasscode } from '../utils/adminAuth';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  onLock: () => void;
  onPasscodeChanged: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  isAdmin,
  onClose,
  onUnlockSuccess,
  onLock,
  onPasscodeChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'unlock' | 'change'>(isAdmin ? 'change' : 'unlock');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Change passcode state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showChangeFields, setShowChangeFields] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(isAdmin ? 'change' : 'unlock');
      setPasscode('');
      setErrorMessage('');
      setCurrentPasscode(isAdmin ? getActiveAdminPasscode() : '');
      setNewPasscode('');
      setConfirmPasscode('');
      setChangeError('');
      setChangeSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!passcode.trim()) {
      setErrorMessage('Please enter the admin passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await verifyAdminPasscode(passcode);
      if (ok) {
        onUnlockSuccess();
        onClose();
      } else {
        setErrorMessage('Incorrect passcode. Please check and try again.');
      }
    } catch {
      setErrorMessage('Verification failed. Server may be starting up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess(false);

    if (newPasscode.trim().length < 4) {
      setChangeError('New passcode must be at least 4 characters long.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setChangeError('New passcodes do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await updateAdminPasscode(currentPasscode, newPasscode);
      if (ok) {
        setChangeSuccess(true);
        setCurrentPasscode(newPasscode.trim());
        setNewPasscode('');
        setConfirmPasscode('');
        onUnlockSuccess();
        onPasscodeChanged();
        setTimeout(() => {
          setChangeSuccess(false);
        }, 3000);
      } else {
        setChangeError('Incorrect current passcode or update failed.');
      }
    } catch {
      setChangeError('Failed to update passcode. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="admin-passcode-backdrop"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="admin-passcode-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-100">
                  {isAdmin ? 'Admin & Passcode Settings' : 'Admin Passcode'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Manage your private owner access and secret passcode
                </p>
              </div>
            </div>
            <button
              id="btn-close-passcode-modal"
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs - Always visible */}
          <div className="flex border-b border-neutral-800/80 bg-neutral-950/40 px-5 pt-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('unlock')}
              className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'unlock'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Status & Lock' : 'Enter Passcode'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('change')}
              className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'change'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Passcode</span>
            </button>
          </div>

          <div className="p-6">
            {/* UNLOCK VIEW */}
            {activeTab === 'unlock' && (
              <>
                {isAdmin ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-neutral-100">Admin Mode is Currently Active</p>
                        <p className="text-neutral-400 mt-1 leading-relaxed">
                          All Add, Edit, and Delete file controls are visible to you. To change your passcode, click the <strong>Change Passcode</strong> tab above.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('change')}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs py-2.5 px-4 rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Update Admin Passcode</span>
                      </button>
                      <button
                        type="button"
                        id="btn-lock-from-modal"
                        onClick={() => {
                          onLock();
                          onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-neutral-700 transition-colors cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Lock & Return to Visitor View</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUnlockSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Private Passcode
                      </label>
                      <div className="relative">
                        <input
                          id="input-admin-passcode"
                          type={showPasscode ? 'text' : 'password'}
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="Enter passcode..."
                          autoFocus
                          className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                        >
                          {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 text-[11px] text-neutral-500">
                        <span>Default: <code className="text-amber-400 font-mono">admin123</code></span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('change')}
                          className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                        >
                          Want to change it? Click here →
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-submit-unlock"
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-neutral-950 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isLoading ? 'Verifying...' : 'Unlock Controls'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* CHANGE PASSCODE VIEW */}
            {activeTab === 'change' && (
              <form onSubmit={handleChangeSubmit} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                  <p className="font-semibold text-neutral-200">Owner Passcode Management</p>
                  <p className="leading-relaxed">
                    Default passcode is <code className="text-amber-400 font-mono bg-neutral-900 px-1 py-0.5 rounded">admin123</code>. Enter the current passcode and choose your new one.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Current Passcode
                  </label>
                  <div className="relative">
                    <input
                      id="input-current-passcode"
                      type={showChangeFields ? 'text' : 'password'}
                      value={currentPasscode}
                      onChange={(e) => setCurrentPasscode(e.target.value)}
                      placeholder="e.g. admin123"
                      className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangeFields(!showChangeFields)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                    >
                      {showChangeFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    New Passcode (at least 4 characters)
                  </label>
                  <input
                    id="input-new-passcode"
                    type={showChangeFields ? 'text' : 'password'}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new private passcode..."
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Confirm New Passcode
                  </label>
                  <input
                    id="input-confirm-passcode"
                    type={showChangeFields ? 'text' : 'password'}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Re-enter new passcode..."
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80"
                  />
                </div>

                {changeError && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{changeError}</span>
                  </div>
                )}

                {changeSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Passcode updated! Owner mode is unlocked.</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    id="btn-save-passcode"
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
                  >
                    <span>{isLoading ? 'Saving...' : 'Save New Passcode'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

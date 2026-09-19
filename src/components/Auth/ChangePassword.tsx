import React, { useState, useEffect, useRef } from 'react';
import { useChangePassword } from '@/hooks/useChangePassword';
import {
  Key,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
  XCircle,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '@/services/auth/hooks/useAuth';
import BaseModal from '@/common/BaseModal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Requirement {
  id: string;
  label: string;
  met: boolean;
}

// 1. Password Complexity & Pattern Evaluation
const evaluatePassword = (
  password: string,
): { requirements: Requirement[]; score: number; patternWarning: string } => {
  let patternWarning = '';

  if (/(.)\1{2,}/.test(password)) {
    patternWarning = 'Avoid repeating characters';
  } else if (/12345|qwerty|password|admin|abcdef/i.test(password)) {
    patternWarning = 'Avoid common keyboard sequences';
  }

  const requirements: Requirement[] = [
    { id: 'length', label: '12+ characters', met: password.length >= 12 },
    { id: 'upper', label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'Number', met: /[0-9]/.test(password) },
    {
      id: 'symbol',
      label: 'Special character',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = requirements.filter((r) => r.met).length;
  return { requirements, score, patternWarning };
};

const getStrengthInfo = (score: number) => {
  switch (score) {
    case 1:
      return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    case 2:
      return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    case 3:
      return { label: 'Good', color: 'bg-cyan-500', text: 'text-cyan-400' };
    case 4:
      return {
        label: 'Strong',
        color: 'bg-emerald-500',
        text: 'text-emerald-400',
      };
    default:
      return { label: '', color: 'bg-slate-800', text: 'text-slate-500' };
  }
};

// 2. Cryptographic SHA-1 Helper for k-Anonymity HIBP API lookup
async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isBreached, setIsBreached] = useState<boolean | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [pastedWarning, setPastedWarning] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending, error, reset } = useChangePassword();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { requirements, score, patternWarning } = evaluatePassword(newPassword);
  const strength = getStrengthInfo(score);

  const isMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isSameAsCurrent =
    newPassword.length > 0 &&
    currentPassword.length > 0 &&
    currentPassword === newPassword;
  const isValidLength = newPassword.length >= 8;

  // 3. Asynchronous k-Anonymity Breach Lookup with Error Handling & Race Guard
  useEffect(() => {
    // If the password isn't long enough, do nothing
    if (!isValidLength) return;

    let isCurrent = true;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // 1. Asynchronous setState occurs AFTER the render cycle
      setIsCheckingBreach(true);

      try {
        const hash = await sha1(newPassword);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        const res = await fetch(
          `https://api.pwnedpasswords.com/range/${prefix}`,
        );
        if (!res.ok) throw new Error('HIBP Lookup Failed');

        const body = await res.text();
        const matches = body
          .split('\r\n')
          .some((line) => line.startsWith(suffix));

        if (isCurrent) {
          setIsBreached(matches);
        }
      } catch {
        if (isCurrent) {
          setIsBreached(null);
        }
      } finally {
        if (isCurrent) {
          setIsCheckingBreach(false);
        }
      }
    }, 500);

    return () => {
      isCurrent = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [newPassword, isValidLength]);

  // 4. Modal State Reset
  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setValidationError('');
    setIsBreached(null);
    setIsCheckingBreach(false);
    setPastedWarning(false);
    setIsSuccess(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    reset();
    onClose();
  };

  // 5. Cryptographically Secure Password Generator
  const generateSecurePassword = () => {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    let pwd = '';
    for (let i = 0; i < array.length; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setNewPassword(pwd);
    setConfirmPassword(pwd);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');

    if (isSameAsCurrent) {
      setValidationError(
        'New password must be different from your current password.',
      );
      return;
    }

    if (score < 3) {
      setValidationError(
        'Please choose a stronger password before continuing.',
      );
      return;
    }

    if (isBreached) {
      setValidationError(
        'This password has been exposed in a known data breach. Choose a different one.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match.');
      return;
    }

    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            logout();
            onSuccess?.();
          }, 1500);
        },
      },
    );
  };

  const apiErrorMessage =
    error?.response?.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
      ? String(error.response.data.message)
      : 'Failed to update password.';

  return (
    <BaseModal
      isOpen={isOpen}
      title="Security Credentials"
      subtitle="Update your password to keep your account secure"
      error={validationError || apiErrorMessage}
      isSubmitting={isPending}
      submitLabel="Update Password"
      submittingLabel="Updating..."
      onClose={handleClose}
      onSubmit={handleSubmit}
      showActions={!isSuccess}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle2 size={32} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <h4 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
            Password Updated <Sparkles size={14} className="text-emerald-400" />
          </h4>
          <p className="mt-1.5 max-w-xs text-xs text-slate-400">
            Your login credentials have been securely updated.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Current Password
            </label>
            <div className="relative flex items-center group">
              <Key className="absolute left-3.5 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 py-2.5 pl-10 pr-10 font-mono text-xs text-slate-100 placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                New Password
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="flex items-center gap-1 text-[10px] font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <RefreshCw size={11} /> Generate Strong Password
                </button>
                {newPassword && (
                  <span
                    className={`font-mono text-[10px] font-bold ${strength.text}`}
                  >
                    (Password strength: {strength.label})
                  </span>
                )}
              </div>
            </div>

            <div className="relative flex items-center group">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onPaste={() => {
                  setPastedWarning(true);
                  setTimeout(() => setPastedWarning(false), 4000);
                }}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new password"
                className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 py-2.5 pl-10 pr-10 font-mono text-xs text-slate-100 placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Paste Guard Warning */}
            {pastedWarning && (
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-500/30 px-2.5 py-1.5 rounded-lg animate-in fade-in duration-200">
                <ClipboardCheck size={13} className="shrink-0" />
                <span>
                  Pasted password detected. Ensure your clipboard remains
                  secure.
                </span>
              </div>
            )}

            {/* Password Reuse Warning */}
            {isSameAsCurrent && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/40 ring-1 ring-amber-500/30 px-2.5 py-1.5 rounded-lg">
                <AlertTriangle size={13} className="shrink-0" />
                <span>
                  New password cannot be identical to your current password.
                </span>
              </div>
            )}

            {/* HIBP Breach Detection Warnings */}
            {isCheckingBreach && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <RefreshCw size={12} className="animate-spin text-slate-500" />
                <span>Checking threat intelligence databases...</span>
              </div>
            )}

            {isBreached && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-950/40 ring-1 ring-rose-500/30 px-2.5 py-1.5 rounded-lg animate-in fade-in duration-200">
                <ShieldAlert size={13} className="shrink-0 text-rose-400" />
                <span>
                  Found in known data breaches. Choose a safer password.
                </span>
              </div>
            )}

            {patternWarning && !isBreached && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/40 ring-1 ring-amber-500/30 px-2.5 py-1.5 rounded-lg">
                <AlertTriangle size={13} className="shrink-0" />
                <span>{patternWarning}</span>
              </div>
            )}

            {/* Segmented Strength Meter */}
            {newPassword && (
              <div className="space-y-2 pt-0.5">
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        step <= score ? strength.color : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Password Requirements Badges */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors ${
                        req.met
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                          : 'bg-slate-900/40 text-slate-500 ring-1 ring-slate-800/60'
                      }`}
                    >
                      {req.met ? (
                        <Check size={12} className="shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0" />
                      )}
                      <span className="truncate">{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Confirm New Password
              </label>
              {isMatch && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                  <Check size={12} /> Passwords match
                </span>
              )}
              {isMismatch && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-rose-400">
                  <XCircle size={12} /> Passwords do not match
                </span>
              )}
            </div>

            <div className="relative flex items-center group">
              <ShieldCheck className="absolute left-3.5 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full rounded-xl border bg-slate-900/80 py-2.5 pl-10 pr-10 font-mono text-xs text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-2 shadow-inner ${
                  isMismatch
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                    : isMatch
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-slate-800/80 focus:border-cyan-500/50 focus:bg-slate-900 focus:ring-cyan-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

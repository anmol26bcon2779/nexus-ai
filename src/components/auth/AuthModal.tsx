import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Lock,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    isSupabaseReady,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    saveRuntimeCredentials,
  } = useAuth();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status and feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // Quick connect accordion for credentials
  const [showQuickConnect, setShowQuickConnect] = useState(!isSupabaseReady);
  const [runtimeUrl, setRuntimeUrl] = useState('');
  const [runtimeKey, setRuntimeKey] = useState('');
  const [testingConnect, setTestingConnect] = useState(false);
  const [connectMessage, setConnectMessage] = useState<{ success: boolean; text: string } | null>(null);

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailConfirmationRequired(false);
  };

  const handleModeChange = (mode: 'signin' | 'signup' | 'reset') => {
    resetFormState();
    setAuthModalMode(mode);
  };

  // Quick connect handler
  const handleQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnect(true);
    setConnectMessage(null);

    const res = await saveRuntimeCredentials(runtimeUrl, runtimeKey);
    setTestingConnect(false);
    if (res.success) {
      setConnectMessage({ success: true, text: res.message });
      setTimeout(() => setShowQuickConnect(false), 2000);
    } else {
      setConnectMessage({ success: false, text: res.message });
    }
  };

  // Main submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);

    try {
      if (authModalMode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in. Verify your credentials.');
        } else {
          setIsAuthModalOpen(false);
        }
      } else if (authModalMode === 'signup') {
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, fullName);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to register account.');
        } else {
          if (res.requiresEmailConfirmation) {
            setEmailConfirmationRequired(true);
            setSuccessMessage(res.message || 'Account registered! Please verify your email.');
          } else {
            setSuccessMessage(res.message || 'Account created successfully!');
            setTimeout(() => setIsAuthModalOpen(false), 2000);
          }
        }
      } else if (authModalMode === 'reset') {
        const res = await resetPassword(email);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to send reset link.');
        } else {
          setSuccessMessage(res.message || 'Check your email for reset instructions.');
        }
      } else if (authModalMode === 'update-password') {
        if (newPassword !== confirmPassword) {
          setErrorMessage('Passwords do not match.');
          setLoading(false);
          return;
        }

        const res = await updatePassword(newPassword);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to update password.');
        } else {
          setSuccessMessage(res.message || 'Password updated successfully!');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setAuthModalMode('signin');
          }, 2500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          {authModalMode === 'signup' ? (
            <UserPlus className="w-5 h-5 text-purple-400" />
          ) : authModalMode === 'reset' ? (
            <KeyRound className="w-5 h-5 text-indigo-400" />
          ) : authModalMode === 'update-password' ? (
            <Lock className="w-5 h-5 text-emerald-400" />
          ) : (
            <LogIn className="w-5 h-5 text-purple-400" />
          )}
          <span>
            {authModalMode === 'signup'
              ? 'Create Nexus AI Account'
              : authModalMode === 'reset'
              ? 'Reset Account Password'
              : authModalMode === 'update-password'
              ? 'Set New Account Password'
              : 'Sign In to Nexus Workspace'}
          </span>
        </div>
      }
      description="Access your business workflows, connected integrations, and delivery records."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Supabase Connection State Banner / Quick Connector */}
        {!isSupabaseReady && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3.5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">Supabase Awaiting Credentials</p>
                  <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                    Set <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">VITE_SUPABASE_URL</code> and{' '}
                    <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">VITE_SUPABASE_ANON_KEY</code> in Vercel or local{' '}
                    <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickConnect(!showQuickConnect)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                <span>{showQuickConnect ? 'Hide' : 'Connect Now'}</span>
                {showQuickConnect ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showQuickConnect && (
              <form onSubmit={handleQuickConnect} className="pt-2 border-t border-amber-500/20 space-y-2.5 text-xs animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-300">
                  Paste your Supabase project credentials below to activate live Auth immediately in your browser:
                </p>

                <Input
                  label="Project URL"
                  placeholder="https://xyzcompany.supabase.co"
                  value={runtimeUrl}
                  onChange={(e) => setRuntimeUrl(e.target.value)}
                  required
                />

                <Input
                  label="Anon / Publishable Key"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... or sb_publishable_..."
                  value={runtimeKey}
                  onChange={(e) => setRuntimeKey(e.target.value)}
                  required
                />

                {connectMessage && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                      connectMessage.success
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {connectMessage.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{connectMessage.text}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Button
                    type="submit"
                    variant="primary"
                    size="xs"
                    isLoading={testingConnect}
                    leftIcon={<Database className="w-3 h-3" />}
                  >
                    Test & Connect Project
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab Switcher (only for signin/signup/reset) */}
        {authModalMode !== 'update-password' && (
          <div className="flex items-center bg-[#151824] p-1 rounded-lg border border-[#282F48] text-xs">
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                authModalMode === 'signin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                authModalMode === 'signup' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">{errorMessage}</span>
              {errorMessage.includes('not confirmed') && (
                <p className="text-[11px] text-rose-300/80">
                  Did not receive your confirmation email? Check your spam folder or Supabase Authentication settings.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">{successMessage}</p>
              {emailConfirmationRequired && (
                <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                  Tip: If using Supabase without a custom SMTP provider, check your email inbox for the standard verification link. You can also disable "Confirm email" in Supabase Auth settings for immediate logins.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Primary Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'signup' && (
            <Input
              label="Full Name / Business Owner"
              placeholder="e.g. Swechha Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          {authModalMode !== 'update-password' && (
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          {authModalMode !== 'reset' && authModalMode !== 'update-password' && (
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {authModalMode === 'signup' && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {authModalMode === 'update-password' && (
            <>
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          {/* Contextual Links */}
          <div className="flex items-center justify-between text-xs pt-1">
            {authModalMode === 'signin' ? (
              <button
                type="button"
                onClick={() => handleModeChange('reset')}
                className="text-purple-400 hover:text-purple-300 hover:underline"
              >
                Forgot password?
              </button>
            ) : authModalMode === 'reset' ? (
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="text-purple-400 hover:text-purple-300 hover:underline"
              >
                Back to Sign In
              </button>
            ) : authModalMode === 'signup' ? (
              <span className="text-[11px] text-slate-400">
                Minimum 6 characters • Real Supabase Auth
              </span>
            ) : null}

            {authModalMode === 'signin' && (
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="text-slate-400 hover:text-slate-200"
              >
                New business? <span className="text-purple-400 font-semibold">Sign up</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAuthModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              isLoading={loading}
              disabled={!isSupabaseReady && !showQuickConnect}
            >
              {authModalMode === 'signup'
                ? 'Create Account'
                : authModalMode === 'reset'
                ? 'Send Reset Link'
                : authModalMode === 'update-password'
                ? 'Update Password'
                : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserPlus, KeyRound, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, isSupabaseReady, signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in. Verify your credentials.');
        } else {
          setIsAuthModalOpen(false);
        }
      } else if (mode === 'signup') {
        const res = await signUp(email, password, fullName);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign up.');
        } else {
          setSuccessMessage(res.message || 'Account created successfully!');
          setTimeout(() => setIsAuthModalOpen(false), 2000);
        }
      } else {
        const res = await resetPassword(email);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to send reset link.');
        } else {
          setSuccessMessage(res.message || 'Check your email for reset instructions.');
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
          {mode === 'signup' ? (
            <UserPlus className="w-5 h-5 text-purple-400" />
          ) : mode === 'reset' ? (
            <KeyRound className="w-5 h-5 text-indigo-400" />
          ) : (
            <LogIn className="w-5 h-5 text-purple-400" />
          )}
          <span>
            {mode === 'signup'
              ? 'Create Nexus AI Account'
              : mode === 'reset'
              ? 'Reset Account Password'
              : 'Sign In to Nexus Workspace'}
          </span>
        </div>
      }
      description="Access your business workflows, connected integrations, and delivery records."
      maxWidth="md"
    >
      <div className="space-y-4">
        {!isSupabaseReady && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Supabase Awaiting Credentials</p>
              <p className="text-[11px] text-amber-300/90 mt-0.5">
                Set <code className="bg-black/30 px-1 py-0.2 rounded font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="bg-black/30 px-1 py-0.2 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> in Vercel or local <code className="bg-black/30 px-1 py-0.2 rounded font-mono">.env.local</code> to activate live authentication.
              </p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#151824] p-1 rounded-lg border border-[#282F48] text-xs">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'signin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'signup' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <Input
              label="Full Name / Business Owner"
              placeholder="e.g. Swechha Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== 'reset' && (
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => { setMode('reset'); setErrorMessage(null); }}
                className="text-purple-400 hover:underline"
              >
                Forgot password?
              </button>
            ) : mode === 'reset' ? (
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(null); }}
                className="text-purple-400 hover:underline"
              >
                Back to Sign In
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">
                Minimum 6 characters with letters & numbers
              </span>
            )}
          </div>

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
              disabled={!isSupabaseReady}
            >
              {mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

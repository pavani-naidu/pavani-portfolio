import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signedUpSuccess, setSignedUpSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Validate
      const result = signupSchema.safeParse(data);
      if (!result.success) {
        setErrorMsg(result.error.errors[0].message);
        setLoading(false);
        return;
      }
      
      await signup({ name: data.name, email: data.email, password: data.password });
      setSignedUpSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3500);
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.response?.data?.error || 'Registration failed. That email may be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[60vw] h-[60vw] rounded-full bg-purple-500/5 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-brand-primary animate-pulse" />
            <span className="font-extrabold text-3xl tracking-tight text-gradient">Yuvi Mantra</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
          <p className="text-slate-400 text-sm mt-1">Join our wellness & study companion platform</p>
        </div>

        {/* Card Body */}
        <div className="glass-card p-8 bg-slate-900/40 rounded-2xl border border-white/5 shadow-2xl">
          {signedUpSuccess ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Welcome to Yuvi Mantra!</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Account created successfully. A verification email has been queued (mocked). Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="Jane Doe"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="jane@school.edu"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-primary transition-colors pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-primary transition-colors pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/10 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer Link */}
        {!signedUpSuccess && (
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:underline font-bold">
              Sign in instead
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    // Solve resolvers manually or inline to prevent resolver import errors
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Validate inputs
      const result = loginSchema.safeParse(data);
      if (!result.success) {
        setErrorMsg(result.error.errors[0].message);
        setLoading(false);
        return;
      }
      
      await login({ email: data.email, password: data.password }, data.rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[60vw] h-[60vw] rounded-full bg-blue-500/5 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full z-10">
        {/* Logo and Headings */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-brand-primary animate-pulse" />
            <span className="font-extrabold text-3xl tracking-tight text-gradient">Yuvi Mantra</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">"A Friend Who Listens. An AI That Cares."</p>
        </div>

        {/* Card Body */}
        <div className="glass-card p-8 bg-slate-900/40 rounded-2xl border border-white/5 shadow-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="you@school.edu"
                required
              />
              {errors.email && (
                <p className="text-red-400 text-[11px] mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-primary hover:underline font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-primary transition-colors pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-[11px] mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="w-4 h-4 bg-slate-950 border border-white/10 rounded focus:ring-0 focus:ring-offset-0 text-brand-primary"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-400 ml-2 cursor-pointer font-medium select-none">
                Remember my login info
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          New to Yuvi Mantra?{' '}
          <Link to="/signup" className="text-brand-primary hover:underline font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { SUGGESTED_JOB_TITLES } from '../utils/sampleTasks';

export const LoginPage = () => {
  const [isRegisterTab, setIsRegisterTab] = useState(window.location.pathname === '/register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAllTitles, setShowAllTitles] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegisterTab) {
        const user = await register({
          name,
          email,
          password,
          title: title || 'Software Engineer',
          department: department || 'Engineering'
        });
        navigate(user.role === 'manager' ? '/dashboard' : '/reports');
      } else {
        const user = await login(email, password);
        navigate(user.role === 'manager' ? '/dashboard' : '/reports');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-2">
          <img
            src="/logo.png"
            alt="TeamPulse"
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Weekly report workspace for engineering teams
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-7 shadow-sm rounded-3xl border border-slate-200">
          {/* Tab Switch */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterTab(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 ${
                !isRegisterTab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterTab(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 ${
                isRegisterTab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
            {isRegisterTab && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    placeholder="e.g. Jane Doe"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-slate-700 text-xs">
                      Job Title
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Pick a suggestion or type your own
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="register-job-titles"
                      value={title}
                      placeholder="e.g. Full Stack Developer, DevOps..."
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-slate-900 text-xs transition"
                    />
                    {title && (
                      <button
                        type="button"
                        onClick={() => setTitle('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Clear job title"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <datalist id="register-job-titles">
                    {SUGGESTED_JOB_TITLES.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>

                  {/* Quick suggestion pills */}
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider">
                        Suggested Titles
                      </span>
                      {SUGGESTED_JOB_TITLES.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllTitles(!showAllTitles)}
                          className="font-medium text-sky-600 hover:text-sky-700 cursor-pointer"
                        >
                          {showAllTitles ? 'Show fewer' : `+${SUGGESTED_JOB_TITLES.length - 6} more`}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(showAllTitles ? SUGGESTED_JOB_TITLES : SUGGESTED_JOB_TITLES.slice(0, 6)).map((t) => {
                        const isSelected = title.trim().toLowerCase() === t.toLowerCase();
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTitle(isSelected ? '' : t)}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {isSelected ? `✓ ${t}` : t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    placeholder="e.g. Platform Team"
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                placeholder="name@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Password *</label>
              <input
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 mt-5 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : isRegisterTab
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

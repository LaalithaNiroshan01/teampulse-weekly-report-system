import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  LogOut,
  Menu
} from 'lucide-react';

export const Navbar = ({ onOpenAi, onToggleSidebar }) => {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="shrink-0 sticky top-0 z-30 glass-nav shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Sidebar toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100/80 transition active:scale-95"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to={isManager ? '/dashboard' : '/reports'} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tracking-tight text-sm block leading-tight">
                    TeamPulse
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    v1.0
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                  Weekly Workspace
                </span>
              </div>
            </Link>
          </div>

          {/* Right: User Info & Logout */}
          <div className="flex items-center gap-3">
            {/* User Name & title + Avatar with Active Status Dot */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white"></span>
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  {user?.title || user?.department}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 transition-colors active:scale-95 border border-slate-200/60"
              title="Sign out of TeamPulse"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

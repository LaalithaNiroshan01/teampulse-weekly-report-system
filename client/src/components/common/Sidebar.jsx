import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  Users,
  FolderKanban,
  History,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isManager, user } = useAuth();

  const memberLinks = [
    {
      to: '/reports',
      label: 'Report History',
      icon: History,
      description: 'View past weekly reports and statuses'
    },
    {
      to: '/reports/new',
      label: 'New Weekly Report',
      icon: FilePlus,
      description: 'Draft or submit this week report'
    }
  ];

  const managerLinks = [
    {
      to: '/dashboard',
      label: 'Team Dashboard',
      icon: LayoutDashboard,
      description: 'Team metrics, charts & compliance'
    },
    {
      to: '/users',
      label: 'User Management',
      icon: Users,
      description: 'Roster, invite & assign roles'
    },
    {
      to: '/projects',
      label: 'Projects & Categories',
      icon: FolderKanban,
      description: 'Manage active project tags'
    },
    {
      to: '/reports',
      label: 'My Weekly Reports',
      icon: History,
      description: 'Your personal report history'
    },
    {
      to: '/reports/new',
      label: 'New Personal Report',
      icon: FilePlus,
      description: 'Draft personal weekly report'
    }
  ];

  const links = isManager ? managerLinks : memberLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block h-full shrink-0 overflow-hidden select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4 justify-between overflow-hidden">
          {/* Top section: Title + Nav */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Mobile Header Brand */}
            <div className="lg:hidden px-3 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
              <img src="/logo.png" alt="TeamPulse" className="h-6 w-auto object-contain" />
              <span className="text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                v1.0
              </span>
            </div>

            {/* Section title - Pinned at top */}
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between shrink-0">
              <span>{isManager ? 'Management' : 'Workspace'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 mt-2 flex-1 overflow-y-auto pr-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="tracking-tight">{link.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-slate-400 translate-x-0.5' : 'text-slate-300 opacity-30 group-hover:opacity-100'
                      }`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

          {/* User footer info card */}
          <div className="shrink-0 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <span>Role:</span>
              </span>
              <span className={`px-2 py-0.5 rounded font-semibold text-[9px] uppercase tracking-wider ${
                user?.role === 'manager' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-200/80 text-slate-700'
              }`}>
                {user?.role === 'manager' ? 'Manager' : 'Member'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

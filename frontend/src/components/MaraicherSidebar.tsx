import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Tractor, BookOpen, Bell, MessageSquare, 
  LogOut, Sprout, ChevronRight, X, Award 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MaraicherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const MaraicherSidebar: React.FC<MaraicherSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Tableau de bord',
      path: '/dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      label: 'Mes Parcelles & Cultures',
      path: '/exploitations',
      icon: Tractor
    },
    {
      label: 'Formations & Cours',
      path: '/formations',
      icon: BookOpen
    },
    {
      label: 'Alertes Agricoles',
      path: '/alertes',
      icon: Bell
    },
    {
      label: 'Forum Maraîcher',
      path: '/forum',
      icon: MessageSquare
    }
  ];

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container (Largeur dynamique : w-72 déplié ou w-20 replié sur desktop) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-emerald-950 text-white flex flex-col border-r border-emerald-800/80 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
      >
        {/* Brand header officiel */}
        <div className={`h-16 flex items-center border-b border-emerald-800/80 bg-emerald-950 px-4 transition-all ${
          isCollapsed ? 'justify-center' : 'justify-between px-6'
        }`}>
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-emerald-500 p-2 rounded-xl text-emerald-950 group-hover:scale-105 transition-transform shadow-md shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap transition-opacity duration-200">
                <span className="text-lg font-black tracking-tight flex items-center gap-1">
                  Casa <span className="text-emerald-400">AgriSchool</span>
                </span>
                <span className="text-[9px] text-emerald-300 block -mt-1 uppercase tracking-widest font-bold">
                  Espace Maraîcher • Casamance
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-850"
            title="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-thin">
          <div className="space-y-1.5">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
                Mon Espace Agricole
              </div>
            )}

            {navItems.map((item) => {
              const active = isItemActive(item.path);
              const Icon = item.icon;

              if (isCollapsed) {
                // Mode Replié Icône seule
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    title={item.label}
                    className="relative flex items-center justify-center group my-2"
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-white text-emerald-950 font-black shadow-lg shadow-emerald-900/50 scale-105'
                        : 'text-emerald-200/80 hover:bg-emerald-900/70 hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-lg">
                      {item.label}
                    </div>
                  </Link>
                );
              }

              // Mode Déplié Complet
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all group ${
                    active
                      ? 'bg-white text-emerald-950 font-black shadow-lg shadow-emerald-950/20'
                      : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                      active ? 'bg-emerald-100 text-emerald-900' : 'text-emerald-300 group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-emerald-850 bg-emerald-950">
          {isCollapsed ? (
            // Mode replié
            <div className="flex flex-col items-center space-y-3 py-1">
              <Link
                to="/profile"
                onClick={() => onClose()}
                title={`Profil : ${user?.prenom} ${user?.nom} (${user?.points || 0} pts)`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-xs transition-all ${
                  location.pathname.includes('/profile') || location.pathname.includes('/profil')
                    ? 'bg-white text-emerald-950 ring-2 ring-emerald-400 scale-105'
                    : 'bg-emerald-700 text-white hover:scale-105'
                }`}
              >
                {user?.prenom?.[0] || 'M'}{user?.nom?.[0] || 'D'}
              </Link>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Mode déplié
            <div className={`rounded-2xl p-3 border flex items-center justify-between transition-all ${
              location.pathname.includes('/profile') || location.pathname.includes('/profil')
                ? 'bg-emerald-850 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                : 'bg-emerald-900/60 border-emerald-800/60 hover:bg-emerald-900/80'
            }`}>
              <Link
                to="/profile"
                onClick={() => onClose()}
                className="flex items-center space-x-3 min-w-0 flex-1 hover:opacity-95 transition-opacity"
                title="Accéder à mon profil maraîcher"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                  location.pathname.includes('/profile') || location.pathname.includes('/profil')
                    ? 'bg-white text-emerald-950 font-black'
                    : 'bg-emerald-500 text-emerald-950 font-black'
                }`}>
                  {user?.prenom?.[0] || 'M'}{user?.nom?.[0] || 'D'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {user?.prenom} {user?.nom}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold truncate flex items-center gap-1">
                    <span>Maraîcher</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{user?.points || 0} pts</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors shrink-0 cursor-pointer ml-1"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

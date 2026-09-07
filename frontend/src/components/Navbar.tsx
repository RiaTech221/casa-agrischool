import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, BookOpen, Bell, MessageSquare, LayoutDashboard, 
  Tractor, ShieldCheck, LogOut, Menu, X, Award, User as UserIcon 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isMaraicher, isExpert, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/alertes')
        .then((res) => {
          const unread = res.data.filter((a: any) => !a.lu).length;
          setUnreadAlertsCount(unread);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-emerald-500 p-2 rounded-xl text-emerald-950 group-hover:scale-105 transition-transform shadow-md">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight flex items-center gap-1.5">
                Casa <span className="text-emerald-400">AgriSchool</span>
              </span>
              <span className="text-[10px] text-emerald-300 block -mt-1 uppercase tracking-widest font-semibold">
                Casamance • Ziguinchor
              </span>
            </div>
          </Link>

          {/* Navigation Links Desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Tableau de bord</span>
              </Link>

              <Link
                to="/exploitations"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/exploitations') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <Tractor className="w-4 h-4" />
                <span>Mes Cultures</span>
              </Link>

              <Link
                to="/formations"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/formations') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Formations</span>
              </Link>

              <Link
                to="/alertes"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive('/alertes') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Alertes</span>
                {unreadAlertsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-amber-950 rounded-full animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/forum"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/forum') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Forum</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'bg-amber-600 text-white shadow-inner' : 'text-amber-300 hover:bg-amber-600/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/formations" className="text-emerald-100 hover:text-white text-sm font-medium">
                Formations
              </Link>
              <Link to="/forum" className="text-emerald-100 hover:text-white text-sm font-medium">
                Forum Maraîcher
              </Link>
            </div>
          )}

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Points Badge */}
                <div className="flex items-center space-x-1 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>{user.points} pts</span>
                </div>

                {/* User info */}
                <div className="text-right">
                  <Link to="/profile" className="text-xs font-semibold leading-tight flex items-center justify-end gap-1 hover:text-white transition-colors cursor-pointer">
                    <span>{user.prenom} {user.nom}</span>
                    {user.profilExpert?.estVerifie && (
                      <span title="Expert vérifié"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></span>
                    )}
                  </Link>
                  <span className="text-[10px] text-emerald-300">
                    {isAdmin ? 'Administrateur' : user.profilExpert ? 'Expert Agricole' : 'Maraîcher'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Se déconnecter"
                  className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition-colors shadow-sm"
                >
                  Rejoindre l'école
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-emerald-800 mb-2">
                <div className="flex items-center space-x-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="bg-emerald-800 p-2 rounded-full hover:bg-emerald-700 transition-colors">
                    <UserIcon className="w-4 h-4 text-emerald-300" />
                  </Link>
                  <div>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-white hover:underline">{user.prenom} {user.nom}</Link>
                    <div className="text-xs text-emerald-400">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-xs font-bold">
                  <Award className="w-3 h-3" />
                  <span>{user.points} pts</span>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Tableau de bord</span>
              </Link>
              <Link
                to="/exploitations"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
              >
                <Tractor className="w-4 h-4" />
                <span>Mes Cultures Déclarées</span>
              </Link>
              <Link
                to="/formations"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
              >
                <BookOpen className="w-4 h-4" />
                <span>Catalogue des Formations</span>
              </Link>
              <Link
                to="/alertes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm text-emerald-100 hover:text-white"
              >
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Alertes Saisonnières</span>
                </div>
                {unreadAlertsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-amber-500 text-amber-950 font-bold rounded-full">
                    {unreadAlertsCount} nouvelles
                  </span>
                )}
              </Link>
              <Link
                to="/forum"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Forum Agricole</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 py-2 text-sm text-amber-400 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administration & Modération</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full mt-3 flex items-center justify-center space-x-2 py-2 rounded-lg bg-red-800/40 text-red-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium bg-emerald-800 text-white rounded-lg"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-semibold bg-emerald-500 text-emerald-950 rounded-lg"
              >
                Créer un compte maraîcher
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
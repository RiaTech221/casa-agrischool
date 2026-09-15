import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout, BookOpen, Bell, MessageSquare, LayoutDashboard,
  Tractor, ShieldCheck, LogOut, Menu, X, Award, Users, User as UserIcon,
  Home, Info, PhoneCall
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isMaraicher, isExpert, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isScrollingRef = useRef(false);

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

  // Détection dynamique de la section visible lors du défilement
  useEffect(() => {
    if (location.pathname !== '/') {
      if (location.pathname === '/a-propos') setActiveSection('apropos');
      else if (location.pathname === '/contact') setActiveSection('contact');
      else setActiveSection(null);
      return;
    }

    if (location.hash) {
      const h = location.hash.replace('#', '');
      if (['accueil', 'formations', 'forum', 'apropos', 'contact'].includes(h)) {
        setActiveSection(h);
      }
    } else {
      setActiveSection('accueil');
    }

    const sections = ['accueil', 'formations', 'forum', 'apropos', 'contact'];

    const handleScroll = () => {
      if (isScrollingRef.current) return;
      
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
    isScrollingRef.current = true;

    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 900);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path.startsWith('/expert/') && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Espaces Expert, Admin et Maraîcher connecté utilisent leur propre layout moderne avec Sidebar et Topbar dédiée
  if (location.pathname.startsWith('/expert') || location.pathname.startsWith('/admin')) {
    return null;
  }
  if (isAuthenticated && (
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/exploitations') ||
    location.pathname.startsWith('/alertes') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/profil') ||
    location.pathname.startsWith('/formations') ||
    location.pathname.startsWith('/quiz') ||
    location.pathname.startsWith('/forum')
  )) {
    return null;
  }

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
              {/* VUE ADMIN */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin') ? 'bg-amber-600 text-white shadow-inner' : 'text-amber-200 hover:bg-amber-700/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Dashboard Admin</span>
                  </Link>
                  <Link
                    to="/formations"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/formations') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Formations & Cours</span>
                  </Link>
                  <Link
                    to="/forum"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/forum') ? 'bg-emerald-800 text-white shadow-inner' : 'text-emerald-100 hover:bg-emerald-800/60'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Modération Forum</span>
                  </Link>
                </>
              )}

              {/* VUE EXPERT (Non Admin) */}
              {!isAdmin && isExpert && (
                <>
                  <Link
                    to="/expert/formations"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/expert/formations') || location.pathname === '/expert' ? 'bg-teal-700 text-white shadow-inner' : 'text-teal-200 hover:bg-teal-800/60'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>Mes Formations & Cours</span>
                  </Link>
                  <Link
                    to="/expert/formations/quiz"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/expert/formations/quiz') ? 'bg-amber-500 text-amber-950 font-bold shadow-inner' : 'text-amber-300 hover:bg-amber-600/30'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Créer & Gérer Quiz</span>
                  </Link>
                  <Link
                    to="/expert/apprenants"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/expert/apprenants') ? 'bg-teal-700 text-white shadow-inner' : 'text-teal-200 hover:bg-teal-800/60'
                    }`}
                  >
                    <Users className="w-4 h-4 text-teal-300" />
                    <span>Suivi Apprenants</span>
                  </Link>
                  <Link
                    to="/expert/alertes"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive('/expert/alertes') ? 'bg-teal-700 text-white shadow-inner' : 'text-teal-200 hover:bg-teal-800/60'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-amber-300" />
                    <span>Alertes Expert</span>
                  </Link>
                  <Link
                    to="/expert/forum"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/expert/forum') ? 'bg-teal-700 text-white shadow-inner' : 'text-teal-200 hover:bg-teal-800/60'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-300" />
                    <span>Forum Expert</span>
                  </Link>
                </>
              )}

              {/* VUE MARAICHER / APPRENANT */}
              {!isAdmin && !isExpert && (
                <>
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
                    <span>Mes cultures</span>
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
                    <span>Forum Maraîcher</span>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <a 
                href="#accueil"
                onClick={(e) => scrollToSection(e, 'accueil')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  activeSection === 'accueil'
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/40' 
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60 font-medium'
                }`}
              >
                <Home className={`w-4 h-4 transition-colors ${activeSection === 'accueil' ? 'text-emerald-300' : 'text-emerald-300/80'}`} />
                <span>Accueil</span>
              </a>
              <a 
                href="#formations" 
                onClick={(e) => scrollToSection(e, 'formations')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  activeSection === 'formations' 
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/40' 
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60 font-medium'
                }`}
              >
                <BookOpen className={`w-4 h-4 transition-colors ${activeSection === 'formations' ? 'text-emerald-300' : 'text-emerald-300/80'}`} />
                <span>Formations</span>
              </a>
              <a 
                href="#forum" 
                onClick={(e) => scrollToSection(e, 'forum')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  activeSection === 'forum' 
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/40' 
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60 font-medium'
                }`}
              >
                <MessageSquare className={`w-4 h-4 transition-colors ${activeSection === 'forum' ? 'text-emerald-300' : 'text-emerald-400'}`} />
                <span>Forum</span>
              </a>
              <a 
                href="#apropos" 
                onClick={(e) => scrollToSection(e, 'apropos')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  activeSection === 'apropos' 
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/40' 
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60 font-medium'
                }`}
              >
                <Info className={`w-4 h-4 transition-colors ${activeSection === 'apropos' ? 'text-emerald-300' : 'text-emerald-300/80'}`} />
                <span>À propos</span>
              </a>
              <a 
                href="#contact" 
                onClick={(e) => scrollToSection(e, 'contact')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  activeSection === 'contact' 
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/40' 
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60 font-medium'
                }`}
              >
                <PhoneCall className={`w-4 h-4 transition-colors ${activeSection === 'contact' ? 'text-emerald-300' : 'text-emerald-300/80'}`} />
                <span>Contact</span>
              </a>
            </div>
          )}

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Points Badge (Maraîchers uniquement) */}
                {!isAdmin && !isExpert && (
                  <div className="flex items-center space-x-1 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                    <span>{user.points} pts</span>
                  </div>
                )}

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
                  className={`px-3.5 py-1.5 rounded-lg text-sm transition-all ${
                    location.pathname === '/login'
                      ? 'bg-emerald-800 text-white font-bold ring-1 ring-emerald-400 shadow-inner'
                      : 'font-medium text-emerald-100 hover:text-white hover:bg-emerald-800'
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className={`px-3.5 py-1.5 rounded-lg text-sm transition-all shadow-sm ${
                    location.pathname === '/register'
                      ? 'bg-emerald-400 text-emerald-950 font-black ring-2 ring-white shadow-md'
                      : 'font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950'
                  }`}
                >
                  Créer un compte maraîcher
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
                {!isAdmin && !isExpert && (
                  <div className="flex items-center space-x-1 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Award className="w-3 h-3" />
                    <span>{user.points} pts</span>
                  </div>
                )}
              </div>

              {/* VUE MOBILE ADMIN */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-amber-300 font-semibold hover:text-white"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Dashboard Admin</span>
                  </Link>
                  <Link
                    to="/formations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Formations & Cours</span>
                  </Link>
                  <Link
                    to="/forum"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Modération Forum</span>
                  </Link>
                </>
              )}

              {/* VUE MOBILE EXPERT */}
              {!isAdmin && isExpert && (
                <>
                  <Link
                    to="/expert/formations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-teal-300 font-semibold hover:text-white"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>Mes Formations & Cours</span>
                  </Link>
                  <Link
                    to="/expert/formations/quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-amber-300 font-bold hover:text-white"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Créer & Gérer Quiz</span>
                  </Link>
                  <Link
                    to="/expert/apprenants"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <Users className="w-4 h-4 text-teal-300" />
                    <span>Suivi des Apprenants</span>
                  </Link>
                  <Link
                    to="/expert/alertes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <Bell className="w-4 h-4 text-amber-300" />
                    <span>Alertes Expert</span>
                  </Link>
                  <Link
                    to="/expert/forum"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-300" />
                    <span>Forum Expert</span>
                  </Link>
                </>
              )}

              {/* VUE MOBILE MARAICHER / APPRENANT */}
              {!isAdmin && !isExpert && (
                <>
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
                    <span>Mes cultures</span>
                  </Link>
                  <Link
                    to="/formations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Formations</span>
                  </Link>
                  <Link
                    to="/alertes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm text-emerald-100 hover:text-white"
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Alertes</span>
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
                    <span>Forum Maraîcher</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full mt-3 flex items-center justify-center space-x-2 py-2 rounded-lg bg-red-800/40 text-red-200 text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <div className="space-y-1 pt-2">
              <a
                href="#accueil"
                onClick={(e) => scrollToSection(e, 'accueil')}
                className={`flex items-center space-x-2.5 w-full py-2.5 px-3 text-sm rounded-lg cursor-pointer transition-colors ${
                  activeSection === 'accueil'
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/30'
                    : 'text-emerald-100 hover:bg-emerald-800/70 font-medium'
                }`}
              >
                <Home className={`w-4 h-4 ${activeSection === 'accueil' ? 'text-emerald-300' : 'text-emerald-300/70'}`} />
                <span>Accueil</span>
              </a>
              <a
                href="#formations"
                onClick={(e) => scrollToSection(e, 'formations')}
                className={`flex items-center space-x-2.5 w-full py-2.5 px-3 text-sm rounded-lg cursor-pointer transition-colors ${
                  activeSection === 'formations'
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/30'
                    : 'text-emerald-100 hover:bg-emerald-800/70 font-medium'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeSection === 'formations' ? 'text-emerald-300' : 'text-emerald-300/70'}`} />
                <span>Formations</span>
              </a>
              <a
                href="#forum"
                onClick={(e) => scrollToSection(e, 'forum')}
                className={`flex items-center space-x-2.5 w-full py-2.5 px-3 text-sm rounded-lg cursor-pointer transition-colors ${
                  activeSection === 'forum'
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/30'
                    : 'text-emerald-100 hover:bg-emerald-800/70 font-medium'
                }`}
              >
                <MessageSquare className={`w-4 h-4 ${activeSection === 'forum' ? 'text-emerald-300' : 'text-emerald-400'}`} />
                <span>Forum Maraîcher</span>
              </a>
              <a
                href="#apropos"
                onClick={(e) => scrollToSection(e, 'apropos')}
                className={`flex items-center space-x-2.5 w-full py-2.5 px-3 text-sm rounded-lg cursor-pointer transition-colors ${
                  activeSection === 'apropos'
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/30'
                    : 'text-emerald-100 hover:bg-emerald-800/70 font-medium'
                }`}
              >
                <Info className={`w-4 h-4 ${activeSection === 'apropos' ? 'text-emerald-300' : 'text-emerald-300/70'}`} />
                <span>À propos</span>
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className={`flex items-center space-x-2.5 w-full py-2.5 px-3 text-sm rounded-lg cursor-pointer transition-colors ${
                  activeSection === 'contact'
                    ? 'bg-emerald-800 text-white font-bold shadow-inner ring-1 ring-emerald-500/30'
                    : 'text-emerald-100 hover:bg-emerald-800/70 font-medium'
                }`}
              >
                <PhoneCall className={`w-4 h-4 ${activeSection === 'contact' ? 'text-emerald-300' : 'text-emerald-300/70'}`} />
                <span>Contact</span>
              </a>
              <div className="pt-3 border-t border-emerald-800 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-center py-2.5 text-sm rounded-xl transition-all ${
                    location.pathname === '/login'
                      ? 'bg-emerald-800 text-white font-bold ring-1 ring-emerald-400 shadow-inner'
                      : 'font-medium bg-emerald-800/80 text-white hover:bg-emerald-800'
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-center py-2.5 text-sm rounded-xl transition-all ${
                    location.pathname === '/register'
                      ? 'bg-emerald-400 text-emerald-950 font-black ring-2 ring-white shadow-md'
                      : 'font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-sm'
                  }`}
                >
                  Créer un compte maraîcher
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Plus, Award, Search, ChevronRight, Sprout, Tractor } from 'lucide-react';
import { MaraicherSidebar } from '../components/MaraicherSidebar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Alerte } from '../types';

export const MaraicherLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get<Alerte[]>('/alertes')
      .then(res => {
        const unread = res.data.filter(a => !a.lu).length;
        setUnreadAlertsCount(unread);
      })
      .catch(() => {});
  }, [location.pathname]);

  const getPageInfo = () => {
    if (location.pathname.includes('/exploitations')) {
      return {
        title: 'Mes Parcelles & Cultures',
        badge: 'Gestion Terrain',
        description: 'Déclarez et surveillez vos parcelles maraîchères en Casamance'
      };
    }
    if (location.pathname.includes('/formations')) {
      return {
        title: 'Catalogue des Formations',
        badge: 'Apprentissage',
        description: 'Modules pratiques, fiches techniques et quiz de validation'
      };
    }
    if (location.pathname.includes('/quiz')) {
      return {
        title: 'Évaluation & Quiz',
        badge: 'Validation',
        description: 'Testez vos connaissances maraîchères et gagnez des points'
      };
    }
    if (location.pathname.includes('/alertes')) {
      return {
        title: 'Alertes Saisonnières & Météo',
        badge: 'Surveillance',
        description: 'Alertes phytosanitaires et conseils d’urgence en temps réel'
      };
    }
    if (location.pathname.includes('/forum')) {
      return {
        title: 'Forum d’Entraide Maraîchère',
        badge: 'Communauté',
        description: 'Échangez avec vos pairs et posez vos questions aux agronomes'
      };
    }
    if (location.pathname.includes('/profile') || location.pathname.includes('/profil')) {
      return {
        title: 'Mon Profil Maraîcher',
        badge: 'Paramètres',
        description: 'Coordonnées personnelles et historique d’apprentissage'
      };
    }
    return {
      title: 'Tableau de Bord Maraîcher',
      badge: 'Vue d’ensemble',
      description: 'Vos cultures en cours, alertes actives et progression pédagogique'
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/formations?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Verticale Collapsible Maraîcher */}
      <MaraicherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top Navbar Moderne & Épurée */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs transition-all">
          {/* Left: Hamburger collapse toggle + Dynamic Page Title */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsCollapsed(!isCollapsed);
                } else {
                  setSidebarOpen(true);
                }
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                <span>Espace Maraîcher</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400 truncate">{pageInfo.badge}</span>
              </div>
              <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 truncate">
                {pageInfo.title}
              </h1>
            </div>
          </div>

          {/* Center: Search Bar moderne */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une formation, une culture, une alerte..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-full text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden shadow-2xs"
              />
            </form>
          </div>

          {/* Right: Points Badge, Quick Action, Alerts & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Points pill badge */}
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs shadow-2xs">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{user?.points || 0} pts</span>
            </div>

            {/* Quick Action: Déclarer parcelle */}
            <Link
              to="/exploitations"
              className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gérer Parcelles</span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/alertes"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Alertes Saisonnières"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Profile link */}
            <Link
              to="/profile"
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              title="Voir mon profil maraîcher"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center text-xs font-black shadow-xs ring-2 ring-emerald-500/30">
                {user?.prenom?.[0] || 'O'}{user?.nom?.[0] || 'D'}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">
                  Maraîcher Apprenant
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Plus, Award, ShieldCheck, Search, ChevronRight } from 'lucide-react';
import { ExpertSidebar } from '../components/ExpertSidebar';
import { useAuth } from '../contexts/AuthContext';

export const ExpertLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageInfo = () => {
    if (location.pathname.includes('/quiz')) {
      return {
        title: 'Création & Gestion des Quiz',
        badge: 'Évaluations',
        description: 'Concevez les quiz d’évaluation (seuil 70% requis)'
      };
    }
    if (location.pathname.endsWith('/formations')) {
      return {
        title: 'Mes Formations & Cours',
        badge: 'Pédagogie',
        description: 'Modules, leçons et supports PDF téléchargeables'
      };
    }
    if (location.pathname.includes('/apprenants')) {
      return {
        title: 'Suivi des Apprenants',
        badge: 'Maraîchers',
        description: 'Progression et réussite des producteurs en direct'
      };
    }
    if (location.pathname.includes('/alertes')) {
      return {
        title: 'Diffusion des Alertes Agricoles',
        badge: 'Phytosanitaire & Météo',
        description: 'Envoyez des conseils d’urgence aux agriculteurs'
      };
    }
    if (location.pathname.includes('/forum')) {
      return {
        title: 'Forum & Réponses Expert',
        badge: 'Entraide',
        description: 'Accompagnez les maraîchers de Casamance'
      };
    }
    if (location.pathname.includes('/profile') || location.pathname.includes('/profil')) {
      return {
        title: 'Mon Profil Expert',
        badge: 'Paramètres',
        description: 'Gérer vos informations personnelles et professionnelles'
      };
    }
    return {
      title: 'Tableau de Bord Expert',
      badge: 'Vue d’ensemble',
      description: 'Pilotage rapide des activités et indicateurs clés'
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Raccourci de recherche intelligente : redirige vers les formations avec query
    navigate(`/expert/formations?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Verticale Collapsible (Accusoft Style) */}
      <ExpertSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area (Marge gauche dynamique : lg:pl-72 ou lg:pl-20) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top Navbar Moderne & Épurée (Inspirée Accusoft Image 3 & 4) */}
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
                <span>Espace Expert</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400 truncate">{pageInfo.badge}</span>
              </div>
              <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 truncate">
                {pageInfo.title}
              </h1>
            </div>
          </div>

          {/* Center: Search Bar moderne (Accusoft style Image 3 & 4) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une formation, un quiz, un maraîcher..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-full text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden shadow-2xs"
              />
            </form>
          </div>

          {/* Right: Quick actions, Alerts bell & Profile card */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Quick Action Button */}
            <Link
              to="/expert/formations/quiz"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-xs hover:shadow-sm transition-all"
            >
              <Award className="w-3.5 h-3.5 text-amber-800" />
              <span>Gérer les Quiz</span>
            </Link>

            {/* Notification Bell with alert dot */}
              <Link
                to="/expert/alertes"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                title="Alertes & Notifications"
              >
                <Bell className="w-4 h-4" />
              </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Profile link (Accusoft John Doe style Image 3) */}
            <Link
              to="/expert/profile"
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              title="Voir mon profil"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-black shadow-xs ring-2 ring-emerald-500/30">
                {user?.prenom?.[0] || 'A'}{user?.nom?.[0] || 'S'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">
                  {user?.profilExpert?.specialite ? user.profilExpert.specialite.slice(0, 22) + '...' : 'Agronome Référent'}
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

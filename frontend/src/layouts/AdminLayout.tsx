import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Plus, ShieldCheck, Search, ChevronRight, Users, Trash2 } from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageInfo = () => {
    if (location.pathname.includes('/utilisateurs')) {
      return {
        title: 'Gestion des Utilisateurs & Experts',
        badge: 'Comptes & Rôles',
        description: 'Validation des experts, création de comptes et gestion des accès'
      };
    }
    if (location.pathname.includes('/formations')) {
      return {
        title: 'Supervision des Formations & Cours',
        badge: 'Contenus',
        description: 'Administration globale du catalogue pédagogique'
      };
    }
    if (location.pathname.includes('/forum')) {
      return {
        title: 'Modération du Forum Agricole',
        badge: 'Modération',
        description: 'Surveillance des questions et réponses de la communauté'
      };
    }
    if (location.pathname.includes('/alertes')) {
      return {
        title: 'Supervision des Alertes Régionales',
        badge: 'Alertes',
        description: 'Alertes phytosanitaires et météo diffusées'
      };
    }
    if (location.pathname.includes('/exploitations')) {
      return {
        title: 'Exploitations & Maraîchage',
        badge: 'Terrain',
        description: 'Parcelles et cultures déclarées en Casamance'
      };
    }
    if (location.pathname.includes('/profile') || location.pathname.includes('/profil')) {
      return {
        title: 'Mon Profil Administrateur',
        badge: 'Paramètres',
        description: 'Informations personnelles et droits d’accès administrateur'
      };
    }
    return {
      title: 'Tableau de Bord Administrateur',
      badge: 'Vue d’ensemble',
      description: 'Supervision globale de Casa AgriSchool et indicateurs clés'
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/utilisateurs?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Verticale Collapsible Admin */}
      <AdminSidebar
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
              <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                <span>Espace Admin</span>
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
                placeholder="Rechercher un utilisateur, une formation, une exploitation..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-full text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden shadow-2xs"
              />
            </form>
          </div>

          {/* Right: Actions, Alerts & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Quick Action: Ajouter utilisateur */}
            <Link
              to="/admin/utilisateurs"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs shadow-xs hover:shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gérer Comptes</span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/admin/alertes"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Alertes Administrateur"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Profile link */}
            <Link
              to="/admin/profile"
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              title="Voir mon profil administrateur"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs ring-2 ring-amber-500/30">
                {user?.prenom?.[0] || 'M'}{user?.nom?.[0] || 'S'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-[10px] text-amber-700 font-bold">
                  Administrateur Général
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

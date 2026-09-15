import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, Award, Bell, BookOpen, MessageSquare, Tractor, 
  ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Sparkles 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Exploitation, Alerte, Formation, QuestionForum } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [exploitations, setExploitations] = useState<Exploitation[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [mesCours, setMesCours] = useState<Formation[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<QuestionForum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, altRes, formRes, mesCoursRes, forumRes] = await Promise.all([
          api.get<Exploitation[]>('/exploitations'),
          api.get<Alerte[]>('/alertes'),
          api.get<Formation[]>('/formations'),
          api.get<Formation[]>('/formations/mes-cours').catch(() => ({ data: [] })),
          api.get<QuestionForum[]>('/forum/questions')
        ]);
        setExploitations(expRes.data);
        setAlertes(altRes.data);
        setFormations(formRes.data);
        setMesCours(mesCoursRes.data);
        setRecentQuestions(forumRes.data.slice(0, 3));
      } catch (err) {
        console.error('Erreur chargement dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalCultures = exploitations.reduce((acc, exp) => acc + (exp.culturesDeclarees?.length || 0), 0);
  const unreadAlerts = alertes.filter(a => !a.lu);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-700/50 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <Sprout className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saison maraîchère en cours • Casamance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Bonjour, {user?.prenom} {user?.nom} !
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Bienvenue sur votre espace Casa AgriSchool. Vos cultures déclarées sont surveillées en temps réel.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center space-x-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{user?.points || 0} pts</div>
              <div className="text-xs font-semibold text-emerald-200">
                {user?.points! > 100 ? 'Agriculteur Confirmé ⭐' : 'Maraîcher Apprenant 🌱'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {unreadAlerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
              <span>{unreadAlerts.length} alerte(s) saisonnière(s) active(s) sur vos cultures</span>
            </div>
            <Link to="/alertes" className="text-xs font-bold text-amber-800 hover:text-amber-950 underline">
              Tout afficher
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unreadAlerts.slice(0, 2).map(alt => (
              <div key={alt.id} className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{alt.titre}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    alt.niveau === 'URGENCE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alt.niveau}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">{alt.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Stats Cards Accusoft */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Exploitations */}
        <Link 
          to="/exploitations" 
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow group"
        >
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Mes Parcelles</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{exploitations.length}</div>
            <span className="text-xs text-emerald-600 font-bold mt-0.5 inline-block">{totalCultures} culture(s) déclarée(s)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Tractor className="w-6 h-6" />
          </div>
        </Link>

        {/* Card 2: Formations */}
        <Link 
          to="/formations" 
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow group"
        >
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Formations</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{formations.length}</div>
            <span className="text-xs text-blue-600 font-bold mt-0.5 inline-block">Modules & Quiz pratiques</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
        </Link>

        {/* Card 3: Forum Maraîcher */}
        <Link 
          to="/forum" 
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow group"
        >
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Forum Maraîcher</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{recentQuestions.length}</div>
            <span className="text-xs text-purple-600 font-bold mt-0.5 inline-block">Entraide & Agronomes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
        </Link>

        {/* Card 4: Alertes Saisonnières (Carte Pleine en Dégradé Signature Accusoft) */}
        <Link 
          to="/alertes" 
          className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 rounded-2xl text-white shadow-lg shadow-emerald-800/20 flex items-center justify-between hover:scale-[1.02] transition-transform group"
        >
          <div>
            <span className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block">Alertes Saison</span>
            <div className="text-3xl font-black text-white mt-1">{alertes.length}</div>
            <span className="text-xs text-emerald-100 font-medium mt-0.5 inline-block">
              {unreadAlerts.length > 0 ? `${unreadAlerts.length} non lue(s)` : 'Toutes lues'} • Météo & Parasites
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Bell className="w-6 h-6 text-amber-300" />
          </div>
        </Link>
      </div>

      {/* Main Grid: My Crops & Formations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mes Parcelles & Cultures Actives</h2>
                <p className="text-xs text-slate-500">Gérez vos superficies et dates de récolte</p>
              </div>
              <Link
                to="/exploitations"
                className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gérer</span>
              </Link>
            </div>

            {exploitations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Tractor className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">Vous n'avez pas encore déclaré d'exploitation.</p>
                <Link
                  to="/exploitations"
                  className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Ajouter ma première parcelle
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {exploitations.map(exp => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{exp.nom}</h3>
                        <p className="text-xs text-slate-500">{exp.localisation} • {exp.superficie} {exp.uniteSuperficie}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                        {exp.culturesDeclarees?.length || 0} culture(s)
                      </span>
                    </div>

                    {exp.culturesDeclarees && exp.culturesDeclarees.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {exp.culturesDeclarees.map(ec => (
                          <div key={ec.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span className="font-semibold text-slate-800">{ec.culture.nom}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">{ec.superficieCultivee} ha</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {mesCours.length > 0 ? 'Mes Cours En Cours' : 'Formations Disponibles'}
                </h2>
                <p className="text-xs text-slate-500">
                  {mesCours.length > 0 ? 'Reprenez votre apprentissage' : 'Modules pratiques de Casamance'}
                </p>
              </div>
              <Link to="/formations" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                {mesCours.length > 0 ? 'Tous les cours' : 'Catalogue'}
              </Link>
            </div>

            <div className="space-y-4">
              {(mesCours.length > 0 ? mesCours : formations.slice(0, 3)).map(f => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start space-x-3">
                    <img
                      src={f.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                      alt={f.titre}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {f.niveau}
                        </span>
                        {f.culture && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {f.culture.nom}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{f.titre}</h4>
                    </div>
                  </div>

                  <Link
                    to={`/formations/${f.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>{mesCours.length > 0 ? 'Reprendre la leçon' : 'Consulter le cours'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
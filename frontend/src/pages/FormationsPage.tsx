import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Sprout, ArrowRight, Layers, Clock, Award, CheckCircle2, PlusCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Formation, Culture } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const FormationsPage: React.FC = () => {
  const { isAuthenticated, isExpert, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cultureFilter = searchParams.get('cultureId');

  const [activeTab, setActiveTab] = useState<'mes-cours' | 'catalogue'>(isAuthenticated ? 'mes-cours' : 'catalogue');
  const [formations, setFormations] = useState<Formation[]>([]);
  const [mesCours, setMesCours] = useState<Formation[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [formRes, cultRes] = await Promise.all([
        api.get<Formation[]>(cultureFilter ? `/formations?cultureId=${cultureFilter}` : '/formations'),
        api.get<Culture[]>('/cultures')
      ]);
      setFormations(formRes.data);
      setCultures(cultRes.data);

      if (isAuthenticated) {
        try {
          const myRes = await api.get<Formation[]>('/formations/mes-cours');
          setMesCours(myRes.data);
          // If learner has no enrolled courses yet, default to catalogue
          if (myRes.data.length === 0 && activeTab === 'mes-cours') {
            setActiveTab('catalogue');
          }
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cultureFilter, isAuthenticated]);

  const handleEnroll = async (formationId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEnrollingId(formationId);
    try {
      await api.post(`/formations/${formationId}/inscrire`);
      await fetchData();
      navigate(`/formations/${formationId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription à la formation");
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isEnrolled = (fId: number) => mesCours.some(m => m.id === fId);

  const displayedFormations = activeTab === 'mes-cours' ? mesCours : formations;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <button onClick={() => window.history.back()} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Formations Agricoles de Casamance</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Formations pratiques conçues pour les conditions agroclimatiques locales avec supports PDF et quiz de validation.
          </p>
        </div>

        {isExpert && (
          <Link
            to="/expert"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition-colors self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gérer mes formations (Espace Expert)</span>
          </Link>
        )}
      </div>

      {/* Tabs : Mes cours inscrits vs Catalogue */}
      {isAuthenticated && (
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('mes-cours')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              activeTab === 'mes-cours'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mes cours inscrits ({mesCours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              activeTab === 'catalogue'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catalogue complet ({formations.length})</span>
          </button>
        </div>
      )}

      {/* Filter by Crop Pills (Active in catalogue tab) */}
      {activeTab === 'catalogue' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              !cultureFilter
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toutes les filières ({formations.length})
          </button>

          {cultures.map(c => (
            <button
              key={c.id}
              onClick={() => setSearchParams({ cultureId: String(c.id) })}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                cultureFilter === String(c.id)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
      )}

      {/* Empty State for Mes Cours */}
      {activeTab === 'mes-cours' && mesCours.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Vous n'êtes inscrit à aucun cours pour le moment</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Parcourez notre catalogue de formations adaptées aux maraîchers de Casamance et inscrivez-vous en 1 clic pour débuter votre apprentissage.
          </p>
          <button
            onClick={() => setActiveTab('catalogue')}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center space-x-2"
          >
            <span>Explorer le catalogue des formations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedFormations.map(formation => {
          const enrolled = isEnrolled(formation.id);

          return (
            <div
              key={formation.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={formation.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'}
                    alt={formation.titre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/80 backdrop-blur-sm text-emerald-300">
                      {formation.culture?.nom || 'Maraîchage Général'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 backdrop-blur-sm text-slate-800">
                      {formation.niveau}
                    </span>
                  </div>

                  {enrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-md flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Inscrit</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{formation.titre}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {formation.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formation.modules?.length || 1} module(s)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quiz inclus (&ge; 70%)</span>
                  </span>
                </div>

                {enrolled ? (
                  <Link
                    to={`/formations/${formation.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>Ouvrir le cours</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(formation.id)}
                    disabled={enrollingId === formation.id}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                  >
                    {enrollingId === formation.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Suivre ce cours</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
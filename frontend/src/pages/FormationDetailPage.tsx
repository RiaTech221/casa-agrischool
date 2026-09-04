import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, CheckCircle2, Clock, Award, ArrowLeft, ArrowRight, 
  ChevronRight, Play, Sparkles, HelpCircle 
} from 'lucide-react';
import api from '../services/api';
import { Formation, Lecon, ProgressionFormation } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const FormationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { refreshUser } = useAuth();

  const [formation, setFormation] = useState<Formation | null>(null);
  const [progression, setProgression] = useState<ProgressionFormation | null>(null);
  const [activeLecon, setActiveLecon] = useState<Lecon | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState('');

  const loadFormation = async () => {
    try {
      const [fRes, pRes] = await Promise.all([
        api.get<Formation>(`/formations/${id}`),
        api.get<ProgressionFormation>(`/formations/${id}/progression`)
      ]);
      setFormation(fRes.data);
      setProgression(pRes.data);

      // Définir la première leçon par défaut si aucune sélectionnée
      if (!activeLecon && fRes.data.modules && fRes.data.modules.length > 0) {
        const firstModule = fRes.data.modules[0];
        if (firstModule.lecons && firstModule.lecons.length > 0) {
          setActiveLecon(firstModule.lecons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormation();
  }, [id]);

  const handleCompleteLecon = async () => {
    if (!activeLecon) return;
    setCompleting(true);
    setCompleteSuccess('');

    try {
      const res = await api.post(`/formations/lecons/${activeLecon.id}/complete`);
      setCompleteSuccess(res.data.message || 'Leçon validée ! +10 points');
      await refreshUser();
      await loadFormation();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setCompleting(false);
    }
  };

  if (loading || !formation) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/formations" className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au catalogue</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                {formation.culture?.nom || 'Maraîchage'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">
                {formation.niveau}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{formation.titre}</h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">{formation.description}</p>
          </div>

          {/* Progression Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Votre progression</span>
              <span className="text-emerald-700">{progression?.pourcentage || 0}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progression?.pourcentage || 0}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block text-right font-medium">
              Statut : {progression?.statut || 'NON COMMENCÉE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Course Layout : Navigation Left + Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Modules & Lessons sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Programme du cours</h3>

            <div className="space-y-4">
              {formation.modules?.map((mod, mIndex) => (
                <div key={mod.id} className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-700">
                    {mod.titre}
                  </h4>

                  <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                    {mod.lecons?.map(lec => {
                      const isSelected = activeLecon?.id === lec.id;
                      return (
                        <button
                          key={lec.id}
                          onClick={() => {
                            setActiveLecon(lec);
                            setCompleteSuccess('');
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="line-clamp-1">{lec.titre}</span>
                          {lec.quiz && (
                            <Award className={`w-3.5 h-3.5 shrink-0 ml-1 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Reader */}
        <div className="lg:col-span-8 space-y-6">
          {activeLecon ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Lecon header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Leçon {activeLecon.ordre}</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{activeLecon.titre}</h2>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{activeLecon.dureeEstimee} min</span>
                </div>
              </div>

              {/* Lecon Content */}
              <div className="prose prose-emerald max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {activeLecon.contenu}
              </div>

              {/* Feedback Success */}
              {completeSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{completeSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleCompleteLecon}
                  disabled={completing}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider cette leçon (+10 points)</span>
                </button>

                {activeLecon.quiz && (
                  <Link
                    to={`/quiz/${activeLecon.quiz.id}`}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 animate-pulse"
                  >
                    <Award className="w-4 h-4" />
                    <span>Passer le Quiz chronométré (+20 pts)</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-sm">
              Sélectionnez une leçon dans le sommaire pour débuter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
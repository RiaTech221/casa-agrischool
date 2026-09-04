import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, 
  Send, Award, Star, Sprout, User as UserIcon 
} from 'lucide-react';
import api from '../services/api';
import { QuestionForum, ReponseForum } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();

  const [question, setQuestion] = useState<QuestionForum | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadQuestion = async () => {
    try {
      const res = await api.get<QuestionForum>(`/forum/questions/${id}`);
      setQuestion(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setSubmitting(true);

    try {
      await api.post(`/forum/questions/${id}/answers`, {
        contenu: newAnswer.trim()
      });
      setNewAnswer('');
      await loadQuestion();
      await refreshUser();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l’envoi de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkBest = async (reponseId: number) => {
    try {
      await api.put(`/forum/answers/${reponseId}/best`);
      loadQuestion();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action non autorisée');
    }
  };

  if (loading || !question) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAuthor = user?.id === question.auteur.id;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/forum" className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au forum</span>
      </Link>

      {/* Main Question Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {question.categorie.nom}
            </span>
            {question.culture && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center space-x-1">
                <Sprout className="w-3 h-3 text-emerald-600" />
                <span>{question.culture.nom}</span>
              </span>
            )}
            {question.statut === 'RESOLUE' && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>Résolue</span>
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {new Date(question.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {question.titre}
        </h1>

        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {question.contenu}
        </p>

        {/* Author info */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs">
              {question.auteur.prenom[0]}
            </div>
            <div>
              <span className="font-bold text-slate-900 block">{question.auteur.prenom} {question.auteur.nom}</span>
              <span className="text-[11px] text-slate-400">{question.auteur.localisation || 'Casamance'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 font-semibold text-emerald-700">
            <MessageSquare className="w-4 h-4" />
            <span>{question.reponses?.length || 0} réponse(s)</span>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Réponses ({question.reponses?.length || 0})
        </h3>

        {(!question.reponses || question.reponses.length === 0) ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            Aucune réponse pour le moment. Partagez votre expertise pour aider ce producteur !
          </div>
        ) : (
          question.reponses.map(rep => {
            const isExpert = rep.auteur.profilExpert?.estVerifie;

            return (
              <div
                key={rep.id}
                className={`rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
                  rep.estMeilleureReponse
                    ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20'
                    : isExpert
                    ? 'bg-emerald-50/30 border-emerald-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Meilleure Réponse Banner */}
                {rep.estMeilleureReponse && (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-950" />
                    <span>Meilleure réponse sélectionnée par l'auteur</span>
                  </div>
                )}

                {/* Author Info + Expert Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isExpert ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {rep.auteur.prenom[0]}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          {rep.auteur.prenom} {rep.auteur.nom}
                        </span>
                        {isExpert && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>EXPERT AGRONOME</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {isExpert && rep.auteur.profilExpert?.organisme
                          ? `${rep.auteur.profilExpert.organisme} • `
                          : ''}
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Mark as best answer button */}
                  {(isAuthor || isAdmin) && !rep.estMeilleureReponse && (
                    <button
                      onClick={() => handleMarkBest(rep.id)}
                      className="text-xs font-bold text-slate-500 hover:text-amber-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 transition-colors"
                    >
                      Désigner comme solution
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-1">
                  {rep.contenu}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reply Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Votre réponse</span>
          <span className="text-xs font-semibold text-emerald-600">+10 points pour participation</span>
        </h4>

        <form onSubmit={handleAddAnswer} className="space-y-4">
          <textarea
            rows={3}
            required
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Partagez votre conseil ou votre expérience de terrain..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publier la réponse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
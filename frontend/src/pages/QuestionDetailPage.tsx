import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, CheckCircle2, ShieldCheck, 
  Send, Award, Star, Sprout, ThumbsUp, ThumbsDown, Eye,
  Tag as TagIcon, CheckCircle, User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import { QuestionForum, ReponseForum } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, isAuthenticated, isExpert, refreshUser } = useAuth();

  const isExpertRoute = location.pathname.startsWith('/expert') || isExpert;

  const [question, setQuestion] = useState<QuestionForum | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [guestAuthorNom, setGuestAuthorNom] = useState('');
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

  const handleVoteAnswer = async (answerId: number, etoiles: number) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour attribuer des étoiles à cette réponse.");
      return;
    }
    try {
      const res = await api.post(`/forum/answers/${answerId}/vote?etoiles=${etoiles}`);
      setQuestion((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reponses: prev.reponses.map((r) =>
            r.id === answerId
              ? {
                  ...r,
                  etoiles: etoiles,
                  noteMoyenne: res.data.noteMoyenne,
                  totalVotes: res.data.totalVotes,
                  votes: res.data.totalVotes
                }
              : r
          )
        };
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement de votre évaluation");
    }
  };

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setSubmitting(true);

    try {
      await api.post(`/forum/questions/${id}/answers`, {
        contenu: newAnswer.trim(),
        auteurNom: isAuthenticated ? undefined : (guestAuthorNom.trim() || 'Invité / Maraîcher')
      });
      setNewAnswer('');
      setGuestAuthorNom('');
      await loadQuestion();
      if (isAuthenticated) {
        await refreshUser();
      }
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

  const isAuthor = user && question.auteur && user.id === question.auteur.id;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const canMarkBest = isAuthor || isAdmin || (!question.auteur && isExpert);

  const questionAuthorName = question.auteur
    ? `${question.auteur.prenom} ${question.auteur.nom}`
    : (question.auteurNom || 'Maraîcher Anonyme');

  const questionTags = question.tags ? question.tags.split(/[\s,]+/).filter(Boolean) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Bouton retour */}
      <Link 
        to={isExpertRoute ? "/expert/forum" : "/forum"} 
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isExpertRoute ? "Retour au Forum Expert" : "Retour à la liste des questions"}</span>
      </Link>

      {/* En-tête titre & métadonnées question */}
      <div className="border-b border-slate-200 pb-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
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
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Résolue (Solution validée)</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
          {question.titre}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>Posée le <strong className="text-slate-700">{new Date(question.createdAt).toLocaleDateString()}</strong></span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> <strong>{question.vues || 0}</strong> vues</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> <strong>{question.reponses?.length || 0}</strong> réponses</span>
        </div>
      </div>

      {/* Boîte principale Question */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
          {question.contenu}
        </div>

        {/* Tags */}
        {questionTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {questionTags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

          {/* Auteur encart bas à droite (Stack Overflow style) */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 min-w-[200px] text-xs space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Posée par :</span>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  {question.auteur ? question.auteur.prenom[0] : (question.auteurNom ? question.auteurNom[0].toUpperCase() : 'M')}
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    {questionAuthorName}
                    {(question.auteur?.roles?.includes('ROLE_EXPERT') || question.auteur?.profilExpert?.estVerifie) && (
                      <span title="Expert vérifié">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {question.auteur?.localisation || 'Producteur local'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Réponses */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {question.reponses?.length || 0} Réponse(s)
          </h2>
          <span className="text-xs text-slate-500">Classées par pertinence & votes</span>
        </div>

        {(!question.reponses || question.reponses.length === 0) ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-600">Aucune réponse pour le moment.</p>
            <p>Partagez votre conseil ou votre expérience de terrain ci-dessous !</p>
          </div>
        ) : (
          question.reponses.map((rep) => {
            const isRepExpert = rep.auteur?.roles?.includes('ROLE_EXPERT') || rep.auteur?.profilExpert?.estVerifie;
            const repAuthorName = rep.auteur ? `${rep.auteur.prenom} ${rep.auteur.nom}` : (rep.auteurNom || 'Invité');

            return (
              <div
                key={rep.id}
                className={`rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
                  rep.estMeilleureReponse
                    ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/20'
                    : isRepExpert
                    ? 'bg-blue-50/30 border-blue-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Bandeau Meilleure Réponse */}
                {rep.estMeilleureReponse && (
                  <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-700 text-white font-black text-xs shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Réponse certifiée & acceptée comme solution</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Notation par étoiles (Star rating) sur la réponse */}
                  <div className="flex flex-col items-center sm:items-start gap-2 text-slate-600 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[140px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Évaluation</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isUserAnswer = user && rep.auteur && user.id === rep.auteur.id;
                        const rating = rep.noteMoyenne || (rep.votes && rep.votes > 0 ? rep.votes : 0);
                        const isFilled = starVal <= Math.round(rating);

                        return (
                          <button
                            key={starVal}
                            type="button"
                            disabled={Boolean(isUserAnswer)}
                            onClick={() => {
                              if (isUserAnswer) {
                                alert("Vous ne pouvez pas voter pour votre propre réponse !");
                                return;
                              }
                              handleVoteAnswer(rep.id, starVal);
                            }}
                            className={`p-0.5 rounded transition-transform ${
                              isUserAnswer 
                                ? 'cursor-not-allowed opacity-60' 
                                : 'hover:scale-125 cursor-pointer text-amber-400'
                            }`}
                            title={
                              isUserAnswer
                                ? "Vous ne pouvez pas voter pour votre propre réponse"
                                : `Attribuer ${starVal} étoile(s)`
                            }
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-center sm:text-left text-xs">
                      <span className="font-black text-slate-900">
                        {rep.noteMoyenne ? rep.noteMoyenne.toFixed(1) : (rep.votes || 0)} / 5
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({rep.totalVotes || (rep.votes ? 1 : 0)} avis)
                      </span>
                    </div>

                    {user && rep.auteur && user.id === rep.auteur.id && (
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-center">
                        Votre réponse
                      </span>
                    )}

                    {/* Bouton Accepter comme meilleure réponse */}
                    {canMarkBest && (
                      <button
                        onClick={() => handleMarkBest(rep.id)}
                        className={`mt-2 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          rep.estMeilleureReponse
                            ? 'text-emerald-700 bg-emerald-100'
                            : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={rep.estMeilleureReponse ? "Solution sélectionnée" : "Valider comme meilleure réponse"}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px]">{rep.estMeilleureReponse ? 'Validée' : 'Accepter'}</span>
                      </button>
                    )}
                  </div>

                  {/* Contenu réponse */}
                  <div className="flex-1 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {rep.contenu}
                    </p>

                    <div className="flex justify-end">
                      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 min-w-[200px] text-xs space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-400 block">
                          Répondu le {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isRepExpert ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {rep.auteur ? rep.auteur.prenom[0] : (rep.auteurNom ? rep.auteurNom[0].toUpperCase() : 'I')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              {repAuthorName}
                              {isRepExpert && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.2 text-[9px] font-black bg-emerald-600 text-white rounded-full">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>EXPERT</span>
                                </span>
                              )}
                            </div>
                            {isRepExpert && rep.auteur?.profilExpert?.organisme && (
                              <span className="text-[10px] text-slate-500 block">
                                {rep.auteur.profilExpert.organisme}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulaire de réponse (Accessible à tous, connecté ou invité) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center justify-between">
          <span>Votre réponse</span>
          {isAuthenticated && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              +10 points de réputation
            </span>
          )}
        </h3>

        <form onSubmit={handleAddAnswer} className="space-y-4">
          {!isAuthenticated && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Votre Nom ou Pseudo (Facultatif)
              </label>
              <input
                type="text"
                value={guestAuthorNom}
                onChange={(e) => setGuestAuthorNom(e.target.value)}
                placeholder="ex: Dr. Camara / Maraîcher Oussouye (ou laisser vide pour Invité)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <textarea
              rows={4}
              required
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Rédigez votre réponse claire avec vos préconisations..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publier ma réponse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
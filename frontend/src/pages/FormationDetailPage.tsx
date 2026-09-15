import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, CheckCircle2, Clock, Award, ArrowLeft, ArrowRight, 
  ChevronRight, Play, Sparkles, HelpCircle, Plus, Trash2, Edit3, X, Check, Lock, Eye
} from 'lucide-react';
import api from '../services/api';
import { Formation, Lecon, ProgressionFormation } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const FormationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isExpert, refreshUser } = useAuth();
  const canManageQuiz = isAdmin || isExpert;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [progression, setProgression] = useState<ProgressionFormation | null>(null);
  const [activeLecon, setActiveLecon] = useState<Lecon | null>(null);
  const [loading, setLoading] = useState(true);

  // PDF Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string>('');

  const [completing, setCompleting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState('');

  // Quiz Modal State for Experts & Admins
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    titre: '',
    dureeMinutes: 5,
    scoreMinimum: 70,
    questions: [
      {
        enonce: '',
        points: 1,
        reponses: [
          { texte: '', estCorrecte: true },
          { texte: '', estCorrecte: false }
        ]
      }
    ]
  });
  const [savingQuiz, setSavingQuiz] = useState(false);

  const openNewQuizModal = () => {
    if (!activeLecon) return;
    setQuizForm({
      titre: `Quiz : ${activeLecon.titre}`,
      dureeMinutes: 5,
      scoreMinimum: 70,
      questions: [
        {
          enonce: '',
          points: 1,
          reponses: [
            { texte: '', estCorrecte: true },
            { texte: '', estCorrecte: false }
          ]
        }
      ]
    });
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLecon) return;
    setSavingQuiz(true);
    try {
      await api.post('/quiz', {
        titre: quizForm.titre,
        dureeMinutes: quizForm.dureeMinutes,
        scoreMinimum: quizForm.scoreMinimum,
        leconId: activeLecon.id,
        questions: quizForm.questions.map((q, qIdx) => ({
          enonce: q.enonce,
          points: q.points || 1,
          ordre: qIdx + 1,
          reponses: q.reponses.map((r, rIdx) => ({
            texte: r.texte,
            estCorrecte: r.estCorrecte,
            ordre: rIdx + 1
          }))
        }))
      });
      setShowQuizModal(false);
      await loadFormation();
      alert('Quiz créé avec succès pour cette leçon !');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création du quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce quiz ?')) return;
    try {
      await api.delete(`/quiz/${quizId}`);
      await loadFormation();
      alert('Quiz supprimé avec succès');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du quiz');
    }
  };

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

      {/* Bandeau d'inscription si non inscrit */}
      {!progression?.estInscrit && !canManageQuiz && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">Vous n'êtes pas encore inscrit à cette formation</h3>
              <p className="text-xs text-emerald-100">Inscrivez-vous gratuitement pour débloquer les leçons, valider les quiz et obtenir vos attestations.</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await api.post(`/formations/${id}/inscrire`);
                await loadFormation();
                alert('Ajouté avec succès ! Vous pouvez maintenant suivre ce cours.');
              } catch (err: any) {
                alert(err.response?.data?.message || "Erreur lors de l'ajout");
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            Suivre ce cours
          </button>
        </div>
      )}

      {/* Félicitations si module débloqué / complété */}
      {formation.modules && formation.modules.some((m, idx) => idx > 0 && (m.lecons?.length ?? 0) > 0 && progression?.leconsValideesIds && formation.modules![idx-1].lecons?.every(l => progression.leconsValideesIds!.includes(l.id))) && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900 shadow-xs">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="font-bold">
            🎉 Félicitations pour votre assiduité ! Vous avez validé avec succès le module précédent et débloqué le module suivant.
          </span>
        </div>
      )}

      {/* Main Course Layout : Navigation Left + Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Modules & Lessons sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Programme du cours</h3>

            <div className="space-y-4">
              {formation.modules?.map((mod, mIndex) => {
                const previousModule = mIndex > 0 ? formation.modules?.[mIndex - 1] : null;
                const prevModuleLessons = previousModule?.lecons || [];
                const validatedIds = progression?.leconsValideesIds || [];
                const isPreviousModuleCompleted = prevModuleLessons.length > 0 && prevModuleLessons.every(l => validatedIds.includes(l.id));
                const isModuleUnlocked = canManageQuiz || mIndex === 0 || isPreviousModuleCompleted;
                const isCurrentModuleCompleted = (mod.lecons?.length ?? 0) > 0 && mod.lecons!.every(l => validatedIds.includes(l.id));

                return (
                  <div 
                    key={mod.id} 
                    className={`space-y-2 p-3 rounded-2xl transition-all ${
                      !isModuleUnlocked 
                        ? 'bg-slate-50/80 border border-dashed border-slate-200 opacity-75' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {!isModuleUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        {isCurrentModuleCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        <h4 className={`text-xs font-extrabold ${!isModuleUnlocked ? 'text-slate-400' : 'text-slate-800'}`}>
                          {mod.titre}
                        </h4>
                      </div>
                      {!isModuleUnlocked ? (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Verrouillé
                        </span>
                      ) : isCurrentModuleCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Complété
                        </span>
                      ) : null}
                    </div>

                    {!isModuleUnlocked && (
                      <p className="text-[10px] text-slate-500 italic pl-1">
                        🔒 Validez toutes les leçons du Module {mIndex} (&ge; 70% aux quiz) pour débloquer ce module.
                      </p>
                    )}

                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                      {mod.lecons?.map(lec => {
                        const isSelected = activeLecon?.id === lec.id;
                        const lecIdx = mod.lecons?.findIndex(l => l.id === lec.id) ?? -1;
                        const unlocked = isModuleUnlocked && (canManageQuiz || lecIdx <= 0 || validatedIds.includes(mod.lecons![lecIdx - 1].id));
                        const validated = validatedIds.includes(lec.id);

                        return (
                          <button
                            key={lec.id}
                            onClick={() => {
                              if (!isModuleUnlocked) {
                                alert(`🔒 Ce module est verrouillé ! Vous devez réussir tous les quiz du Module ${mIndex} avec au moins 70% pour débloquer le Module ${mIndex + 1}.`);
                                return;
                              }
                              if (!unlocked) {
                                alert("🔒 Cette leçon est verrouillée ! Vous devez réussir le quiz de la leçon précédente avec au moins 70% pour la débloquer.");
                                return;
                              }
                              setActiveLecon(lec);
                              setCompleteSuccess('');
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                              !unlocked
                                ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed border border-dashed border-slate-200'
                                : isSelected
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {!unlocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                              {validated && <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />}
                              <span className="truncate">{lec.titre}</span>
                            </div>

                            {lec.quiz && (
                              <Award className={`w-3.5 h-3.5 shrink-0 ml-1.5 ${
                                isSelected ? 'text-amber-300' : validated ? 'text-emerald-600' : 'text-amber-500'
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Leçon {activeLecon.ordre}</span>
                    {progression?.leconsValideesIds?.includes(activeLecon.id) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Validée</span>
                      </span>
                    )}
                  </div>
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

              {/* Fichier joint téléchargeable (PDF / Document) */}
              {activeLecon.fichierJointUrl && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {activeLecon.fichierJointNom || 'Support de cours (Document PDF)'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Document officiel à lire pour accompagner votre apprentissage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedPdf(activeLecon.fichierJointUrl!);
                        setShowPdfModal(true);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lire le cours</span>
                    </button>
                    <a
                      href={activeLecon.fichierJointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center transition-colors"
                      title="Télécharger"
                    >
                      <span>📥 Télécharger</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Progression & Validation Gate Box */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                {progression && !progression.estInscrit && !canManageQuiz ? (
                  /* Pas encore inscrit */
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
                    <div className="text-amber-900 font-bold text-sm">
                      Vous n'êtes pas encore inscrit à ce cours
                    </div>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Inscrivez-vous pour débloquer les leçons séquentielles, valider les quiz et obtenir vos attestations.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/formations/${id}/inscrire`);
                          await loadFormation();
                          alert('Ajouté avec succès ! Vous pouvez maintenant suivre ce cours.');
                        } catch (err: any) {
                          alert(err.response?.data?.message || "Erreur lors de l'ajout");
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Suivre ce cours
                    </button>
                  </div>
                ) : progression?.leconsValideesIds?.includes(activeLecon.id) ? (
                  /* Already validated */
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-xs text-emerald-900 font-bold">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-sm font-black">Leçon validée avec succès !</span>
                        <p className="text-[11px] font-normal text-emerald-700">Vous avez réussi le test d'évaluation et débloqué la leçon suivante.</p>
                      </div>
                    </div>
                    {activeLecon.quiz && (
                      <Link
                        to={`/quiz/${activeLecon.quiz.id}`}
                        className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors shrink-0"
                      >
                        Refaire le test (Entraînement)
                      </Link>
                    )}
                  </div>
                ) : (
                  /* Must pass quiz to validate and unlock next */
                  <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 text-xs text-amber-950">
                        <Award className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-black text-sm text-amber-900">Test d'évaluation</span>
                          <p className="text-slate-600 text-xs leading-relaxed">
                            Conformément à la méthode pédagogique de Casa AgriSchool, vous devez obtenir au moins <strong className="text-amber-800 font-black">{activeLecon.quiz?.scoreMinimum || 70}%</strong> au test chronométré pour valider cette leçon, remporter vos points (+50 pts) et débloquer la leçon suivante automatiquement.
                          </p>
                        </div>
                      </div>

                      {activeLecon.quiz ? (
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Durée : ~{activeLecon.quiz.dureeMinutes || 5} min • {activeLecon.quiz.questions?.length || 0} question(s)
                          </span>
                          <Link
                            to={`/quiz/${activeLecon.quiz.id}`}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                          >
                            <Award className="w-4 h-4" />
                            <span>Faire le test (Score requis : {activeLecon.quiz.scoreMinimum}%)</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="pt-2 text-xs text-slate-500 italic">
                          {canManageQuiz ? "Aucun test n'est encore associé à cette leçon. En tant qu'expert/admin, vous pouvez en ajouter un ci-dessous." : "Le test de validation sera bientôt disponible par l'expert."}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expert/Admin Quiz Management Controls */}
                {canManageQuiz && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-medium">Outils formateur :</span>
                    <div className="flex items-center space-x-2">
                      {!activeLecon.quiz ? (
                        <button
                          onClick={openNewQuizModal}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Créer un quiz pour cette leçon</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteQuiz(activeLecon.quiz!.id)}
                          className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 font-bold flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Supprimer le quiz</span>
                        </button>
                      )}
                    </div>
                  </div>
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

      {/* Modal Création Quiz (Expert / Admin) */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">
                  Créer un Quiz pour : {activeLecon?.titre}
                </h3>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Titre du Quiz</label>
                  <input
                    type="text"
                    required
                    value={quizForm.titre}
                    onChange={e => setQuizForm({ ...quizForm, titre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Durée (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      required
                      value={quizForm.dureeMinutes}
                      onChange={e => setQuizForm({ ...quizForm, dureeMinutes: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Score min pour valider (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      required
                      value={quizForm.scoreMinimum}
                      onChange={e => setQuizForm({ ...quizForm, scoreMinimum: parseInt(e.target.value) || 70 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">
                    Questions ({quizForm.questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizForm({
                        ...quizForm,
                        questions: [
                          ...quizForm.questions,
                          {
                            enonce: '',
                            points: 1,
                            reponses: [
                              { texte: '', estCorrecte: true },
                              { texte: '', estCorrecte: false }
                            ]
                          }
                        ]
                      });
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une question</span>
                  </button>
                </div>

                {quizForm.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Question {qIndex + 1}</span>
                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizForm({
                              ...quizForm,
                              questions: quizForm.questions.filter((_, idx) => idx !== qIndex)
                            });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Énoncé de la question..."
                      required
                      value={q.enonce}
                      onChange={e => {
                        const newQ = [...quizForm.questions];
                        newQ[qIndex].enonce = e.target.value;
                        setQuizForm({ ...quizForm, questions: newQ });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
                    />

                    {/* Choix de réponses */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Options de réponse (cochez la bonne réponse) :
                      </span>
                      {q.reponses.map((rep, rIndex) => (
                        <div key={rIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={rep.estCorrecte}
                            onChange={() => {
                              const newQ = [...quizForm.questions];
                              newQ[qIndex].reponses.forEach((r, i) => {
                                r.estCorrecte = i === rIndex;
                              });
                              setQuizForm({ ...quizForm, questions: newQ });
                            }}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${rIndex + 1}...`}
                            required
                            value={rep.texte}
                            onChange={e => {
                              const newQ = [...quizForm.questions];
                              newQ[qIndex].reponses[rIndex].texte = e.target.value;
                              setQuizForm({ ...quizForm, questions: newQ });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          />
                          {q.reponses.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQ = [...quizForm.questions];
                                newQ[qIndex].reponses = newQ[qIndex].reponses.filter((_, i) => i !== rIndex);
                                setQuizForm({ ...quizForm, questions: newQ });
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {q.reponses.length < 4 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = [...quizForm.questions];
                            newQ[qIndex].reponses.push({ texte: '', estCorrecte: false });
                            setQuizForm({ ...quizForm, questions: newQ });
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1 mt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ajouter une option de réponse</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  {savingQuiz ? 'Enregistrement...' : 'Enregistrer le quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="truncate">Lecture du cours</span>
              </h3>
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <a
                  href={selectedPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Ouvrir dans un onglet
                </a>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full border border-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-800 w-full relative">
              <iframe
                src={`${selectedPdf}#toolbar=0`}
                className="absolute inset-0 w-full h-full border-0"
                title="Support de cours PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
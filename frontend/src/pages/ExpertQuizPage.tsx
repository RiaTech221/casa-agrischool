import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Award, ArrowLeft, Plus, Trash2, Edit3, CheckCircle2, 
  HelpCircle, AlertCircle, BookOpen, Layers, Check, ShieldCheck, X
} from 'lucide-react';
import api from '../services/api';
import { Formation, Module, Lecon } from '../types';

interface QuestionFormState {
  enonce: string;
  points: number;
  reponses: { texte: string; estCorrecte: boolean }[];
}

export const ExpertQuizPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLeconId, setSelectedLeconId] = useState<number | null>(null);

  // Quiz edition/creation state
  const [isEditing, setIsEditing] = useState(false);
  const [existingQuizId, setExistingQuizId] = useState<number | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
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
    ] as QuestionFormState[]
  });

  const loadFormations = async () => {
    try {
      const res = await api.get<Formation[]>('/expert/formations');
      setFormations(res.data);
      return res.data;
    } catch (err) {
      console.error('Erreur chargement formations expert', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormations().then(data => {
      const paramFormId = searchParams.get('formationId');
      const paramLeconId = searchParams.get('leconId');

      if (paramFormId && data.length > 0) {
        const fId = Number(paramFormId);
        const f = data.find(x => x.id === fId);
        if (f) {
          setSelectedFormationId(fId);
          if (paramLeconId) {
            const lId = Number(paramLeconId);
            // find module
            for (const m of f.modules || []) {
              const l = (m.lecons || []).find(x => x.id === lId);
              if (l) {
                setSelectedModuleId(m.id);
                setSelectedLeconId(l.id);
                break;
              }
            }
          } else if (f.modules && f.modules.length > 0) {
            setSelectedModuleId(f.modules[0].id);
            if (f.modules[0].lecons && f.modules[0].lecons.length > 0) {
              setSelectedLeconId(f.modules[0].lecons[0].id);
            }
          }
        }
      } else if (data.length > 0) {
        // default select first formation
        setSelectedFormationId(data[0].id);
        if (data[0].modules && data[0].modules.length > 0) {
          setSelectedModuleId(data[0].modules[0].id);
          if (data[0].modules[0].lecons && data[0].modules[0].lecons.length > 0) {
            setSelectedLeconId(data[0].modules[0].lecons[0].id);
          }
        }
      }
    });
  }, []);

  const currentFormation = formations.find(f => f.id === selectedFormationId);
  const currentModule = currentFormation?.modules?.find(m => m.id === selectedModuleId);
  const currentLecon = currentModule?.lecons?.find(l => l.id === selectedLeconId);

  // When selected lesson changes, reset edit form or sync with existing quiz
  useEffect(() => {
    if (currentLecon) {
      if (currentLecon.quiz) {
        setExistingQuizId(currentLecon.quiz.id);
        setIsEditing(false);
        // Pre-fill form in case they click edit
        setQuizForm({
          titre: currentLecon.quiz.titre,
          dureeMinutes: currentLecon.quiz.dureeMinutes || 5,
          scoreMinimum: currentLecon.quiz.scoreMinimum || 70,
          questions: (currentLecon.quiz.questions && currentLecon.quiz.questions.length > 0)
            ? currentLecon.quiz.questions.map(q => ({
                enonce: q.enonce,
                points: q.points || 1,
                reponses: (q.reponses && q.reponses.length > 0)
                  ? q.reponses.map(r => ({ texte: r.texte, estCorrecte: !!(r as any).estCorrecte }))
                  : [
                      { texte: 'Choix 1', estCorrecte: true },
                      { texte: 'Choix 2', estCorrecte: false }
                    ]
              }))
            : [
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
      } else {
        setExistingQuizId(null);
        setIsEditing(true); // default to create mode if no quiz exists
        setQuizForm({
          titre: `Quiz : ${currentLecon.titre}`,
          dureeMinutes: 5,
          scoreMinimum: 70,
          questions: [
            {
              enonce: `Quelle est la bonne pratique pour : ${currentLecon.titre} ?`,
              points: 1,
              reponses: [
                { texte: 'Bonne méthode conforme aux normes agroécologiques', estCorrecte: true },
                { texte: 'Mauvaise pratique à éviter sur le terrain', estCorrecte: false }
              ]
            }
          ]
        });
      }
    }
  }, [currentLecon]);

  const handleSelectFormation = (fId: number) => {
    setSelectedFormationId(fId);
    setSearchParams({ formationId: String(fId) });
    const f = formations.find(x => x.id === fId);
    if (f?.modules && f.modules.length > 0) {
      setSelectedModuleId(f.modules[0].id);
      if (f.modules[0].lecons && f.modules[0].lecons.length > 0) {
        setSelectedLeconId(f.modules[0].lecons[0].id);
      } else {
        setSelectedLeconId(null);
      }
    } else {
      setSelectedModuleId(null);
      setSelectedLeconId(null);
    }
  };

  const handleSelectModule = (mId: number) => {
    setSelectedModuleId(mId);
    const m = currentFormation?.modules?.find(x => x.id === mId);
    if (m?.lecons && m.lecons.length > 0) {
      setSelectedLeconId(m.lecons[0].id);
      setSearchParams({ formationId: String(selectedFormationId), leconId: String(m.lecons[0].id) });
    } else {
      setSelectedLeconId(null);
    }
  };

  const handleSelectLecon = (lId: number) => {
    setSelectedLeconId(lId);
    setSearchParams({ formationId: String(selectedFormationId), leconId: String(lId) });
  };

  // Questions manipulation
  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          enonce: '',
          points: 1,
          reponses: [
            { texte: '', estCorrecte: true },
            { texte: '', estCorrecte: false }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (qIdx: number) => {
    if (quizForm.questions.length <= 1) {
      alert('Un quiz doit comporter au minimum une question.');
      return;
    }
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIdx)
    }));
  };

  const updateQuestionEnonce = (qIdx: number, val: string) => {
    setQuizForm(prev => {
      const qs = [...prev.questions];
      qs[qIdx].enonce = val;
      return { ...prev, questions: qs };
    });
  };

  const addReponse = (qIdx: number) => {
    setQuizForm(prev => {
      const qs = [...prev.questions];
      qs[qIdx].reponses.push({ texte: '', estCorrecte: false });
      return { ...prev, questions: qs };
    });
  };

  const removeReponse = (qIdx: number, rIdx: number) => {
    setQuizForm(prev => {
      const qs = [...prev.questions];
      if (qs[qIdx].reponses.length <= 2) {
        alert('Une question doit avoir au moins 2 propositions de réponse.');
        return prev;
      }
      qs[qIdx].reponses = qs[qIdx].reponses.filter((_, idx) => idx !== rIdx);
      // If removed was the correct one, make first option correct
      if (!qs[qIdx].reponses.some(r => r.estCorrecte)) {
        qs[qIdx].reponses[0].estCorrecte = true;
      }
      return { ...prev, questions: qs };
    });
  };

  const updateReponseTexte = (qIdx: number, rIdx: number, val: string) => {
    setQuizForm(prev => {
      const qs = [...prev.questions];
      qs[qIdx].reponses[rIdx].texte = val;
      return { ...prev, questions: qs };
    });
  };

  const setCorrectReponse = (qIdx: number, rIdx: number) => {
    setQuizForm(prev => {
      const qs = [...prev.questions];
      qs[qIdx].reponses = qs[qIdx].reponses.map((r, idx) => ({
        ...r,
        estCorrecte: idx === rIdx
      }));
      return { ...prev, questions: qs };
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeconId) {
      alert('Veuillez sélectionner une leçon');
      return;
    }

    // Validation
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.enonce.trim()) {
        alert(`Veuillez renseigner l'énoncé de la question ${i + 1}`);
        return;
      }
      for (let j = 0; j < q.reponses.length; j++) {
        if (!q.reponses[j].texte.trim()) {
          alert(`Veuillez remplir le texte de l'option ${j + 1} dans la question ${i + 1}`);
          return;
        }
      }
      if (!q.reponses.some(r => r.estCorrecte)) {
        alert(`Veuillez cocher la bonne réponse pour la question ${i + 1}`);
        return;
      }
    }

    setSavingQuiz(true);
    try {
      const payload = {
        titre: quizForm.titre,
        dureeMinutes: quizForm.dureeMinutes,
        scoreMinimum: quizForm.scoreMinimum,
        leconId: selectedLeconId,
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
      };

      if (existingQuizId) {
        await api.put(`/quiz/${existingQuizId}`, payload);
        alert('Quiz mis à jour avec succès !');
      } else {
        await api.post('/quiz', payload);
        alert('Nouveau quiz créé et rattaché à la leçon avec succès !');
      }

      await loadFormations();
      setIsEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde du quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!existingQuizId) return;
    if (!window.confirm('Voulez-vous vraiment supprimer ce quiz ? Les apprenants ne pourront plus être évalués sur cette leçon.')) {
      return;
    }
    setSavingQuiz(true);
    try {
      await api.delete(`/quiz/${existingQuizId}`);
      alert('Quiz supprimé avec succès.');
      setExistingQuizId(null);
      await loadFormations();
      setIsEditing(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <Link
            to="/expert/formations"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à mes formations</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Création et Gestion des Quiz</h1>
              <p className="text-xs text-slate-500">
                Espace Expert • Définissez le quiz d'évaluation pour valider chaque leçon et débloquer les modules suivants (70% requis).
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/expert/formations"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors self-start sm:self-auto flex items-center space-x-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>Voir mes cours</span>
        </Link>
      </div>

      {/* Selectors Bar: Formation -> Module -> Leçon */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          1. Sélectionner la Leçon cible
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Formation Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Formation</label>
            <select
              value={selectedFormationId || ''}
              onChange={e => handleSelectFormation(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {formations.map(f => (
                <option key={f.id} value={f.id}>{f.titre}</option>
              ))}
            </select>
          </div>

          {/* Module Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Module</label>
            <select
              value={selectedModuleId || ''}
              onChange={e => handleSelectModule(Number(e.target.value))}
              disabled={!currentFormation?.modules || currentFormation.modules.length === 0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-100"
            >
              {currentFormation?.modules && currentFormation.modules.length > 0 ? (
                currentFormation.modules.map(m => (
                  <option key={m.id} value={m.id}>{m.titre}</option>
                ))
              ) : (
                <option value="">Aucun module disponible</option>
              )}
            </select>
          </div>

          {/* Leçon Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Leçon</label>
            <select
              value={selectedLeconId || ''}
              onChange={e => handleSelectLecon(Number(e.target.value))}
              disabled={!currentModule?.lecons || currentModule.lecons.length === 0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-100"
            >
              {currentModule?.lecons && currentModule.lecons.length > 0 ? (
                currentModule.lecons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.titre} {l.quiz ? '✓ (Quiz existant)' : '⚠ (Sans quiz)'}
                  </option>
                ))
              ) : (
                <option value="">Aucune leçon dans ce module</option>
              )}
            </select>
          </div>
        </div>

        {/* Selected Lesson Status Card */}
        {currentLecon && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{currentLecon.titre}</div>
                <div className="text-[11px] text-slate-500">
                  Module : {currentModule?.titre} • Durée leçon : {currentLecon.dureeEstimee} min
                </div>
              </div>
            </div>

            <div>
              {existingQuizId ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quiz actif ({currentLecon.quiz?.questions?.length || 0} questions • seuil {currentLecon.quiz?.scoreMinimum}%)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Aucun quiz configuré pour cette leçon</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Editor / Viewer */}
      {currentLecon ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? (existingQuizId ? 'Modifier le Quiz' : 'Créer un nouveau Quiz') : 'Détails du Quiz existant'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Définissez les questions, propositions de réponses et la note minimale requise.'
                  : 'Ce quiz est actuellement actif et sera proposé à l’apprenant dès la fin de lecture.'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {!isEditing && existingQuizId && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier ce quiz</span>
                  </button>
                  <button
                    onClick={handleDeleteQuiz}
                    disabled={savingQuiz}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="Supprimer ce quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              {isEditing && existingQuizId && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Form for Creating / Editing */}
          {isEditing ? (
            <form onSubmit={handleSaveQuiz} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Titre du Quiz *
                  </label>
                  <input
                    type="text"
                    required
                    value={quizForm.titre}
                    onChange={e => setQuizForm({ ...quizForm, titre: e.target.value })}
                    placeholder="ex: Quiz d'évaluation : Préparation du sol"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Score minimum requis (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={quizForm.scoreMinimum}
                    onChange={e => setQuizForm({ ...quizForm, scoreMinimum: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">Recommandé : 70% pour débloquer la suite</span>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                    <span>Questions du Quiz ({quizForm.questions.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une question</span>
                  </button>
                </div>

                {quizForm.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-800 flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white inline-flex items-center justify-center text-[10px]">
                          {qIdx + 1}
                        </span>
                        <span>Question {qIdx + 1}</span>
                      </span>

                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Supprimer cette question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Question Statement */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Énoncé de la question *
                      </label>
                      <input
                        type="text"
                        required
                        value={q.enonce}
                        onChange={e => updateQuestionEnonce(qIdx, e.target.value)}
                        placeholder="ex: Quel est le paillage le plus adapté pour conserver l'humidité en Casamance ?"
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    {/* Reponses */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Choix de réponses (cochez le bouton radio de la bonne réponse)
                        </span>
                        <button
                          type="button"
                          onClick={() => addReponse(qIdx)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ajouter un choix</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {q.reponses.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`question_correct_${qIdx}`}
                              checked={r.estCorrecte}
                              onChange={() => setCorrectReponse(qIdx, rIdx)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Définir comme la bonne réponse"
                            />
                            <input
                              type="text"
                              required
                              value={r.texte}
                              onChange={e => updateReponseTexte(qIdx, rIdx, e.target.value)}
                              placeholder={`Option ${rIdx + 1}`}
                              className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white ${
                                r.estCorrecte ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold' : 'border-slate-300'
                              }`}
                            />
                            {r.estCorrecte && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                                Bonne réponse
                              </span>
                            )}
                            {q.reponses.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeReponse(qIdx, rIdx)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Supprimer ce choix"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{savingQuiz ? 'Enregistrement...' : (existingQuizId ? 'Mettre à jour le Quiz' : 'Enregistrer et publier le Quiz')}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Read Only View of Quiz */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">{currentLecon.quiz?.titre}</span>
                  <span className="text-emerald-700 text-[11px]">
                    Note éliminatoire : {currentLecon.quiz?.scoreMinimum}% • Durée maximale : {currentLecon.quiz?.dureeMinutes || 5} min
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Modifier
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Questions configurées ({currentLecon.quiz?.questions?.length || 0})
                </h4>

                {currentLecon.quiz?.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        Q{idx + 1}. {q.enonce}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {q.points || 1} pt(s)
                      </span>
                    </div>

                    <div className="space-y-1 pl-4 pt-1">
                      {q.reponses?.map((r, rIdx) => (
                        <div key={r.id || rIdx} className="text-xs text-slate-700 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>{r.texte}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Aucune leçon sélectionnée</h3>
          <p className="text-xs text-slate-400 mt-1">
            Veuillez créer des modules et leçons dans votre formation avant de configurer les quiz.
          </p>
        </div>
      )}

      {/* Recap Table of all formations and quizzes */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900">
          État des Quiz sur toutes vos Formations
        </h3>
        <p className="text-xs text-slate-500">
          Cliquez sur "Configurer" ou "Modifier" pour intervenir directement sur le quiz d'une leçon.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Formation</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Leçon</th>
                <th className="px-4 py-3">Statut Quiz</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formations.flatMap(f =>
                (f.modules || []).flatMap(m =>
                  (m.lecons || []).map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-semibold text-slate-900">{f.titre}</td>
                      <td className="px-4 py-3 text-slate-600">{m.titre}</td>
                      <td className="px-4 py-3 font-medium text-emerald-800">{l.titre}</td>
                      <td className="px-4 py-3">
                        {l.quiz ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{l.quiz.questions?.length || 0} Q • {l.quiz.scoreMinimum}%</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Sans quiz
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedFormationId(f.id);
                            setSelectedModuleId(m.id);
                            setSelectedLeconId(l.id);
                            setSearchParams({ formationId: String(f.id), leconId: String(l.id) });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                        >
                          {l.quiz ? 'Gérer / Modifier' : 'Créer Quiz'}
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

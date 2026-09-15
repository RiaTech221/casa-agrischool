import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Award, Clock, CheckCircle2, XCircle, ArrowLeft, RotateCcw, Sparkles 
} from 'lucide-react';
import api from '../services/api';
import { Quiz, QuizSubmitResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(300); // en secondes
  const [timerActive, setTimerActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    api.get<Quiz>(`/quiz/${id}`)
      .then(res => {
        setQuiz(res.data);
        const totalSeconds = (res.data.dureeMinutes || 5) * 60;
        setTimeLeft(totalSeconds);
        setTimerActive(true);
        setStartTime(Date.now());
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, submitted, selectedAnswers]);

  const handleSelect = (questionId: number, reponseId: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: reponseId
    }));
  };

  const handleSubmit = async () => {
    if (submitted || !quiz) return;
    setTimerActive(false);

    const dureeReelle = Math.round((Date.now() - startTime) / 1000);

    try {
      const response = await api.post<QuizSubmitResponse>(`/quiz/${quiz.id}/submit`, {
        reponsesChoisies: selectedAnswers,
        dureeReelleSecondes: dureeReelle
      });

      setResult(response.data);
      setSubmitted(true);
      await refreshUser();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission du quiz');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !quiz) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link to="/formations" className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux formations</span>
      </Link>

      {/* Quiz Header with Timer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase text-amber-600">Évaluation chronométrée</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{quiz.titre}</h1>
          <p className="text-xs text-slate-500">
            Score minimum requis pour valider : <span className="font-bold text-slate-700">{quiz.scoreMinimum}%</span>
          </p>
        </div>

        {/* Timer Box */}
        <div className={`px-4 py-2.5 rounded-2xl border flex items-center space-x-2 shrink-0 ${
          timeLeft < 60 ? 'bg-red-50 border-red-300 text-red-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="text-base font-black font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Results screen if submitted */}
      {submitted && result && (
        <div className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-lg ${
          result.reussi ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-2xl shadow-inner bg-white">
            {result.reussi ? '🏆' : '⚠️'}
          </div>

          <h2 className="text-2xl font-black">{result.reussi ? 'Félicitations !' : 'Score insuffisant'}</h2>
          <p className="text-sm max-w-md mx-auto">{result.message}</p>

          <div className="flex items-center justify-center space-x-6 text-sm font-bold pt-2">
            <div>
              <span className="text-xs text-slate-500 block">Score</span>
              <span className="text-2xl font-black">{result.score}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Bonnes réponses</span>
              <span className="text-2xl font-black">{result.nombreBonnesReponses} / {result.totalQuestions}</span>
            </div>
            {result.pointsGagnes > 0 && (
              <div>
                <span className="text-xs text-slate-500 block">Points gagnés</span>
                <span className="text-2xl font-black text-emerald-600">+{result.pointsGagnes} pts</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {quiz.questions?.map((q, qIndex) => {
          const selectedChoiceId = selectedAnswers[q.id];
          const correctChoiceId = result?.bonnesReponses ? result.bonnesReponses[q.id] : null;

          return (
            <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Question {qIndex + 1} : {q.enonce}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {q.points} pt(s)
                </span>
              </div>

              <div className="space-y-2">
                {q.reponses?.map(rep => {
                  const isChecked = selectedChoiceId === rep.id;
                  const isCorrect = correctChoiceId === rep.id;
                  const isUserWrong = submitted && isChecked && !isCorrect;

                  let borderStyle = 'border-slate-200 hover:border-slate-300';
                  let bgStyle = 'bg-white';

                  if (isChecked) {
                    borderStyle = 'border-emerald-500 ring-2 ring-emerald-500/20';
                    bgStyle = 'bg-emerald-50/50';
                  }

                  if (submitted) {
                    if (isCorrect) {
                      borderStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isUserWrong) {
                      borderStyle = 'border-red-400 bg-red-50 text-red-900';
                    }
                  }

                  return (
                    <div
                      key={rep.id}
                      onClick={() => handleSelect(q.id, rep.id)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${borderStyle} ${bgStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={isChecked}
                          onChange={() => handleSelect(q.id, rep.id)}
                          disabled={submitted}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{rep.texte}</span>
                      </div>

                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isUserWrong && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted ? (
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all"
          >
            Soumettre le quiz et voir mon score
          </button>
        </div>
      ) : (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setSelectedAnswers({});
              setSubmitted(false);
              setResult(null);
              const totalSeconds = (quiz.dureeMinutes || 5) * 60;
              setTimeLeft(totalSeconds);
              setTimerActive(true);
              setStartTime(Date.now());
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recommencer le quiz</span>
          </button>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/formations');
              }
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-600 transition-colors text-center shadow-md flex items-center justify-center space-x-2"
          >
            <span>Retourner au cours (Leçon débloquée)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </button>
        </div>
      )}
    </div>
  );
};
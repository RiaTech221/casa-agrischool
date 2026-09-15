import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, LogIn, Lock, Mail, AlertCircle, ShieldCheck, 
  Award, Sparkles, CheckCircle2, BookOpen, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [fillInfo, setFillInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFillInfo('');
    setLoading(true);

    try {
      const loggedUser = await login(identifiant, motDePasse);
      if (loggedUser?.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (loggedUser?.roles?.includes('ROLE_EXPERT')) {
        navigate('/expert');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides. Vérifiez votre email ou téléphone et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email: string) => {
    setIdentifiant(email);
    setMotDePasse('passer123');
    setError('');
    setFillInfo("Identifiants pré-remplis ! Cliquez sur 'Se connecter à mon espace' ci-dessus.");
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/30 relative overflow-hidden">
      {/* Décors doux et lumineux en arrière-plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Colonne gauche : Présentation & Bénéfices sur fond clair */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Plateforme Numérique de Casamance</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Accédez à votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">école agricole</span> et à vos alertes en temps réel.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Formez-vous aux meilleures techniques de maraîchage, téléchargez vos supports de cours en PDF, validez vos acquis grâce aux quiz et bénéficiez des conseils certifiés des agronomes de l'ISRA & du DRDR.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Supports de cours PDF téléchargeables & quiz chronométrés</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Alertes saisonnières ciblées selon vos cultures déclarées</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Réseau d'entraide maraîcher et réponses d'experts certifiés</span>
            </div>
          </div>
        </div>

        {/* Colonne droite : Formulaire de connexion Embelli */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-9 border border-slate-200/90 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/30">
                <Sprout className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Connexion <span className="text-emerald-700">Casa AgriSchool</span>
              </h2>
              <p className="text-xs text-slate-500">
                Connectez-vous pour retrouver vos cours, exploitations ou espace de gestion
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {fillInfo && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold">{fillInfo}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email ou Téléphone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    placeholder="ex: maraicher@agrischool.sn ou +221..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se connecter à mon espace</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Buttons (1 clic direct) */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Accès Démonstration Rapide (1 clic)
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Pré-remplissage
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill('maraicher@agrischool.sn')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-base">🧑‍🌾</span>
                  <span className="text-[11px] leading-tight">Maraîcher</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('expert@agrischool.sn')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-teal-50/80 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-base">🎓</span>
                  <span className="text-[11px] leading-tight">Expert</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@agrischool.sn')}
                  disabled={loading}
                  className="py-2 px-2.5 bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-1 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-base">⚙️</span>
                  <span className="text-[11px] leading-tight">Admin</span>
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Vous n'avez pas encore de compte ?{' '}
              <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-800 hover:underline">
                Créer un compte maraîcher
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
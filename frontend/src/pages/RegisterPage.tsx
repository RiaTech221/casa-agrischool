import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, UserPlus, AlertCircle, Phone, Mail, Lock, User, 
  MapPin, Sparkles, CheckCircle2, Award, BookOpen, ShieldCheck, GraduationCap 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    localisation: 'Ziguinchor',
    role: 'ROLE_MARAICHER',
    specialite: '',
    organisme: '',
    biographie: ''
  });

  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!EMAIL_REGEX.test(form.email)) {
      newErrors.email = "L'adresse email n'est pas valide.";
    }

    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$/;
    if (form.motDePasse.length < 10) {
      newErrors.motDePasse = "Le mot de passe doit contenir au moins 10 caractères.";
    } else if (!passwordRegex.test(form.motDePasse)) {
      newErrors.motDePasse = "Doit contenir au moins 1 chiffre, 1 majuscule, 1 minuscule et 1 caractère spécial (@#$%^&+=_!).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(form);
      if (form.role === 'ROLE_EXPERT') {
        navigate('/expert');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        if (Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach((e: any) => {
            backendErrors[e.field || ''] = e.defaultMessage || e.message;
          });
        }
        setErrors(backendErrors);
      }
      setError(err.response?.data?.message || 'Erreur lors de la création du compte. Veuillez vérifier vos informations.');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    const base = "w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 bg-white ";
    return base + (errors[fieldName] 
      ? "border-red-400 bg-red-50/50 focus:ring-red-500 text-red-900" 
      : "border-slate-300 focus:ring-emerald-500 text-slate-900");
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/30 relative overflow-hidden">
      {/* Décors doux et lumineux en arrière-plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Colonne gauche : Présentation & Avantages sur fond clair */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block pr-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Rejoignez la Révolution Agricole en Casamance</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Cultivez votre savoir et <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">sécurisez vos récoltes</span>.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Créez votre compte gratuitement pour accéder aux formations maraîchères adaptées au climat de Casamance, poser vos questions à nos agronomes et protéger vos cultures en temps réel.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Formations pratiques & certifiantes</span>
                <span className="text-slate-500 text-[11px]">Supports PDF téléchargeables et quiz de validation des compétences.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Alertes phytosanitaires locales</span>
                <span className="text-slate-500 text-[11px]">Prévention des ravageurs (chenilles, mildiou) selon vos parcelles.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Conseils d'experts agréés</span>
                <span className="text-slate-500 text-[11px]">Assistance continue par des ingénieurs de l'ISRA et du DRDR.</span>
              </div>
            </div>
          </div>

          {/* Badge communautaire de réassurance */}
          <div className="bg-emerald-900 text-white rounded-2xl p-4 flex items-center space-x-3.5 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">100% Dédié à la Casamance</p>
              <p className="text-emerald-200/90 text-[11px]">Ziguinchor, Bignona, Oussouye, Sédhiou et Kolda.</p>
            </div>
          </div>
        </div>

        {/* Colonne droite : Formulaire d'inscription Embelli */}
        <div className="lg:col-span-7 max-w-xl w-full mx-auto">
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-xl space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/30">
                <Sprout className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Inscription <span className="text-emerald-700">Casa AgriSchool</span>
              </h2>
              <p className="text-xs text-slate-500">
                Créez votre profil en quelques secondes pour rejoindre la plateforme
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Choix du type de compte (Maraîcher ou Expert) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Je m'inscris en tant que :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'ROLE_MARAICHER' })}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    form.role === 'ROLE_MARAICHER'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                    form.role === 'ROLE_MARAICHER' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Sprout className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">🌱 Maraîcher</span>
                  <span className="text-[10px] text-slate-500">Apprenant & Producteur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'ROLE_EXPERT' })}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    form.role === 'ROLE_EXPERT'
                      ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                    form.role === 'ROLE_EXPERT' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">🎓 Expert / Agronome</span>
                  <span className="text-[10px] text-slate-500">Formateur & Conseiller</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Prénom & Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={form.prenom}
                      onChange={(e) => {
                        setForm({ ...form, prenom: e.target.value });
                        if (errors.prenom) setErrors({ ...errors, prenom: '' });
                      }}
                      placeholder="Ousmane"
                      className={getInputClass('prenom')}
                    />
                  </div>
                  {errors.prenom && <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.prenom}</p>}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={form.nom}
                      onChange={(e) => {
                        setForm({ ...form, nom: e.target.value });
                        if (errors.nom) setErrors({ ...errors, nom: '' });
                      }}
                      placeholder="Diatta"
                      className={getInputClass('nom')}
                    />
                  </div>
                  {errors.nom && <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.nom}</p>}
                </div>
              </div>

              {/* Téléphone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={form.telephone}
                      onChange={(e) => {
                        setForm({ ...form, telephone: e.target.value });
                        if (errors.telephone) setErrors({ ...errors, telephone: '' });
                      }}
                      placeholder="+221 77 123 45 67"
                      className={getInputClass('telephone')}
                    />
                  </div>
                  {errors.telephone && <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.telephone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, email: val });
                        if (val && !EMAIL_REGEX.test(val)) {
                          setErrors(prev => ({ ...prev, email: "Email non valide." }));
                        } else {
                          setErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="diatta@exemple.sn"
                      className={getInputClass('email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.email}</p>}
                </div>
              </div>

              {/* Localisation & Mot de passe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Localisation (Casamance)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={form.localisation}
                      onChange={(e) => {
                        setForm({ ...form, localisation: e.target.value });
                        if (errors.localisation) setErrors({ ...errors, localisation: '' });
                      }}
                      placeholder="ex: Ziguinchor, Nyassia, Oussouye"
                      className={getInputClass('localisation')}
                    />
                  </div>
                  {errors.localisation && <p className="mt-1 text-[10px] text-red-500 font-medium">{errors.localisation}</p>}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={form.motDePasse}
                      onChange={(e) => {
                        setForm({ ...form, motDePasse: e.target.value });
                        if (errors.motDePasse) setErrors({ ...errors, motDePasse: '' });
                      }}
                      placeholder="Au moins 10 car., 1 maj, 1 chiffre"
                      className={getInputClass('motDePasse')}
                    />
                  </div>
                  {errors.motDePasse && <p className="mt-1 text-[10px] text-red-500 font-medium leading-tight">{errors.motDePasse}</p>}
                </div>
              </div>

              {/* Si profil Expert sélectionné : Spécialité et Organisme */}
              {form.role === 'ROLE_EXPERT' && (
                <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center space-x-2 text-teal-800 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>Informations professionnelles Expert</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Spécialité agronomique
                      </label>
                      <input
                        type="text"
                        value={form.specialite}
                        onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                        placeholder="ex: Maraîchage bio, Sols, Irrig."
                        className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase mb-1">
                        Organisme / Institution
                      </label>
                      <input
                        type="text"
                        value={form.organisme}
                        onChange={(e) => setForm({ ...form, organisme: e.target.value })}
                        placeholder="ex: ISRA, DRDR, ANCIS, Freelance"
                        className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer pt-3 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer mon compte {form.role === 'ROLE_EXPERT' ? 'Expert' : 'Maraîcher'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                Se connecter ici
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
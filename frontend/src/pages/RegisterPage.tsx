import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, UserPlus, AlertCircle, Phone, Mail, Lock, User, MapPin } from 'lucide-react';
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

    // Password validation (same as backend)
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_!]).*$/;
    if (form.motDePasse.length < 10) {
      newErrors.motDePasse = "Le mot de passe doit contenir au moins 10 caractères.";
    } else if (!passwordRegex.test(form.motDePasse)) {
      newErrors.motDePasse = "Doit contenir chiffre, minuscule, majuscule et caractère spécial.";
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
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Handle backend field errors if any
        const backendErrors: Record<string, string> = {};
        if (Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach((e: any) => {
            backendErrors[e.field || ''] = e.defaultMessage || e.message;
          });
        }
        setErrors(backendErrors);
      }
      setError(err.response?.data?.message || 'Erreur lors de la création du compte. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    const base = "w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 ";
    return base + (errors[fieldName] 
      ? "border-red-400 bg-red-50 focus:ring-red-500 text-red-900" 
      : "border-slate-300 focus:ring-emerald-500");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rejoindre Casa AgriSchool</h2>
          <p className="text-xs text-slate-500">Créez votre compte maraîcher ou expert agricole</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prénom</label>
              <input
                type="text"
                required
                value={form.prenom}
                onChange={(e) => {
                  setForm({ ...form, prenom: e.target.value });
                  if (errors.prenom) setErrors({...errors, prenom: ''});
                }}
                placeholder="Ousmane"
                className={getInputClass('prenom')}
              />
              {errors.prenom && <p className="mt-1 text-[10px] text-red-500">{errors.prenom}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => {
                  setForm({ ...form, nom: e.target.value });
                  if (errors.nom) setErrors({...errors, nom: ''});
                }}
                placeholder="Diatta"
                className={getInputClass('nom')}
              />
              {errors.nom && <p className="mt-1 text-[10px] text-red-500">{errors.nom}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Téléphone</label>
              <input
                type="tel"
                required
                value={form.telephone}
                onChange={(e) => {
                  setForm({ ...form, telephone: e.target.value });
                  if (errors.telephone) setErrors({...errors, telephone: ''});
                }}
                placeholder="+221 77..."
                className={getInputClass('telephone')}
              />
              {errors.telephone && <p className="mt-1 text-[10px] text-red-500">{errors.telephone}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, email: val });
                  if (val && !EMAIL_REGEX.test(val)) {
                    setErrors(prev => ({...prev, email: "L'adresse email n'est pas valide."}));
                  } else {
                    setErrors(prev => ({...prev, email: ''}));
                  }
                }}
                placeholder="adresse@mail.com"
                className={getInputClass('email')}
              />
              {errors.email && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Localisation</label>
              <input
                type="text"
                required
                value={form.localisation}
                onChange={(e) => {
                  setForm({ ...form, localisation: e.target.value });
                  if (errors.localisation) setErrors({...errors, localisation: ''});
                }}
                placeholder="ex: Ziguinchor, Nyassia"
                className={getInputClass('localisation')}
              />
              {errors.localisation && <p className="mt-1 text-[10px] text-red-500">{errors.localisation}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={form.motDePasse}
                onChange={(e) => {
                  setForm({ ...form, motDePasse: e.target.value });
                  if (errors.motDePasse) setErrors({...errors, motDePasse: ''});
                }}
                placeholder="Au moins 10 caractères"
                className={getInputClass('motDePasse')}
              />
              {errors.motDePasse && <p className="mt-1 text-[10px] font-medium text-red-500 leading-tight">{errors.motDePasse}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type de profil</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="ROLE_MARAICHER">🌱 Maraîcher / Agriculteur (Apprenant)</option>
              <option value="ROLE_EXPERT">🎓 Expert Agricole / Agronome (Formateur)</option>
            </select>
          </div>

          {form.role === 'ROLE_EXPERT' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Spécialité agronomique</label>
                <input
                  type="text"
                  value={form.specialite}
                  onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                  placeholder="ex: Protection des cultures, Agroécologie"
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Organisme / Institution</label>
                <input
                  type="text"
                  value={form.organisme}
                  onChange={(e) => setForm({ ...form, organisme: e.target.value })}
                  placeholder="ex: ISRA, ANCIS, DRDR Ziguinchor"
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Créer mon compte</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};
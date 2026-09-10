
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Award, ShieldCheck, MapPin, Phone, Mail, 
  Save, CheckCircle2, BookOpen, Clock, Sparkles 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ResultatQuiz } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, isExpert, isAdmin } = useAuth();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [biographie, setBiographie] = useState('');

  const [results, setResults] = useState<ResultatQuiz[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setNom(user.nom || '');
      setPrenom(user.prenom || '');
      setTelephone(user.telephone || '');
      setLocalisation(user.localisation || '');

      if (user.profilExpert) {
        setSpecialite(user.profilExpert.specialite || '');
        setOrganisme(user.profilExpert.organisme || '');
        setBiographie(user.profilExpert.biographie || '');
      }
    }

    api.get<ResultatQuiz[]>('/quiz/results')
      .then(res => setResults(res.data))
      .catch(() => {});
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await api.put('/auth/profile', {
        nom,
        prenom,
        telephone,
        localisation,
        specialite,
        organisme,
        biographie
      });
      await refreshUser();
      setSuccessMsg('Profil mis à jour avec succès !');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-md">
            {user.prenom?.[0] || 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black">{user.prenom} {user.nom}</h1>
              {user.profilExpert?.estVerifie && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-emerald-950">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Expert Vérifié</span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200">
              {isAdmin ? 'Administrateur Système' : isExpert ? 'Expert Agronome' : 'Maraîcher de Casamance'}
            </p>
          </div>
        </div>

        {/* Points & Badge Status */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center space-x-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{user.points || 0} pts</div>
            <div className="text-xs font-semibold text-emerald-200">
              {user.points > 100 ? 'Agriculteur Confirmé ⭐' : 'Maraîcher Apprenant 🌱'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire d'édition */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Modifier mes informations</h2>
            <p className="text-xs text-slate-500">Mettez à jour vos coordonnées personnelles et professionnelles</p>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Téléphone</label>
                <input
                  type="text"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Localisation</label>
                <input
                  type="text"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  placeholder="ex: Nyassia, Ziguinchor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            {/* Email (lecture seule) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresse Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            {/* Section Expert si applicable */}
            {user.profilExpert && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 pt-4">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Détails du Profil Expert</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Organisme / Institution</label>
                  <input
                    type="text"
                    value={organisme}
                    onChange={(e) => setOrganisme(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">Biographie</label>
                  <textarea
                    rows={3}
                    value={biographie}
                    onChange={(e) => setBiographie(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Mettre à jour mon profil'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Historique des Quiz */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Historique de mes Quiz</h2>
            <p className="text-xs text-slate-500">Scores enregistrés et validés côté serveur</p>
          </div>

          {results.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">Aucun quiz passé pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {results.map(r => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.quiz?.titre || 'Évaluation'}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      r.reussi ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.reussi ? 'RÉUSSI' : 'ÉCHOUÉ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                    <span>Score : <strong className="text-slate-800">{r.score}%</strong> ({r.nombreBonnesReponses}/{r.totalQuestions})</span>
                    <span>{new Date(r.datePassage).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

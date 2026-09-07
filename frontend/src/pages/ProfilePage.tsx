import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { User, ShieldCheck, ShieldAlert, User as UserIcon, Phone, MapPin, Mail, Award, Briefcase, BookOpen } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser, isExpert } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [localisation, setLocalisation] = useState(user?.localisation || '');

  const [specialite, setSpecialite] = useState(user?.profilExpert?.specialite || '');
  const [biographie, setBiographie] = useState(user?.profilExpert?.biographie || '');
  const [organisme, setOrganisme] = useState(user?.profilExpert?.organisme || '');

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await userService.updateProfile({ nom, prenom, telephone, localisation });
      await refreshUser();
      setMessage({ text: 'Profil mis à jour avec succès.', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Erreur lors de la mise à jour.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await userService.updateExpertProfile({ specialite, biographie, organisme });
      await refreshUser();
      setMessage({ text: 'Profil expert mis à jour avec succès.', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Erreur lors de la mise à jour expert.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
        <p className="mt-2 text-sm text-slate-600">Gérez vos informations personnelles et vos paramètres.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche: Infos de base & Statut */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-green-600 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="h-20 w-20 bg-white rounded-full p-1 absolute -top-10 left-6 border border-slate-200">
                <div className="h-full w-full bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <UserIcon size={32} />
                </div>
              </div>
              <div className="pt-12">
                <h2 className="text-xl font-bold text-slate-900">{user.prenom} {user.nom}</h2>
                <div className="mt-1 flex items-center text-sm text-slate-500">
                  <Mail size={16} className="mr-1.5" />
                  {user.email}
                </div>
                
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center text-sm text-slate-600 mb-2">
                    <Phone size={16} className="mr-2 text-slate-400" />
                    {user.telephone}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin size={16} className="mr-2 text-slate-400" />
                    {user.localisation || 'Non spécifié'}
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 flex items-center">
                      <Award size={16} className="mr-1.5 text-green-500" /> Points
                    </span>
                    <span className="text-lg font-bold text-green-600">{user.points}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {isExpert && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                <Briefcase size={18} className="mr-2 text-slate-500" />
                Statut Expert
              </h3>
              {user.profilExpert?.estVerifie ? (
                <div className="flex items-start bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
                  <ShieldCheck size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Profil vérifié</p>
                    <p className="text-green-600 text-xs mt-1">Vous êtes un expert validé par la plateforme.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start bg-amber-50 text-amber-700 p-3 rounded-md border border-amber-200">
                  <ShieldAlert size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">En attente de vérification</p>
                    <p className="text-amber-600 text-xs mt-1">Votre profil sera examiné par un administrateur.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne de droite: Formulaires */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-medium text-slate-900">Informations générales</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      required
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Localisation</label>
                    <input
                      type="text"
                      value={localisation}
                      onChange={(e) => setLocalisation(e.target.value)}
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                      placeholder="Ex: Ziguinchor, Bignona"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {isExpert && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">Profil Expert</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Optionnel
                </span>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdateExpert} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Spécialité</label>
                      <input
                        type="text"
                        value={specialite}
                        onChange={(e) => setSpecialite(e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                        placeholder="Ex: Maraîchage bio, Irrigation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Organisme / Entreprise</label>
                      <input
                        type="text"
                        value={organisme}
                        onChange={(e) => setOrganisme(e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                        placeholder="Ex: INSAH, FAO, Indépendant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Biographie</label>
                      <textarea
                        rows={4}
                        value={biographie}
                        onChange={(e) => setBiographie(e.target.value)}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white border p-2"
                        placeholder="Présentez votre parcours et votre expertise..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {loading ? 'Enregistrement...' : 'Mettre à jour mon profil expert'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

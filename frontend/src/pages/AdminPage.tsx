import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Users, Tractor, BookOpen, Bell, MessageSquare, 
  CheckCircle2, XCircle, AlertCircle, Sparkles, Plus, Edit2, Trash2 
} from 'lucide-react';
import api from '../services/api';
import { AdminStats, User, Formation } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'users' | 'formations' | 'moderation'>('users');
  const [questions, setQuestions] = useState<any[]>([]);

  // Formations CRUD state
  const [formations, setFormations] = useState<Formation[]>([]);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editFormationId, setEditFormationId] = useState<number | null>(null);
  const [formationForm, setFormationForm] = useState({
    titre: '',
    description: '',
    niveau: 'DEBUTANT' as 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE',
    statut: 'BROUILLON' as 'BROUILLON' | 'PUBLIE' | 'ARCHIVE',
    imageUrl: ''
  });

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<User[]>('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await api.get('/forum/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFormations = async () => {
    try {
      const res = await api.get<Formation[]>('/formations');
      setFormations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') {
      loadQuestions();
    }
    if (activeTab === 'formations') {
      loadFormations();
    }
  }, [activeTab]);

  const handleToggleActive = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      loadData();
    } catch (err) {
      alert('Erreur lors de la modification du statut');
    }
  };

  const handleVerifyExpert = async (expertId: number, verify: boolean) => {
    try {
      await api.put(`/admin/experts/${expertId}/verify?verify=${verify}`);
      loadData();
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette question ? (Action irréversible)')) return;
    try {
      await api.delete(`/admin/forum/questions/${id}`);
      loadQuestions();
    } catch (err) {
      alert('Erreur lors de la suppression de la question');
    }
  };

  // --- Formations CRUD ---
  const openNewFormationModal = () => {
    setEditFormationId(null);
    setFormationForm({ titre: '', description: '', niveau: 'DEBUTANT', statut: 'BROUILLON', imageUrl: '' });
    setShowFormationModal(true);
  };

  const openEditFormationModal = (f: Formation) => {
    setEditFormationId(f.id);
    setFormationForm({
      titre: f.titre,
      description: f.description,
      niveau: f.niveau,
      statut: f.statut,
      imageUrl: f.imageUrl || ''
    });
    setShowFormationModal(true);
  };

  const handleSaveFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editFormationId) {
        await api.put(`/formations/${editFormationId}`, formationForm);
      } else {
        await api.post('/formations', formationForm);
      }
      setShowFormationModal(false);
      loadFormations();
      loadData(); // refresh stats
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la formation');
    }
  };

  const handleDeleteFormation = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette formation et tous ses modules ?')) return;
    try {
      await api.delete(`/formations/${id}`);
      loadFormations();
      loadData(); // refresh stats
    } catch (err) {
      alert('Erreur lors de la suppression de la formation');
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-700/60 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Espace Restreint • Administrateur</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Administration Casa AgriSchool</h1>
          <p className="text-xs text-amber-100">Supervision de la plateforme maraîchère, validation des experts et statistiques</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Utilisateurs</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{stats.totalMaraichers} maraîchers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Experts</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalExperts}</div>
          <span className="text-[11px] text-amber-600 font-semibold">{stats.totalExpertsEnAttente} en attente</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Exploitations</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalExploitations}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Parcelles déclarées</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Alertes Actives</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalAlertesActives}</div>
          <span className="text-[11px] text-red-500 font-semibold">Météo / Parasites</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Utilisateurs & Experts</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('formations')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'formations' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Formations</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'moderation' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Modération Forum</span>
          </div>
        </button>
      </div>

      {/* Content based on Tab */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        {activeTab === 'users' && (
          <>
            <h2 className="text-lg font-bold text-slate-900">Comptes Utilisateurs & Experts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nom & Prénom</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Localisation</th>
                    <th className="px-4 py-3">Profil / Rôle</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Statut Expert</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const isExp = u.profilExpert != null;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {u.prenom} {u.nom}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.telephone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.localisation || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {u.roles?.map(r => r.replace('ROLE_', '')).join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{u.points}</td>
                        <td className="px-4 py-3">
                          {isExp ? (
                            u.profilExpert?.estVerifie ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Vérifié</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyExpert(u.profilExpert!.id, true)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-[10px] shadow-sm transition-colors"
                              >
                                Valider Expert
                              </button>
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleActive(u.id)}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                              u.actif
                                ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.actif ? 'Désactiver' : 'Réactiver'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'formations' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Gestion des Formations</h2>
              <button
                onClick={openNewFormationModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle formation</span>
              </button>
            </div>

            {formations.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-500">Aucune formation créée pour l'instant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Titre</th>
                      <th className="px-4 py-3">Niveau</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Modules</th>
                      <th className="px-4 py-3">Créée le</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formations.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{f.titre}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{f.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.niveau === 'DEBUTANT' ? 'bg-emerald-100 text-emerald-800' :
                            f.niveau === 'INTERMEDIAIRE' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {f.niveau}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.statut === 'PUBLIE' ? 'bg-emerald-100 text-emerald-800' :
                            f.statut === 'BROUILLON' ? 'bg-slate-100 text-slate-600' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {f.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {f.modules?.length || 0} module(s)
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditFormationModal(f)}
                              title="Modifier la formation"
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFormation(f.id)}
                              title="Supprimer la formation"
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'moderation' && (
          <>
            <h2 className="text-lg font-bold text-slate-900">Modération du Forum</h2>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">Aucune question sur le forum.</div>
              ) : (
                questions.map(q => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {q.categorie.nom}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{q.titre}</h4>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{q.contenu}</p>
                      <div className="text-[10px] text-slate-400">
                        Posté par <span className="font-bold">{q.auteur.prenom} {q.auteur.nom}</span> le {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      Supprimer
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Création / Édition Formation */}
      {showFormationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-slate-900">
              {editFormationId ? 'Modifier la formation' : 'Nouvelle Formation'}
            </h3>

            <form onSubmit={handleSaveFormation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={formationForm.titre}
                  onChange={(e) => setFormationForm({...formationForm, titre: e.target.value})}
                  placeholder="ex: Culture du piment en Casamance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formationForm.description}
                  onChange={(e) => setFormationForm({...formationForm, description: e.target.value})}
                  placeholder="Description détaillée de la formation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Niveau</label>
                  <select
                    value={formationForm.niveau}
                    onChange={(e) => setFormationForm({...formationForm, niveau: e.target.value as any})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="DEBUTANT">🌱 Débutant</option>
                    <option value="INTERMEDIAIRE">🌿 Intermédiaire</option>
                    <option value="AVANCE">🌳 Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Statut</label>
                  <select
                    value={formationForm.statut}
                    onChange={(e) => setFormationForm({...formationForm, statut: e.target.value as any})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="BROUILLON">📝 Brouillon</option>
                    <option value="PUBLIE">✅ Publié</option>
                    <option value="ARCHIVE">📦 Archivé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Image (optionnel)</label>
                <input
                  type="text"
                  value={formationForm.imageUrl}
                  onChange={(e) => setFormationForm({...formationForm, imageUrl: e.target.value})}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFormationModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {editFormationId ? 'Mettre à jour' : 'Créer la formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
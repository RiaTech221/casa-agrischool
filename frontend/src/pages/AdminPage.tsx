import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Users, Tractor, BookOpen, Bell, MessageSquare, 
  CheckCircle2, XCircle, AlertCircle, Sparkles, Plus, Edit2, Trash2,
  ArrowRight, AlertTriangle, MapPin, Calendar, Layers, Search
} from 'lucide-react';
import api from '../services/api';
import { AdminStats, User, Formation, Alerte, Exploitation, QuestionForum } from '../types';

interface AdminPageProps {
  defaultTab?: 'dashboard' | 'users' | 'formations' | 'moderation' | 'alertes' | 'exploitations';
}

export const AdminPage: React.FC<AdminPageProps> = ({ defaultTab = 'dashboard' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = (): 'dashboard' | 'users' | 'formations' | 'moderation' | 'alertes' | 'exploitations' => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') return 'dashboard';
    if (location.pathname.includes('/utilisateurs')) return 'users';
    if (location.pathname.includes('/formations')) return 'formations';
    if (location.pathname.includes('/forum')) return 'moderation';
    if (location.pathname.includes('/alertes')) return 'alertes';
    if (location.pathname.includes('/exploitations')) return 'exploitations';
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'formations' | 'moderation' | 'alertes' | 'exploitations'>(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, defaultTab]);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [questions, setQuestions] = useState<QuestionForum[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [exploitations, setExploitations] = useState<Exploitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Users CRUD state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    motDePasse: '',
    localisation: '',
    role: 'ROLE_MARAICHER' as 'ROLE_MARAICHER' | 'ROLE_EXPERT' | 'ROLE_ADMIN',
    actif: true
  });
  const [userFilterRole, setUserFilterRole] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState<string>('');
  const [resetting, setResetting] = useState(false);

  // Formations CRUD state
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editFormationId, setEditFormationId] = useState<number | null>(null);
  const [formationForm, setFormationForm] = useState({
    titre: '',
    description: '',
    niveau: 'DEBUTANT' as 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE',
    statut: 'BROUILLON' as 'BROUILLON' | 'PUBLIE' | 'ARCHIVE',
    imageUrl: ''
  });

  // Query parameter support from top search bar (?q=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q');
    if (q) {
      setUserSearch(q);
      if (activeTab !== 'users') {
        setActiveTab('users');
      }
    }
  }, [location.search]);

  const handleResetProgressAndPoints = async () => {
    if (!window.confirm("⚠️ Attention : Voulez-vous vraiment réinitialiser toutes les progressions de cours, quiz validés et remettre les points de TOUS les utilisateurs à 0 ? Cette action est irréversible.")) {
      return;
    }
    setResetting(true);
    try {
      const res = await api.post('/admin/reset-progress-and-points');
      alert(res.data.message || 'Points et progressions réinitialisés avec succès !');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, usersRes, formRes, questRes, alertRes, expRes] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<User[]>('/admin/users'),
        api.get<Formation[]>('/formations').catch(() => ({ data: [] })),
        api.get<QuestionForum[]>('/forum/questions').catch(() => ({ data: [] })),
        api.get<Alerte[]>('/alertes').catch(() => ({ data: [] })),
        api.get<Exploitation[]>('/admin/exploitations')
          .catch(() => api.get<Exploitation[]>('/exploitations'))
          .catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFormations(formRes.data);
      setQuestions(questRes.data);
      setAlertes(alertRes.data);
      setExploitations(expRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // --- Users CRUD ---
  const openNewUserModal = () => {
    setEditUserId(null);
    setUserForm({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      motDePasse: '',
      localisation: '',
      role: 'ROLE_MARAICHER',
      actif: true
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (u: User) => {
    setEditUserId(u.id);
    const hasRole = (roleName: string) => (u.roles as any[])?.some(r => (typeof r === 'string' ? r : r?.nom) === roleName);
    const mainRole = (hasRole('ROLE_ADMIN')
      ? 'ROLE_ADMIN'
      : hasRole('ROLE_EXPERT')
      ? 'ROLE_EXPERT'
      : 'ROLE_MARAICHER') as any;

    setUserForm({
      nom: u.nom || '',
      prenom: u.prenom || '',
      telephone: u.telephone || '',
      email: u.email || '',
      motDePasse: '',
      localisation: u.localisation || '',
      role: mainRole,
      actif: u.actif !== false
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUserId) {
        // Update
        const payload: any = {
          nom: userForm.nom,
          prenom: userForm.prenom,
          telephone: userForm.telephone,
          email: userForm.email,
          localisation: userForm.localisation,
          roles: [userForm.role],
          actif: userForm.actif
        };
        if (userForm.motDePasse.trim()) {
          payload.motDePasse = userForm.motDePasse.trim();
        }
        await api.put(`/admin/users/${editUserId}`, payload);
      } else {
        // Create
        if (!userForm.motDePasse) {
          alert('Le mot de passe est obligatoire pour créer un compte');
          return;
        }
        await api.post('/admin/users', {
          nom: userForm.nom,
          prenom: userForm.prenom,
          telephone: userForm.telephone,
          email: userForm.email,
          motDePasse: userForm.motDePasse,
          localisation: userForm.localisation,
          roles: [userForm.role],
          actif: userForm.actif
        });
      }
      setShowUserModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId: number, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer définitivement le compte de ${name} ?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
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
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la formation');
    }
  };

  const handleDeleteFormation = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette formation et tous ses modules ?')) return;
    try {
      await api.delete(`/formations/${id}`);
      loadData();
    } catch (err) {
      alert('Erreur lors de la suppression de la formation');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette question du forum ?')) return;
    try {
      await api.delete(`/forum/questions/${id}`);
      loadData();
    } catch (err) {
      alert('Erreur lors de la suppression de la question');
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-24 flex flex-col justify-center items-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chargement de l'espace administrateur...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ============================================================ */}
      {/* TAB: DASHBOARD VUE D'ENSEMBLE                                */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner Harmonisé (Vert Émeraude Profond & Teal) */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-700/50">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-xs font-bold text-emerald-200 border border-emerald-600/50 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Espace Superviseur • Administrateur Général</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Supervision Casa AgriSchool</h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Tableau de bord exécutif : gestion centralisée des utilisateurs, validation des experts agronomes, modération communautaire et données de terrain en Casamance.
              </p>
            </div>

            <button
              onClick={handleResetProgressAndPoints}
              disabled={resetting}
              className="px-4 py-2.5 rounded-2xl bg-red-950/70 hover:bg-red-900 text-red-200 hover:text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 border border-red-500/30 cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
              title="Réinitialise toutes les progressions pour préparer une démo"
            >
              <Trash2 className="w-4 h-4 text-red-300" />
              <span>{resetting ? 'Réinitialisation...' : 'Réinitialiser données de test'}</span>
            </button>
          </div>

          {/* 4 KPI Cards (Harmonisées avec le style Accusoft de l'Espace Expert) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Utilisateurs */}
            <Link
              to="/admin/utilisateurs"
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Utilisateurs</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
                <span className="text-xs text-emerald-600 font-bold mt-0.5 inline-block">{stats.totalMaraichers} maraîchers apprenants</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </Link>

            {/* Card 2: Experts Agronomes */}
            <Link
              to="/admin/utilisateurs"
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Experts Agronomes</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalExperts}</div>
                <span className={`text-xs font-bold mt-0.5 inline-block ${stats.totalExpertsEnAttente > 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                  {stats.totalExpertsEnAttente > 0 ? `${stats.totalExpertsEnAttente} en attente` : 'Tous validés & actifs'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </Link>

            {/* Card 3: Exploitations Maraîchères */}
            <Link
              to="/admin/exploitations"
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Exploitations</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalExploitations}</div>
                <span className="text-xs text-amber-600 font-bold mt-0.5 inline-block">Parcelles en Casamance</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Tractor className="w-6 h-6" />
              </div>
            </Link>

            {/* Card 4: Alertes Actives (Carte Pleine en Dégradé Signature Accusoft) */}
            <Link
              to="/admin/alertes"
              className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 rounded-2xl text-white shadow-lg shadow-emerald-800/20 flex items-center justify-between hover:scale-[1.02] transition-transform group"
            >
              <div>
                <span className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block">Alertes Régionales</span>
                <div className="text-3xl font-black text-white mt-1">{stats.totalAlertesActives}</div>
                <span className="text-xs text-emerald-100 font-medium mt-0.5 inline-block">Météo & Parasites</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Bell className="w-6 h-6 text-amber-300" />
              </div>
            </Link>
          </div>

          {/* 2-Column Executive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2/3): Recent Users & Forum Preview */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Derniers Utilisateurs Inscrits */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Derniers Utilisateurs Enregistrés</h2>
                    <p className="text-xs text-slate-500">Comptes récents sur la plateforme Casa AgriSchool</p>
                  </div>
                  <Link
                    to="/admin/utilisateurs"
                    className="inline-flex items-center space-x-1 text-xs font-black text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Voir tout ({stats.totalUsers})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="px-3 py-2.5">Utilisateur</th>
                        <th className="px-3 py-2.5">Localisation</th>
                        <th className="px-3 py-2.5">Rôle</th>
                        <th className="px-3 py-2.5">Points</th>
                        <th className="px-3 py-2.5 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.slice(0, 5).map((u) => {
                        const isExp = u.profilExpert != null;
                        const roleAdmin = (u.roles as any[])?.some(r => (typeof r === 'string' ? r : r?.nom) === 'ROLE_ADMIN');
                        const roleExp = (u.roles as any[])?.some(r => (typeof r === 'string' ? r : r?.nom) === 'ROLE_EXPERT');

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-3 font-bold text-slate-900">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {u.prenom?.[0]}{u.nom?.[0]}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 leading-tight">{u.prenom} {u.nom}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-slate-600">{u.localisation || 'Casamance'}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                roleAdmin ? 'bg-purple-100 text-purple-800' :
                                roleExp ? 'bg-blue-100 text-blue-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {roleAdmin ? 'ADMIN' : roleExp ? 'EXPERT' : 'MARAÎCHER'}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-black text-emerald-700">{u.points} pts</td>
                            <td className="px-3 py-3 text-right">
                              {isExp ? (
                                u.profilExpert?.estVerifie ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Vérifié
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    À valider
                                  </span>
                                )
                              ) : (
                                <span className={`text-[10px] font-bold ${u.actif ? 'text-slate-500' : 'text-red-500'}`}>
                                  {u.actif ? 'Actif' : 'Inactif'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modération Forum Récente */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Activité Récente du Forum</h2>
                    <p className="text-xs text-slate-500">Dernières questions posées par la communauté maraîchère</p>
                  </div>
                  <Link
                    to="/admin/forum"
                    className="inline-flex items-center space-x-1 text-xs font-black text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Modérer ({questions.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {questions.slice(0, 3).map((q) => (
                    <div key={q.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {q.categorie?.nom || 'Général'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Par {q.auteur ? `${q.auteur.prenom} ${q.auteur.nom}` : (q.auteurNom || 'Anonyme')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{q.titre}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Supprimer la question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Aucune question à modérer.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (1/3): Validation Priority & Shortcuts */}
            <div className="space-y-6">
              
              {/* Priorité Supervision Experts */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Validation des Experts
                </h3>

                {stats.totalExpertsEnAttente > 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{stats.totalExpertsEnAttente} dossier(s) en attente</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Des experts ont créé un compte et attendent l'approbation administrative pour publier des formations et des alertes.
                    </p>
                    <Link
                      to="/admin/utilisateurs"
                      className="block w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl text-center shadow-xs transition-colors"
                    >
                      Examiner les experts →
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-emerald-900">Tous les experts sont certifiés</div>
                    <p className="text-[11px] text-emerald-700">Aucune candidature d'expert en attente d'approbation pour le moment.</p>
                  </div>
                )}
              </div>

              {/* Raccourcis Administratifs */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Raccourcis de Gestion
                </h3>

                <div className="space-y-2.5">
                  <button
                    onClick={openNewUserModal}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 group-hover:scale-105 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Ajouter un utilisateur</div>
                        <div className="text-[10px] text-slate-500">Maraîcher, expert ou admin</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={openNewFormationModal}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-800 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Créer une formation</div>
                        <div className="text-[10px] text-slate-500">Publier au catalogue officiel</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <Link
                    to="/admin/alertes"
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Superviser les alertes</div>
                        <div className="text-[10px] text-slate-500">Météo et urgences régionales</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    to="/admin/exploitations"
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-800 group-hover:scale-105 transition-transform">
                        <Tractor className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Exploitations maraîchères</div>
                        <div className="text-[10px] text-slate-500">Parcelles et cultures en cours</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: GESTION DES UTILISATEURS & RÔLES                       */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Gestion Centralisée des Accès</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Utilisateurs & Experts Agronomes</h2>
              <p className="text-xs text-slate-500">
                Supervision des {users.length} comptes enregistrés, validation des experts et contrôle des droits.
              </p>
            </div>

            <button
              onClick={openNewUserModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

          {/* Filtres & Recherche */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher nom, email, téléphone..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
              <span className="text-slate-500 text-xs font-semibold">Filtrer par rôle :</span>
              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Tous les rôles ({users.length})</option>
                <option value="ROLE_MARAICHER">Maraîchers ({stats.totalMaraichers})</option>
                <option value="ROLE_EXPERT">Experts Agronomes ({stats.totalExperts})</option>
                <option value="ROLE_ADMIN">Administrateurs</option>
              </select>
            </div>
          </div>

          {/* Table Utilisateurs */}
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
                {users
                  .filter((u) => {
                    if (userFilterRole !== 'ALL' && !(u.roles as any[])?.some(r => (typeof r === 'string' ? r : r?.nom) === userFilterRole)) return false;
                    if (userSearch.trim()) {
                      const q = userSearch.toLowerCase();
                      const matchName = `${u.prenom} ${u.nom}`.toLowerCase().includes(q);
                      const matchEmail = u.email?.toLowerCase().includes(q);
                      const matchPhone = u.telephone?.toLowerCase().includes(q);
                      return matchName || matchEmail || matchPhone;
                    }
                    return true;
                  })
                  .map(u => {
                    const isExp = u.profilExpert != null;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.prenom?.[0]}{u.nom?.[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.prenom} {u.nom}</div>
                              <div className="text-[10px] text-slate-400">ID #{u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.telephone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.localisation || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (u.roles as any[])?.some(r => (typeof r === 'string' ? r : r?.nom) === 'ROLE_ADMIN')
                              ? 'bg-purple-100 text-purple-800'
                              : (u.roles as any[])?.some(r => (typeof r === 'string' ? r : r?.nom) === 'ROLE_EXPERT')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {(u.roles as any[])?.map(r => {
                              const roleStr = typeof r === 'string' ? r : (r?.nom || '');
                              return roleStr.replace('ROLE_', '');
                            }).join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{u.points} pts</td>
                        <td className="px-4 py-3">
                          {isExp ? (
                            u.profilExpert?.estVerifie ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Vérifié</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyExpert(u.profilExpert!.id, true)}
                                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-[10px] shadow-sm transition-colors cursor-pointer"
                              >
                                Valider Expert
                              </button>
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            {/* Éditer */}
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Modifier l'utilisateur"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle actif */}
                            <button
                              onClick={() => handleToggleActive(u.id)}
                              className={`px-2.5 py-1 rounded-xl font-bold text-[10px] transition-colors cursor-pointer ${
                                u.actif
                                  ? 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                              title={u.actif ? 'Désactiver le compte' : 'Activer le compte'}
                            >
                              {u.actif ? 'Actif' : 'Inactif'}
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => handleDeleteUser(u.id, `${u.prenom} ${u.nom}`)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: SUPERVISION DES FORMATIONS                             */}
      {/* ============================================================ */}
      {activeTab === 'formations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Supervision Pédagogique</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Formations & Modules</h2>
              <p className="text-xs text-slate-500">
                Gérez le catalogue officiel des formations maraîchères de Casamance ({formations.length} parcours).
              </p>
            </div>

            <button
              onClick={openNewFormationModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle formation</span>
            </button>
          </div>

          {formations.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">Aucune formation créée pour l'instant.</p>
              <p className="text-xs text-slate-400">Cliquez sur "Nouvelle formation" pour initier un programme de formation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Formation</th>
                    <th className="px-4 py-3">Niveau</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Modules</th>
                    <th className="px-4 py-3">Date de création</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formations.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{f.titre}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{f.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          f.niveau === 'DEBUTANT' ? 'bg-emerald-100 text-emerald-800' :
                          f.niveau === 'INTERMEDIAIRE' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {f.niveau}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          f.statut === 'PUBLIE' ? 'bg-emerald-100 text-emerald-800' :
                          f.statut === 'BROUILLON' ? 'bg-slate-100 text-slate-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {f.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-bold">
                        {f.modules?.length || 0} module(s)
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => openEditFormationModal(f)}
                            title="Modifier la formation"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFormation(f.id)}
                            title="Supprimer la formation"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: MODERATION DU FORUM                                     */}
      {/* ============================================================ */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Modération Communautaire</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Modération du Forum Agricole</h2>
            <p className="text-xs text-slate-500">
              Contrôlez les questions posées par les maraîchers et préservez la qualité des échanges ({questions.length} questions).
            </p>
          </div>

          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Aucune question sur le forum actuellement.</p>
              </div>
            ) : (
              questions.map(q => (
                <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-emerald-400/50 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {q.categorie?.nom || 'Général'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{q.titre}</h4>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{q.contenu}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Posté par <strong className="text-slate-700">{q.auteur ? `${q.auteur.prenom} ${q.auteur.nom}` : (q.auteurNom || 'Anonyme')}</strong></span>
                      <span>•</span>
                      <span>Le {new Date(q.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{q.reponses?.length || 0} réponse(s)</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: SUPERVISION DES ALERTES REGIONALES                      */}
      {/* ============================================================ */}
      {activeTab === 'alertes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Surveillance des Risques</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Alertes Régionales & Météo</h2>
            <p className="text-xs text-slate-500">
              Supervision des alertes phytosanitaires, météorologiques et conseils d'urgence diffusés aux producteurs ({alertes.length} alertes).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertes.map((a) => {
              const isUrgent = a.niveau === 'URGENCE';
              const isAttention = a.niveau === 'ATTENTION';

              return (
                <div 
                  key={a.id} 
                  className={`p-5 rounded-3xl border transition-all ${
                    isUrgent ? 'bg-red-50/50 border-red-200' :
                    isAttention ? 'bg-amber-50/50 border-amber-200' :
                    'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isUrgent ? 'bg-red-200 text-red-900' :
                      isAttention ? 'bg-amber-200 text-amber-950' :
                      'bg-emerald-100 text-emerald-900'
                    }`}>
                      {a.niveau} • {a.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mb-1">{a.titre}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{a.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Du {new Date(a.dateDebut).toLocaleDateString()} au {new Date(a.dateFin).toLocaleDateString()}
                    </span>
                    {a.culture && (
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {a.culture.nom}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {alertes.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 font-bold text-xs">
                Aucune alerte enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: EXPLOITATIONS MARAÎCHÈRES                              */}
      {/* ============================================================ */}
      {activeTab === 'exploitations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                <Tractor className="w-3.5 h-3.5" />
                <span>Données Terrain & Production</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Exploitations Maraîchères de Casamance</h2>
              <p className="text-xs text-slate-500">
                Surveillance de {exploitations.length} parcelles déclarées et des cycles culturaux suivis sur le terrain.
              </p>
            </div>

            {exploitations.length > 0 && (
              <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{exploitations.reduce((acc, e) => acc + (e.superficie || 0), 0).toFixed(1)} ha supervisés au total</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exploitations.map((exp) => (
              <div key={exp.id} className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md hover:border-emerald-400/60 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {exp.superficie} {exp.uniteSuperficie}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {exp.localisation || 'Casamance'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">{exp.nom}</h3>
                  {exp.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{exp.description}</p>
                  )}
                </div>

                {/* Producteur rattaché */}
                {(exp as any).producteurNom && (
                  <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl w-fit">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Producteur : {(exp as any).producteurNom}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Cultures Déclarées</div>
                  {exp.culturesDeclarees && exp.culturesDeclarees.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.culturesDeclarees.map((c) => (
                        <span key={c.id} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">
                          🌱 {c.culture?.nom || 'Culture'} ({c.statut})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">En préparation / Aucune culture</span>
                  )}
                </div>
              </div>
            ))}
            {exploitations.length === 0 && (
              <div className="col-span-3 py-16 text-center text-slate-400 font-bold text-xs space-y-2">
                <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Aucune exploitation maraîchère enregistrée pour l'instant.</p>
                <p className="text-xs text-slate-400">Les parcelles déclarées par les maraîchers s'afficheront automatiquement ici.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CRÉATION / ÉDITION FORMATION                          */}
      {/* ============================================================ */}
      {showFormationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <h3 className="text-xl font-bold text-slate-900">
              {editFormationId ? 'Modifier la formation' : 'Nouvelle Formation'}
            </h3>

            <form onSubmit={handleSaveFormation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={formationForm.titre}
                  onChange={(e) => setFormationForm({...formationForm, titre: e.target.value})}
                  placeholder="ex: Culture du piment en Casamance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formationForm.description}
                  onChange={(e) => setFormationForm({...formationForm, description: e.target.value})}
                  placeholder="Description détaillée de la formation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFormationModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editFormationId ? 'Mettre à jour' : 'Créer la formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CRÉATION / ÉDITION UTILISATEUR                        */}
      {/* ============================================================ */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <h3 className="text-xl font-bold text-slate-900">
              {editUserId ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={userForm.prenom}
                    onChange={(e) => setUserForm({ ...userForm, prenom: e.target.value })}
                    placeholder="ex: Fatou"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={userForm.nom}
                    onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })}
                    placeholder="ex: Sané"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="fatou@example.sn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={userForm.telephone}
                    onChange={(e) => setUserForm({ ...userForm, telephone: e.target.value })}
                    placeholder="+221770000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mot de passe {editUserId ? '(laisser vide pour ne pas modifier)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editUserId}
                  value={userForm.motDePasse}
                  onChange={(e) => setUserForm({ ...userForm, motDePasse: e.target.value })}
                  placeholder={editUserId ? '••••••••' : 'Mot de passe sécurisé'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rôle Principal</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ROLE_MARAICHER">🧑‍🌾 Maraîcher / Apprenant</option>
                    <option value="ROLE_EXPERT">🎓 Expert Agronome</option>
                    <option value="ROLE_ADMIN">🛡️ Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Localisation</label>
                  <input
                    type="text"
                    value={userForm.localisation}
                    onChange={(e) => setUserForm({ ...userForm, localisation: e.target.value })}
                    placeholder="ex: Ziguinchor, Bignona"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="userActif"
                  checked={userForm.actif}
                  onChange={(e) => setUserForm({ ...userForm, actif: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="userActif" className="text-xs font-semibold text-slate-700">
                  Compte actif (l'utilisateur peut se connecter)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editUserId ? 'Enregistrer les modifications' : "Créer l'utilisateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
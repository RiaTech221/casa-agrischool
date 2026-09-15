import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, BookOpen, Users, Award, Plus, Edit2, Trash2, 
  ChevronRight, Layers, Clock, CheckCircle2, AlertCircle, ArrowRight, X, Sparkles, FileText,
  Upload, Bell, MessageSquare, Eye, Send
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Formation, Culture, ExpertStats, ExpertApprenant, Alerte, QuestionForum } from '../types';

interface ExpertDashboardPageProps {
  defaultTab?: 'dashboard' | 'formations' | 'apprenants' | 'alertes' | 'forum';
}

export const ExpertDashboardPage: React.FC<ExpertDashboardPageProps> = ({ defaultTab = 'dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = (): 'dashboard' | 'formations' | 'apprenants' | 'alertes' | 'forum' => {
    if (location.pathname === '/expert' || location.pathname === '/expert/') return 'dashboard';
    if (location.pathname.endsWith('/formations')) return 'formations';
    if (location.pathname.includes('/apprenants')) return 'apprenants';
    if (location.pathname.includes('/alertes')) return 'alertes';
    if (location.pathname.includes('/forum')) return 'forum';
    return defaultTab;
  };

  const [stats, setStats] = useState<ExpertStats | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [apprenants, setApprenants] = useState<ExpertApprenant[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [expertAlertes, setExpertAlertes] = useState<Alerte[]>([]);
  const [expertQuestions, setExpertQuestions] = useState<QuestionForum[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'formations' | 'apprenants' | 'alertes' | 'forum'>(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, defaultTab]);

  const handleTabChange = (tab: 'dashboard' | 'formations' | 'apprenants' | 'alertes' | 'forum') => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/expert');
    } else {
      navigate(`/expert/${tab}`);
    }
  };

  // Modals state
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editFormationId, setEditFormationId] = useState<number | null>(null);
  const [formationForm, setFormationForm] = useState({
    titre: '',
    description: '',
    niveau: 'DEBUTANT' as 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE',
    cultureId: undefined as number | undefined,
    imageUrl: ''
  });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [targetFormationId, setTargetFormationId] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState({ titre: '', description: '', ordre: 1 });

  const [showLeconModal, setShowLeconModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<number | null>(null);
  const [leconForm, setLeconForm] = useState({
    titre: '',
    contenu: '',
    typeContenu: 'TEXTE' as 'TEXTE' | 'VIDEO',
    ordre: 1,
    dureeEstimee: 10,
    fichierJointUrl: '',
    fichierJointNom: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Modal Alerte Expert
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    titre: '',
    message: '',
    type: 'PARASITE' as 'METEO' | 'PARASITE' | 'SEMIS' | 'RECOLTE' | 'MARCHE',
    niveau: 'ATTENTION' as 'INFO' | 'ATTENTION' | 'URGENCE',
    cultureId: undefined as number | undefined
  });
  const [savingAlert, setSavingAlert] = useState(false);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, formRes, appRes, cultRes, alertRes, forumRes] = await Promise.all([
        api.get<ExpertStats>('/expert/stats'),
        api.get<Formation[]>('/expert/formations'),
        api.get<ExpertApprenant[]>('/expert/apprenants'),
        api.get<Culture[]>('/expert/cultures').catch(() => api.get<Culture[]>('/cultures')),
        api.get<Alerte[]>('/alertes'),
        api.get<QuestionForum[]>('/forum/questions')
      ]);
      setStats(statsRes.data);
      setFormations(formRes.data);
      setApprenants(appRes.data);
      setCultures(cultRes.data);
      setExpertAlertes(alertRes.data);
      setExpertQuestions(forumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Formations ---
  const openNewFormationModal = () => {
    setEditFormationId(null);
    setFormationForm({
      titre: '',
      description: '',
      niveau: 'DEBUTANT',
      cultureId: cultures.length > 0 ? cultures[0].id : undefined,
      imageUrl: ''
    });
    setShowFormationModal(true);
  };

  const openEditFormationModal = (f: Formation) => {
    setEditFormationId(f.id);
    setFormationForm({
      titre: f.titre,
      description: f.description,
      niveau: f.niveau,
      cultureId: f.culture?.id,
      imageUrl: f.imageUrl || ''
    });
    setShowFormationModal(true);
  };

  const handleSaveFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editFormationId) {
        await api.put(`/expert/formations/${editFormationId}`, formationForm);
      } else {
        await api.post('/expert/formations', formationForm);
      }
      setShowFormationModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement de la formation");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFormation = async (id: number, titre: string) => {
    if (!window.confirm(`Supprimer la formation "${titre}" et tout son contenu ?`)) return;
    try {
      await api.delete(`/expert/formations/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // --- Modules ---
  const openNewModuleModal = (formationId: number) => {
    setTargetFormationId(formationId);
    setModuleForm({ titre: '', description: '', ordre: 1 });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFormationId) return;
    setSaving(true);
    try {
      await api.post('/expert/modules', {
        ...moduleForm,
        formationId: targetFormationId
      });
      setShowModuleModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout du module");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Supprimer ce module et ses leçons ?')) return;
    try {
      await api.delete(`/expert/modules/${moduleId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // --- Leçons ---
  const openNewLeconModal = (moduleId: number) => {
    setTargetModuleId(moduleId);
    setLeconForm({
      titre: '',
      contenu: '',
      typeContenu: 'TEXTE',
      ordre: 1,
      dureeEstimee: 10,
      fichierJointUrl: '',
      fichierJointNom: ''
    });
    setShowLeconModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingFile(true);
    try {
      const res = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrl = res.data.fileUrl || res.data.url;
      const fileName = res.data.fileName || res.data.originalFilename || file.name;
      setLeconForm(prev => ({
        ...prev,
        fichierJointUrl: fileUrl,
        fichierJointNom: fileName
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du téléchargement du fichier');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveLecon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId) return;
    setSaving(true);
    try {
      await api.post('/expert/lecons', {
        ...leconForm,
        moduleId: targetModuleId
      });
      setShowLeconModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout de la leçon");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAlert(true);
    try {
      await api.post('/alertes', alertForm);
      setShowAlertModal(false);
      setAlertForm({
        titre: '',
        message: '',
        type: 'PARASITE',
        niveau: 'ATTENTION',
        cultureId: undefined
      });
      loadData();
      alert('Alerte agricole diffusée aux maraîchers avec succès !');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la publication de l'alerte");
    } finally {
      setSavingAlert(false);
    }
  };

  const handleDeleteLecon = async (leconId: number) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try {
      await api.delete(`/expert/lecons/${leconId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Tab 0: Tableau de Bord (Accès rapide & minimaliste) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-xs font-bold text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Espace Réservé • Expert Agronome & Formateur</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Bonjour, {user?.prenom} {user?.nom}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
                {user?.profilExpert?.specialite || 'Formateur agréé de Casa AgriSchool'}
                {user?.profilExpert?.organisme ? ` — ${user.profilExpert.organisme}` : ''}
              </p>
            </div>

            <button
              onClick={openNewFormationModal}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg transition-all self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une nouvelle formation</span>
            </button>
          </div>

          {/* KPI Cards (Inspirées Accusoft Image 1, 2 & 3 avec 4ème carte en dégradé plein) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Mes Formations</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalFormations || 0}</div>
                <span className="text-xs text-emerald-600 font-bold mt-0.5 inline-block">Formations actives</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Leçons Pédagogiques</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalLecons || 0}</div>
                <span className="text-xs text-blue-600 font-bold mt-0.5 inline-block">Avec quiz obligatoires</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Maraîchers Inscrits</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalApprenants || 0}</div>
                <span className="text-xs text-amber-600 font-bold mt-0.5 inline-block">En cours d'apprentissage</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4 (Carte Pleine en Dégradé style Accusoft Image 3) */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 rounded-2xl text-white shadow-lg shadow-emerald-800/20 flex items-center justify-between hover:scale-[1.02] transition-transform">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block">Certifications</span>
                <div className="text-3xl font-black text-white mt-1">{stats?.totalTermines || 0}</div>
                <span className="text-xs text-emerald-100 font-medium mt-0.5 inline-block">100% complétées</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 shadow-inner">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
            </div>
          </div>

          {/* Grille Principale 2 Colonnes (Inspirée Accusoft : Recent Projects + New Customers) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Colonne Gauche : Formations Récentes (Style Recent Projects Accusoft Image 3) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Formations & Cours Récents</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Derniers modules et cours conçus pour les maraîchers</p>
                  </div>
                  <Link
                    to="/expert/formations"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Voir tout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {formations.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    Aucune formation créée pour l'instant.
                  </div>
                ) : (
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="pb-2.5 font-bold">Formation</th>
                          <th className="pb-2.5 font-bold">Filière</th>
                          <th className="pb-2.5 font-bold">Statut</th>
                          <th className="pb-2.5 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formations.slice(0, 4).map(f => (
                          <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 pr-2">
                              <div className="font-bold text-slate-900 truncate max-w-[200px]">{f.titre}</div>
                              <div className="text-[10px] text-slate-400">{f.modules?.length || 0} module(s) • {f.niveau}</div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {f.culture?.nom || 'Maraîchage'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Publiée</span>
                              </span>
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <Link
                                to={`/expert/formations/quiz?formationId=${f.id}`}
                                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[11px] shadow-2xs transition-colors inline-flex items-center space-x-1"
                              >
                                <Award className="w-3 h-3" />
                                <span>Quiz</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{formations.length} formation(s) publiée(s) au catalogue</span>
                <Link to="/expert/formations" className="text-emerald-700 font-bold hover:underline">
                  Gérer l'arborescence complète →
                </Link>
              </div>
            </div>

            {/* Colonne Droite : Derniers Apprenants Inscrits (Style New Customers Accusoft Image 3) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Derniers Apprenants</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Producteurs inscrits à vos parcours</p>
                  </div>
                  <Link
                    to="/expert/apprenants"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Voir tout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {apprenants.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    Aucun apprenant inscrit pour le moment.
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    {apprenants.slice(0, 4).map((a, idx) => {
                      const colors = [
                        'from-emerald-500 to-teal-500',
                        'from-blue-500 to-indigo-500',
                        'from-amber-500 to-orange-500',
                        'from-purple-500 to-pink-500'
                      ];
                      const avatarColor = colors[idx % colors.length];

                      return (
                        <div key={a.id} className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between space-x-3 transition-colors">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarColor} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                              {a.prenom?.[0] || 'M'}{a.nom?.[0] || 'P'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 text-xs truncate">
                                {a.prenom} {a.nom}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                {a.formationTitre}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-black text-slate-800 block">
                              {a.pourcentage}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${a.pourcentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{apprenants.length} apprenant(s) en formation</span>
                <Link to="/expert/apprenants" className="text-blue-700 font-bold hover:underline">
                  Suivi détaillé →
                </Link>
              </div>
            </div>
          </div>

          {/* Section Raccourcis Complémentaires (Quiz 70% & Alertes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Bannière Quiz Pédagogique */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-950">
                  <Award className="w-3.5 h-3.5 text-amber-800" />
                  <span>Validation séquentielle • Seuil 70%</span>
                </div>
                <h3 className="text-base font-black text-amber-950">
                  Générateur de Quiz Pédagogiques
                </h3>
                <p className="text-xs text-amber-900/80 max-w-md leading-relaxed">
                  Configurez des QCM chronométrés pour chaque leçon. L'obtention de 70% débloque automatiquement les leçons et modules suivants pour le maraîcher.
                </p>
              </div>

              <Link
                to="/expert/formations/quiz"
                className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
              >
                Accéder aux Quiz →
              </Link>
            </div>

            {/* Bannière Alertes & Forum */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-950">
                  <Bell className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Assistance & Urgences Maraîchères</span>
                </div>
                <h3 className="text-base font-black text-emerald-950">
                  Alertes Phytosanitaires & Forum
                </h3>
                <p className="text-xs text-emerald-900/80 max-w-md leading-relaxed">
                  Diffusez des recommandations urgentes (attaques de parasites, risques climatiques) ou répondez aux questions techniques posées par les producteurs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-auto">
                <Link
                  to="/expert/alertes"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-all whitespace-nowrap text-center"
                >
                  Publier Alerte
                </Link>
                <Link
                  to="/expert/forum"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-all whitespace-nowrap text-center"
                >
                  Forum ({expertQuestions.length})
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Mes Formations & Cours (Page dédiée avec structure complète) */}
      {activeTab === 'formations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900">Mes Formations & Cours</h2>
              <p className="text-xs text-slate-500 mt-1">
                Structurez vos modules et leçons, joignez des supports de cours (PDF téléchargeables) et configurez les quiz d'évaluation.
              </p>
            </div>
            <button
              onClick={openNewFormationModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Formation</span>
            </button>
          </div>
          {formations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Vous n'avez pas encore créé de formation</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Partagez votre expertise avec les maraîchers de Casamance en concevant des formations techniques accompagnées de quiz de validation.
              </p>
              <button
                onClick={openNewFormationModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Créer ma première formation
              </button>
            </div>
          ) : (
            formations.map(f => (
              <div key={f.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                {/* Formation Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start space-x-4">
                    <img
                      src={f.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                      alt={f.titre}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {f.culture?.nom || 'Maraîchage'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {f.niveau}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700">
                          {f.statut}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{f.titre}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{f.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to={`/expert/formations/quiz?formationId=${f.id}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex items-center space-x-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gérer Quiz</span>
                    </Link>
                    <Link
                      to={`/formations/${f.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center space-x-1"
                    >
                      <span>Aperçu apprenant</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => openNewModuleModal(f.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter Module</span>
                    </button>
                    <button
                      onClick={() => openEditFormationModal(f)}
                      className="p-2 text-slate-400 hover:text-emerald-700 rounded-xl hover:bg-slate-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFormation(f.id, f.titre)}
                      className="p-2 text-slate-400 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modules & Lessons tree */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Structure du cours ({f.modules?.length || 0} modules)
                  </h4>

                  {f.modules && f.modules.length > 0 ? (
                    f.modules.map(m => (
                      <div key={m.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-800">{m.titre}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openNewLeconModal(m.id)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Ajouter Leçon</span>
                            </button>
                            <button
                              onClick={() => handleDeleteModule(m.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Supprimer ce module"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons in module */}
                        <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
                          {m.lecons && m.lecons.length > 0 ? (
                            m.lecons.map(l => (
                              <div key={l.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-semibold text-slate-800">{l.titre}</span>
                                  <span className="text-[10px] text-slate-400">({l.dureeEstimee} min)</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {l.quiz ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center space-x-1">
                                      <Award className="w-3 h-3 text-amber-600" />
                                      <span>Quiz ({l.quiz.questions?.length || 0} Q • {l.quiz.scoreMinimum}%)</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                      Sans quiz (à ajouter)
                                    </span>
                                  )}

                                  <Link
                                    to={`/expert/formations/quiz?formationId=${f.id}&leconId=${l.id}`}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-colors flex items-center space-x-1 shadow-xs"
                                  >
                                    <Award className="w-3 h-3" />
                                    <span>{l.quiz ? 'Gérer Quiz' : 'Créer Quiz'}</span>
                                  </Link>

                                  <button
                                    onClick={() => handleDeleteLecon(l.id)}
                                    className="text-slate-400 hover:text-red-600 p-1"
                                    title="Supprimer cette leçon"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-slate-400 italic py-1">
                              Aucune leçon dans ce module. Cliquez sur "Ajouter Leçon" pour en créer une.
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      Aucun module. Cliquez sur "Ajouter Module" ci-dessus pour structurer cette formation.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Suivi des Apprenants */}
      {activeTab === 'apprenants' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Apprenants Inscrits à vos Formations</h2>
              <p className="text-xs text-slate-500">Suivez la progression en temps réel et le taux de réussite aux quiz.</p>
            </div>
          </div>

          {apprenants.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun apprenant n'a encore débuté vos formations.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Apprenant</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Localisation</th>
                    <th className="px-4 py-3">Formation suivie</th>
                    <th className="px-4 py-3">Progression</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Débutée le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apprenants.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {a.prenom} {a.nom}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{a.email}</div>
                        <div className="text-[11px] text-slate-400">{a.telephone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{a.localisation || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-800">
                        {a.formationTitre}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${a.pourcentage}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700">{a.pourcentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.statut === 'TERMINEE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.statut === 'TERMINEE' ? 'Complétée' : 'En cours'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.dateDebut ? new Date(a.dateDebut).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Alertes Agricoles Expert */}
      {activeTab === 'alertes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Diffusion d'Alertes Maraîchères</h2>
              <p className="text-xs text-slate-500">
                En tant qu'expert, publiez des alertes phytosanitaires, climatiques ou conseils urgents envoyés directement aux maraîchers.
              </p>
            </div>
            <button
              onClick={() => {
                setAlertForm({
                  titre: '',
                  message: '',
                  type: 'PARASITE',
                  niveau: 'ATTENTION',
                  cultureId: cultures.length > 0 ? cultures[0].id : undefined
                });
                setShowAlertModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publier une alerte agricole</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertAlertes.map(a => (
              <div key={a.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    a.niveau === 'URGENCE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.niveau}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{a.titre}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                {a.culture && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Filière : {a.culture.nom}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Forum & Questions des Maraîchers */}
      {activeTab === 'forum' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Questions des Producteurs en Casamance</h2>
            <p className="text-xs text-slate-500">
              Apportez votre expertise technique, validez des solutions et guidez les agriculteurs.
            </p>
          </div>

          <div className="space-y-4">
            {expertQuestions.map(q => (
              <div key={q.id} className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {q.categorie?.nom || 'Général'}
                    </span>
                    {q.culture && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {q.culture.nom}
                      </span>
                    )}
                    {q.statut === 'RESOLUE' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                        Résolue
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-sm text-slate-900 hover:text-emerald-700">
                    <Link to={`/expert/forum/questions/${q.id}`}>{q.titre}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{q.contenu}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right text-xs text-slate-500">
                    <div className="font-bold text-slate-800">{q.reponses?.length || 0} réponse(s)</div>
                    <div className="text-[10px] text-slate-400">{q.vues || 0} vue(s)</div>
                  </div>
                  <Link
                    to={`/expert/forum/questions/${q.id}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Répondre en Expert
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Formation */}
      {showFormationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-slate-900">
              {editFormationId ? 'Modifier la formation' : 'Nouvelle Formation Expert'}
            </h3>

            <form onSubmit={handleSaveFormation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre de la formation *</label>
                <input
                  type="text"
                  required
                  value={formationForm.titre}
                  onChange={e => setFormationForm({ ...formationForm, titre: e.target.value })}
                  placeholder="ex: Maîtrise de l'irrigation goutte-à-goutte"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formationForm.description}
                  onChange={e => setFormationForm({ ...formationForm, description: e.target.value })}
                  placeholder="Objectifs et compétences cibles..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Filière / Culture</label>
                  <select
                    value={formationForm.cultureId || ''}
                    onChange={e => setFormationForm({ ...formationForm, cultureId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="">Général / Polyvalence</option>
                    {cultures.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Niveau</label>
                  <select
                    value={formationForm.niveau}
                    onChange={e => setFormationForm({ ...formationForm, niveau: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="DEBUTANT">🌱 Débutant</option>
                    <option value="INTERMEDIAIRE">🌿 Intermédiaire</option>
                    <option value="AVANCE">🌳 Avancé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Image d'illustration</label>
                <input
                  type="text"
                  value={formationForm.imageUrl}
                  onChange={e => setFormationForm({ ...formationForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
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
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {saving ? 'Enregistrement...' : editFormationId ? 'Mettre à jour' : 'Publier la formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Module */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Ajouter un module</h3>
            <form onSubmit={handleSaveModule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre du module *</label>
                <input
                  type="text"
                  required
                  value={moduleForm.titre}
                  onChange={e => setModuleForm({ ...moduleForm, titre: e.target.value })}
                  placeholder="ex: Module 1 : Préparation du sol"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={moduleForm.description}
                  onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ordre</label>
                <input
                  type="number"
                  min="1"
                  value={moduleForm.ordre}
                  onChange={e => setModuleForm({ ...moduleForm, ordre: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Ajouter le module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Leçon */}
      {showLeconModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Ajouter une leçon</h3>
            <form onSubmit={handleSaveLecon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre de la leçon *</label>
                <input
                  type="text"
                  required
                  value={leconForm.titre}
                  onChange={e => setLeconForm({ ...leconForm, titre: e.target.value })}
                  placeholder="ex: Confection des planches et apport organique"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contenu pédagogique (Markdown supporté) *</label>
                <textarea
                  rows={6}
                  required
                  value={leconForm.contenu}
                  onChange={e => setLeconForm({ ...leconForm, contenu: e.target.value })}
                  placeholder="Rédigez le cours..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono text-xs"
                />
              </div>
              {/* Upload Pièce jointe / Document PDF */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Support de cours à joindre (PDF / Document téléchargeable)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center space-x-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{uploadingFile ? 'Importation en cours...' : 'Sélectionner un fichier (PDF)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                  </label>
                  {leconForm.fichierJointNom && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1 truncate max-w-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{leconForm.fichierJointNom}</span>
                    </span>
                  )}
                </div>
                {leconForm.fichierJointUrl && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                    <span>Fichier importé avec succès. Mis à disposition des apprenants.</span>
                    <a
                      href={leconForm.fichierJointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Tester le téléchargement (PDF) ↗</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Durée estimée (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={leconForm.dureeEstimee}
                    onChange={e => setLeconForm({ ...leconForm, dureeEstimee: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ordre</label>
                  <input
                    type="number"
                    min="1"
                    value={leconForm.ordre}
                    onChange={e => setLeconForm({ ...leconForm, ordre: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeconModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingFile}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer la leçon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alerte Expert */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Diffuser une alerte agricole</h3>
            <form onSubmit={handleSaveAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre de l'alerte *</label>
                <input
                  type="text"
                  required
                  value={alertForm.titre}
                  onChange={e => setAlertForm({ ...alertForm, titre: e.target.value })}
                  placeholder="ex: Risque d'attaque de chenilles légionnaires sur Tomate"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message d'alerte et recommandations *</label>
                <textarea
                  rows={4}
                  required
                  value={alertForm.message}
                  onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
                  placeholder="Détails du risque, symptômes à surveiller et préconisations de traitement bio..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type d'alerte</label>
                  <select
                    value={alertForm.type}
                    onChange={e => setAlertForm({ ...alertForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="METEO">Météo 🌦️</option>
                    <option value="PARASITE">Parasite 🐛</option>
                    <option value="SEMIS">Semis 🌱</option>
                    <option value="RECOLTE">Récolte 🌾</option>
                    <option value="MARCHE">Marché 📈</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Niveau d'urgence</label>
                  <select
                    value={alertForm.niveau}
                    onChange={e => setAlertForm({ ...alertForm, niveau: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="INFO">Information ℹ️</option>
                    <option value="ATTENTION">Attention ⚠️</option>
                    <option value="URGENCE">Urgence 🚨</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Filière / Culture ciblée</label>
                  <select
                    value={alertForm.cultureId || ''}
                    onChange={e => setAlertForm({ ...alertForm, cultureId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="">Toutes les cultures</option>
                    {cultures.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingAlert}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs shadow-md transition-colors"
                >
                  {savingAlert ? 'Publication...' : "Diffuser l'alerte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

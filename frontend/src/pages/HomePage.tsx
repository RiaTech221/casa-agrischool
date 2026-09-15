import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, BookOpen, Bell, MessageSquare, Award, ArrowRight, 
  CheckCircle2, ShieldCheck, TrendingUp, Users, Sparkles,
  HelpCircle, Send, Clock, ThumbsUp, Eye, Search, AlertTriangle,
  ChevronRight, Compass, Shield, UserCheck, Flame, Leaf, Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Culture, Formation, QuestionForum, CategorieForum, Alerte } from '../types';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Data states
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [questions, setQuestions] = useState<QuestionForum[]>([]);
  const [categories, setCategories] = useState<CategorieForum[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);

  // Form question sans connexion state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [auteurNom, setAuteurNom] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('');
  const [selectedCultureId, setSelectedCultureId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Selected culture filter for formations preview
  const [selectedCultureFilter, setSelectedCultureFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [cultRes, formRes, questRes, catRes, alertRes] = await Promise.all([
          api.get<Culture[]>('/cultures').catch(() => ({ data: [] })),
          api.get<Formation[]>('/formations').catch(() => ({ data: [] })),
          api.get<QuestionForum[]>('/forum/questions').catch(() => ({ data: [] })),
          api.get<CategorieForum[]>('/forum/categories').catch(() => ({ data: [] })),
          isAuthenticated ? api.get<Alerte[]>('/alertes').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ]);

        setCultures(cultRes.data || []);
        setFormations(formRes.data || []);
        setQuestions((questRes.data || []).slice(0, 4));
        setCategories(catRes.data || []);
        setAlertes((alertRes.data || []).filter(a => a.statut).slice(0, 2));

        if (catRes.data && catRes.data.length > 0) {
          setSelectedCatId(catRes.data[0].id);
        }
      } catch (err) {
        console.error('Erreur chargement données accueil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // Smooth scroll vers l'ancre si présente dans l'URL
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  const handlePostQuickQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !contenu.trim()) {
      setSubmitError('Veuillez renseigner le titre et votre question.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/forum/questions', {
        titre: titre.trim(),
        contenu: contenu.trim(),
        auteurNom: isAuthenticated ? undefined : (auteurNom.trim() || 'Maraîcher de Casamance'),
        tags: 'Entraide, Casamance',
        categorieId: selectedCatId ? Number(selectedCatId) : (categories[0]?.id || 1),
        cultureId: selectedCultureId ? Number(selectedCultureId) : null
      });

      setSubmitSuccess(true);
      setTitre('');
      setContenu('');
      setAuteurNom('');
      
      // Re-fetch questions
      const updatedQ = await api.get<QuestionForum[]>('/forum/questions');
      setQuestions(updatedQ.data.slice(0, 4));

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowQuestionModal(false);
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Erreur lors de la publication de la question.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFormations = selectedCultureFilter === 'all'
    ? formations.slice(0, 4)
    : formations.filter(f => f.culture?.id === selectedCultureFilter).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-slate-50/50">
      
      {/* 1. HERO SECTION MODERNE */}
      <section id="accueil" className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40 scroll-mt-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2.5 bg-emerald-800/60 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-300 font-bold">Plateforme Agricole Unifiée</span>
              <span className="text-emerald-500">•</span>
              <span className="text-emerald-200">Ziguinchor, Bignona & Oussouye</span>
            </div>
            
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Cultivez votre savoir, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  récoltez votre réussite
                </span>
              </h1>
              
              <p className="text-emerald-100/90 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-medium">
                L'écosystème numérique d'excellence pour le maraîchage en Basse-Casamance. Formez-vous avec des modules pratiques, prévenez les risques phytosanitaires et bénéficiez de l'appui direct d'experts agronomes du DRDR & de l'ISRA.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                {isAuthenticated ? (
                  <Link
                    to={user?.roles?.includes('ROLE_ADMIN') ? '/admin' : user?.roles?.includes('ROLE_EXPERT') ? '/expert' : '/dashboard'}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-black text-sm sm:text-base transition-all shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center space-x-2"
                  >
                    <span>Mon tableau de bord</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-black text-sm sm:text-base transition-all shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center space-x-2"
                    >
                      <span>Rejoindre gratuitement</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                      href="#formations"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 font-bold text-sm sm:text-base border border-emerald-600/50 transition-all flex items-center justify-center space-x-2 hover:border-emerald-400 backdrop-blur-sm"
                    >
                      <BookOpen className="w-5 h-5 text-amber-300" />
                      <span>Explorer les formations</span>
                    </a>
                  </>
                )}
              </div>

            {/* Micro KPI Pills */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-emerald-800/60 text-emerald-100">
              <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-xl p-3 text-center lg:text-left backdrop-blur-sm">
                <div className="font-black text-xl sm:text-2xl text-emerald-300">100%</div>
                <div className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">Climat Casamance</div>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-xl p-3 text-center lg:text-left backdrop-blur-sm">
                <div className="font-black text-xl sm:text-2xl text-amber-300">Sans Compte</div>
                <div className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">Questions au Forum</div>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-xl p-3 text-center lg:text-left backdrop-blur-sm">
                <div className="font-black text-xl sm:text-2xl text-teal-300">Agronomes</div>
                <div className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">Réponses Certifiées</div>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Card / Alertes */}
          <div className="lg:col-span-5 relative space-y-4">
            {/* Quick Question Trigger Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Besoin d'un conseil agronomique ?</h3>
                    <p className="text-[11px] text-emerald-200">Sans inscription préalable • Réponse rapide</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
                  Accès Libre
                </span>
              </div>

              <div className="bg-emerald-950/60 rounded-xl p-4 border border-emerald-800/60 space-y-2.5">
                <div className="text-xs text-emerald-200 font-medium flex items-center space-x-1.5">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>Votre culture est attaquée ? Des taches suspectes sur vos feuilles ?</span>
                </div>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="w-full py-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Soumettre ma question maintenant</span>
                </button>
              </div>

              {/* Live Active Alert Preview */}
              {alertes.length > 0 && (
                <div className="pt-2 border-t border-emerald-800/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-amber-300 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Vigilance de Saison</span>
                    </span>
                    <Link to="/alertes" className="text-[11px] text-emerald-300 hover:underline">
                      Voir alertes ({alertes.length})
                    </Link>
                  </div>
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-100">
                    <p className="font-semibold text-amber-200 text-xs">{alertes[0].titre}</p>
                    <p className="text-[11px] text-amber-100/80 line-clamp-1 mt-0.5">{alertes[0].message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. SECTION FORMATIONS MARAÎCHÈRES EN VEDETTE */}
      <section id="formations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Itinéraires Techniques & Pédagogie</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Formations Phares pour la Région
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Des modules structurés étape par étape, testés sur les sols de Ziguinchor, Bignona et Oussouye avec supports téléchargeables et quiz.
            </p>
          </div>

          <Link
            to="/formations"
            className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors self-start md:self-auto"
          >
            <span>Voir l'ensemble du catalogue ({formations.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filters pills for formations */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCultureFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCultureFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toutes les filières
          </button>
          {cultures.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCultureFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCultureFilter === c.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>

        {/* Formations Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFormations.map((f) => (
            <div 
              key={f.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="relative">
                <img
                  src={f.imageUrl || f.culture?.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                  alt={f.titre}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${
                    f.niveau === 'DEBUTANT' 
                      ? 'bg-emerald-600/90 text-white' 
                      : f.niveau === 'INTERMEDIAIRE'
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-purple-600/90 text-white'
                  }`}>
                    {f.niveau}
                  </span>
                </div>
                {f.culture && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                      {f.culture.nom}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {f.titre}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium text-[11px] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.modules?.length || 1} Module{(f.modules?.length || 1) > 1 ? 's' : ''}</span>
                  </span>

                  <Link
                    to={`/formations/${f.id}`}
                    className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <span>Consulter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECTION FORUM EN DIRECT (POSER SANS SE CONNECTER + QUESTIONS RÉCENTES) */}
      <section id="forum" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Forum Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Entraide Communautaire Ouverte</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Le Forum Agricole de Casamance en Direct
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                Posez vos questions librement sans compte ou parcourez les solutions validées par les agronomes certifiés de la région.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Poser une question (Accès Libre)</span>
              </button>
              <Link
                to="/forum"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center space-x-2 backdrop-blur-sm"
              >
                <span>Explorer tout le Forum</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Forum Body: Direct Questions Grid */}
          <div className="p-6 sm:p-8 bg-slate-50/60">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Dernières questions posées par les maraîchers</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Mise à jour en temps réel
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-bold text-sm">Aucune question pour le moment.</p>
                <p className="text-xs text-slate-400 mt-1">Soyez le premier à poser une question agronomique !</p>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Poser la première question
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {questions.map((q) => {
                  const hasExpertAnswer = q.reponses?.some(r => 
                    r.auteur?.roles?.includes('ROLE_EXPERT') || r.auteur?.profilExpert?.estVerifie || r.estMeilleureReponse
                  );
                  const isResolved = q.statut === 'RESOLUE';

                  return (
                    <div 
                      key={q.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {q.categorie?.nom || 'Agronomie'}
                            </span>
                            {q.culture && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                {q.culture.nom}
                              </span>
                            )}
                          </div>
                          
                          {isResolved ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Résolue</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              En cours
                            </span>
                          )}
                        </div>

                        <Link 
                          to={`/forum/questions/${q.id}`}
                          className="block font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2"
                        >
                          {q.titre}
                        </Link>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {q.contenu}
                        </p>
                      </div>

                      {/* Footer card question */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                            {q.auteur ? (q.auteur.prenom?.[0] || 'U') : (q.auteurNom?.[0] || 'M')}
                          </div>
                          <span className="text-slate-600 font-medium text-[11px] truncate max-w-[120px]">
                            {q.auteur ? `${q.auteur.prenom} ${q.auteur.nom}` : (q.auteurNom || 'Maraîcher')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px]">
                          {hasExpertAnswer && (
                            <span className="flex items-center space-x-1 text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              <ShieldCheck className="w-3 h-3 text-teal-600" />
                              <span>Réponse expert</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1 text-slate-500 font-semibold">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{q.reponses?.length || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Question Inline Banner */}
            <div className="mt-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Vous observez une anomalie sur vos parcelles ?
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Pas besoin de mot de passe : déposez votre demande et un spécialiste vous apportera un diagnostic.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Poser ma question maintenant
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECTION À PROPOS & MISSION RÉGIONALE DIRECTE */}
      <section id="apropos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-700/60 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>À Propos de Casa AgriSchool</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Une Alliance Forte entre la Recherche et le Terroir de Casamance
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                Développée pour répondre aux réalités climatiques et pédologiques de Ziguinchor, Bignona et Oussouye, notre plateforme connecte les producteurs familiaux aux spécialistes de l'ISRA, du DRDR et de l'ANCAR.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Itinéraires certifiés ISRA</span>
                </div>
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Questions ouvertes sans compte</span>
                </div>
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prévention des attaques de ravageurs</span>
                </div>
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-700/40 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Réduction de la mévente sur les marchés</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/a-propos"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-300 hover:text-white"
                >
                  <span>En savoir plus sur notre mission et partenaires</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <h3 className="font-black text-base text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-300" />
                <span>Nos 3 Piliers d'Intervention</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                  <div className="font-bold text-emerald-300">1. Pratique & Local</div>
                  <p className="text-emerald-100/80 text-[11px] mt-0.5">Adapté aux terroirs de basse vallée et plateaux.</p>
                </div>
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                  <div className="font-bold text-amber-300">2. Réactivité Immédiate</div>
                  <p className="text-emerald-100/80 text-[11px] mt-0.5">Alertes régionales et réponses rapides sur le forum.</p>
                </div>
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                  <div className="font-bold text-teal-300">3. Inclusivité Totale</div>
                  <p className="text-emerald-100/80 text-[11px] mt-0.5">Accessible à tous les producteurs gratuitement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LES 3 ESPACES DÉDIÉS ET UNIFIÉS DE CASA AGRISCHOOL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Écosystème Intégré</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Une Plateforme Conçue pour Tous les Acteurs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Chaque profil bénéficie d'une interface ergonomique optimisée, dotée d'un panneau latéral et d'outils métiers dédiés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Espace Maraîcher */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Espace Producteur</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Maraîcher Apprenant</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gérez vos parcelles, suivez vos cycles culturaux de la semence à la récolte, validez vos acquis avec des quiz et recevez des alertes locales.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Déclaration & suivi d'exploitations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cours hors-ligne & quiz certifiants</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alertes météo et phytosanitaires</span>
                </li>
              </ul>
            </div>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs text-center transition-colors shadow-sm"
            >
              {isAuthenticated ? 'Accéder à mon tableau de bord' : 'Rejoindre en tant que Maraîcher'}
            </Link>
          </div>

          {/* Espace Expert Agronome */}
          <div className="bg-white rounded-3xl p-7 border-2 border-teal-600/30 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              Agronomes Certifiés
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">Espace Conseil</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Expert & Chercheur</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Créez des formations adaptées aux terroirs de Casamance, rédigez des quiz interactifs et répondez en priorité aux alertes des producteurs.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Conception de formations & quiz</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Réponses certifiées sur le forum</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Suivi de la cohorte d'apprenants</span>
                </li>
              </ul>
            </div>

            <Link
              to={isAuthenticated ? '/expert' : '/register'}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs text-center transition-colors shadow-sm"
            >
              {isAuthenticated ? 'Accéder à l’Espace Expert' : 'Postuler comme Expert Agronome'}
            </Link>
          </div>

          {/* Espace Supervision Admin */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-inner">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Gouvernance Régionale</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Administration & Suivi</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Supervisez la conformité des exploitations déclarées, validez les accréditations d'experts, modérez le forum et diffusez les alertes d'urgence.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Validation des profils d'experts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Modération et diffusion d'alertes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Statistiques régionales en temps réel</span>
                </li>
              </ul>
            </div>

            <Link
              to={isAuthenticated ? '/admin' : '/login'}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors shadow-sm"
            >
              {isAuthenticated ? 'Accéder à l’Administration' : 'Connexion Supervision'}
            </Link>
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION & CONTACT DIRECT */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl border border-emerald-700/50">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-emerald-800/80 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Accompagnement Maraîcher 100% Régional • Ziguinchor</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Prêt à développer le plein potentiel de vos terres ?
              </h2>
              <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed font-normal">
                Rejoignez la communauté Casa AgriSchool à Ziguinchor, Bignona et Oussouye. 
                Inscrivez-vous en moins de 2 minutes pour suivre vos cycles de culture et poser vos questions aux agronomes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-black text-sm sm:text-base shadow-xl transition-all text-center"
              >
                Créer mon compte Maraîcher
              </Link>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-white font-bold text-sm border border-emerald-600/50 transition-colors text-center"
              >
                Poser une question libre
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL: POSER UNE QUESTION RAPIDE (SANS CONNEXION REQUISE) */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    Poser une question au Forum
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAuthenticated ? 'Publier avec votre profil' : 'Accès libre sans création de compte'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base text-emerald-900">Question publiée avec succès !</h4>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Votre question est maintenant visible sur le forum. Les experts agronomes et producteurs de Casamance y répondront sous peu.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePostQuickQuestion} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                {!isAuthenticated && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Votre Prénom ou Nom (optionnel)
                    </label>
                    <input
                      type="text"
                      value={auteurNom}
                      onChange={(e) => setAuteurNom(e.target.value)}
                      placeholder="Ex: Ousmane Diédhiou (Bignona)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Culture concernée (optionnel)
                    </label>
                    <select
                      value={selectedCultureId}
                      onChange={(e) => setSelectedCultureId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      <option value="">Général / Aucune</option>
                      {cultures.map((c) => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titre du sujet ou problème observé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Taches noires et enroulement des feuilles de piment"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description détaillée de votre situation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    placeholder="Décrivez vos symptômes, la localisation de votre parcelle, le type d'arrosage et les traitements déjà essayés..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none leading-relaxed"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center space-x-2"
                  >
                    {submitting ? (
                      <span>Publication en cours...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publier ma question</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
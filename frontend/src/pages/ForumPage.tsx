import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, PlusCircle, Search, CheckCircle2, ShieldCheck, 
  TrendingUp, Clock, HelpCircle, Eye, Sprout, Tag as TagIcon,
  AlertCircle, X
} from 'lucide-react';
import api from '../services/api';
import { QuestionForum, CategorieForum, Culture } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const ForumPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<QuestionForum[]>([]);
  const [categories, setCategories] = useState<CategorieForum[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState<'recent' | 'popular' | 'unresolved'>('recent');
  const [loading, setLoading] = useState(true);

  // Modal new question (Mini Stack Overflow style)
  const [showModal, setShowModal] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [auteurNom, setAuteurNom] = useState('');
  const [catId, setCatId] = useState('');
  const [cultureId, setCultureId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadQuestions = async () => {
    try {
      let url = '/forum/questions';
      const params = new URLSearchParams();
      if (selectedCat) params.append('categorieId', String(selectedCat));
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortFilter === 'popular') params.append('sort', 'votes');
      if (sortFilter === 'unresolved') params.append('sort', 'unresolved');
      if (params.toString()) url += `?${params.toString()}`;

      const [qRes, cRes, cultRes] = await Promise.all([
        api.get<QuestionForum[]>(url),
        api.get<CategorieForum[]>('/forum/categories'),
        api.get<Culture[]>('/cultures')
      ]);
      setQuestions(qRes.data);
      setCategories(cRes.data);
      setCultures(cultRes.data);
      if (cRes.data.length > 0 && !catId) setCatId(String(cRes.data[0].id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedCat, sortFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/forum/questions', {
        titre,
        contenu,
        auteurNom: isAuthenticated ? undefined : (auteurNom.trim() || 'Maraîcher Anonyme'),
        tags: tagsInput.trim(),
        categorieId: parseInt(catId),
        cultureId: cultureId ? parseInt(cultureId) : null
      });
      setShowModal(false);
      setTitre('');
      setContenu('');
      setTagsInput('');
      setAuteurNom('');
      loadQuestions();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la publication de la question');
    } finally {
      setSubmitting(false);
    }
  };

  const getAuthorDisplay = (q: QuestionForum) => {
    if (q.auteur) {
      return {
        name: `${q.auteur.prenom} ${q.auteur.nom}`,
        initial: q.auteur.prenom ? q.auteur.prenom[0] : 'U',
        isExpert: q.auteur.roles?.includes('ROLE_EXPERT') || q.auteur.profilExpert?.estVerifie
      };
    }
    return {
      name: q.auteurNom || 'Invité / Maraîcher',
      initial: q.auteurNom ? q.auteurNom[0].toUpperCase() : 'M',
      isExpert: false
    };
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
      {/* Header Mini Stack Overflow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Forum d'Entraide Maraîchère
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Posez vos questions librement (sans obligation de connexion), votez et collaborez avec nos experts certifiés et pairs agriculteurs.
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedCat) setCatId(String(selectedCat));
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all hover:scale-102 self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Poser une question</span>
        </button>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Onglets style Stack Overflow */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSortFilter('recent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              sortFilter === 'recent'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Récents</span>
          </button>
          <button
            onClick={() => setSortFilter('popular')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              sortFilter === 'popular'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Populaires</span>
          </button>
          <button
            onClick={() => setSortFilter('unresolved')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              sortFilter === 'unresolved'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Non résolues</span>
          </button>
        </div>

        {/* Moteur de recherche */}
        <form onSubmit={handleSearch} className="w-full lg:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher questions, tags, maladies..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Catégories thématiques */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            selectedCat === null
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toutes les catégories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              selectedCat === c.id
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      {/* Liste des questions format Mini Stack Overflow */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Aucune question dans cette rubrique</h3>
            <p className="text-xs text-slate-500">Soyez le premier à poser une question agronomique !</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-emerald-700 font-bold text-xs hover:underline inline-block cursor-pointer"
            >
              Poser une question sans attendre →
            </button>
          </div>
        ) : (
          questions.map((q) => {
            const author = getAuthorDisplay(q);
            const hasBestAnswer = q.reponses?.some((r) => r.estMeilleureReponse) || q.statut === 'RESOLUE';
            const rawTags = q.tags ? q.tags.split(/[\s,]+/).filter(Boolean) : [];

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Blocs statistiques Mini Stack Overflow */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-start gap-3 sm:gap-2 text-center shrink-0 min-w-[90px]">
                    {/* Votes */}
                    <div className="text-slate-600 text-xs font-semibold">
                      <span className="font-bold text-slate-900 text-sm">{q.votes || 0}</span> votes
                    </div>

                    {/* Réponses */}
                    <div
                      className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        hasBestAnswer
                          ? 'bg-emerald-600 text-white'
                          : q.reponses && q.reponses.length > 0
                          ? 'border border-emerald-600 text-emerald-800 bg-emerald-50'
                          : 'border border-slate-200 text-slate-500'
                      }`}
                    >
                      {hasBestAnswer && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{q.reponses?.length || 0} réponses</span>
                    </div>

                    {/* Vues */}
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{q.vues || 0} vues</span>
                    </div>
                  </div>

                  {/* Corps de la question */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {q.categorie.nom}
                      </span>
                      {q.culture && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Sprout className="w-3 h-3 text-emerald-600" />
                          <span>{q.culture.nom}</span>
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/forum/questions/${q.id}`}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors block leading-snug"
                    >
                      {q.titre}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {q.contenu}
                    </p>

                    {/* Tags et Auteur */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1.5">
                        {rawTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium hover:bg-slate-200 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                          {author.initial}
                        </div>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          {author.name}
                          {author.isExpert && (
                            <span title="Expert vérifié">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Poser une Question (Style Mini Stack Overflow) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Poser une question publique</h3>
                <p className="text-xs text-slate-500">Accessible sans connexion obligatoire</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Encart guide Mini Stack Overflow */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-700" />
                Conseils pour recevoir une bonne réponse
              </div>
              <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5">
                <li>Soyez précis dans le titre (culture, symptômes observés).</li>
                <li>Détaillez le problème (fréquence d'arrosage, âge des plants, fertilisation).</li>
                <li>Ajoutez des mots-clés (tags) pour aider les experts à trouver votre sujet.</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {/* Nom / Pseudo si non connecté */}
              {!isAuthenticated && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Votre Nom ou Pseudo (Facultatif)
                  </label>
                  <input
                    type="text"
                    value={auteurNom}
                    onChange={(e) => setAuteurNom(e.target.value)}
                    placeholder="ex: Moussa Diatta (ou laisser vide pour Maraîcher Anonyme)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Titre de votre question *
                </label>
                <input
                  type="text"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="ex: Comment traiter les taches noires sur les feuilles de tomate ?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catégorie *</label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Culture concernée</label>
                  <select
                    value={cultureId}
                    onChange={(e) => setCultureId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Générale / Non spécifiée</option>
                    {cultures.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description détaillée du problème *
                </label>
                <textarea
                  rows={5}
                  required
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  placeholder="Décrivez précisément votre sol, vos pratiques et le comportement observé..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tags (mots-clés séparés par un espace ou virgule)
                </label>
                <div className="relative">
                  <TagIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="ex: tomate mildiou irrigation casamance"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Publication en cours...' : 'Publier ma question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
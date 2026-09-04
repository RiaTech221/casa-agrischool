import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Plus, Search, CheckCircle2, ShieldCheck, 
  Sparkles, Sprout, ArrowRight, User as UserIcon 
} from 'lucide-react';
import api from '../services/api';
import { QuestionForum, CategorieForum, Culture } from '../types';

export const ForumPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionForum[]>([]);
  const [categories, setCategories] = useState<CategorieForum[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal new question
  const [showModal, setShowModal] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [catId, setCatId] = useState('');
  const [cultureId, setCultureId] = useState('');

  const loadQuestions = async () => {
    try {
      let url = '/forum/questions';
      const params = new URLSearchParams();
      if (selectedCat) params.append('categorieId', String(selectedCat));
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
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
  }, [selectedCat]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/forum/questions', {
        titre,
        contenu,
        categorieId: parseInt(catId),
        cultureId: cultureId ? parseInt(cultureId) : null
      });
      setShowModal(false);
      setTitre('');
      setContenu('');
      loadQuestions();
    } catch (err) {
      alert('Erreur lors de la publication de la question');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Forum Maraîcher & Entraide</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Posez vos questions agronomiques. Nos experts vérifiés et vos pairs maraîchers vous répondent.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Poser une question</span>
        </button>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une maladie, variété, conseil..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedCat === null
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCat === c.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Aucune question trouvée</h3>
            <p className="text-xs text-slate-400">Soyez le premier à poser une question dans cette catégorie !</p>
          </div>
        ) : (
          questions.map(q => (
            <Link
              key={q.id}
              to={`/forum/questions/${q.id}`}
              className="block bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {q.categorie.nom}
                  </span>
                  {q.culture && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center space-x-1">
                      <Sprout className="w-3 h-3 text-emerald-600" />
                      <span>{q.culture.nom}</span>
                    </span>
                  )}
                  {q.statut === 'RESOLUE' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>Résolue</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-snug">{q.titre}</h2>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{q.contenu}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                    {q.auteur.prenom[0]}
                  </div>
                  <span className="text-slate-700 font-medium">{q.auteur.prenom} {q.auteur.nom}</span>
                  {q.auteur.profilExpert?.estVerifie && (
                    <span title="Expert vérifié"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /></span>
                  )}
                </div>

                <div className="flex items-center space-x-1 font-semibold text-emerald-700">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{q.reponses?.length || 0} réponse(s)</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Modal Créer Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-slate-900">Poser une question aux maraîchers & experts</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre de votre question</label>
                <input
                  type="text"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="ex: Feuilles de piment qui se recroquevillent..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catégorie</label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Culture concernée</label>
                  <select
                    value={cultureId}
                    onChange={(e) => setCultureId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="">Générale / Non spécifiée</option>
                    {cultures.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description détaillée du problème</label>
                <textarea
                  rows={4}
                  required
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  placeholder="Décrivez précisément les symptômes, la fréquence d'arrosage, l'âge des plants..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Publier ma question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
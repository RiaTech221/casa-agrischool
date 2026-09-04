import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, BookOpen, Bell, MessageSquare, Award, ArrowRight, 
  CheckCircle2, ShieldCheck, TrendingUp, Users, Sparkles 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Culture, Formation } from '../types';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);

  useEffect(() => {
    api.get<Culture[]>('/cultures').then(res => setCultures(res.data.slice(0, 4))).catch(() => {});
    api.get<Formation[]>('/formations').then(res => setFormations(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-700/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Plateforme Maraîchère de Casamance / Ziguinchor</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Former, Anticiper et <span className="text-emerald-400">Réussir son Maraîchage</span>
            </h1>
            
            <p className="text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
              L'école numérique et le réseau d'accompagnement sur mesure pour les producteurs de Casamance. 
              Formez-vous aux meilleures techniques culturales, anticipez les risques saisonniers et échangez avec des agronomes certifiés.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-base transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center space-x-2"
                >
                  <span>Accéder à mon tableau de bord</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-base transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center space-x-2"
                  >
                    <span>Rejoindre gratuitement</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-base border border-emerald-600/60 transition-colors flex items-center justify-center"
                  >
                    Connexion
                  </Link>
                </>
              )}
            </div>

            {/* Quick stats pills */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-emerald-700/50 text-emerald-100 text-xs sm:text-sm">
              <div>
                <div className="font-extrabold text-xl text-white">100%</div>
                <div className="text-emerald-300">Adapté Casamance</div>
              </div>
              <div>
                <div className="font-extrabold text-xl text-white">Experts</div>
                <div className="text-emerald-300">Agronomes vérifiés</div>
              </div>
              <div>
                <div className="font-extrabold text-xl text-white">Zéro</div>
                <div className="text-emerald-300">Mévente anticipée</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-700/50 bg-emerald-950/40">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"
                alt="Culture maraîchère de tomate"
                className="w-full h-80 object-cover"
              />
              <div className="p-5 bg-emerald-950/90 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Alerte Prioritaire</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">URGENCE</span>
                </div>
                <h3 className="font-bold text-sm">Flétrissement bactérien sur Tomate</h3>
                <p className="text-xs text-emerald-200/80 line-clamp-2">
                  Mesures préventives immédiates pour protéger vos parcelles en Casamance.
                </p>
                <Link to="/alertes" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                  <span>Consulter toutes les alertes</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les 4 Piliers Fondamentaux */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Les 4 Piliers de Casa AgriSchool
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Une approche globale pour soutenir le maraîcher avant, pendant et après la récolte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pilier 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Apprendre</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Formations pas à pas, modules techniques, leçons multimédias et quiz chronométrés corrigés en temps réel.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600">
              <span>Formations & Quiz</span>
            </div>
          </div>

          {/* Pilier 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Planifier</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Moteur d'alertes saisonnières ciblées selon vos cultures déclarées, les conditions climatiques et les ravageurs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-amber-600">
              <span>Alertes intelligentes</span>
            </div>
          </div>

          {/* Pilier 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Demander</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Forum d'entraide communautaire. Posez vos questions et recevez des réponses certifiées par des agronomes de l'ISRA et du DRDR.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
              <span>Experts vérifiés</span>
            </div>
          </div>

          {/* Pilier 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Suivre</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tableau de bord de vos exploitations, calendrier des récoltes prévues, points d'apprentissage et progression.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-purple-600">
              <span>Gestion & Gamification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cultures Phares de la Région */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Filières agricoles</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Cultures Maraîchères Prioritaires</h2>
            </div>
            <Link to="/formations" className="mt-3 md:mt-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center">
              <span>Explorer les formations dédiées</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cultures.map(culture => (
              <div key={culture.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <img
                  src={culture.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                  alt={culture.nom}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-slate-900">{culture.nom}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {culture.description}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/formations?cultureId=${culture.id}`}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                    >
                      <span>Voir les cours</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Prêt à valoriser vos récoltes ?</h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Rejoignez des centaines de producteurs maraîchers de Ziguinchor, Bignona et Oussouye. 
              Inscrivez-vous en 1 minute.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 px-8 py-4 rounded-xl bg-white text-emerald-950 font-extrabold text-base hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Créer mon exploitation
          </Link>
        </div>
      </section>
    </div>
  );
};
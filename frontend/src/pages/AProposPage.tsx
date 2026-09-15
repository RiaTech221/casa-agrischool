import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ShieldCheck, Award, Users, MapPin, Target, CheckCircle2, 
  ArrowRight, Heart, Sparkles, BookOpen, MessageSquare, Bell 
} from 'lucide-react';

export const AProposPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-slate-50/50">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2.5 bg-emerald-800/60 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Notre Mission en Casamance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            L'Excellence Maraîchère au Cœur de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Basse-Casamance</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
            Casa AgriSchool est une initiative technologique et agronomique dédiée à l'autonomisation des petits producteurs maraîchers de Ziguinchor, Bignona et Oussouye. Nous combinons formation continue, alertes phytosanitaires et entraide communautaire directe avec des chercheurs de l'ISRA et du DRDR.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/formations"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 font-black text-sm shadow-lg hover:shadow-emerald-500/25 flex items-center space-x-2"
            >
              <span>Découvrir les formations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/forum"
              className="px-6 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-600/50 flex items-center space-x-2"
            >
              <span>Rejoindre le Forum</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Les Objectifs Clés */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pourquoi Casa AgriSchool ?</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Résoudre les Défis Majeurs du Maraîchage Local</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Réduire la Mévente et les Pertes</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              En fournissant un calendrier des récoltes et des prévisions de marché, nous aidons les producteurs à échelonner leurs semis pour éviter la surproduction simultanée sur les marchés hebdomadaires (Loumas).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Anticiper les Ravageurs & Maladies</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Le système d'alerte précoce notifie instantanément les maraîchers dès qu'une attaque (flétrissement bactérien, chenilles légionnaires, mouche des fruits) est repérée dans leur zone géographique.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Démocratiser le Conseil Agronomique</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tout producteur, même sans compte ni budget, peut soumettre une photo ou une question et obtenir des recommandations formulées par des experts qualifiés sous 24h.
            </p>
          </div>
        </div>
      </section>

      {/* Les Partenaires Institutionnels */}
      <section className="bg-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">Nos Partenaires et Références Techniques</h2>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-2xl mx-auto">
              Nos modules de formation et protocoles d'alerte s'appuient sur les fiches techniques officielles et les stations de recherche de Casamance.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
            <div className="bg-emerald-800/60 p-6 rounded-2xl border border-emerald-700/50">
              <div className="font-black text-lg text-emerald-300">ISRA</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Recherche Agricole & Semences</p>
            </div>
            <div className="bg-emerald-800/60 p-6 rounded-2xl border border-emerald-700/50">
              <div className="font-black text-lg text-emerald-300">DRDR Ziguinchor</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Développement Rural Régional</p>
            </div>
            <div className="bg-emerald-800/60 p-6 rounded-2xl border border-emerald-700/50">
              <div className="font-black text-lg text-emerald-300">ANCAR</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Conseil Agricole & Rural</p>
            </div>
            <div className="bg-emerald-800/60 p-6 rounded-2xl border border-emerald-700/50">
              <div className="font-black text-lg text-emerald-300">GIE & Coopératives</div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Bignona, Oussouye & Nyassia</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

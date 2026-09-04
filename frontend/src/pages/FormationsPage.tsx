import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Sprout, ArrowRight, Layers, Clock, Award } from 'lucide-react';
import api from '../services/api';
import { Formation, Culture } from '../types';

export const FormationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cultureFilter = searchParams.get('cultureId');

  const [formations, setFormations] = useState<Formation[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, cultRes] = await Promise.all([
          api.get<Formation[]>(cultureFilter ? `/formations?cultureId=${cultureFilter}` : '/formations'),
          api.get<Culture[]>('/cultures')
        ]);
        setFormations(formRes.data);
        setCultures(cultRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cultureFilter]);

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Catalogue des Formations Maraîchères</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Formations pratiques conçues pour les conditions agroclimatiques de Casamance. Chaque module comprend des leçons et des quiz chronométrés.
        </p>
      </div>

      {/* Filter by Crop Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSearchParams({})}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            !cultureFilter
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toutes les filières ({formations.length})
        </button>

        {cultures.map(c => (
          <button
            key={c.id}
            onClick={() => setSearchParams({ cultureId: String(c.id) })}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              cultureFilter === String(c.id)
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      {/* Formations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.map(formation => (
          <div
            key={formation.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={formation.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'}
                  alt={formation.titre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/80 backdrop-blur-sm text-emerald-300">
                    {formation.culture?.nom || 'Maraîchage Général'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 backdrop-blur-sm text-slate-800">
                    {formation.niveau}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-slate-900 leading-snug">{formation.titre}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {formation.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formation.modules?.length || 1} module(s)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quiz inclus</span>
                </span>
              </div>

              <Link
                to={`/formations/${formation.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Accéder à la formation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
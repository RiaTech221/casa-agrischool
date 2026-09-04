import React, { useEffect, useState } from 'react';
import { 
  Bell, AlertTriangle, Info, AlertOctagon, CheckCircle2, 
  Calendar, Sprout, Filter, Check 
} from 'lucide-react';
import api from '../services/api';
import { Alerte } from '../types';

export const AlertesPage: React.FC = () => {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('TOUS');
  const [loading, setLoading] = useState(true);

  const loadAlertes = async () => {
    try {
      const res = await api.get<Alerte[]>('/alertes');
      setAlertes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertes();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/alertes/${id}/read`);
      setAlertes(prev => prev.map(a => a.id === id ? { ...a, lu: true, dateLecture: new Date().toISOString() } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlertes = alertes.filter(a => {
    if (filterLevel === 'TOUS') return true;
    return a.niveau === filterLevel;
  });

  const unreadCount = alertes.filter(a => !a.lu).length;

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Alertes Saisonnières & Météo</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-amber-950">
                {unreadCount} non lue(s)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recommandations préventives et alertes phytosanitaires ciblées sur vos cultures de Casamance.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          {['TOUS', 'URGENCE', 'ATTENTION', 'INFO'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterLevel === lvl
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lvl === 'TOUS' ? 'Toutes' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlertes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Aucune alerte active pour ce filtre</h3>
            <p className="text-xs text-slate-400">Vos cultures sont actuellement hors zone de risque signalé.</p>
          </div>
        ) : (
          filteredAlertes.map(alerte => {
            const isUrgence = alerte.niveau === 'URGENCE';
            const isAttention = alerte.niveau === 'ATTENTION';

            let borderClass = 'border-slate-200';
            let bgClass = 'bg-white';
            let badgeClass = 'bg-blue-100 text-blue-800';
            let IconComp = Info;

            if (isUrgence) {
              borderClass = alerte.lu ? 'border-red-200' : 'border-red-400 ring-2 ring-red-400/20';
              bgClass = alerte.lu ? 'bg-white' : 'bg-red-50/30';
              badgeClass = 'bg-red-500 text-white';
              IconComp = AlertOctagon;
            } else if (isAttention) {
              borderClass = alerte.lu ? 'border-amber-200' : 'border-amber-400 ring-2 ring-amber-400/20';
              bgClass = alerte.lu ? 'bg-white' : 'bg-amber-50/30';
              badgeClass = 'bg-amber-500 text-amber-950 font-bold';
              IconComp = AlertTriangle;
            }

            return (
              <div
                key={alerte.id}
                className={`rounded-3xl p-6 border shadow-sm transition-all space-y-4 ${borderClass} ${bgClass}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${badgeClass}`}>
                        {alerte.niveau}
                      </span>
                      {alerte.culture ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                          <Sprout className="w-3 h-3" />
                          <span>{alerte.culture.nom}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Alerte Générale
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        Type : {alerte.type}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <IconComp className={`w-5 h-5 shrink-0 ${
                        isUrgence ? 'text-red-500' : isAttention ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                      <span>{alerte.titre}</span>
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {alerte.lu ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lue</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(alerte.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marquer comme lue</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/60 p-4 rounded-2xl border border-slate-100">
                  {alerte.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Période de validité : du {alerte.dateDebut} au {alerte.dateFin}</span>
                  </div>
                  {alerte.lu && alerte.dateLecture && (
                    <span className="text-emerald-700 font-medium">
                      Consultée le {new Date(alerte.dateLecture).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Users, Tractor, BookOpen, Bell, MessageSquare, 
  CheckCircle2, XCircle, AlertCircle, Sparkles 
} from 'lucide-react';
import api from '../services/api';
import { AdminStats, User } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

      {/* Users Management */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
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
      </div>
    </div>
  );
};
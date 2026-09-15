import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Footer: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (location.pathname.startsWith('/expert') || location.pathname.startsWith('/admin')) {
    return null;
  }
  if (isAuthenticated && (
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/exploitations') ||
    location.pathname.startsWith('/alertes') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/profil') ||
    location.pathname.startsWith('/formations') ||
    location.pathname.startsWith('/quiz') ||
    location.pathname.startsWith('/forum')
  )) {
    return null;
  }

  return (
    <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <span>Casa AgriSchool</span>
            </div>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              Plateforme numérique d'apprentissage et d'accompagnement agricole pour les maraîchers de Casamance.
            </p>
            <p className="text-[11px] font-semibold text-emerald-400">
              Former • Anticiper • Accompagner • Réduire la mévente
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Les 4 Piliers</h4>
            <ul className="space-y-1.5 text-xs text-emerald-300">
              <li>Apprendre : Formations & Quiz chronométrés</li>
              <li>Planifier : Alertes saisonnières ciblées</li>
              <li>Demander : Forum et experts certifiés</li>
              <li>Suivre : Tableau de bord des cultures</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Cultures Prioritaires</h4>
            <ul className="space-y-1.5 text-xs text-emerald-300">
              <li>Tomate maraîchère de Casamance</li>
              <li>Piment local aromatique</li>
              <li>Oignon violet de Galmi</li>
              <li>Gombo rustique et Aubergine amère</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Contact & Terrain</h4>
            <ul className="space-y-2 text-xs text-emerald-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ziguinchor, Bignona, Oussouye (Sénégal)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+221 33 991 00 00 / +221 77 000 00 00</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contact@agrischool.sn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80">
          <p>© 2026 Casa AgriSchool — Tous droits réservés.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Conçu avec passion pour l'autonomisation des maraîchers de Casamance
          </p>
        </div>
      </div>
    </footer>
  );
};
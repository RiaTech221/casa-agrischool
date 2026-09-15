import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, 
  Sparkles, Clock, ShieldCheck 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [envoye, setEnvoye] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoye(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-slate-50/50">
      
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/60 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>À votre écoute en Casamance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Contactez l'Équipe <span className="text-emerald-400">Casa AgriSchool</span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto">
            Une question technique, un partenariat, une anomalie phytosanitaire à signaler ou besoin d'accompagnement sur vos parcelles ? Écrivez-nous.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Card (Left) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-teal-950 rounded-3xl p-8 text-white shadow-xl space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Coordonnées Régionales</h2>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Nos conseillers et agronomes partenaires sillonnent la région pour appuyer les coopératives et groupements maraîchers.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Siège & Antenne Technique</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Quartier Escale / Route de l'Aéroport, Ziguinchor (Sénégal)
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">Antennes à Bignona & Oussouye</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Assistance Téléphonique</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    +221 33 991 00 00 (Standard Ziguinchor)
                  </p>
                  <p className="text-xs text-emerald-200/80">
                    +221 77 123 45 67 (Urgence Phytosanitaire WhatsApp)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Courrier Électronique</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    contact@agrischool.sn
                  </p>
                  <p className="text-xs text-emerald-200/80">
                    support-agronome@agrischool.sn
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Horaires d'Ouverture</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Du Lundi au Vendredi : 8h00 - 18h00
                  </p>
                  <p className="text-[11px] text-amber-300 mt-0.5">Forum ouvert 24h/24 sans inscription</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (Right) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Envoyez-nous un Message</h3>
              <p className="text-xs text-slate-500 mt-1">
                Remplissez ce formulaire et notre équipe technique vous recontactera sous 24 heures ouvrées.
              </p>
            </div>

            {envoye ? (
              <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-lg text-emerald-900">Message bien transmis !</h4>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                  Merci de votre prise de contact. Notre équipe agronomique de Ziguinchor a bien reçu votre demande et vous répondra très rapidement.
                </p>
                <button
                  onClick={() => setEnvoye(false)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Votre Nom & Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Ex: Ibrahima Coly"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Numéro de Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="Ex: +221 77 000 00 00"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adresse Email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: ibrahima@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Objet du message <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sujet}
                      onChange={(e) => setSujet(e.target.value)}
                      placeholder="Ex: Question sur l'itinéraire technique Tomate"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votre Message détaillé <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Expliquez-nous votre situation, votre zone (Ziguinchor, Bignona, Oussouye) et votre demande..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmettre mon message</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};

export type RoleName = 'ROLE_MARAICHER' | 'ROLE_EXPERT' | 'ROLE_ADMIN';

export interface UserRole {
  id: number;
  nom: RoleName;
  description: string;
}

export interface ProfilExpert {
  id: number;
  specialite: string;
  biographie: string;
  organisme: string;
  estVerifie: boolean;
  dateVerification?: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  localisation?: string;
  points: number;
  roles: string[];
  actif?: boolean;
  profilExpert?: ProfilExpert;
  createdAt?: string;
}

export interface Culture {
  id: number;
  nom: string;
  description: string;
  imageUrl?: string;
  actif: boolean;
}

export interface ExploitationCulture {
  id: number;
  culture: Culture;
  dateDebut: string;
  dateFinPrevue: string;
  superficieCultivee: number;
  statut: 'PREPARATION' | 'EN_COURS' | 'RECOLTE' | 'TERMINEE';
}

export interface Exploitation {
  id: number;
  nom: string;
  superficie: number;
  uniteSuperficie: string;
  localisation: string;
  description?: string;
  culturesDeclarees: ExploitationCulture[];
}

export interface Formation {
  id: number;
  titre: string;
  description: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  imageUrl?: string;
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
  culture?: Culture;
  modules?: Module[];
  createdAt: string;
}

export interface Module {
  id: number;
  titre: string;
  description: string;
  ordre: number;
  lecons: Lecon[];
}

export interface Lecon {
  id: number;
  titre: string;
  contenu: string;
  typeContenu: 'TEXTE' | 'VIDEO';
  ordre: number;
  dureeEstimee: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: number;
  titre: string;
  dureeMinutes: number;
  scoreMinimum: number;
  leconId?: number;
  questions?: QuestionQuiz[];
}

export interface QuestionQuiz {
  id: number;
  enonce: string;
  ordre: number;
  points: number;
  reponses: ReponseQuiz[];
}

export interface ReponseQuiz {
  id: number;
  texte: string;
  ordre: number;
}

export interface ProgressionFormation {
  id?: number;
  pourcentage: number;
  statut: 'NON_COMMENCEE' | 'EN_COURS' | 'TERMINEE';
  dateDebut?: string;
  dateFin?: string;
}

export interface QuizSubmitResponse {
  resultatId: number;
  score: number;
  nombreBonnesReponses: number;
  totalQuestions: number;
  reussi: boolean;
  pointsGagnes: number;
  message: string;
  datePassage: string;
  bonnesReponses: Record<number, number>;
}

export interface Alerte {
  id: number;
  titre: string;
  message: string;
  type: 'METEO' | 'PARASITE' | 'SEMIS' | 'RECOLTE' | 'MARCHE';
  dateDebut: string;
  dateFin: string;
  niveau: 'INFO' | 'ATTENTION' | 'URGENCE';
  statut: boolean;
  culture?: Culture;
  lu: boolean;
  dateLecture?: string;
  createdAt: string;
}

export interface CategorieForum {
  id: number;
  nom: string;
  description: string;
  icone: string;
}

export interface QuestionForum {
  id: number;
  titre: string;
  contenu: string;
  imageUrl?: string;
  statut: 'OUVERTE' | 'RESOLUE' | 'FERMEE';
  auteur: User;
  categorie: CategorieForum;
  culture?: Culture;
  reponses: ReponseForum[];
  createdAt: string;
}

export interface ReponseForum {
  id: number;
  contenu: string;
  estMeilleureReponse: boolean;
  auteur: User;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalMaraichers: number;
  totalExperts: number;
  totalExpertsEnAttente: number;
  totalExploitations: number;
  totalFormations: number;
  totalAlertesActives: number;
  totalQuestionsForum: number;
  totalQuestionsResolues: number;
}
package sn.casaagrischool.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.entity.*;
import sn.casaagrischool.api.entity.Module;
import sn.casaagrischool.api.entity.enums.*;
import sn.casaagrischool.api.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProfilExpertRepository profilExpertRepository;
    private final CultureRepository cultureRepository;
    private final ExploitationRepository exploitationRepository;
    private final ExploitationCultureRepository exploitationCultureRepository;
    private final FormationRepository formationRepository;
    private final ModuleRepository moduleRepository;
    private final LeconRepository leconRepository;
    private final QuizRepository quizRepository;
    private final QuestionQuizRepository questionQuizRepository;
    private final ReponseQuizRepository reponseQuizRepository;
    private final AlerteRepository alerteRepository;
    private final CategorieForumRepository categorieForumRepository;
    private final QuestionForumRepository questionForumRepository;
    private final ReponseForumRepository reponseForumRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (roleRepository.count() > 0) {
            return; // Déjà initialisé
        }

        System.out.println("=== INITIALISATION DES DONNEES DE DEMONSTRATION CASA AGRISCHOOL ===");

        // 1. Rôles
        Role roleMaraicher = roleRepository.save(Role.builder().nom(ERole.ROLE_MARAICHER).description("Maraîcher / Agriculteur").build());
        Role roleExpert = roleRepository.save(Role.builder().nom(ERole.ROLE_EXPERT).description("Expert Agricole Vérifié").build());
        Role roleAdmin = roleRepository.save(Role.builder().nom(ERole.ROLE_ADMIN).description("Administrateur Système").build());

        // 2. Utilisateurs de démo
        // Admin
        User admin = User.builder()
                .nom("SOW")
                .prenom("Moustapha")
                .email("admin@agrischool.sn")
                .telephone("+221770000003")
                .motDePasse(passwordEncoder.encode("passer123"))
                .localisation("Ziguinchor")
                .actif(true)
                .points(0)
                .roles(new HashSet<>(Set.of(roleAdmin, roleMaraicher)))
                .build();
        userRepository.save(admin);

        // Expert
        User expertUser = User.builder()
                .nom("SANÉ")
                .prenom("Dr. Aminata")
                .email("expert@agrischool.sn")
                .telephone("+221770000002")
                .motDePasse(passwordEncoder.encode("passer123"))
                .localisation("Bignona / Ziguinchor")
                .actif(true)
                .points(0)
                .roles(new HashSet<>(Set.of(roleExpert)))
                .build();
        userRepository.save(expertUser);

        ProfilExpert profilExpert = ProfilExpert.builder()
                .user(expertUser)
                .specialite("Agroécologie & Protection des cultures maraîchères")
                .biographie("Ingénieure agronome avec 12 ans d'expérience en Casamance, consultante technique auprès de l'ISRA et des coopératives maraîchères locales.")
                .organisme("ISRA / Direction Régionale Développement Rural (DRDR)")
                .estVerifie(true)
                .dateVerification(LocalDateTime.now().minusMonths(3))
                .build();
        profilExpertRepository.save(profilExpert);
        expertUser.setProfilExpert(profilExpert);

        // Maraîcher
        User maraicher = User.builder()
                .nom("DIATTA")
                .prenom("Ousmane")
                .email("maraicher@agrischool.sn")
                .telephone("+221770000001")
                .motDePasse(passwordEncoder.encode("passer123"))
                .localisation("Ziguinchor (Commune de Nyassia)")
                .actif(true)
                .points(0)
                .roles(new HashSet<>(Set.of(roleMaraicher)))
                .build();
        userRepository.save(maraicher);

        // 3. Cultures prioritaires de Casamance
        Culture tomate = cultureRepository.save(Culture.builder()
                .nom("Tomate")
                .description("Culture maraîchère à haute valeur ajoutée, très prisée sur les marchés de Ziguinchor et Dakar. Nécessite une attention particulière sur la pépinière et l'irrigation.")
                .imageUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80")
                .actif(true)
                .build());

        Culture piment = cultureRepository.save(Culture.builder()
                .nom("Piment de Casamance")
                .description("Piment local très aromatique et piquant, adapté au climat chaud et humide de la région avec un excellent rendement économique.")
                .imageUrl("https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80")
                .actif(true)
                .build());

        Culture oignon = cultureRepository.save(Culture.builder()
                .nom("Oignon Violet de Galmi")
                .description("Variété bien adaptée aux saisons sèches et fraîches, forte demande locale et très bonne conservation post-récolte.")
                .imageUrl("https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80")
                .actif(true)
                .build());

        Culture gombo = cultureRepository.save(Culture.builder()
                .nom("Gombo")
                .description("Culture rustique et productive, essentielle dans l'alimentation locale et résistante aux périodes sèches.")
                .imageUrl("https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80")
                .actif(true)
                .build());

        // 4. Exploitation pour le maraîcher
        Exploitation exploitation = exploitationRepository.save(Exploitation.builder()
                .nom("Ferme Maraîchère Diatta & Fils")
                .superficie(2.5)
                .uniteSuperficie("ha")
                .localisation("Nyassia, Région de Ziguinchor")
                .description("Parcelle familiale avec accès à un puits maraîcher et système d'irrigation goutte-à-goutte.")
                .user(maraicher)
                .build());

        exploitationCultureRepository.save(ExploitationCulture.builder()
                .exploitation(exploitation)
                .culture(tomate)
                .dateDebut(LocalDate.now().minusDays(20))
                .dateFinPrevue(LocalDate.now().plusDays(70))
                .superficieCultivee(1.2)
                .statut(StatutCulture.EN_COURS)
                .build());

        exploitationCultureRepository.save(ExploitationCulture.builder()
                .exploitation(exploitation)
                .culture(piment)
                .dateDebut(LocalDate.now().minusDays(45))
                .dateFinPrevue(LocalDate.now().plusDays(40))
                .superficieCultivee(0.8)
                .statut(StatutCulture.EN_COURS)
                .build());

        // 5. Formations complètes
        // Formation 1: Tomate
        Formation fTomate = formationRepository.save(Formation.builder()
                .titre("Itinéraire technique complet de la Tomate en Casamance")
                .description("Apprenez à réussir votre culture de tomate de la pépinière jusqu'à la récolte, avec des techniques préventives contre le flétrissement bactérien.")
                .niveau(NiveauFormation.DEBUTANT)
                .imageUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80")
                .statut(StatutContenu.PUBLIE)
                .culture(tomate)
                .createur(expertUser)
                .build());

        Module mod1 = moduleRepository.save(Module.builder()
                .titre("Module 1 : Réussite de la pépinière et préparation du sol")
                .description("Les bases incontournables pour obtenir des plants vigoureux et sains.")
                .ordre(1)
                .formation(fTomate)
                .build());

        Lecon lec1 = leconRepository.save(Lecon.builder()
                .titre("Choix des semences certifiées et confection des planches")
                .contenu("### 1. Importance du choix variétal\nEn Casamance, le choix de semences certifiées et tolérantes au flétrissement bactérien (variétés type Mongal F1 ou Nadira F1) est indispensable.\n\n### 2. Préparation du substrat de pépinière\n- Utilisez un mélange tamisé de terre franche (2/3) et de compost bien décomposé (1/3).\n- Évitez les sols ayant récemment porté des solanacées (piment, aubergine, pomme de terre).\n\n### 3. Semis et ombrage\nSemez en lignes distantes de 10 cm, à 1 cm de profondeur. Arrosez délicatement matin et soir.")
                .typeContenu(TypeContenu.TEXTE)
                .ordre(1)
                .dureeEstimee(8)
                .fichierJointUrl("https://www.fao.org/3/i3246f/i3246f.pdf")
                .fichierJointNom("Guide_Technique_Pepiniere_Tomate_Casamance.pdf")
                .module(mod1)
                .build());

        // Quiz Leçon 1 Tomate (Option A : un quiz systématique par leçon)
        Quiz quizLec1 = quizRepository.save(Quiz.builder()
                .titre("Quiz : Choix des semences et pépinière")
                .dureeMinutes(5)
                .scoreMinimum(70)
                .lecon(lec1)
                .build());

        QuestionQuiz qLec1_1 = questionQuizRepository.save(QuestionQuiz.builder()
                .enonce("Quelles variétés de tomate sont recommandées en Casamance contre le flétrissement bactérien ?")
                .ordre(1)
                .points(10)
                .quiz(quizLec1)
                .build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Les variétés tolérantes comme Mongal F1 ou Nadira F1").estCorrecte(true).ordre(1).questionQuiz(qLec1_1).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("N'importe quelle variété sans certification").estCorrecte(false).ordre(2).questionQuiz(qLec1_1).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Les semences de pomme de terre").estCorrecte(false).ordre(3).questionQuiz(qLec1_1).build());

        QuestionQuiz qLec1_2 = questionQuizRepository.save(QuestionQuiz.builder()
                .enonce("Quelle est la proportion idéale du substrat pour la pépinière ?")
                .ordre(2)
                .points(10)
                .quiz(quizLec1)
                .build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("2/3 de terre franche et 1/3 de compost bien décomposé").estCorrecte(true).ordre(1).questionQuiz(qLec1_2).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("100% de sable marin salé").estCorrecte(false).ordre(2).questionQuiz(qLec1_2).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Terre argileuse compacte sans aération").estCorrecte(false).ordre(3).questionQuiz(qLec1_2).build());

        Lecon lec2 = leconRepository.save(Lecon.builder()
                .titre("Repiquage, espacement et tuteurage")
                .contenu("### 1. Stade idéal de repiquage\nLe repiquage s'effectue 25 à 30 jours après semis, lorsque les plants ont 4 à 5 vraies feuilles et un diamètre au collet vigoureux.\n\n### 2. Densité et espacement\n- Écartement entre les lignes : 80 cm à 1 mètre.\n- Écartement entre les plants : 40 à 50 cm.\n- Repiquer de préférence en fin d'après-midi pour limiter le stress hydrique.\n\n### 3. Tuteurage\nPoser les tuteurs en bambou local ou piquets 2 semaines après repiquage pour faciliter l'aération et limiter le contact des fruits avec le sol.")
                .typeContenu(TypeContenu.TEXTE)
                .ordre(2)
                .dureeEstimee(12)
                .fichierJointUrl("https://www.fao.org/3/i3246f/i3246f.pdf")
                .fichierJointNom("Fiche_Repiquage_et_Tuteurage_Tomate.pdf")
                .module(mod1)
                .build());

        // Quiz chronométré rattaché à la Leçon 2
        Quiz quizTomate = quizRepository.save(Quiz.builder()
                .titre("Quiz d'évaluation : Pépinière & Repiquage de la Tomate")
                .dureeMinutes(5)
                .scoreMinimum(70)
                .lecon(lec2)
                .build());

        QuestionQuiz q1 = questionQuizRepository.save(QuestionQuiz.builder()
                .enonce("Quel est le moment idéal de la journée pour effectuer le repiquage de la tomate ?")
                .ordre(1)
                .points(10)
                .quiz(quizTomate)
                .build());

        reponseQuizRepository.save(ReponseQuiz.builder().texte("En plein milieu de journée sous un fort ensoleillement").estCorrecte(false).ordre(1).questionQuiz(q1).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("En fin d'après-midi pour réduire le stress hydrique et la transpiration").estCorrecte(true).ordre(2).questionQuiz(q1).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Uniquement la nuit sous la pluie").estCorrecte(false).ordre(3).questionQuiz(q1).build());

        QuestionQuiz q2 = questionQuizRepository.save(QuestionQuiz.builder()
                .enonce("Pourquoi est-il crucial de tuteurer les plants de tomate en Casamance ?")
                .ordre(2)
                .points(10)
                .quiz(quizTomate)
                .build());

        reponseQuizRepository.save(ReponseQuiz.builder().texte("Pour aérer la végétation et éviter la pourriture des fruits au contact du sol").estCorrecte(true).ordre(1).questionQuiz(q2).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Pour attirer les papillons ravageurs").estCorrecte(false).ordre(2).questionQuiz(q2).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Le tuteurage n'a aucune utilité agronomique").estCorrecte(false).ordre(3).questionQuiz(q2).build());

        // Formation 2: Piment
        Formation fPiment = formationRepository.save(Formation.builder()
                .titre("Conduite agroécologique du Piment de Casamance")
                .description("Optimisez la productivité et la saveur du piment tout en luttant naturellement contre les pucerons et l'oïdium.")
                .niveau(NiveauFormation.INTERMEDIAIRE)
                .imageUrl("https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80")
                .statut(StatutContenu.PUBLIE)
                .culture(piment)
                .createur(expertUser)
                .build());

        Module modPiment1 = moduleRepository.save(Module.builder()
                .titre("Module 1 : Fertilisation organique et lutte intégrée")
                .description("Techniques pour maximiser le calibre et préserver l'équilibre du sol.")
                .ordre(1)
                .formation(fPiment)
                .build());

        Lecon lecPiment1 = leconRepository.save(Lecon.builder()
                .titre("Préparation du purin de neem et paillage organique")
                .contenu("### 1. Utilisation du Neem local\nLe purin de graines ou feuilles de neem broyées est un répulsif naturel puissant contre les acariens et les thrips.\n\n### 2. Le paillage (Mulch)\nLe paillage avec de la paille de riz ou d'arachide permet de conserver l'humidité et d'abaisser la température du sol de 4 à 5°C.")
                .typeContenu(TypeContenu.TEXTE)
                .ordre(1)
                .dureeEstimee(10)
                .module(modPiment1)
                .build());

        // Quiz Leçon 1 Piment
        Quiz quizPiment1 = quizRepository.save(Quiz.builder()
                .titre("Quiz : Purin de neem et paillage organique")
                .dureeMinutes(5)
                .scoreMinimum(70)
                .lecon(lecPiment1)
                .build());

        QuestionQuiz qPiment1 = questionQuizRepository.save(QuestionQuiz.builder()
                .enonce("Quel est le rôle principal du purin de neem en maraîchage ?")
                .ordre(1)
                .points(10)
                .quiz(quizPiment1)
                .build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Répulsif et insecticide naturel contre thrips et acariens").estCorrecte(true).ordre(1).questionQuiz(qPiment1).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Désherbant chimique total").estCorrecte(false).ordre(2).questionQuiz(qPiment1).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Colorant pour les fruits").estCorrecte(false).ordre(3).questionQuiz(qPiment1).build());

        QuestionQuiz qPiment2 = questionQuizRepository.save(QuestionQuiz.builder()
                .enonce("De combien de degrés le paillage organique peut-il abaisser la température du sol ?")
                .ordre(2)
                .points(10)
                .quiz(quizPiment1)
                .build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("De 4 à 5°C en conservant l'humidité").estCorrecte(true).ordre(1).questionQuiz(qPiment2).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Il augmente la température de 20°C").estCorrecte(false).ordre(2).questionQuiz(qPiment2).build());
        reponseQuizRepository.save(ReponseQuiz.builder().texte("Le paillage n'a aucun effet thermique").estCorrecte(false).ordre(3).questionQuiz(qPiment2).build());

        // 6. Alertes Saisonnières
        alerteRepository.save(Alerte.builder()
                .titre("Alerte Flétrissement bactérien et Nématodes sur Tomate")
                .message("La chaleur associée à l'humidité résiduelle favorise le développement du flétrissement bactérien (Ralstonia solanacearum). Inspectez immédiatement vos parcelles. En cas de plants touchés, arrachez et brûlez-les en dehors de la parcelle. Ne pas enfouir.")
                .type(TypeAlerte.PARASITE)
                .dateDebut(LocalDate.now().minusDays(10))
                .dateFin(LocalDate.now().plusDays(25))
                .niveau(NiveauAlerte.URGENCE)
                .statut(true)
                .culture(tomate)
                .createur(expertUser)
                .build());

        alerteRepository.save(Alerte.builder()
                .titre("Gestion des thrips et mouches blanches sur Piment")
                .message("Multiplication observée de mouches blanches dans le secteur de Nyassia et Bignona. Risque de transmission de virus (mosaïque). Appliquer une macération d'huile de neem et savon noir tous les 5 jours.")
                .type(TypeAlerte.PARASITE)
                .dateDebut(LocalDate.now().minusDays(5))
                .dateFin(LocalDate.now().plusDays(30))
                .niveau(NiveauAlerte.ATTENTION)
                .statut(true)
                .culture(piment)
                .createur(expertUser)
                .build());

        alerteRepository.save(Alerte.builder()
                .titre("Conseil de saison : Révision des systèmes d'arrosage et paillage")
                .message("L'évapotranspiration augmente sensiblement. Paillez abondamment vos planches de culture maraîchère pour économiser jusqu'à 40% d'eau et éviter le compactage des sols.")
                .type(TypeAlerte.METEO)
                .dateDebut(LocalDate.now().minusDays(15))
                .dateFin(LocalDate.now().plusDays(45))
                .niveau(NiveauAlerte.INFO)
                .statut(true)
                .culture(null) // alerte générale
                .createur(expertUser)
                .build());

        // 7. Catégories Forum & Questions
        CategorieForum cat1 = categorieForumRepository.save(CategorieForum.builder()
                .nom("Protection des cultures & Santé des plantes")
                .description("Maladies, insectes ravageurs, traitements bio et diagnostics.")
                .icone("ShieldAlert")
                .build());

        CategorieForum cat2 = categorieForumRepository.save(CategorieForum.builder()
                .nom("Irrigation, Sols & Fertilisation")
                .description("Compostage, gestion des forages, goutte-à-goutte et fertilité.")
                .icone("Droplets")
                .build());

        CategorieForum cat3 = categorieForumRepository.save(CategorieForum.builder()
                .nom("Semences, Pépinières & Calendrier agricole")
                .description("Variétés adaptées à la Casamance, techniques de germination et calendrier de semis.")
                .icone("Sprout")
                .build());

        QuestionForum qForum1 = questionForumRepository.save(QuestionForum.builder()
                .titre("Jaunissement prématuré des feuilles inférieures de ma parcelle de tomate")
                .contenu("Bonjour à tous les collègues maraîchers. Mes plants de tomate ont 40 jours après repiquage. Depuis une semaine, les feuilles du bas jaunissent et s'enroulent vers le haut. J'arrose tous les matins au pied. Quelqu'un a-t-il déjà rencontré ce problème et que faire ?")
                .statut(StatutQuestion.RESOLUE)
                .auteur(maraicher)
                .categorie(cat1)
                .culture(tomate)
                .build());

        reponseForumRepository.save(ReponseForum.builder()
                .question(qForum1)
                .auteur(expertUser)
                .contenu("Bonjour Ousmane. D'après vos observations, il s'agit très probablement d'une asphyxie racinaire liée à un arrosage excessif ou d'une carence en azote amplifiée par le lessivage. Espacer les arrosages à un arrosage tous les 2 jours en profondeur plutôt que tous les matins en surface, et effectuez un apport de purin d'ortie ou compost bien décomposé au collet.")
                .estMeilleureReponse(true)
                .build());

        System.out.println("=== DONNEES DE DEMONSTRATION INITIALISEES AVEC SUCCES ===");
    }
}
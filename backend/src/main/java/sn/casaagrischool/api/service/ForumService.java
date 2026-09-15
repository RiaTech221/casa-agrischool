package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.dto.MessageResponse;
import sn.casaagrischool.api.dto.QuestionForumCreateDto;
import sn.casaagrischool.api.dto.ReponseForumCreateDto;
import sn.casaagrischool.api.entity.*;
import sn.casaagrischool.api.entity.enums.StatutQuestion;
import org.springframework.security.access.AccessDeniedException;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.*;
import sn.casaagrischool.api.security.services.UserDetailsImpl;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final CategorieForumRepository categorieRepository;
    private final QuestionForumRepository questionRepository;
    private final ReponseForumRepository reponseRepository;
    private final CultureRepository cultureRepository;
    private final UserRepository userRepository;

    public List<CategorieForum> getAllCategories() {
        return categorieRepository.findAll();
    }

    public List<QuestionForum> getQuestions(Long categorieId, Long cultureId, String search, String sort) {
        if (search != null && !search.trim().isEmpty()) {
            return questionRepository.searchByQuery(search.trim());
        }
        if ("votes".equalsIgnoreCase(sort)) {
            return questionRepository.findAllByOrderByVotesDescCreatedAtDesc();
        }
        if ("unresolved".equalsIgnoreCase(sort)) {
            return questionRepository.findByStatutOrderByCreatedAtDesc(StatutQuestion.OUVERTE);
        }
        if (categorieId != null) {
            return questionRepository.findByCategorieIdOrderByCreatedAtDesc(categorieId);
        }
        if (cultureId != null) {
            return questionRepository.findByCultureIdOrderByCreatedAtDesc(cultureId);
        }
        return questionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public QuestionForum getQuestionById(Long id) {
        QuestionForum question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable avec l'ID: " + id));
        // Incrémentation des vues
        question.setVues(question.getVues() + 1);
        return questionRepository.save(question);
    }

    @Transactional
    public QuestionForum createQuestion(QuestionForumCreateDto dto, UserDetailsImpl userDetails) {
        User auteur = null;
        String auteurNom = dto.getAuteurNom();

        if (userDetails != null && userDetails.getId() != null) {
            auteur = userRepository.findById(userDetails.getId()).orElse(null);
            if (auteur != null) {
                auteurNom = auteur.getPrenom() + " " + auteur.getNom();
            }
        }

        if (auteurNom == null || auteurNom.trim().isEmpty()) {
            auteurNom = "Maraîcher Anonyme";
        }

        CategorieForum categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));

        Culture culture = null;
        if (dto.getCultureId() != null) {
            culture = cultureRepository.findById(dto.getCultureId()).orElse(null);
        }

        QuestionForum question = QuestionForum.builder()
                .titre(dto.getTitre())
                .contenu(dto.getContenu())
                .imageUrl(dto.getImageUrl())
                .auteurNom(auteurNom)
                .tags(dto.getTags())
                .votes(0)
                .vues(0)
                .statut(StatutQuestion.OUVERTE)
                .auteur(auteur)
                .categorie(categorie)
                .culture(culture)
                .build();

        return questionRepository.save(question);
    }

    @Transactional
    public ReponseForum addAnswer(Long questionId, ReponseForumCreateDto dto, UserDetailsImpl userDetails) {
        QuestionForum question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable avec l'ID: " + questionId));

        User auteur = null;
        String auteurNom = dto.getAuteurNom();

        if (userDetails != null && userDetails.getId() != null) {
            auteur = userRepository.findById(userDetails.getId()).orElse(null);
            if (auteur != null) {
                auteurNom = auteur.getPrenom() + " " + auteur.getNom();
                // Gamification : +10 points pour participation au forum si connecté
                auteur.setPoints(auteur.getPoints() + 10);
                userRepository.save(auteur);
            }
        }

        if (auteurNom == null || auteurNom.trim().isEmpty()) {
            auteurNom = "Invité";
        }

        ReponseForum reponse = ReponseForum.builder()
                .question(question)
                .auteur(auteur)
                .auteurNom(auteurNom)
                .contenu(dto.getContenu())
                .votes(0)
                .estMeilleureReponse(false)
                .build();

        return reponseRepository.save(reponse);
    }

    @Transactional
    public MessageResponse voteQuestion(Long questionId, int value) {
        QuestionForum question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable"));
        int delta = value > 0 ? 1 : -1;
        question.setVotes(question.getVotes() + delta);
        questionRepository.save(question);
        return new MessageResponse("Vote enregistré");
    }

    @Transactional
    public MessageResponse voteReponse(Long reponseId, int value, UserDetailsImpl userDetails) {
        ReponseForum reponse = reponseRepository.findById(reponseId)
                .orElseThrow(() -> new ResourceNotFoundException("Réponse introuvable"));

        if (userDetails != null && reponse.getAuteur() != null && reponse.getAuteur().getId().equals(userDetails.getId())) {
            throw new AccessDeniedException("L'auteur d'une réponse ne peut pas voter pour sa propre réponse !");
        }

        int stars = value;
        if (stars < 1) stars = 1;
        if (stars > 5) stars = 5;

        int currentTotal = reponse.getTotalVotes() != null ? reponse.getTotalVotes() : 0;
        double currentNote = reponse.getNoteMoyenne() != null ? reponse.getNoteMoyenne() : 0.0;

        double newNote = ((currentNote * currentTotal) + stars) / (currentTotal + 1);
        reponse.setTotalVotes(currentTotal + 1);
        reponse.setNoteMoyenne(Math.round(newNote * 10.0) / 10.0);
        reponse.setEtoiles(stars);
        reponse.setVotes((reponse.getVotes() != null ? reponse.getVotes() : 0) + 1);

        reponseRepository.save(reponse);
        return new MessageResponse("Vote de " + stars + " étoile(s) enregistré avec succès !");
    }

    @Transactional
    public MessageResponse markBestAnswer(Long reponseId, UserDetailsImpl userDetails) {
        ReponseForum reponse = reponseRepository.findById(reponseId)
                .orElseThrow(() -> new ResourceNotFoundException("Réponse introuvable"));

        QuestionForum question = reponse.getQuestion();

        boolean isAuteur = question.getAuteur() != null && userDetails != null &&
                question.getAuteur().getId().equals(userDetails.getId());
        boolean isPrivileged = userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EXPERT"));

        if (!isAuteur && !isPrivileged) {
            // Si la question n'a pas d'auteur connecté, un expert ou admin peut marquer la meilleure réponse
            throw new AccessDeniedException("Seul l'auteur de la question ou un expert peut marquer la meilleure réponse");
        }

        // Réinitialiser les autres réponses de la question
        List<ReponseForum> reponses = reponseRepository.findByQuestionIdOrderByVotesDescCreatedAtAsc(question.getId());
        for (ReponseForum r : reponses) {
            r.setEstMeilleureReponse(r.getId().equals(reponseId));
            reponseRepository.save(r);
        }

        question.setStatut(StatutQuestion.RESOLUE);
        questionRepository.save(question);

        return new MessageResponse("Meilleure réponse désignée avec succès");
    }

    @Transactional
    public void deleteQuestion(Long id, UserDetailsImpl userDetails) {
        QuestionForum question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable"));

        boolean isAuteur = question.getAuteur() != null && userDetails != null &&
                question.getAuteur().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAuteur && !isAdmin) {
            throw new AccessDeniedException("Action non autorisée");
        }

        questionRepository.delete(question);
    }
}
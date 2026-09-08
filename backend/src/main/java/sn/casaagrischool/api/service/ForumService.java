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

    public List<QuestionForum> getQuestions(Long categorieId, Long cultureId, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return questionRepository.searchByQuery(search.trim());
        }
        if (categorieId != null) {
            return questionRepository.findByCategorieIdOrderByCreatedAtDesc(categorieId);
        }
        if (cultureId != null) {
            return questionRepository.findByCultureIdOrderByCreatedAtDesc(cultureId);
        }
        return questionRepository.findAllByOrderByCreatedAtDesc();
    }

    public QuestionForum getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable avec l'ID: " + id));
    }

    @Transactional
    public QuestionForum createQuestion(QuestionForumCreateDto dto, UserDetailsImpl userDetails) {
        User auteur = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

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
                .statut(StatutQuestion.OUVERTE)
                .auteur(auteur)
                .categorie(categorie)
                .culture(culture)
                .build();

        return questionRepository.save(question);
    }

    @Transactional
    public ReponseForum addAnswer(Long questionId, ReponseForumCreateDto dto, UserDetailsImpl userDetails) {
        // Un maraîcher ne peut pas répondre
        boolean isMaraicher = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MARAICHER"));
        if (isMaraicher && userDetails.getAuthorities().size() == 1) { // Vérifie qu'il n'est que maraîcher
             throw new AccessDeniedException("Les maraîchers ne sont pas autorisés à répondre aux questions du forum. Seuls les experts le peuvent.");
        }
        
        QuestionForum question = getQuestionById(questionId);
        User auteur = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        ReponseForum reponse = ReponseForum.builder()
                .question(question)
                .auteur(auteur)
                .contenu(dto.getContenu())
                .estMeilleureReponse(false)
                .build();

        ReponseForum saved = reponseRepository.save(reponse);

        // Gamification : +10 points pour participation au forum
        auteur.setPoints(auteur.getPoints() + 10);
        userRepository.save(auteur);

        return saved;
    }

    @Transactional
    public MessageResponse markBestAnswer(Long reponseId, UserDetailsImpl userDetails) {
        ReponseForum reponse = reponseRepository.findById(reponseId)
                .orElseThrow(() -> new ResourceNotFoundException("Réponse introuvable"));

        QuestionForum question = reponse.getQuestion();

        // Seul l'auteur de la question ou un admin peut valider la meilleure réponse
        boolean isAuteur = question.getAuteur().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAuteur && !isAdmin) {
            throw new AccessDeniedException("Seul l'auteur de la question peut marquer la meilleure réponse");
        }

        // Réinitialiser les autres réponses de la question
        List<ReponseForum> reponses = reponseRepository.findByQuestionIdOrderByCreatedAtAsc(question.getId());
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
        QuestionForum question = getQuestionById(id);
        boolean isAuteur = question.getAuteur().getId().equals(userDetails.getId());
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAuteur && !isAdmin) {
            throw new AccessDeniedException("Action non autorisée");
        }

        questionRepository.delete(question);
    }
}
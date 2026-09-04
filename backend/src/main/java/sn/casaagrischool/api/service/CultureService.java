package sn.casaagrischool.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.entity.Culture;
import sn.casaagrischool.api.exception.BadRequestException;
import sn.casaagrischool.api.exception.ResourceNotFoundException;
import sn.casaagrischool.api.repository.CultureRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CultureService {

    private final CultureRepository cultureRepository;

    public List<Culture> getAllActiveCultures() {
        return cultureRepository.findByActifTrue();
    }

    public List<Culture> getAllCultures() {
        return cultureRepository.findAll();
    }

    public Culture getCultureById(Long id) {
        return cultureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Culture non trouvée avec l'identifiant: " + id));
    }

    @Transactional
    public Culture createCulture(Culture culture) {
        if (cultureRepository.findByNomIgnoreCase(culture.getNom()).isPresent()) {
            throw new BadRequestException("Une culture avec le nom '" + culture.getNom() + "' existe déjà.");
        }
        return cultureRepository.save(culture);
    }

    @Transactional
    public Culture updateCulture(Long id, Culture updated) {
        Culture culture = getCultureById(id);
        culture.setNom(updated.getNom());
        culture.setDescription(updated.getDescription());
        culture.setImageUrl(updated.getImageUrl());
        culture.setActif(updated.isActif());
        return cultureRepository.save(culture);
    }
}
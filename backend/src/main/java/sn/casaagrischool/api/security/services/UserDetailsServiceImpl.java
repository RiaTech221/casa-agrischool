package sn.casaagrischool.api.security.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.casaagrischool.api.entity.User;
import sn.casaagrischool.api.repository.UserRepository;
import sn.casaagrischool.api.util.PhoneUtils;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Rechercher par email ou par téléphone
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByTelephone(PhoneUtils.normalize(username)))
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable avec l'identifiant : " + username));

        return UserDetailsImpl.build(user);
    }
}
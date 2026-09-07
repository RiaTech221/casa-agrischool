package sn.casaagrischool.api.security.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;

    // Map: IP or Username -> (Attempts, LastAttemptTime)
    private final ConcurrentHashMap<String, AttemptRecord> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
    }

    public void loginFailed(String key) {
        cleanExpiredEntries(); // Prevent memory leak

        AttemptRecord record = attemptsCache.getOrDefault(key, new AttemptRecord(0, LocalDateTime.now()));
        if (!isBlocked(key)) {
            record.attempts++;
            record.lastAttempt = LocalDateTime.now();
            attemptsCache.put(key, record);
        }
    }

    public boolean isBlocked(String key) {
        AttemptRecord record = attemptsCache.get(key);
        if (record == null) {
            return false;
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            if (record.lastAttempt.plusMinutes(BLOCK_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
                // Block duration expired
                attemptsCache.remove(key);
                return false;
            }
            return true; // Still blocked
        }
        return false;
    }

    // Prevents infinite memory growth
    private void cleanExpiredEntries() {
        if (attemptsCache.size() > 1000) { // arbitrary threshold to trigger cleanup
            Iterator<Map.Entry<String, AttemptRecord>> iterator = attemptsCache.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry<String, AttemptRecord> entry = iterator.next();
                if (entry.getValue().lastAttempt.plusMinutes(BLOCK_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
                    iterator.remove();
                }
            }
        }
    }

    private static class AttemptRecord {
        int attempts;
        LocalDateTime lastAttempt;

        AttemptRecord(int attempts, LocalDateTime lastAttempt) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
        }
    }
}

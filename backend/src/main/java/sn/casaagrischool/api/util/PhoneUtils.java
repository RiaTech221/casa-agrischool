package sn.casaagrischool.api.util;

public class PhoneUtils {

    public static String normalize(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return phone;
        }
        
        // Remove spaces and non-breaking spaces
        String normalized = phone.replaceAll("\\s+", "").trim();
        
        // Convert local format (e.g., 771234567, 78900087) to +221 format
        if (normalized.length() == 9 && (normalized.startsWith("7") || normalized.startsWith("3"))) {
            return "+221" + normalized;
        }
        
        // Convert 00221 format to +221 format
        if (normalized.startsWith("00221")) {
            return "+221" + normalized.substring(5);
        }
        
        // Ensure +221 prefix is standard
        if (normalized.startsWith("221") && normalized.length() == 12) {
            return "+" + normalized;
        }

        return normalized;
    }
}

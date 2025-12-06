package com.echoproject.echo.user.domain;

public record UserRegistration(String username, String password) {

    public ValidationResult validate() {
        if (username == null || username.isBlank()) {
            return ValidationResult.invalid("Username is required");
        }

        if (username.length() < 3) {
            return ValidationResult.invalid("Username must be at least 3 characters");
        }

        if (username.length() > 50) {
            return ValidationResult.invalid("Username must not exceed 50 characters");
        }

        if (password == null || password.isBlank()) {
            return ValidationResult.invalid("Password is required");
        }

        if (password.length() < 6) {
            return ValidationResult.invalid("Password must be at least 6 characters");
        }

        return ValidationResult.valid();
    }

    public record ValidationResult(boolean isValid, String errorMessage) {
        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult invalid(String errorMessage) {
            return new ValidationResult(false, errorMessage);
        }
    }
}

package com.echoproject.echo.user.domain;

public record UserLogin(String username, String password) {

    public ValidationResult validate() {
        if (username == null || username.isBlank()) {
            return ValidationResult.invalid("Username is required");
        }

        if (password == null || password.isBlank()) {
            return ValidationResult.invalid("Password is required");
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

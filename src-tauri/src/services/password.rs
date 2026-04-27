use anyhow::Result;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use crate::models::dto::PasswordStrength;
use password_hash::SaltString;
use rand_core::{OsRng, RngCore};

pub struct PasswordService;

impl PasswordService {
    pub fn hash(password: &str) -> Result<String> {
        let salt = SaltString::generate(&mut OsRng);
        let hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)?
            .to_string();
        Ok(hash)
    }

    pub fn verify(password: &str, password_hash: &str) -> bool {
        let Ok(parsed_hash) = PasswordHash::new(password_hash) else {
            return false;
        };

        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    }

    pub fn strength(password: &str) -> PasswordStrength {
        let mut messages = Vec::new();
        let mut score = 0;
        if password.len() >= 8 {
            score += 1;
        } else {
            messages.push("至少 8 位".to_string());
        }
        if password.chars().any(char::is_uppercase) {
            score += 1;
        } else {
            messages.push("包含大写字母".to_string());
        }
        if password.chars().any(char::is_lowercase) {
            score += 1;
        } else {
            messages.push("包含小写字母".to_string());
        }
        if password.chars().any(|value| value.is_ascii_digit()) {
            score += 1;
        } else {
            messages.push("包含数字".to_string());
        }
        if password.chars().any(|value| !value.is_alphanumeric()) {
            score += 1;
        } else {
            messages.push("包含符号".to_string());
        }

        PasswordStrength {
            score,
            passed: score >= 4,
            messages,
        }
    }

    pub fn recovery_code() -> String {
        let mut bytes = [0_u8; 12];
        OsRng.fill_bytes(&mut bytes);
        bytes
            .chunks(3)
            .map(|chunk| {
                chunk
                    .iter()
                    .map(|byte| format!("{byte:02X}"))
                    .collect::<String>()
            })
            .collect::<Vec<_>>()
            .join("-")
    }
}

#[cfg(test)]
mod tests {
    use super::PasswordService;

    #[test]
    fn verifies_hashed_password() {
        let hash = PasswordService::hash("secret").expect("hash password");
        assert!(PasswordService::verify("secret", &hash));
        assert!(!PasswordService::verify("wrong", &hash));
    }

    #[test]
    fn validates_password_strength() {
        assert!(PasswordService::strength("Strong-123").passed);
        assert!(!PasswordService::strength("123456").passed);
    }
}

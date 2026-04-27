use anyhow::Result;
use sqlx::SqlitePool;

use crate::{
    models::dto::{
        AppSettings, PasswordActionResult, PasswordStatus, SetupPasswordResult, StoredSettings,
    },
    repositories::settings::SettingsRepository,
    services::password::PasswordService,
};

pub struct SettingsService;

impl SettingsService {
    pub async fn get_or_create(pool: &SqlitePool) -> Result<StoredSettings> {
        if let Some(mut settings) = SettingsRepository::get(pool).await? {
            settings.app.password_set = settings.password_hash.is_some();
            if settings
                .password_hash
                .as_deref()
                .is_some_and(|hash| PasswordService::verify(crate::config::DEFAULT_PASSWORD, hash))
            {
                settings.app.password_migration_required = true;
            }
            return Ok(settings);
        }

        let stored = StoredSettings {
            app: AppSettings::default(),
            password_hash: None,
            recovery_code_hash: None,
        };
        SettingsRepository::save(pool, &stored).await?;
        Ok(stored)
    }

    pub async fn save_app_settings(pool: &SqlitePool, app: AppSettings) -> Result<AppSettings> {
        let mut stored = Self::get_or_create(pool).await?;
        stored.app = app;
        SettingsRepository::save(pool, &stored).await?;
        Ok(stored.app)
    }

    pub async fn password_status(pool: &SqlitePool) -> Result<PasswordStatus> {
        let stored = Self::get_or_create(pool).await?;
        Ok(Self::status_from_stored(&stored))
    }

    pub async fn setup_password(pool: &SqlitePool, password: String) -> Result<SetupPasswordResult> {
        let mut stored = Self::get_or_create(pool).await?;
        let strength = PasswordService::strength(&password);
        if !strength.passed {
            anyhow::bail!("密码强度不足：{}", strength.messages.join("、"));
        }

        let recovery_code = PasswordService::recovery_code();
        stored.password_hash = Some(PasswordService::hash(&password)?);
        stored.recovery_code_hash = Some(PasswordService::hash(&recovery_code)?);
        stored.app.password_set = true;
        stored.app.password_migration_required = false;
        SettingsRepository::save(pool, &stored).await?;

        Ok(SetupPasswordResult {
            status: Self::status_from_stored(&stored),
            recovery_code,
        })
    }

    pub async fn change_password(
        pool: &SqlitePool,
        old_password: String,
        new_password: String,
    ) -> Result<PasswordActionResult> {
        let mut stored = Self::get_or_create(pool).await?;
        let valid = stored
            .password_hash
            .as_deref()
            .is_some_and(|hash| PasswordService::verify(&old_password, hash));
        if !valid {
            return Ok(PasswordActionResult {
                success: false,
                message: "原密码错误".to_string(),
                strength: None,
            });
        }

        let strength = PasswordService::strength(&new_password);
        if !strength.passed {
            return Ok(PasswordActionResult {
                success: false,
                message: "新密码强度不足".to_string(),
                strength: Some(strength),
            });
        }

        stored.password_hash = Some(PasswordService::hash(&new_password)?);
        stored.app.password_migration_required = false;
        SettingsRepository::save(pool, &stored).await?;
        Ok(PasswordActionResult {
            success: true,
            message: "密码已更新".to_string(),
            strength: Some(strength),
        })
    }

    pub async fn reset_password_with_recovery_code(
        pool: &SqlitePool,
        recovery_code: String,
        new_password: String,
    ) -> Result<SetupPasswordResult> {
        let stored = Self::get_or_create(pool).await?;
        let valid = stored
            .recovery_code_hash
            .as_deref()
            .is_some_and(|hash| PasswordService::verify(&recovery_code, hash));
        if !valid {
            anyhow::bail!("恢复码无效");
        }
        Self::setup_password(pool, new_password).await
    }

    fn status_from_stored(stored: &StoredSettings) -> PasswordStatus {
        PasswordStatus {
            password_set: stored.password_hash.is_some(),
            recovery_code_set: stored.recovery_code_hash.is_some(),
            migration_required: stored.app.password_migration_required,
        }
    }
}

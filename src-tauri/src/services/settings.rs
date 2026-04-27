use anyhow::Result;
use sqlx::SqlitePool;

use crate::{
    config,
    models::dto::{AppSettings, StoredSettings},
    repositories::settings::SettingsRepository,
    services::password::PasswordService,
};

pub struct SettingsService;

impl SettingsService {
    pub async fn get_or_create(pool: &SqlitePool) -> Result<StoredSettings> {
        if let Some(settings) = SettingsRepository::get(pool).await? {
            return Ok(settings);
        }

        let stored = StoredSettings {
            app: AppSettings::default(),
            password_hash: Some(PasswordService::hash(config::DEFAULT_PASSWORD)?),
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
}

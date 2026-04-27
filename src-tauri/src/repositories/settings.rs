use anyhow::Result;
use chrono::Utc;
use sqlx::{Row, SqlitePool};

use crate::{config, models::dto::StoredSettings};

pub struct SettingsRepository;

impl SettingsRepository {
    pub async fn get(pool: &SqlitePool) -> Result<Option<StoredSettings>> {
        let row = sqlx::query("SELECT value FROM settings WHERE key = ?")
            .bind(config::SETTINGS_KEY)
            .fetch_optional(pool)
            .await?;

        row.map(|row| serde_json::from_str(row.get::<&str, _>("value")))
            .transpose()
            .map_err(Into::into)
    }

    pub async fn save(pool: &SqlitePool, settings: &StoredSettings) -> Result<()> {
        let value = serde_json::to_string(settings)?;
        sqlx::query(
            r#"
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at
            "#,
        )
        .bind(config::SETTINGS_KEY)
        .bind(value)
        .bind(Utc::now().to_rfc3339())
        .execute(pool)
        .await?;

        Ok(())
    }
}

use anyhow::Result;
use chrono::Utc;
use sqlx::{sqlite::SqliteRow, Row, SqlitePool};

use crate::models::{
    dto::{AppSettings, StoredSettings},
    vo::LockMode,
};

pub struct SettingsRepository;

fn row_to_app_settings(row: &SqliteRow) -> Result<AppSettings> {
    let mode = row.get::<String, _>("default_lock_mode");
    let default_lock_mode = serde_json::from_value::<LockMode>(serde_json::Value::String(mode))?;
    Ok(AppSettings {
        auto_start_enabled: row.get::<bool, _>("auto_start_enabled"),
        prevent_sleep_enabled: row.get::<bool, _>("prevent_sleep_enabled"),
        default_lock_mode,
        multi_display_enabled: row.get::<bool, _>("multi_display_enabled"),
        multi_display_strategy: row.get("multi_display_strategy"),
        unlock_hotkey: row.get("unlock_hotkey"),
        password_set: row.get::<bool, _>("password_set"),
        password_migration_required: row.get::<bool, _>("password_migration_required"),
        theme: row.get("theme"),
        wallpaper_path: row.get("wallpaper_path"),
        usb_key_path: row.get("usb_key_path"),
        bluetooth_device_name: row.get("bluetooth_device_name"),
    })
}

fn lock_mode_to_string(mode: &LockMode) -> Result<String> {
    Ok(serde_json::to_value(mode)?
        .as_str()
        .unwrap_or("Transparent")
        .to_string())
}

impl SettingsRepository {
    pub async fn get(pool: &SqlitePool) -> Result<Option<StoredSettings>> {
        let app_row = sqlx::query("SELECT * FROM app_settings WHERE id = 1")
            .fetch_optional(pool)
            .await?;
        let Some(app_row) = app_row else {
            return Ok(None);
        };

        let credential_row = sqlx::query("SELECT * FROM password_credentials WHERE id = 1")
            .fetch_optional(pool)
            .await?;

        Ok(Some(StoredSettings {
            app: row_to_app_settings(&app_row)?,
            password_hash: credential_row
                .as_ref()
                .and_then(|row| row.get::<Option<String>, _>("password_hash")),
            recovery_code_hash: credential_row
                .as_ref()
                .and_then(|row| row.get::<Option<String>, _>("recovery_code_hash")),
        }))
    }

    pub async fn save(pool: &SqlitePool, settings: &StoredSettings) -> Result<()> {
        let updated_at = Utc::now().to_rfc3339();
        let mode = lock_mode_to_string(&settings.app.default_lock_mode)?;
        sqlx::query(
            "INSERT INTO app_settings (
                id, auto_start_enabled, prevent_sleep_enabled, default_lock_mode,
                multi_display_enabled, multi_display_strategy, unlock_hotkey,
                password_set, password_migration_required, theme, wallpaper_path,
                usb_key_path, bluetooth_device_name, updated_at
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                auto_start_enabled = excluded.auto_start_enabled,
                prevent_sleep_enabled = excluded.prevent_sleep_enabled,
                default_lock_mode = excluded.default_lock_mode,
                multi_display_enabled = excluded.multi_display_enabled,
                multi_display_strategy = excluded.multi_display_strategy,
                unlock_hotkey = excluded.unlock_hotkey,
                password_set = excluded.password_set,
                password_migration_required = excluded.password_migration_required,
                theme = excluded.theme,
                wallpaper_path = excluded.wallpaper_path,
                usb_key_path = excluded.usb_key_path,
                bluetooth_device_name = excluded.bluetooth_device_name,
                updated_at = excluded.updated_at",
        )
        .bind(settings.app.auto_start_enabled)
        .bind(settings.app.prevent_sleep_enabled)
        .bind(mode)
        .bind(settings.app.multi_display_enabled)
        .bind(&settings.app.multi_display_strategy)
        .bind(&settings.app.unlock_hotkey)
        .bind(settings.password_hash.is_some())
        .bind(settings.app.password_migration_required)
        .bind(&settings.app.theme)
        .bind(&settings.app.wallpaper_path)
        .bind(&settings.app.usb_key_path)
        .bind(&settings.app.bluetooth_device_name)
        .bind(&updated_at)
        .execute(pool)
        .await?;

        sqlx::query(
            "INSERT INTO password_credentials (id, password_hash, recovery_code_hash, updated_at)
            VALUES (1, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                password_hash = excluded.password_hash,
                recovery_code_hash = excluded.recovery_code_hash,
                updated_at = excluded.updated_at",
        )
        .bind(&settings.password_hash)
        .bind(&settings.recovery_code_hash)
        .bind(updated_at)
        .execute(pool)
        .await?;

        Ok(())
    }
}

use anyhow::Result;
use chrono::Utc;
use sqlx::Row;
use sqlx::SqlitePool;

use crate::{config, models::dto::StoredSettings};

pub async fn migrate(pool: &SqlitePool) -> Result<()> {
    create_settings(pool).await?;
    create_app_settings(pool).await?;
    create_password_credentials(pool).await?;
    migrate_legacy_settings(pool).await?;
    create_lock_events(pool).await?;
    create_schema_migrations(pool).await?;
    Ok(())
}

async fn create_settings(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );",
    )
    .execute(pool)
    .await?;
    Ok(())
}

async fn create_app_settings(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS app_settings (
            id INTEGER PRIMARY KEY CHECK(id = 1),
            auto_start_enabled INTEGER NOT NULL,
            prevent_sleep_enabled INTEGER NOT NULL,
            default_lock_mode TEXT NOT NULL,
            multi_display_enabled INTEGER NOT NULL,
            multi_display_strategy TEXT NOT NULL,
            unlock_hotkey TEXT NOT NULL,
            password_set INTEGER NOT NULL,
            password_migration_required INTEGER NOT NULL,
            theme TEXT NOT NULL,
            wallpaper_path TEXT,
            usb_key_path TEXT,
            bluetooth_device_name TEXT,
            updated_at TEXT NOT NULL
        );",
    )
    .execute(pool)
    .await?;
    Ok(())
}

async fn create_password_credentials(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS password_credentials (
            id INTEGER PRIMARY KEY CHECK(id = 1),
            password_hash TEXT,
            recovery_code_hash TEXT,
            updated_at TEXT NOT NULL
        );",
    )
    .execute(pool)
    .await?;
    Ok(())
}

async fn migrate_legacy_settings(pool: &SqlitePool) -> Result<()> {
    let exists = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM app_settings")
        .fetch_one(pool)
        .await?;
    if exists > 0 {
        return Ok(());
    }

    let row = sqlx::query("SELECT value FROM settings WHERE key = ?")
        .bind(config::SETTINGS_KEY)
        .fetch_optional(pool)
        .await?;
    let Some(row) = row else {
        return Ok(());
    };
    let settings = serde_json::from_str::<StoredSettings>(row.get::<&str, _>("value"))?;
    save_legacy_settings(pool, settings).await
}

async fn save_legacy_settings(pool: &SqlitePool, settings: StoredSettings) -> Result<()> {
    let updated_at = Utc::now().to_rfc3339();
    let mode = serde_json::to_value(&settings.app.default_lock_mode)?
        .as_str()
        .unwrap_or("Transparent")
        .to_string();

    sqlx::query(
        "INSERT INTO app_settings (
            id, auto_start_enabled, prevent_sleep_enabled, default_lock_mode,
            multi_display_enabled, multi_display_strategy, unlock_hotkey,
            password_set, password_migration_required, theme, wallpaper_path,
            usb_key_path, bluetooth_device_name, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(settings.app.auto_start_enabled)
    .bind(settings.app.prevent_sleep_enabled)
    .bind(mode)
    .bind(settings.app.multi_display_enabled)
    .bind(settings.app.multi_display_strategy)
    .bind(settings.app.unlock_hotkey)
    .bind(settings.password_hash.is_some())
    .bind(settings.app.password_migration_required)
    .bind(settings.app.theme)
    .bind(settings.app.wallpaper_path)
    .bind(settings.app.usb_key_path)
    .bind(settings.app.bluetooth_device_name)
    .bind(&updated_at)
    .execute(pool)
    .await?;

    sqlx::query(
        "INSERT INTO password_credentials (id, password_hash, recovery_code_hash, updated_at)
        VALUES (1, ?, ?, ?)",
    )
    .bind(settings.password_hash)
    .bind(settings.recovery_code_hash)
    .bind(updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

async fn create_lock_events(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS lock_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            mode TEXT,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        );",
    )
    .execute(pool)
    .await?;
    Ok(())
}

async fn create_schema_migrations(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY NOT NULL,
            applied_at TEXT NOT NULL
        );",
    )
    .execute(pool)
    .await?;
    Ok(())
}

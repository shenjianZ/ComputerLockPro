use anyhow::Result;
use sqlx::SqlitePool;

pub async fn migrate(pool: &SqlitePool) -> Result<()> {
    create_settings(pool).await?;
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

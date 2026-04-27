use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{sqlite::SqliteRow, Row, SqlitePool};

use crate::models::{entity::LockEventEntity, vo::LockMode};

pub struct EventsRepository;

impl EventsRepository {
    pub async fn add(
        pool: &SqlitePool,
        event_type: &str,
        mode: Option<&LockMode>,
        message: &str,
    ) -> Result<()> {
        sqlx::query("INSERT INTO lock_events (event_type, mode, message, created_at) VALUES (?, ?, ?, ?)")
            .bind(event_type)
            .bind(mode.map(|value| format!("{value:?}")))
            .bind(message)
            .bind(Utc::now().to_rfc3339())
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn list(pool: &SqlitePool, limit: u32) -> Result<Vec<LockEventEntity>> {
        let rows = sqlx::query(
            "SELECT id, event_type, mode, message, created_at FROM lock_events ORDER BY id DESC LIMIT ?",
        )
        .bind(limit.min(200))
        .fetch_all(pool)
        .await?;

        Self::map_rows(rows)
    }

    fn map_rows(rows: Vec<SqliteRow>) -> Result<Vec<LockEventEntity>> {
        rows.into_iter()
            .map(|row| {
                let mode = match row.get::<Option<String>, _>("mode").as_deref() {
                    Some("Black") => Some(LockMode::Black),
                    Some("Transparent") => Some(LockMode::Transparent),
                    Some("Blur") => Some(LockMode::Blur),
                    Some("Wallpaper") => Some(LockMode::Wallpaper),
                    Some("Clock") => Some(LockMode::Clock),
                    _ => None,
                };
                Ok(LockEventEntity {
                    id: row.get("id"),
                    event_type: row.get("event_type"),
                    mode,
                    message: row.get("message"),
                    created_at: row.get::<String, _>("created_at").parse::<DateTime<Utc>>()?,
                })
            })
            .collect()
    }

    pub async fn list_filtered(
        pool: &SqlitePool,
        event_type: Option<String>,
        limit: u32,
    ) -> Result<Vec<LockEventEntity>> {
        if let Some(event_type) = event_type.filter(|value| !value.is_empty()) {
            let rows = sqlx::query(
                "SELECT id, event_type, mode, message, created_at FROM lock_events WHERE event_type = ? ORDER BY id DESC LIMIT ?",
            )
            .bind(event_type)
            .bind(limit.min(500))
            .fetch_all(pool)
            .await?;
            return Self::map_rows(rows);
        }

        Self::list(pool, limit).await
    }

    pub async fn clear(pool: &SqlitePool) -> Result<()> {
        sqlx::query("DELETE FROM lock_events").execute(pool).await?;
        Ok(())
    }
}

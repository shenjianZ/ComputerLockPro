use anyhow::{Context, Result};
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

use crate::{config, db::migration};

pub async fn init_database() -> Result<SqlitePool> {
    let db_path = config::database_path()?;
    let url = format!("sqlite://{}?mode=rwc", db_path.display());
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .context("无法连接 SQLite 数据库")?;

    migration::migrate(&pool).await?;
    Ok(pool)
}

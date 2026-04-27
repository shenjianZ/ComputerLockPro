use sqlx::SqlitePool;
use tokio::sync::RwLock;

use crate::models::dto::LockSession;

pub struct AppRuntimeState {
    pub db: SqlitePool,
    pub lock_session: RwLock<Option<LockSession>>,
}

impl AppRuntimeState {
    pub fn new(db: SqlitePool) -> Self {
        Self {
            db,
            lock_session: RwLock::new(None),
        }
    }
}

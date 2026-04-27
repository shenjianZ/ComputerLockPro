use serde::{Deserialize, Serialize};

use crate::models::vo::LockMode;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
    pub is_locked: bool,
    pub active_mode: Option<LockMode>,
    pub auto_start_enabled: bool,
    pub prevent_sleep_enabled: bool,
    pub database_ready: bool,
}

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::models::vo::LockMode;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LockSession {
    pub session_id: String,
    pub mode: LockMode,
    pub started_at: DateTime<Utc>,
    pub display_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnlockResult {
    pub success: bool,
    pub message: String,
}

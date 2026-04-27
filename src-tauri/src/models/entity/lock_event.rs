use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::models::vo::LockMode;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LockEventEntity {
    pub id: i64,
    pub event_type: String,
    pub mode: Option<LockMode>,
    pub message: String,
    pub created_at: DateTime<Utc>,
}

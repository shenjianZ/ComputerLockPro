use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SchemaMigrationEntity {
    pub version: i64,
    pub applied_at: DateTime<Utc>,
}

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingEntity {
    pub key: String,
    pub value: String,
    pub updated_at: DateTime<Utc>,
}

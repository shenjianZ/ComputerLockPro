use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub enum LockEventType {
    Locked,
    Unlocked,
    UnlockFailed,
}

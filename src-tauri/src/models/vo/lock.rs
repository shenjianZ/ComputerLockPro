use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub enum LockMode {
    Transparent,
    Black,
    Blur,
    Wallpaper,
    Clock,
}

impl Default for LockMode {
    fn default() -> Self {
        Self::Transparent
    }
}

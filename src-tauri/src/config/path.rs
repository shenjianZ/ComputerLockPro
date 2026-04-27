use std::path::PathBuf;

use anyhow::{Context, Result};

pub fn app_data_dir() -> Result<PathBuf> {
    let base = dirs::home_dir().context("无法定位用户家目录")?;
    let dir = base.join(".computer_lock_pro");
    std::fs::create_dir_all(&dir).context("无法创建应用数据目录")?;
    Ok(dir)
}

pub fn database_path() -> Result<PathBuf> {
    Ok(app_data_dir()?.join("computer_lock.sqlite"))
}

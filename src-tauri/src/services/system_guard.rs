use anyhow::{bail, Result};
use std::process::Command;

use crate::models::dto::SystemGuardResult;

pub struct SystemGuardService;

impl SystemGuardService {
    pub fn block_app(process_name: String) -> Result<SystemGuardResult> {
        let process_name = process_name.trim();
        if process_name.is_empty() || process_name.contains(['\\', '/', ':']) {
            bail!("请输入有效的进程名，例如 chrome.exe");
        }

        block_app_process(process_name)?;
        Ok(SystemGuardResult {
            success: true,
            message: format!("已尝试限制应用进程：{process_name}"),
        })
    }

    pub fn set_website_block(domain: String, enabled: bool) -> Result<SystemGuardResult> {
        let domain = domain.trim().trim_start_matches("https://").trim_start_matches("http://");
        if domain.is_empty() || domain.contains(['/', '\\', ' ']) {
            bail!("请输入有效域名，例如 example.com");
        }

        update_hosts_block(domain, enabled)?;
        Ok(SystemGuardResult {
            success: true,
            message: if enabled {
                format!("已写入网站限制：{domain}")
            } else {
                format!("已移除网站限制：{domain}")
            },
        })
    }

    pub fn lock_input(seconds: u32) -> Result<SystemGuardResult> {
        let seconds = seconds.clamp(3, 300);
        block_input_for(seconds)?;
        Ok(SystemGuardResult {
            success: true,
            message: format!("系统输入已锁定 {seconds} 秒"),
        })
    }

    pub fn check_usb_key(path: Option<String>) -> SystemGuardResult {
        let Some(path) = path.filter(|value| !value.trim().is_empty()) else {
            return SystemGuardResult {
                success: false,
                message: "未配置 USB Key 文件路径".to_string(),
            };
        };
        let exists = std::path::Path::new(&path).exists();
        SystemGuardResult {
            success: exists,
            message: if exists { "USB Key 已就绪" } else { "未检测到 USB Key" }.to_string(),
        }
    }

    pub fn check_bluetooth_device(device_name: Option<String>) -> Result<SystemGuardResult> {
        let Some(device_name) = device_name.filter(|value| !value.trim().is_empty()) else {
            return Ok(SystemGuardResult {
                success: false,
                message: "未配置蓝牙设备名".to_string(),
            });
        };
        let present = bluetooth_device_present(&device_name)?;
        Ok(SystemGuardResult {
            success: present,
            message: if present { "蓝牙设备在线" } else { "蓝牙设备不在线" }.to_string(),
        })
    }
}

#[cfg(target_os = "windows")]
fn block_app_process(process_name: &str) -> Result<()> {
    Command::new("taskkill")
        .args(["/F", "/IM", process_name])
        .spawn()?;
    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn block_app_process(_process_name: &str) -> Result<()> {
    Ok(())
}

#[cfg(target_os = "windows")]
fn update_hosts_block(domain: &str, enabled: bool) -> Result<()> {
    let path = std::path::Path::new(r"C:\Windows\System32\drivers\etc\hosts");
    let mut content = std::fs::read_to_string(path).unwrap_or_default();
    let line = format!("127.0.0.1 {domain} # ComputerLock Pro");
    content = content
        .lines()
        .filter(|value| *value != line)
        .collect::<Vec<_>>()
        .join("\n");
    if enabled {
        content.push('\n');
        content.push_str(&line);
        content.push('\n');
    }
    std::fs::write(path, content)?;
    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn update_hosts_block(_domain: &str, _enabled: bool) -> Result<()> {
    Ok(())
}

#[cfg(target_os = "windows")]
fn block_input_for(seconds: u32) -> Result<()> {
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::BlockInput;

    unsafe {
        BlockInput(1);
    }
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(seconds as u64));
        unsafe {
            BlockInput(0);
        }
    });
    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn block_input_for(_seconds: u32) -> Result<()> {
    Ok(())
}

#[cfg(target_os = "windows")]
fn bluetooth_device_present(device_name: &str) -> Result<bool> {
    let escaped = device_name.replace('\'', "''");
    let script = format!(
        "Get-PnpDevice -Class Bluetooth | Where-Object {{$_.FriendlyName -like '*{escaped}*' -and $_.Status -eq 'OK'}}"
    );
    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &script])
        .output()?;
    Ok(!String::from_utf8_lossy(&output.stdout).trim().is_empty())
}

#[cfg(not(target_os = "windows"))]
fn bluetooth_device_present(_device_name: &str) -> Result<bool> {
    Ok(false)
}

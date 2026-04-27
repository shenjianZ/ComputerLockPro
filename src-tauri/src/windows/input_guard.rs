use anyhow::Result;

#[cfg(target_os = "windows")]
mod platform {
    use anyhow::{anyhow, Result};
    use std::{
        mem::zeroed,
        ptr::{null, null_mut},
        sync::{mpsc, Mutex, OnceLock},
        time::Duration,
    };
    use windows_sys::Win32::{
        Foundation::{LPARAM, LRESULT, WPARAM},
        System::{LibraryLoader::GetModuleHandleW, Threading::GetCurrentThreadId},
        UI::{
            Input::KeyboardAndMouse::{
                GetAsyncKeyState, VK_CONTROL, VK_DELETE, VK_ESCAPE, VK_F4, VK_LCONTROL, VK_LMENU,
                VK_LWIN, VK_MENU, VK_RCONTROL, VK_RMENU, VK_RWIN, VK_SHIFT, VK_SNAPSHOT, VK_SPACE,
                VK_TAB,
            },
            WindowsAndMessaging::{
                CallNextHookEx, GetMessageW, PeekMessageW, PostThreadMessageW, SetWindowsHookExW,
                UnhookWindowsHookEx, KBDLLHOOKSTRUCT, LLKHF_ALTDOWN, MSG, PM_NOREMOVE,
                WH_KEYBOARD_LL, WM_KEYDOWN, WM_KEYUP, WM_QUIT, WM_SYSKEYDOWN, WM_SYSKEYUP,
            },
        },
    };

    static HOOK_THREAD: OnceLock<Mutex<Option<u32>>> = OnceLock::new();

    pub fn start() -> Result<()> {
        let mut active = HOOK_THREAD.get_or_init(|| Mutex::new(None)).lock().unwrap();
        if active.is_some() {
            return Ok(());
        }
        let (tx, rx) = mpsc::channel();
        std::thread::spawn(move || run_hook(tx));
        let thread_id = rx
            .recv_timeout(Duration::from_secs(2))
            .map_err(|_| anyhow!("锁屏快捷键拦截启动超时"))?
            .map_err(|message| anyhow!(message))?;
        *active = Some(thread_id);
        Ok(())
    }

    pub fn stop() {
        let Some(lock) = HOOK_THREAD.get() else {
            return;
        };
        let Some(thread_id) = lock.lock().unwrap().take() else {
            return;
        };
        unsafe {
            PostThreadMessageW(thread_id, WM_QUIT, 0, 0);
        }
    }

    fn run_hook(tx: mpsc::Sender<std::result::Result<u32, String>>) {
        unsafe {
            let module = GetModuleHandleW(null());
            let hook = SetWindowsHookExW(WH_KEYBOARD_LL, Some(keyboard_proc), module, 0);
            if hook.is_null() {
                let _ = tx.send(Err("无法安装锁屏快捷键拦截".to_string()));
                return;
            }
            let thread_id = GetCurrentThreadId();
            let mut msg: MSG = zeroed();
            PeekMessageW(&mut msg, null_mut(), 0, 0, PM_NOREMOVE);
            let _ = tx.send(Ok(thread_id));
            while GetMessageW(&mut msg, null_mut(), 0, 0) > 0 {}
            UnhookWindowsHookEx(hook);
        }
    }

    unsafe extern "system" fn keyboard_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code >= 0 && is_key_message(wparam) {
            let key = *(lparam as *const KBDLLHOOKSTRUCT);
            if should_block(key.vkCode, key.flags) {
                return 1;
            }
        }
        CallNextHookEx(null_mut(), code, wparam, lparam)
    }

    fn is_key_message(wparam: WPARAM) -> bool {
        matches!(
            wparam as u32,
            WM_KEYDOWN | WM_KEYUP | WM_SYSKEYDOWN | WM_SYSKEYUP
        )
    }

    fn pressed(key: u16) -> bool {
        unsafe { (GetAsyncKeyState(key as i32) as u16 & 0x8000) != 0 }
    }

    fn should_block(key: u32, flags: u32) -> bool {
        let alt = flags & LLKHF_ALTDOWN != 0
            || pressed(VK_MENU)
            || pressed(VK_LMENU)
            || pressed(VK_RMENU);
        let ctrl = pressed(VK_CONTROL) || pressed(VK_LCONTROL) || pressed(VK_RCONTROL);
        let shift = pressed(VK_SHIFT);
        key == VK_LWIN as u32
            || key == VK_RWIN as u32
            || key == VK_SNAPSHOT as u32
            || (alt
                && matches!(key, x if x == VK_TAB as u32 || x == VK_F4 as u32 || x == VK_ESCAPE as u32 || x == VK_SPACE as u32))
            || (ctrl && key == VK_ESCAPE as u32)
            || (ctrl && alt && key == VK_DELETE as u32)
            || (ctrl && shift && key == VK_ESCAPE as u32)
    }
}

#[cfg(not(target_os = "windows"))]
mod platform {
    use anyhow::Result;

    pub fn start() -> Result<()> {
        Ok(())
    }

    pub fn stop() {}
}

pub fn start_lock_keyboard_guard() -> Result<()> {
    platform::start()
}

pub fn stop_lock_keyboard_guard() {
    platform::stop();
}

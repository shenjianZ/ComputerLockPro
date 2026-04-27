# ComputerLock Pro

ComputerLock Pro 是一个基于 Tauri v2、React、TypeScript 和 Rust 的 Windows 桌面安全与专注工具。项目目标不只是透明锁屏，而是逐步扩展为集锁屏、防误触、隐私保护、专注管理和电源自动化于一体的桌面助手。

## 当前能力

- 透明锁屏、黑屏锁屏基础流程
- 独立锁屏窗口，多显示器覆盖
- 密码解锁，密码使用 Argon2 哈希存储
- 主窗口锁屏时隐藏，解锁后恢复
- 系统托盘：显示主窗口、透明锁屏、黑屏锁屏、退出
- 全局快捷键：`Ctrl + Alt + L` 触发透明锁屏
- 开机自启开关
- Windows 防休眠开关
- SQLite 本地存储设置与锁屏事件
- 安全日志页面
- 前端侧边栏 Hash 路由：锁屏中心、专注模式、电源管理、安全日志

## 技术栈

- 桌面框架：Tauri v2
- 前端：React 19、TypeScript、Vite、Tailwind CSS、Radix UI、lucide-react
- 后端：Rust、sqlx、SQLite、Argon2
- 包管理：pnpm

## 工程结构

```text
src/
├─ api/          # Tauri invoke 封装
├─ components/   # common / dashboard / lock 组件
├─ layouts/      # 应用布局
├─ pages/        # 路由页面
├─ router/       # Hash 路由
├─ services/     # 前端业务服务
├─ types/        # 前端类型
└─ utils/        # 前端工具

src-tauri/src/
├─ commands/     # Tauri IPC 命令
├─ config/       # 应用配置与路径
├─ db/           # SQLite 连接与迁移
├─ models/       # dto / entity / vo
├─ repositories/ # 数据访问层
├─ services/     # Rust 业务服务
├─ windows/      # 锁屏窗口管理
├─ hotkey.rs
├─ tray.rs
└─ state.rs
```

## 本地开发

```powershell
pnpm install
pnpm tauri dev
```

前端构建：

```powershell
pnpm build
```

Rust 检查与测试：

```powershell
cd src-tauri
cargo check
cargo test
```

## 本地数据

数据库文件位于用户家目录：

```text
~/.computer-lock-pro/computer-lock.db
```

当前数据库表：

- `settings`
- `lock_events`
- `schema_migrations`

## 开发规范

- Rust 字段使用 `snake_case`
- 前端字段使用 `camelCase`
- Rust/TypeScript 类型名保持一致
- 跨端 DTO 使用 `#[serde(rename_all = "camelCase")]`
- 前端项目统一使用 `pnpm`

## 后续路线

- 首次设置密码、修改密码、密码强度校验
- 模糊锁屏、壁纸锁屏、时钟锁屏
- 键盘清洁模式、仅锁键盘、仅锁鼠标
- 番茄钟、强制休息、护眼提醒、久坐提醒
- 定时关机、倒计时休眠、锁屏后自动关机
- 日志筛选、清空日志、导出日志
- 蓝牙离开锁定、USB Key 解锁、自动化规则系统

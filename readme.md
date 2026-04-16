<p align="center">
  <a href="https://github.com/justorez/douban-group-reporter-webext" target="_blank" rel="noopener noreferrer">
    <img width="180" src="./public/icons/200.png" alt="logo">
  </a>
</p>
<br/>
<p align="center">
    <a href="https://github.com/justorez/douban-group-reporter-webext/releases"><img alt="github release" src="https://img.shields.io/github/v/release/justorez/douban-group-reporter-webext"></a>
    <a href="https://github.com/justorez/douban-group-reporter-webext/actions/workflows/build.yml"><img src="https://github.com/justorez/douban-group-reporter-webext/actions/workflows/build.yml/badge.svg" alt="build status"></a>
</p>
<br/>

# Douban Group Reporter

💢豆瓣小组评论批量举报工具 - 浏览器扩展

## 安装

[Edge 扩展商店](https://microsoftedge.microsoft.com/addons/detail/%E8%B1%86%E7%93%A3%E5%B0%8F%E7%BB%84%E8%AF%84%E8%AE%BA%E4%B8%BE%E6%8A%A5%E5%B7%A5%E5%85%B7/hlhlkfcmlieombipnhpkceakaklhdfdf)

## 用法

登录豆瓣，点击扩展进入主界面，如果在小组帖子页面点击，自动获取帖子地址并解析，否则请手动填写帖子地址。

筛选用户请输入全名，筛选评论支持模糊搜索，多个关键字需用空格隔开。

[![pFpywzF.md.png](https://s11.ax1x.com/2024/01/09/pFpywzF.md.png)](https://imgse.com/i/pFpywzF)

按钮动态展示处理进度。

[![piHXmQS.md.png](https://s11.ax1x.com/2023/12/25/piHXmQS.md.png)](https://imgse.com/i/piHXmQS)

## 手机端免写代码方案（推荐）

如果你朋友不懂写代码，可直接用现成版本：

1. 打开 `docs/bookmarklet-no-code.url.txt`，复制整行（以 `javascript:` 开头）。
2. 在手机浏览器新建书签，网址栏粘贴这整行。
3. 进入豆瓣小组帖子页面（`/group/topic/xxxx`），点击该书签。
4. 会弹出手机面板，可一键复制当前帖子链接，并打开扩展使用说明。

> 说明：这是“零代码”应急方案，主要用于手机上快速取链接/辅助操作。真正批量举报流程仍建议在桌面浏览器扩展中完成。

## 手机端 Bookmarklet 模板（实验）

如果你在 Android 浏览器中遇到扩展弹窗不适配、空白页等情况，可以先试用 Bookmarklet 方案：

1. 打开 `docs/bookmarklet-template.js`（已内置 Phase 1 单页 MVP 逻辑）。
2. 将脚本压缩成单行，并在前面加上 `javascript:`。
3. 在手机浏览器保存为书签 URL，进入豆瓣帖子页后点击该书签运行。

该模板会在当前页面注入一个手机友好的底部浮层（可滚动、触控按钮），避免依赖扩展 popup 固定尺寸。

> 常见问题：如果提示 `please login (code:01004)`，请先在当前使用的同一域名页面完成登录（例如你在 `m.douban.com` 页面运行，就先确认 `m.douban.com` 已登录），再重试。

## Mobile Roadmap / TODO / Non-Goals

### Roadmap

#### Phase 1（Current / Android MVP）

目标：先在 Android 手机上，做到接近 desktop extension 的核心流程（单页版）。

- [ ] 在豆瓣小组帖子页启动手机助手面板
- [ ] 自动读取当前帖子 URL（或手动粘贴）
- [ ] 解析「单页」评论列表
- [ ] 关键词 / 用户名筛选
- [ ] 选择举报原因并批量提交（仅当前页）
- [ ] 展示提交进度（done / total）
- [ ] 失败项目支持手动重试

#### Phase 2（Next / Android Enhancement）

目标：提升批量能力与稳定性。

- [ ] 跨页批量（自动翻页抓取 + 续跑）
- [ ] 失败列表增强（可按原因筛选、只重试失败）
- [ ] 任务中断后恢复（可选）
- [ ] UI / 交互优化（减少操作步骤）

#### Phase 3（Later / iOS）

目标：iOS 适配与体验对齐 Android。

- [ ] iOS 可用的启动方式（待定）
- [ ] iOS 版 UI 适配（面板、字体、按钮尺寸）
- [ ] iOS 与 Android 功能对齐

### TODO

- [ ] Android：单页 MVP 完成
- [ ] Android：跨页批量（翻页）
- [ ] Android：失败项手动重试流程打磨
- [ ] iOS：可行方案验证与时间评估
- [ ] iOS：正式适配与上线计划

### Non-Goals（MVP 阶段不做）

以下内容不在当前 MVP 范围，避免需求膨胀：

- [ ] iOS 同步上线（先 Android）
- [ ] 全自动重试（当前只做手动重试）
- [ ] 跨页批量（先完成单页）
- [ ] 复杂账号管理 / 云端同步
- [ ] 非豆瓣场景支持

### Definition of Done（Android MVP）

当以下条件全部达成，视为 Android MVP 完成：

1. 已登录豆瓣的手机用户，可在帖子页完成单页批量举报流程。
2. 流程中有明确进度提示。
3. 失败项目可手动重试。
4. README 已标明「跨页批量、iOS 适配」为后续 TODO。

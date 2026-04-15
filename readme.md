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

1. 打开 `docs/bookmarklet-template.js`，按注释替换 `TODO` 的业务逻辑。
2. 将脚本压缩成单行，并在前面加上 `javascript:`。
3. 在手机浏览器保存为书签 URL，进入豆瓣帖子页后点击该书签运行。

该模板会在当前页面注入一个手机友好的底部浮层（可滚动、触控按钮），避免依赖扩展 popup 固定尺寸。

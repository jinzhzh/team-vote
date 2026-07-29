# 团队投票（TeamVote）

轻量级团队投票 H5 页面，纯前端实现，数据保存在浏览器 localStorage。

## 功能

- 创建议题与多个选项（最少 2 个）
- 单选投票，实时计票与百分比展示
- localStorage 防重复投票
- 响应式布局，手机 / 桌面均可操作

## 本地运行

直接打开 `index.html` 即可，无需构建工具。

## 校验

```bash
node --check app.js
```

## 部署

GitHub Actions 在 push / PR 时校验 HTML 与 JS 语法；通过后可发布至 Vercel / Netlify。
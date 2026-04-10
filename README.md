# 🔬 AI Paper Tracker

自动追踪国内外主要 AI 团队的最新 arXiv 论文，每小时更新，并通过企业微信群机器人推送通知。

## 追踪团队

**国内：** 字节 Seed、阿里千问、百度文心、腾讯混元、智谱 GLM、DeepSeek、月之暗面、MiniMax

**国际：** OpenAI、Anthropic、Google DeepMind、Meta AI、Mistral、Cohere

---

## 快速部署

### 1. Fork & 部署到 Vercel

1. Fork 本仓库到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com) 导入该仓库
3. 在 Vercel 控制台 → Storage → 创建 Upstash Redis 数据库（一键，自动注入环境变量）

### 2. 配置环境变量

在 Vercel 控制台 → Settings → Environment Variables 中添加：

```bash
# 企业微信群机器人 Webhook（在群机器人配置中获取完整 URL）
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY

# Cron 安全密钥（自定义随机字符串）
CRON_SECRET=your-random-secret-here
```

> KV_REST_API_URL 和 KV_REST_API_TOKEN 由 Vercel Upstash 集成自动注入，无需手动填写。

### 3. 配置 GitHub Actions

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 值 |
|-------------|-----|
| `CRON_SECRET` | 与 Vercel 中设置的 `CRON_SECRET` 相同 |
| `VERCEL_APP_URL` | 你的 Vercel 部署 URL，如 `https://your-app.vercel.app` |

### 4. 触发首次抓取

部署完成后，手动触发一次论文抓取：

```bash
curl -X POST https://your-app.vercel.app/api/cron \
  -H "Authorization: Bearer your-random-secret-here"
```

---

## 功能特性

- 📄 **论文列表** — 按发布时间倒序，支持展开摘要
- 🔍 **全文搜索** — 搜索标题、摘要、作者
- 🏷️ **团队筛选** — 支持多选，区分国内/国际
- 📊 **数据统计** — 显示今日/本周/总计论文数量
- 📱 **响应式** — 手机端可用
- 🔔 **企业微信通知** — 新论文 Markdown 格式推送，每批最多 5 篇
- ⏱️ **自动更新** — GitHub Actions 每小时整点触发

---

## 手动验证

```bash
# 触发论文抓取
curl -X POST https://your-app.vercel.app/api/cron \
  -H "Authorization: Bearer $CRON_SECRET"

# 查询论文列表
curl "https://your-app.vercel.app/api/papers?days=7"

# 按团队筛选
curl "https://your-app.vercel.app/api/papers?team=deepseek&days=3"

# 关键词搜索
curl "https://your-app.vercel.app/api/papers?search=reasoning"

# 查看统计
curl "https://your-app.vercel.app/api/papers?stats=1"
```

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 前端+API | Next.js 16 (App Router) + TypeScript |
| 样式 | Tailwind CSS |
| 存储 | Upstash Redis (via Vercel Integration) |
| 定时任务 | GitHub Actions (每小时) |
| 数据源 | arXiv Atom Feed API |
| 通知 | 企业微信群机器人 Webhook |
| 部署 | Vercel |

---

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量模板
cp .env.local.example .env.local
# 编辑 .env.local，填入 Upstash Redis URL/Token 和其他配置

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

# 人生旅途

给家里每一位长辈各自留一份口述回忆录的访谈工具。语音优先、AI 追问、按经历定制专属问题、家人可以留问题插队、支持拍照和保留原声、能生成回忆录初稿。

这是独立部署的版本：打开链接的人**不需要登录任何账号**（不需要 Claude 账号，不需要注册），因为 AI 调用走的是你自己在后台配置的 API key，不是访问者自己的。

## 需要准备的三样东西

1. **一个 Anthropic API key** —— 去 https://console.anthropic.com 注册（跟你平时用的 claude.ai 是两回事），创建一个 API key，需要绑定支付方式。按这个工具的实际用量（几十条问答 + 生成几次回忆录），成本大概是几毛到几块钱人民币这个量级。
2. **一个 Vercel 账号** —— 去 https://vercel.com 用你的 GitHub 账号登录即可，不需要单独设密码。免费额度对个人使用完全够。
3. **一个 GitHub 仓库**，把这份代码放上去。

## 部署步骤

### 1. 把代码推到 GitHub

```bash
cd memoir-app
git init
git add .
git commit -m "Initial commit"
```

然后在 github.com 上新建一个仓库（可以设为 Private，只有自己看得到），按它给的提示把本地仓库推上去：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

### 2. 在 Vercel 导入这个仓库

登录 Vercel → "Add New Project" → 选择刚才那个 GitHub 仓库 → 直接点 Deploy（不用改任何构建设置，Next.js 项目会被自动识别）。

第一次部署这时候会失败或者跑起来但用不了，因为还没配数据库和 API key——没关系，继续往下配。

### 3. 加一个 Postgres 数据库

在 Vercel 项目页面 → **Storage** 标签 → **Create Database** → 选 **Postgres**（背后用的是 Neon）→ 创建好之后点 **Connect** 关联到这个项目。这一步会自动把连接字符串（`DATABASE_URL`）写进项目的环境变量，不用手动填。

### 4. 加一个 Blob 存储（存照片和录音）

同样在 **Storage** 标签 → **Create Database** → 选 **Blob** → 创建并关联到这个项目，`BLOB_READ_WRITE_TOKEN` 也会自动写好。

### 5. 填 Anthropic API key

项目 → **Settings** → **Environment Variables** → 新增一条：

- Name: `ANTHROPIC_API_KEY`
- Value: 你在 console.anthropic.com 申请到的那个 key

### 6. 重新部署一次

**Deployments** 标签 → 找到最近一次部署 → 右上角 **︙** → **Redeploy**（这样新加的环境变量才会生效）。

部署完成后，Vercel 会给你一个 `https://你的项目名.vercel.app` 这样的链接，打开就能直接用，家里任何人拿到这个链接都不需要登录就能用满血功能。

## 本地开发（可选）

如果想在自己电脑上先跑起来试试：

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 ANTHROPIC_API_KEY / DATABASE_URL / BLOB_READ_WRITE_TOKEN
npm run dev
```

打开 http://localhost:3000 。没配置数据库/API key 的情况下页面也能打开，只是相应功能会静默失败（比如列表是空的、AI 功能报错），这是设计好的降级行为，不是 bug。

## 项目结构

```
public/app.html          前端界面（纯 HTML/CSS/JS，不依赖任何框架）
app/api/people/          家人档案的增删改查
app/api/people/[id]/...  某位家人的问答记录、追加问题、家人留言
app/api/ai/...           三个 AI 接口：追问、生成专属章节、生成回忆录（流式）
app/api/upload/          照片/录音上传，存到 Vercel Blob
lib/db.js                数据库连接与建表
lib/anthropic.js         Anthropic API 客户端封装
```

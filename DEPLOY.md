# 人生有悔 · 部署说明

## 前端部署（推荐：Cloudflare Pages）

1. **构建**
   ```bash
   npm run build
   ```
   产物在 `dist/`。

2. **Cloudflare Pages**
   - 在 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create project → Connect to Git（或直接上传 `dist`）。
   - Build command: `npm run build`，Output directory: `dist`。
   - 若用 Git：每次 push 自动构建并发布，免费额度足够个人使用。

3. **环境变量（可选）**
   - 若接 EverMemOS 云端：在 Pages 的 Settings → Environment variables 添加 `VITE_EVERMEMOS_API_BASE` = 你的 EverMemOS API 地址（见下文后端）。

---

## 后端部署（EverMemOS 或自建 BFF）

### 方案 A：仅前端（无 EverMemOS）

- 不配置 `VITE_EVERMEMOS_API_BASE` 即可。数据存浏览器 localStorage，无需后端。
- 适合：个人使用、演示。

### 方案 B：EverMemOS 上云（记忆/复盘能力）

EverMemOS 为 Python + Docker（MongoDB、Elasticsearch、Milvus、Redis 等），适合放在能跑 Docker 或多服务的平台：

| 平台 | 适用场景 | 说明 |
|------|----------|------|
| **Railway** | 推荐 | 支持 Docker、多服务、Postgres/Redis 等，免费额度有限但够小项目；把 EverMemOS 的 `docker-compose` 或 Dockerfile 部署即可。 |
| **Render** | 可选 | 支持 Docker、Background Workers；免费 tier 有冷启动。 |
| **Fly.io** | 可选 | 多区域、Docker 友好，适合需要低延迟时。 |

**建议**：优先 **Railway**（配置简单、日志清晰），若需多区域或更高可用再考虑 Render/Fly。

**步骤概要**：
1. 将 [EverMind-AI/EverMemOS](https://github.com/EverMind-AI/EverMemOS) 克隆或 fork 到你的仓库。
2. 在 Railway 新建 Project → 用 Dockerfile 或 docker-compose 部署，配置 `.env`（如 LLM_API_KEY、VECTORIZE_API_KEY）。
3. 拿到对外 API 地址（如 `https://xxx.railway.app`），在前端环境变量里设 `VITE_EVERMEMOS_API_BASE=https://xxx.railway.app`。
4. 若 EverMemOS 与前端不同域，需在 EverMemOS 侧或通过 Nginx 配置 CORS 允许前端域名。

### 方案 C：自建 BFF（Node/Cloudflare Workers）

- 若不想在前端直连 EverMemOS（避免 CORS、藏 API 地址），可加一层 BFF：
  - **Cloudflare Workers**：与 Pages 同域，免费额度大，适合做代理和简单转发。
  - **Vercel / Netlify Functions**：与前端同项目，写几段 serverless 转发到 EverMemOS。
- BFF 只做转发时，前端 `VITE_EVERMEMOS_API_BASE` 指向 BFF 的 URL，BFF 再请求 Railway 上的 EverMemOS。

---

## 推荐组合

- **前端**：**Cloudflare Pages**（静态 Vite 构建，免费、全球 CDN）。
- **后端**：需要记忆/复盘时用 **Railway** 部署 EverMemOS；不需要则只部署前端即可。

这样前端在 Cloudflare，后端在 Railway，成本低、易扩展。

# 发布清单

## 1. 后端 Railway

1. GitHub 推代码
2. Railway → New Project → Deploy `backend/`
3. 复制公网 URL，如 `https://biolog-api.up.railway.app`
4. 访问 `/health` 确认 `{"status":"ok"}`

## 2. 前端 Vercel

1. Import 仓库，Root Directory: `frontend`
2. 环境变量：

| 变量 | 示例 |
|------|------|
| `VITE_API_URL` | `https://biolog-api.up.railway.app` |
| `VITE_SITE_URL` | `https://biolog.vercel.app` |

3. Deploy → 复制前端 URL

## 3. README 更新

- 将 Demo 表格中的占位符换成真实 URL
- 深链示例：`https://你的域名/?view=compare`

## 4. 配图（自动）

```bash
# 安装脚本依赖（首次）
cd scripts && npm install && cd ..

# 自动启动前后端并截图 + GIF
node scripts/capture-demo.mjs --start-servers

# 或前后端已运行时
node scripts/capture-demo.mjs
```

输出：`docs/screenshots/*.png` + `demo.gif`

## 5. 一键部署脚本（需 Token）

```bash
# 后端
RAILWAY_TOKEN=xxx ./scripts/deploy-railway.sh

# 前端（先设后端 URL）
VITE_API_URL=https://xxx.up.railway.app \
VITE_SITE_URL=https://xxx.vercel.app \
VERCEL_TOKEN=xxx ./scripts/deploy-vercel.sh
```

也可用 [Render](https://render.com) 导入仓库，识别根目录 `render.yaml`。

## 6. V2EX

复制 `docs/launch.md` 模板，填入 Demo + GitHub 链接后发布。

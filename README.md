# Rosa的旅行足迹

一个纯前端静态应用，用来点亮去过的中国省份和城市。

## 功能

- 中国省级/市级地图点亮
- 多项目管理（全部足迹、和朋友去的、大学去的...）
- 数据本地存储（LocalStorage）
- JSON 导入/导出备份
- PWA 支持（可添加到手机主屏幕、离线访问）
- 响应式设计（手机/电脑自适应）

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 浏览器打开 http://localhost:5173
```

## 构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 部署到 GitHub Pages

### 方式一：GitHub Actions 自动部署（推荐）

1. 在 GitHub 创建仓库，推送代码：
   ```bash
   git init
   git add .
   git commit -m "init: travel map app"
   git remote add origin https://github.com/你的用户名/travel-map.git
   git branch -M main
   git push -u origin main
   ```

2. 在 GitHub 仓库 Settings → Pages → Source 选择 **GitHub Actions**。

3. 推送到 main 分支后会自动构建部署。

### 方式二：手动部署

```bash
npm run build
npx gh-pages -d dist
```

然后在 Settings → Pages → Source 选择 `gh-pages` 分支。

## 技术栈

- React 18 + TypeScript
- Vite 6
- ECharts 5（地图渲染）
- Tailwind CSS（样式）
- vite-plugin-pwa（PWA 支持）
- 地图数据：阿里云 DataV GeoAtlas

## 数据说明

- 所有数据存储在浏览器 LocalStorage
- 清除浏览器数据会丢失，建议定期导出备份
- 地图地理数据首次加载需要联网，之后由 Service Worker 缓存

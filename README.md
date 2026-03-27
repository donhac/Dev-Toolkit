# DevToolkit
一个面向开发者工具集合场景的前端站点，当前内置了 Base64、时间戳转换、JSON 格式化、随机数生成、图片 Base64 互转、图片压缩、Cron 表达式工具等页面。

DevToolkit 适合用来快速搭建一个现代化的开发者工具聚合站点：
- 首页通过卡片展示常用工具，便于快速检索和进入
- 每个工具页都带独立工作区，强调输入、输出和高频操作的效率
- 视觉风格统一支持 `dark / light` 和中英文切换，适合继续扩展更多工具

项目特点：
- 卡片式工具入口与独立工具工作区
- `dark / light` 双主题
- 中英文切换，默认中文
- 工具页支持持续扩展，适合继续接入更多开发者工具
- 支持本地运行，也支持 Docker 容器化部署

## 核心能力

- 编码与转换：Base64 编解码、图片与 Base64 互转、时间戳转换
- 数据处理：JSON 格式化、压缩、转义、树视图浏览
- 生成与测试：随机数生成、Cron 表达式生成与反向解析
- 媒体处理：图片体积压缩、格式和尺寸调整
- 平台能力：主题切换、国际化、复制反馈、可扩展工具注册机制

## 界面预览

下方是当前项目中的部分页面截图，便于快速了解整体视觉风格和工具页交互方式。

### Dashboard / 首页工具总览

![Dashboard](docs/assets/Dashboard.png)

首页采用卡片式工具入口，配合搜索、分类和状态信息，适合作为开发者工具集合站点的默认着陆页。

### Timestamp Converter / 时间戳转换

![Timestamp Converter](docs/assets/Timestamp%20Converter.png)

该页面聚焦时间与 Unix Epoch 相互转换，支持本地时区和 UTC 展示。

### Base64 Encoder / Decoder / Base64 编解码

![Base64 Encoder / Decoder](docs/assets/Base64%20EncoderDecoder.png)

中间控制区采用更突出的编解码操作布局，适合处理普通 Base64 与 URL-safe Base64 场景。

### JSON Formatter / JSON 格式化

![JSON Formatter](docs/assets/JSON%20Formatter.png)

该页面支持自动格式化、压缩、转义、树视图、语法高亮与复制反馈，适合作为高频数据处理工具。

### Random Generator / 随机数生成

![Random Generator](docs/assets/Random%20Generator.png)

支持按配置一次生成多个随机数，并配有复制反馈和更清晰的结果态区分。

## 适用场景

- 搭建自己的开发者工具导航站
- 为团队内部提供统一的常用工具集合
- 作为前端工具页设计与交互实现的参考模板
- 在现有项目中继续扩展更多编码、格式化、转换类工具

## 技术栈

- React + TypeScript
- Vite
- Express
- CSS Variables + 自定义主题体系
- 本地化上下文驱动的国际化方案


## 项目结构

核心目录说明：

```text
src/
  components/
    dashboard/        仪表盘卡片、统计卡片
    layout/           顶部导航、侧边栏、应用壳层
    tooling/          各个工具页的具体实现
    ui/               通用 UI 组件，例如复制反馈 Toast
  data/
    tools.ts          工具注册表、分类元信息、本地化辅助
  hooks/
    useAppRouter.ts   简单路由状态
    useClipboardFeedback.ts 复制反馈
  pages/
    DashboardPage.tsx 仪表盘
    CategoryPage.tsx  分类页
    ToolPage.tsx      工具页入口分发
  i18n.tsx            国际化上下文与通用文案
  App.tsx             应用状态入口
server.ts             Express + Vite 服务入口
```

## 本地开发

环境要求：
- Node.js 22+

启动步骤：

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000
```

常用命令：

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## 如何接入新的工具页

新增工具建议按下面步骤接入。

### 1. 注册工具元信息

在 [src/data/tools.ts](/Users/donh/work/LeadBlazing/code/dev-toolkit/src/data/tools.ts) 的 `tools` 数组中新增一项：

```ts
{
  slug: "my-new-tool",
  title: "My New Tool",
  shortDescription: "Short summary",
  description: "Longer description",
  category: "converters",
  variant: "primary",
  icon: SomeIcon,
  tags: ["demo", "tool"]
}
```

如果需要中文展示，再补 `toolTranslations["zh-CN"]` 对应配置。

### 2. 创建工具组件

在 `src/components/tooling/` 下新增页面组件，例如：

```text
src/components/tooling/MyNewTool.tsx
```

如果页面里有复制按钮，优先复用：
- `useClipboardFeedback`
- `CopyToast`

如果页面有需要国际化的基础文案，建议直接接 `useI18n()`，或者为该工具增加自己的本地化配置对象。

### 3. 接入工具页路由分发

在 [src/pages/ToolPage.tsx](/Users/donh/work/LeadBlazing/code/dev-toolkit/src/pages/ToolPage.tsx) 里新增 `switch` 分支：

```ts
case "my-new-tool":
  content = <MyNewTool />;
  break;
```

### 4. 如有接口需求，再扩展后端

如果这个工具需要服务端能力，就在 [server.ts](/Users/donh/work/LeadBlazing/code/dev-toolkit/server.ts) 新增 `/api/tools/...` 路由，并在 [src/services/api.ts](/Users/donh/work/LeadBlazing/code/dev-toolkit/src/services/api.ts) 增加对应请求方法。

### 5. 保持国际化可扩展

当前国际化方案是：
- `src/i18n.tsx`：语言状态和通用 UI 文案
- `src/data/tools.ts`：分类、工具标题和描述的本地化辅助

后续新增工具页时，建议遵循：
- 通用导航/按钮/状态文案放进 `i18n.tsx`
- 工具名称、简介、描述放进 `tools.ts` 的翻译表
- 页面内部独有文案，直接在组件内部按 `language` 组织一个局部字典

这样接入新工具时不会把翻译散落到很多地方。

## Docker 部署

仓库已提供 [Dockerfile](/Users/donh/work/LeadBlazing/code/dev-toolkit/Dockerfile)。

### 构建镜像

```bash
docker build -t devtoolkit .
```

### 运行容器

```bash
docker run --rm -p 3000:3000 devtoolkit
```

### 使用 docker-compose

仓库已提供 [docker-compose.yml](/Users/donh/work/LeadBlazing/code/dev-toolkit/docker-compose.yml)：

```bash
docker compose up --build -d
```

停止容器：

```bash
docker compose down
```

访问：

```text
http://localhost:3000
```

## 生产部署说明

当前服务模式：
- 开发环境：`server.ts` 通过 Vite middleware 提供前端
- 生产环境：先执行 `npm run build`，再通过 Express 提供 `dist` 静态资源

Docker 镜像里默认已经执行 `npm run build`，容器启动后使用：

```bash
npm start
```

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。

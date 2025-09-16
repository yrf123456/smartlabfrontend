# Smart Lab - 智能实验室管理系统前端

基于 Vue 3 + Vite + TypeScript + Pinia + Vue Router 构建的简约风格智能实验室管理系统前端。

## ✨ 特性

- 🎨 **简约设计** - 极简、留白、卡片式、清晰层级的现代化UI
- 📱 **响应式** - 移动优先，支持桌面、平板、手机全端适配
- 🔐 **权限管理** - 基于角色的权限控制（SYS_ADMIN、DEPT_ADMIN、TEACHER、STUDENT、VISITOR）
- 📊 **数据可视化** - 环境监测图表、统计报表
- 🌐 **国际化** - 支持中英文切换
- ⚡ **性能优化** - 路由懒加载、组件按需加载
- 🎯 **TypeScript** - 完整的类型定义和类型检查

## 🚀 快速开始

### 安装依赖

推荐使用 pnpm：

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

或使用 npm：

```bash
npm install
```

### 环境配置

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

修改环境变量：

```bash
# API Base URL
VITE_API_BASE=http://localhost:8080/api

# Use mock data (开发阶段建议设为 true)
VITE_USE_MOCK=true

# App Name
VITE_APP_NAME=Smart Lab

# Upload base URL
VITE_UPLOAD_BASE=http://localhost:8080
```

### 启动开发服务器

```bash
pnpm dev
```

或使用 npm：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 📁 项目结构

```
src/
├── api/                    # API 接口封装
│   ├── index.ts           # API 统一导出
│   └── mock.ts            # Mock 数据
├── components/            # 组件
│   ├── lab/              # 实验室相关组件
│   ├── layout/           # 布局组件
│   └── ui/               # 通用UI组件
├── layouts/              # 布局文件
├── locales/              # 国际化文件
├── router/               # 路由配置
├── stores/               # Pinia 状态管理
├── types/                # TypeScript 类型定义
├── views/                # 页面组件
├── App.vue               # 根组件
├── main.ts               # 应用入口
└── style.css             # 全局样式
```

## 🎯 核心功能模块

### 1. Dashboard（总览）
- 统计卡片：今日预约数、设备可用率、告警数量、使用率
- 快捷操作：创建预约、发布公告、查看审批
- 环境概览：各实验室环境数据展示
- 最近动态：系统活动时间线
- 待审批事项：管理员审批队列

### 2. Labs（实验室管理）
- 实验室列表：支持网格/列表视图切换
- 筛选功能：关键词、标签、状态筛选
- 实验室卡片：封面图、基本信息、快捷预约
- 详情页面：概览、日程、环境、设备、门禁信息

### 3. Bookings（预约管理）
- 预约创建：选择实验室、时间段、用途说明
- 日历视图：周/月视图展示预约情况
- 审批流程：管理员审批、拒绝功能
- 冲突检测：实时检测时间冲突

### 4. Equipment（设备管理）
- 设备清单：状态、位置、使用人信息
- 设备分配：管理设备分配和归还
- 维护提醒：维保到期提醒和报修功能

### 5. Environment（环境监测）
- 实时数据：温度、湿度、PM2.5、噪声监测
- 历史图表：环境数据趋势分析
- 阈值告警：超限告警和确认处理
- 多实验室对比：最多3个实验室数据对比

### 6. Access（门禁管理）
- 授权策略：基于角色/用户的门禁权限
- 出入记录：详细的进出记录查询
- 异常检测：异常行为标记和处理

### 7. Users/Roles（用户角色管理）
- 用户管理：用户信息、角色分配
- 权限矩阵：角色-权限关系配置
- 部门管理：用户部门归属管理

### 8. Reports（报表统计）
- 预约统计：预约数据分析
- 设备使用统计：设备利用率分析
- 环境报表：环境数据统计
- 导出功能：支持CSV/Excel导出

### 9. Settings（系统设置）
- 主题设置：浅色/深色主题切换
- 上传配置：图片上传策略配置
- 系统信息：版本信息和帮助文档

## 🎨 设计规范

### 配色方案
- 背景色：`#F7F8FA`
- 卡片/内容区：白色 `#FFFFFF`
- 主要文本：`#1F2937`
- 次级文本：`#6B7280`
- 品牌主色：`#3B82F6`（可在代码中自定义）

### 组件风格
- 圆角：`rounded-2xl` (16px)
- 阴影：柔和阴影效果
- 间距：统一的内边距和外边距
- 字体：系统字体栈，优先 `-apple-system`

## 🔐 演示账号

```
邮箱: admin@example.com
密码: 123456
```

## 🛠️ 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **编程语言**：TypeScript
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **样式**：Tailwind CSS
- **图标**：Lucide Vue Next
- **图表**：Chart.js + Vue-Chartjs
- **时间处理**：Day.js
- **HTTP客户端**：Axios
- **国际化**：Vue I18n
- **工具库**：@vueuse/core

## 📱 响应式设计

- **移动端**：≥ 320px
- **平板端**：≥ 768px  
- **桌面端**：≥ 1024px

移动端特殊适配：
- 侧栏改为抽屉式菜单
- 隐藏顶栏管理员邮箱图标，移入汉堡菜单
- 触摸优化的交互元素
- 移动优先的组件布局

## 🔧 自定义配置

### 主题定制

在 `tailwind.config.js` 中修改主题配色：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-brand-color', // 修改品牌主色
      }
    }
  }
}
```

### API 配置

在 `.env` 文件中配置API地址：

```bash
# 生产环境API地址
VITE_API_BASE=https://your-api-domain.com/api

# 关闭Mock数据
VITE_USE_MOCK=false
```

## 📋 开发指南

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `src/components/layout/SidebarNav.vue` 添加导航菜单

### 添加新API

1. 在 `src/types/index.ts` 定义数据类型
2. 在 `src/api/index.ts` 添加API接口
3. 在 `src/api/mock.ts` 添加Mock数据（可选）
4. 在对应的 Pinia store 中调用API

### 权限控制

使用 `authStore.hasRole()` 或 `authStore.can()` 方法：

```vue
<template>
  <button v-if="authStore.hasRole('SYS_ADMIN')">
    管理员功能
  </button>
</template>
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- Issue：[GitHub Issues](https://github.com/your-repo/smart-lab/issues)
- Email：admin@example.com

---

**注意**：当前版本使用Mock数据进行演示，生产使用前请配置真实的后端API接口。
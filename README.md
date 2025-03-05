# 汇率计算器

一个基于 Vue 3 + Electron 的跨平台桌面应用，用于实时获取和计算货币汇率。

## 技术栈

- **前端框架**: Vue 3
- **桌面框架**: Electron 13
- **UI 组件库**: Element Plus
- **数据库**: Dexie (IndexedDB)
- **HTTP 客户端**: Axios
- **构建工具**: Vue CLI + vue-cli-plugin-electron-builder
- **开发语言**: JavaScript/Vue

## 开发环境设置

### 安装依赖
```bash
# 安装项目依赖
npm install
```

### 开发命令
```bash
# 启动开发服务器（带热重载）
npm run electron:serve

# 打包应用
npm run electron:build

# 代码检查
npm run lint

# 代码检查并自动修复
npm run lint -- --fix
```

## 项目结构
```
currency-converter-app/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # Vue 组件
│   ├── utils/          # 工具函数
│   ├── App.vue         # 根组件
│   ├── background.js   # Electron 主进程
│   ├── main.js        # Vue 入口文件
│   └── preload.js     # Electron 预加载脚本
├── public/            # 公共资源
├── vue.config.js      # Vue 和 Electron 配置
└── package.json       # 项目配置和依赖
```

## 数据来源

汇率数据来自万事达卡官方 API：
- API 地址：https://www.mastercard.com.cn/settlement/currencyrate/conversion-rate
- 更新时间：每天美东时间下午 4:00（北京时间次日凌晨 4:00 或 5:00）

## 主要功能

- 支持多种货币实时转换
- 历史汇率记录查询
- 手续费计算
- 离线数据存储
- 自定义转换组合

## 开发注意事项

1. 开发时需要确保网络能访问万事达卡 API
2. 首次运行需要初始化本地数据库
3. 打包时注意配置相应的图标和应用信息
4. 注意处理 API 请求的错误和超时
5. 考虑美东时间与本地时间的转换

## 构建产物

构建后的应用位于：
```
dist_electron/
├── win-unpacked/      # 免安装版
│   └── 汇率计算器.exe
└── 汇率计算器.exe      # 便携版
```

## 版本历史

- v1.0.0
  - 基础货币转换功能
  - 历史记录查询
  - 手续费计算
  - 离线数据存储

## 许可证

MIT License

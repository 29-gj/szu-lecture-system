# 深圳大学创新领航讲座系统

一个基于Flask的在线讲座报名系统，为深圳大学学生提供便捷的讲座信息浏览和报名服务。

## 功能特色

- 📚 **讲座浏览**：支持查看全部、正在报名、未开始的讲座
- 🎯 **在线报名**：选择教室、查看剩余名额、一键报名
- 👤 **个人中心**：查看待参加活动、学习统计、历史记录
- 📱 **响应式设计**：完美适配桌面和移动设备
- ⚡ **实时更新**：剩余名额实时显示，状态同步更新

## 技术栈

- **后端**：Flask (Python)
- **前端**：HTML5 + CSS3 + JavaScript (jQuery)
- **样式**：响应式布局，现代化UI设计

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 运行项目

```bash
python app.py
```

访问 `http://localhost:5000` 查看效果

## 项目结构

```
SZULecture/
├── app.py                 # Flask主程序
├── requirements.txt       # Python依赖
├── templates/            # HTML模板
│   ├── index.html        # 主页面
│   ├── classroom.html    # 教室选择
│   ├── profile.html      # 个人中心
│   ├── history.html      # 历史记录
│   └── lecture_detail.html # 讲座详情
└── static/               # 静态文件
    ├── css/
    │   └── style.css     # 样式文件
    └── js/               # JavaScript文件
        ├── main.js
        ├── classroom.js
        ├── profile.js
        └── history.js
```

## 在线演示

🌐 [点击查看在线演示](您的部署链接)

## 开发者

深圳大学创新领航讲座项目组

---

⭐ 如果这个项目对您有帮助，请给一个Star！
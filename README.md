# English-Sanskrit-Hindi Learning App

![GitHub repo size](https://img.shields.io/github/repo-size/Prince200510/English-Sanskrit-Learning-App)
![GitHub stars](https://img.shields.io/github/stars/Prince200510/English-Sanskrit-Learning-App?style=social)
![GitHub issues](https://img.shields.io/github/issues/Prince200510/English-Sanskrit-Learning-App)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> **A next-generation, AI-powered platform for immersive learning and translation between English, Sanskrit, and Hindi.**

---

## 🚀 Overview

English-Sanskrit-Hindi Learning App is a full-stack, production-grade platform that leverages state-of-the-art machine translation models, interactive learning modules, and a modern UI to deliver a seamless multilingual learning experience. Built with React, Node.js, and Python ML integration, it is designed for scalability, extensibility, and real-world educational impact.

---

## 🏗️ Architecture

```
English-Sanskrit-Hindi/Final/
├── ai-server/         # Backend: Node.js, Express, Python ML (mbart, IndicTrans)
│   ├── controller/    # REST API controllers
│   ├── modelv2/      # (gitignored) Model weights, checkpoints
│   ├── modelv3/      # (gitignored) Advanced model files
│   ├── services/     # Node-Python bridge, local logic
│   └── ...           # Config, routes, utils, etc.
├── frontend/          # Frontend: React, TypeScript, Vite, Tailwind CSS
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Flashcards, Grammar, Translate, etc.
│   │   └── ...
│   └── ...
└── .gitignore         # Ignores modelv2, modelv3, node_modules, etc.
```

---

## ✨ Key Features

- **AI-Powered Translation:**
  - Custom-trained models for English↔Sanskrit↔Hindi
  - Fast, accurate, and context-aware translations
- **Interactive Learning:**
  - Flashcards, grammar exercises, and quizzes
  - Progress tracking and adaptive content
- **Modern UI/UX:**
  - Responsive, accessible, and mobile-friendly
  - Built with React, Tailwind CSS, and Vite
- **API-First Backend:**
  - RESTful endpoints for translation and learning modules
  - Python ML integration (mbart, IndicTrans, etc.)
- **Extensible & Scalable:**
  - Modular codebase, easy to add new languages or features
  - Production-ready structure and best practices

---

## 🛠️ Quick Start

### Prerequisites

- Node.js (v16+)
- Python 3.8+
- npm or yarn

### 1. Clone the Repository

```sh
git clone https://github.com/Prince200510/English-Sanskrit-Learning-App.git
cd English-Sanskrit-Hindi/Final
```

### 2. Backend Setup

```sh
cd ai-server
npm install
pip install -r requirements.txt
```

### 3. Frontend Setup

```sh
cd ../frontend
npm install
```

### 4. Run the App

- **Start Backend:**
  ```sh
  cd ai-server
  npm start
  # or
  node main.js
  ```
- **Start Frontend:**
  ```sh
  cd frontend
  npm run dev
  ```

---

## 📚 Usage

- Access the app at `http://localhost:5173` (default Vite port)
- Use the translation, flashcards, grammar, and quiz modules
- Progress and learning data are stored locally or via backend APIs

---

## 🧩 Advanced Features

- **Model Hot-Swapping:** Easily update or swap translation models without downtime
- **API Authentication:** (Pluggable, for future production deployments)
- **Analytics & Logging:** Track user progress, translation accuracy, and system health
- **Extensible Module System:** Add new languages, exercises, or AI features with minimal code changes

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 👤 Author

- **Prince Maurya**  
  Email: princemaurya8879@gmail.com
  GitHub: [Prince200510](https://github.com/Prince200510)

## 📦 Repository

- [English-Sanskrit-Learning-App](https://github.com/Prince200510/English-Sanskrit-Learning-App)

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

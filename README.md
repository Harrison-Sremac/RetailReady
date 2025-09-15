# RetailReady - AI-Powered Compliance Management

A comprehensive compliance risk assessment platform that helps retailers and suppliers manage compliance requirements, assess risks, and calculate potential fines using AI-powered document parsing.

## 🚀 Features

- **AI Document Parsing**: Upload PDF compliance documents for automatic requirement extraction
- **Risk Assessment**: Interactive calculator for violation quantities and fine estimation
- **Multi-Page Interface**: Clean, professional dashboard with separate sections
- **Worker Tools**: Interface for warehouse workers with guidance and scanning
- **Risk Overview**: Proactive risk prediction using rules-based matching
- **Compliance Management**: Filter and search violations by category, severity, and retailer

## 🏗️ Architecture

```
Frontend (React + TypeScript) ↔ Backend (Express + Node.js) ↔ Database (SQLite)
                                      ↕
                              AI Services (OpenAI)
```

## ⚡ Quick Start

### Prerequisites
- Node.js (v16+)
- OpenAI API key

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd retailReady2
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment setup**
   ```bash
   cp backend/env.example backend/.env
   # Add your OpenAI API key to .env
   ```

3. **Start the application**
   ```bash
   # Backend (port 3001)
   cd backend && npm start
   
   # Frontend (port 3000/3002)
   cd frontend && npm run dev
   ```

4. **Access**
   - Frontend: http://localhost:3000 (or 3002)
   - Backend API: http://localhost:3001/api

## 📖 Usage

### Upload Documents
- Drag & drop PDF compliance documents
- AI automatically extracts requirements and violations
- Supports up to 10MB PDF files

### Risk Management
- **Risk Calculator**: Select violations and calculate potential fines
- **Risk Overview**: Predict violations before they happen using contextual factors
- **Analytics**: View compliance statistics and performance metrics

### Worker Interface
- Sign in with worker ID (demo IDs provided)
- Access packing guides and verification tools
- Track performance and streaks

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/violations` | Get violations with filtering |
| POST | `/api/upload` | Upload and parse PDF documents |
| POST | `/api/risk/score` | Calculate risk scores |
| POST | `/api/risk/overview` | Get risk overview predictions |
| GET | `/api/health` | Health check |

## 🗂️ Project Structure

```
retailReady2/
├── backend/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── config/          # Database & config
│   └── server.js        # Main server
├── frontend/
│   ├── src/
│   │   ├── pages/       # Main application pages
│   │   ├── components/  # Reusable components
│   │   └── utils/       # API & utilities
│   └── public/          # Static assets
└── README.md
```

## 🛠️ Development

### Running in Development
```bash
# Backend with auto-restart
cd backend && npm run dev

# Frontend with hot reload
cd frontend && npm run dev
```

### Building for Production
```bash
cd frontend && npm run build
cd backend && npm start
```

## 🐛 Troubleshooting

- **OpenAI API Errors**: Verify API key and billing
- **File Upload Issues**: Check PDF format and size (max 10MB)
- **Port Conflicts**: Change PORT in .env file
- **Database Issues**: Check file permissions for `compliance.db`

## 📝 Recent Updates

- ✅ Added Risk Overview feature with rules-based prediction
- ✅ Restructured to multi-page application with React Router
- ✅ Added 15 workers with varied experience levels
- ✅ Removed emojis for professional appearance
- ✅ Cleaned up unused components and code

## 📄 License

MIT License - see LICENSE file for details.

---

**RetailReady** - Making compliance management simple and intelligent.
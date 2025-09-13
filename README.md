# RetailReady MVP - Compliance Risk Assessment Tool

A full-stack SaaS tool that parses retailer compliance guides, extracts requirements and violations, and provides risk assessment for supply chain teams.

## 🚀 Features

- **PDF Upload & Parsing**: Upload retailer compliance guides and extract structured data using AI
- **Requirements Database**: Store and query compliance requirements, violations, and fine structures
- **Risk Calculator**: Estimate financial exposure based on shipment size and violations
- **Interactive Dashboard**: Browse, filter, and search compliance requirements
- **Pre-seeded Data**: Includes Dick's Sporting Goods compliance rules for immediate demo

## 🛠 Tech Stack

### Backend
- Node.js + Express
- SQLite for data storage
- OpenAI API for PDF parsing
- Multer for file uploads
- pdf-parse for text extraction

### Frontend
- React + TypeScript + Vite
- TailwindCSS for styling
- Axios for API calls
- Lucide React for icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## 🚀 Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd retailReady2
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend development server on http://localhost:3000

4. **Open your browser** and navigate to http://localhost:3000

## 📊 API Endpoints

- `POST /api/upload` - Upload and parse PDF compliance guides
- `GET /api/violations` - Retrieve all compliance violations
- `GET /api/categories` - Get available categories for filtering
- `POST /api/risk-score` - Calculate risk score for a violation

## 🎯 Usage

1. **Upload Compliance Guide**: Drag and drop a PDF file to extract compliance requirements
2. **Browse Requirements**: View all compliance violations with filtering options
3. **Calculate Risk**: Select a violation and enter shipment size to estimate potential fines
4. **Filter Data**: Use category, severity, and retailer filters to narrow down results

## 📁 Project Structure

```
retailReady2/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── compliance.db      # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── App.tsx        # Main application component
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
└── package.json           # Root package.json with scripts
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database
The SQLite database is automatically created and seeded with Dick's Sporting Goods compliance data on first run.

## 📈 Seed Data

The application comes pre-loaded with Dick's Sporting Goods compliance requirements including:

- Labeling requirements (UCC-128 labels, UPC codes)
- ASN submission requirements
- Packaging standards
- Delivery timeframes
- Fine structures for violations

## 🚀 Deployment

### Local Deployment
The application runs locally with the `npm run dev` command.

### Cloud Deployment (Stretch Goal)
- Frontend: Deploy to Vercel
- Backend: Deploy to Railway/Render/Heroku
- Database: Use cloud SQLite or PostgreSQL

## 🎨 UI Components

- **UploadZone**: Drag-and-drop PDF upload with progress indicators
- **ViolationsList**: Card-based display of compliance requirements
- **RiskCalculator**: Interactive risk assessment tool
- **FilterBar**: Multi-criteria filtering system
- **Header**: Application branding and navigation

## 🔮 Future Enhancements

- Multi-retailer support (Target, Walmart, etc.)
- Worker checklist functionality
- Automated compliance alerts
- AI-powered rule explanations
- Cloud storage and multi-user accounts
- Advanced analytics and reporting

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.


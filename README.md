# RetailReady - Compliance Risk Assessment Platform

## Overview

RetailReady is a comprehensive compliance management system that helps retailers and suppliers manage compliance requirements, assess risks, and calculate potential fines. The system uses AI-powered document parsing to extract compliance data from PDF documents and provides detailed risk assessment tools.

## Features

### 🤖 AI-Powered Document Parsing
- Upload PDF compliance documents
- Automatic extraction of requirements, violations, and fine structures
- Intelligent categorization and severity assessment
- Support for multiple retailers and compliance standards

### 📊 Risk Assessment Calculator
- Interactive risk calculation based on violation quantities
- Real-time fine estimation
- Risk level determination (High, Medium, Low)
- Comprehensive risk factor analysis

### 🔍 Advanced Filtering & Search
- Filter by category, severity, and retailer
- Real-time search and filtering
- Organized database views
- Detailed violation information

### 📈 Data Management
- SQLite database for reliable data storage
- Organized data views by retailer and category
- Comprehensive violation tracking
- Data export capabilities

## Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Express)     │◄──►│   Services      │
│                 │    │                 │    │   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite)      │
                       └─────────────────┘
```

### Backend Architecture
- **Modular Design**: Separated into config, routes, services, and utilities
- **Service Layer**: Clean separation of business logic from HTTP concerns
- **Database Layer**: Abstracted database operations with comprehensive error handling
- **AI Integration**: OpenAI GPT models for intelligent document parsing

### Frontend Architecture
- **Component-Based**: Reusable React components with TypeScript
- **Custom Hooks**: Centralized state management and API interactions
- **Utility Functions**: Shared constants, API helpers, and validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retailReady2
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   
   # Edit .env file with your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend development server (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

## Usage Guide

### 1. Upload Compliance Documents

1. Navigate to the "Upload Compliance Guide" section
2. Drag and drop a PDF file or click to browse
3. Wait for the AI parsing to complete
4. Review the extracted requirements

**Supported Formats:**
- PDF files only
- Maximum file size: 10MB
- Text-based PDFs (scanned PDFs may not work well)

### 2. View Compliance Requirements

1. Browse the "Compliance Requirements" section
2. Use filters to narrow down results:
   - **Category**: Labeling, ASN, Packaging, Delivery, etc.
   - **Severity**: High, Medium, Low
   - **Retailer**: Dick's Sporting Goods, Uploaded Document, etc.
3. Click on any violation for detailed information

### 3. Calculate Risk Assessment

1. Go to the "Risk Assessment Calculator" section
2. Select a violation from the dropdown
3. Enter the number of units affected
4. Click "Calculate Risk" to see:
   - Estimated fine amount
   - Risk level assessment
   - Risk factors and recommendations

### 4. Database View

1. Click "Show Database View" to see organized data
2. View data grouped by retailer and category
3. See summary statistics and violation counts
4. Access detailed views for specific combinations

## API Documentation

### Violations Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/violations` | Get all violations with optional filtering |
| GET | `/api/violations/:id` | Get specific violation by ID |
| GET | `/api/violations/categories` | Get all unique categories |
| GET | `/api/violations/retailers` | Get all unique retailers |
| GET | `/api/violations/database-view` | Get organized database view |
| GET | `/api/violations/database-view/:retailer/:category` | Get detailed view |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and parse PDF compliance document |
| POST | `/api/upload/validate` | Validate PDF file without processing |
| GET | `/api/upload/info` | Get upload requirements |

### Risk Assessment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/risk/score` | Calculate risk score for specific violation |
| POST | `/api/risk/batch` | Calculate risk scores for multiple violations |
| POST | `/api/risk/estimate` | Estimate fine without database lookup |
| GET | `/api/risk/config` | Get risk calculation configuration |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api` | API information and available endpoints |

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
VITE_API_URL=http://localhost:3001
```

### Database Configuration

The application uses SQLite for data storage. The database file is automatically created at `backend/compliance.db`.

**Database Schema:**
```sql
CREATE TABLE violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requirement TEXT NOT NULL,
  violation TEXT NOT NULL,
  fine TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  retailer TEXT DEFAULT 'Unknown',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Project Structure

```
retailReady2/
├── backend/                 # Backend application
│   ├── config/              # Configuration modules
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── uploads/             # File upload storage
│   └── server-refactored.js # Main server application
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── types.ts        # TypeScript definitions
│   └── public/             # Static assets
├── ARCHITECTURE.md         # Detailed architecture guide
└── README.md              # This file
```

### Running in Development Mode

1. **Backend Development**
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev  # Vite development server with HMR
   ```

### Building for Production

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd backend
   npm start
   ```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use the built-in API documentation at `http://localhost:3001/api` or tools like Postman/Insomnia.

## Deployment

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t retailready .
   ```

2. **Run Container**
   ```bash
   docker run -p 3001:3001 -e OPENAI_API_KEY=your_key retailready
   ```

### Environment-Specific Deployment

1. **Production Environment**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Staging Environment**
   ```bash
   NODE_ENV=staging npm start
   ```

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account billing
   - Ensure you have sufficient API credits

2. **File Upload Issues**
   - Verify file is PDF format
   - Check file size (max 10MB)
   - Ensure PDF contains readable text

3. **Database Issues**
   - Check file permissions for `compliance.db`
   - Verify SQLite installation
   - Check disk space availability

4. **Port Conflicts**
   - Change PORT in environment variables
   - Check if port 3001 is already in use
   - Use `lsof -i :3001` to check port usage

### Debug Mode

Enable debug logging:
```bash
DEBUG=retailready:* npm start
```

### Logs

- **Application Logs**: Console output with timestamps
- **Error Logs**: Detailed error information with stack traces
- **API Logs**: Request/response logging for debugging

## Contributing

### Development Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow ESLint and Prettier configurations
   - Write comprehensive JSDoc comments

2. **Git Workflow**
   - Create feature branches for new functionality
   - Write descriptive commit messages
   - Include tests for new features

3. **Testing**
   - Write unit tests for new functions
   - Include integration tests for API endpoints
   - Test error handling scenarios

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request with description
5. Address review feedback

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

### Getting Help

1. **Documentation**: Check this README and ARCHITECTURE.md
2. **Issues**: Create GitHub issues for bugs or feature requests
3. **Discussions**: Use GitHub Discussions for questions

### Contact

- **Project Maintainer**: RetailReady Team
- **Email**: support@retailready.com
- **GitHub**: [Repository Issues](https://github.com/retailready/issues)

## Changelog

### Version 1.0.0
- Initial release with core functionality
- AI-powered document parsing
- Risk assessment calculator
- Comprehensive filtering and search
- Database management system

### Future Roadmap
- User authentication and authorization
- Multi-tenant support
- Advanced reporting and analytics
- Integration with external compliance systems
- Mobile application
- Real-time notifications

---

**RetailReady** - Making compliance management simple and intelligent.
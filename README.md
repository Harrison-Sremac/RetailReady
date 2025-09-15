# RetailReady - AI-Powered Compliance Management Platform

**Author:** Harrison Sremac

A comprehensive compliance risk assessment platform that helps retailers and suppliers manage compliance requirements, assess risks, and calculate potential fines using AI-powered document parsing. Built with modern web technologies and designed for enterprise use.

## Quick Deploy to Railway

Deploy this application to Railway in minutes:

1. **Fork this repository** to your GitHub account
2. **Sign up at [Railway](https://railway.app)** and connect your GitHub
3. **Create a new project** and select your forked repository
4. **Set environment variables**:
   - `NODE_ENV=production`
   - `OPENAI_API_KEY=your_openai_api_key_here`
5. **Add a persistent volume** mounted at `/data` for the database
6. **Deploy!** Railway will automatically build and deploy your app

**Detailed deployment guide**: See [RAILWAY_DEPLOYMENT.md](./docs/RAILWAY_DEPLOYMENT.md)

**Quick deploy script**: Run `npm run railway:deploy` (requires Railway CLI)

## Features

### Core Functionality
- **AI Document Parsing**: Upload PDF compliance documents for automatic requirement extraction using OpenAI GPT models with dynamic retailer detection
- **Risk Assessment Calculator**: Interactive calculator for violation quantities and fine estimation with real-time calculations
- **Risk Overview System**: Proactive risk prediction using rules-based matching engine (no ML training required)
- **Multi-Page Interface**: Clean, professional dashboard with separate sections for different workflows
- **Worker Tools**: Comprehensive interface for warehouse workers with guidance and scanning capabilities
- **Compliance Management**: Advanced filtering and search capabilities for violations by category, severity, and retailer
- **Task Assignment System**: Intelligent task assignment and optimization for warehouse operations
- **Worker Management Dashboard**: Comprehensive worker performance tracking and analytics

### Advanced Features
- **Dynamic Retailer Detection**: Automatically identifies document type (Dick's Sporting Goods, Walmart, Target, Amazon, or Generic)
- **Comprehensive Violation Extraction**: Finds 10+ violations per document instead of just 5 hardcoded violations
- **Real-time Risk Scoring**: Dynamic risk level determination (High, Medium, Low) based on multiple factors
- **Contextual Risk Analysis**: Consider time of day, shift load, worker experience, and environmental factors
- **Routing Guide Analysis**: Parse and analyze complex routing guide documents with order types and specifications
- **Performance Tracking**: Worker performance metrics and streak tracking
- **Database Management**: SQLite-based data storage with organized views and comprehensive violation tracking
- **Flexible Parsing System**: Adapts parsing approach based on detected retailer with fallback for unknown retailers

## Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Express)     │◄──►│   Services      │
│   TypeScript    │    │   Node.js       │    │   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite)      │
                       └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, SQLite3
- **AI Integration**: OpenAI GPT-4 for document parsing
- **Development**: Vite, ESLint, Prettier
- **Deployment**: Docker-ready, environment-based configuration

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- OpenAI API key with GPT-4 access
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harrison-Sremac/RetailReady.git
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

3. **Environment setup**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   
   # Edit .env file with your configuration
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start backend server (Terminal 1)
   cd backend
   npm start
   
   # Start frontend development server (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000 (or 3002 if 3000 is occupied)
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

## Detailed Usage Guide

### 1. Document Upload and Parsing

#### Supported Document Types
- **Format**: PDF files only
- **Size Limit**: Maximum 10MB per file
- **Content**: Text-based PDFs (scanned PDFs may have limited functionality)
- **Sources**: Compliance guides, routing guides, requirement documents

#### Upload Process
1. Navigate to the "Overview" page
2. Locate the "Upload Compliance Guide" section
3. Drag and drop your PDF file or click to browse
4. Wait for AI parsing to complete (typically 10-30 seconds)
5. Review extracted requirements in the compliance section

#### What Gets Extracted
- Compliance requirements and violations (10+ per document)
- Fine structures and penalty amounts
- Category classifications (Pre-Packing, During Packing, Post-Packing, etc.)
- Severity levels (High, Medium, Low)
- Retailer-specific requirements and violation codes
- Order types and packing methods
- Carton specifications and dimensional requirements
- Label placement rules and positioning requirements
- Timing requirements and deadlines
- Shipping requirements and carrier specifications
- Documentation requirements (EDI, ASN, etc.)
- Product-specific compliance rules

### 2. Risk Management Tools

#### Risk Assessment Calculator
1. Navigate to the "Risk Management" page
2. Select a violation from the dropdown menu
3. Enter the number of units affected
4. Select frequency of occurrence
5. Click "Calculate Risk Score" to see:
   - Estimated fine amount
   - Risk level assessment
   - Risk factors and recommendations
   - Historical compliance data

#### Risk Overview System
1. Access the "Risk Overview" section on the Risk Management page
2. Select an order from the dropdown
3. Choose a worker from the available options
4. Adjust contextual factors:
   - Time of day (Day/Night)
   - Day of week
   - Shift load (Low/Medium/High)
   - Weather conditions
5. Click "Calculate Risk Overview" to see:
   - Predicted risk level
   - Risk factors identified
   - Recommendations for risk mitigation
   - Assignment suggestions

### 3. Compliance Management

#### Filtering and Search
1. Navigate to the "Compliance" page
2. Use the filter bar to narrow results:
   - **Category**: Pre-Packing, During Packing, Post-Packing, Pre-Shipment, EDI/Digital, Carrier/Routing
   - **Severity**: High, Medium, Low
   - **Retailer**: Dick's Sporting Goods, Uploaded Document, etc.
3. View filtered results in real-time
4. Click on any violation for detailed information

#### Compliance Statistics
- Total requirements count
- Risk distribution (High/Medium/Low)
- Category breakdown
- Retailer-specific compliance data

### 4. Worker Interface

#### Worker Sign-In
1. Navigate to the "Workers" page
2. Use one of the demo worker IDs:
   - johnny123 - Johnny Appleseed
   - john456 - John Smith
   - sarah789 - Sarah Johnson
   - mike001 - Mike Rodriguez
   - lisa002 - Lisa Chen
   - maria008 - Maria Garcia
   - (and 9 more workers with varied experience)

#### Worker Tools
- **Packing Guides**: Visual guides for different order types
- **Verification Tools**: UPC verification, label placement guides
- **Performance Tracking**: Streak counters and performance metrics
- **Order Scanning**: Simulated order processing with guidance

### 5. Analytics and Insights

#### Routing Guide Analysis
- Parse complex routing guide documents
- Extract order types and specifications
- Analyze carton specifications
- View violation matrices and timing rules

#### Performance Metrics
- Compliance statistics
- Risk distribution analysis
- Worker performance data
- System health monitoring

## API Documentation

### Core Endpoints

#### Violations Management
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/violations` | Get all violations with optional filtering | `?category=Pre-Packing&severity=High` |
| GET | `/api/violations/:id` | Get specific violation by ID | `id` (number) |
| GET | `/api/violations/categories` | Get all unique categories | None |
| GET | `/api/violations/retailers` | Get all unique retailers | None |

#### File Upload
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload and parse PDF compliance document | `FormData` with PDF file |
| POST | `/api/upload/validate` | Validate PDF file without processing | `FormData` with PDF file |
| GET | `/api/upload/info` | Get upload requirements and limits | None |

#### Risk Assessment
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/risk/score` | Calculate risk score for specific violation | `{violationId, units}` |
| POST | `/api/risk/batch` | Calculate risk scores for multiple violations | `{violations[], units}` |
| POST | `/api/risk/estimate` | Estimate fine without database lookup | `{violation, units}` |
| POST | `/api/risk/overview` | Get risk overview prediction | `{orderId, workerId, context}` |
| GET | `/api/risk/config` | Get risk calculation configuration | None |

#### Worker Management
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/worker/scan` | Process worker scan/order | `{workerId, orderData}` |
| GET | `/api/worker` | Get worker performance data | `?workerId=johnny123` |

#### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api` | API information and available endpoints |

### API Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2025-09-15T02:31:08.521Z"
}
```

## Project Structure

```
retailReady2/
├── backend/                    # Backend application
│   ├── config/                 # Configuration modules
│   │   ├── database.js         # Database setup and seeding
│   │   └── upload.js           # File upload configuration
│   ├── routes/                 # API route handlers
│   │   ├── risk.js             # Risk calculation endpoints
│   │   ├── upload.js           # File upload endpoints
│   │   ├── violations.js       # Violations management
│   │   ├── worker.js           # Worker interface endpoints
│   │   ├── riskOverview.js     # Risk overview endpoints
│   │   ├── taskAssignment.js   # Task assignment endpoints
│   │   └── workerManagement.js # Worker management endpoints
│   ├── services/               # Business logic services
│   │   ├── databaseService.js  # Database operations
│   │   ├── parserService.js    # AI document parsing with retailer detection
│   │   ├── riskService.js      # Risk calculation logic
│   │   ├── workerService.js    # Worker management
│   │   ├── riskOverview.js     # Risk overview logic
│   │   ├── taskAssignmentService.js # Task assignment logic
│   │   └── workerManagementData.js # Worker management data seeding
│   ├── uploads/                # File upload storage
│   ├── compliance.db           # SQLite database
│   ├── test-parser.js          # PDF parsing test utility
│   └── server.js               # Main server application
├── frontend/                   # Frontend application
│   ├── src/
│   │   ├── pages/              # Main application pages
│   │   │   ├── OverviewPage.tsx     # Dashboard overview
│   │   │   ├── CompliancePage.tsx   # Compliance management
│   │   │   ├── RiskPage.tsx         # Risk management
│   │   │   ├── WorkersPage.tsx      # Worker tools
│   │   │   ├── AnalyticsPage.tsx    # Analytics & insights
│   │   │   ├── TaskAssignmentPage.tsx # Task assignment interface
│   │   │   └── WorkerManagementPage.tsx # Worker management dashboard
│   │   ├── components/         # Reusable React components
│   │   │   ├── Navigation.tsx       # Main navigation
│   │   │   ├── UploadZone.tsx      # File upload component
│   │   │   ├── RiskCalculator.tsx   # Risk calculation tool
│   │   │   ├── RiskOverviewDemo.tsx # Risk overview interface
│   │   │   ├── WorkerInterface.tsx  # Worker tools interface
│   │   │   ├── FilterBar.tsx        # Compliance filtering
│   │   │   ├── ViolationsList.tsx   # Violations display
│   │   │   ├── RoutingGuideViewer.tsx # Routing guide analysis
│   │   │   ├── TaskAssignmentSystem.tsx # Task assignment interface
│   │   │   ├── WorkerManagementDashboard.tsx # Worker management dashboard
│   │   │   ├── ViolationMatrixHeatMap.tsx # Violation matrix visualization
│   │   │   ├── CartonSpecValidator.tsx # Carton specification validator
│   │   │   ├── OrderTypeDecisionTree.tsx # Order type decision tree
│   │   │   └── ui/                  # UI components
│   │   │       ├── CategoryBadge.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── SeverityBadge.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useRiskCalculation.ts
│   │   │   └── useViolations.ts
│   │   ├── utils/              # Utility functions
│   │   │   ├── api.ts              # API client functions
│   │   │   ├── categories.ts       # Category definitions
│   │   │   └── constants.ts        # Application constants
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── App.tsx             # Main application component
│   │   └── main.tsx            # Application entry point
│   ├── public/                 # Static assets
│   │   └── worker-images/      # Worker guidance images
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Vite configuration
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # Detailed architecture documentation
│   ├── IMPLEMENTATION_DOCUMENTATION.md # Implementation details
│   └── RAILWAY_DEPLOYMENT.md   # Railway deployment guide
├── scripts/                    # Build and deployment scripts
│   ├── build.sh               # Build script
│   └── deploy-to-railway.sh   # Railway deployment script
├── assets/                     # Static assets
│   ├── pp.webp                # Profile picture
│   └── Dicks Routing Guide (1).pdf # Sample routing guide
└── README.md                   # This file
```

## Development

### Development Environment Setup

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

3. **Database Development**
   ```bash
   # Reset database (removes all data)
   rm backend/compliance.db
   cd backend && npm start
   ```

### Code Quality Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety and better development experience
- **JSDoc**: Comprehensive documentation

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

3. **Environment Configuration**
   ```bash
   NODE_ENV=production npm start
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
- Use the built-in API documentation at `http://localhost:3001/api`
- Tools like Postman, Insomnia, or curl for endpoint testing
- Example API calls:
  ```bash
  # Health check
  curl http://localhost:3001/api/health
  
  # Get violations
  curl http://localhost:3001/api/violations
  
  # Risk overview
  curl -X POST http://localhost:3001/api/risk/overview \
    -H "Content-Type: application/json" \
    -d '{"orderId":"ORD-001","workerId":"johnny123","context":{}}'
  ```

## Troubleshooting

### Common Issues

#### OpenAI API Errors
- **Problem**: API key invalid or expired
- **Solution**: Verify API key in `.env` file and check OpenAI account billing
- **Debug**: Check API credits and usage limits

#### File Upload Issues
- **Problem**: Upload fails or parsing errors
- **Solution**: 
  - Verify file is PDF format
  - Check file size (max 10MB)
  - Ensure PDF contains readable text (not scanned images)
- **Debug**: Check browser console and backend logs

#### Database Issues
- **Problem**: Database connection errors
- **Solution**:
  - Check file permissions for `compliance.db`
  - Verify SQLite installation
  - Check disk space availability
- **Debug**: Check database file exists and is writable

#### Port Conflicts
- **Problem**: Port 3001 already in use
- **Solution**:
  - Change PORT in environment variables
  - Kill existing process: `lsof -ti:3001 | xargs kill -9`
  - Use different port: `PORT=3002 npm start`

#### Frontend Build Issues
- **Problem**: Build fails or dependencies missing
- **Solution**:
  - Clear node_modules: `rm -rf node_modules && npm install`
  - Update dependencies: `npm update`
  - Check Node.js version compatibility

### Debug Mode

Enable debug logging:
```bash
DEBUG=retailready:* npm start
```

### Logs and Monitoring

- **Application Logs**: Console output with timestamps
- **Error Logs**: Detailed error information with stack traces
- **API Logs**: Request/response logging for debugging
- **Database Logs**: SQL query logging (in development)

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

#### Production Environment
```bash
NODE_ENV=production npm start
```

#### Staging Environment
```bash
NODE_ENV=staging npm start
```

### Cloud Deployment Options

- **Heroku**: Easy deployment with environment variables
- **AWS**: EC2 instances with RDS for database
- **Google Cloud**: App Engine or Compute Engine
- **Azure**: App Service or Virtual Machines

## Performance Considerations

### Backend Optimization
- Database indexing for faster queries
- Connection pooling for database connections
- Caching for frequently accessed data
- Rate limiting for API endpoints

### Frontend Optimization
- Code splitting for faster loading
- Image optimization and lazy loading
- Bundle size optimization
- Progressive Web App features

### Scalability
- Horizontal scaling with load balancers
- Database replication for high availability
- CDN for static assets
- Microservices architecture for large deployments

## Security Considerations

### API Security
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Environment variable protection

### Data Security
- SQL injection prevention
- File upload validation
- Secure file storage
- Data encryption at rest

### Authentication (Future)
- JWT token-based authentication
- Role-based access control
- Multi-factor authentication
- Session management

## Recent Updates

### Version 2.1.0 (Current)
- **Dynamic PDF Parsing**: Implemented retailer detection system for automatic document type identification
- **Comprehensive Violation Extraction**: Enhanced parsing to find 10+ violations per document instead of 5 hardcoded violations
- **Flexible Parsing System**: Added support for multiple retailers (Dick's, Walmart, Target, Amazon, Generic)
- **Enhanced Data Structure**: Added retailer identification and comprehensive requirement categories
- **Task Assignment System**: Intelligent task assignment and optimization for warehouse operations
- **Worker Management Dashboard**: Comprehensive worker performance tracking and analytics
- **Improved Error Handling**: Better error messages and validation for parsing operations
- **Code Optimization**: Enhanced parser service with dynamic prompt generation

### Version 2.0.0 (Previous)
- **Risk Overview Feature**: Added rules-based risk prediction system
- **Multi-Page Application**: Restructured from single-page to multi-page with React Router
- **Expanded Worker Database**: Added 15 workers with varied experience levels
- **Professional Design**: Removed emojis for enterprise-ready appearance
- **Code Cleanup**: Removed unused components and optimized codebase
- **Enhanced Navigation**: Clean, professional navigation system
- **Improved Documentation**: Comprehensive README and architecture docs

### Version 1.0.0 (Previous)
- Initial release with core functionality
- AI-powered document parsing
- Risk assessment calculator
- Basic compliance management
- Worker interface

### Future Roadmap
- **User Authentication**: Login system with role-based access
- **Multi-tenant Support**: Support for multiple organizations
- **Advanced Analytics**: Machine learning insights and predictions
- **Mobile Application**: React Native mobile app
- **Real-time Notifications**: WebSocket-based alerts
- **Integration APIs**: Connect with external compliance systems
- **Advanced Reporting**: PDF report generation and export
- **Workflow Automation**: Automated compliance checking

## Contributing

### Development Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow ESLint and Prettier configurations
   - Write comprehensive JSDoc comments
   - Use meaningful variable and function names

2. **Git Workflow**
   - Create feature branches for new functionality
   - Write descriptive commit messages
   - Include tests for new features
   - Update documentation for new features

3. **Testing Requirements**
   - Write unit tests for new functions
   - Include integration tests for API endpoints
   - Test error handling scenarios
   - Ensure backward compatibility

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request with detailed description
7. Address review feedback
8. Merge after approval

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Getting Help

1. **Documentation**: Check this README and ARCHITECTURE.md
2. **Issues**: Create GitHub issues for bugs or feature requests
3. **Discussions**: Use GitHub Discussions for questions and ideas
4. **Code Review**: Submit pull requests for improvements

### Contact Information

- **Project Maintainer**: Harrison Sremac
- **Repository**: [GitHub Repository](https://github.com/Harrison-Sremac/RetailReady)
- **Issues**: [GitHub Issues](https://github.com/Harrison-Sremac/RetailReady/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Harrison-Sremac/RetailReady/discussions)

---

**RetailReady** - Making compliance management simple, intelligent, and scalable for modern retail operations.
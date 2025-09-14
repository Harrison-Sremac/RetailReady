# RetailReady Architecture Guide

## Overview

RetailReady is a compliance management system that helps retailers and suppliers manage compliance requirements, assess risks, and calculate potential fines. The system uses AI-powered document parsing to extract compliance data from PDF documents and provides comprehensive risk assessment tools.

## System Architecture

### High-Level Architecture

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

## Backend Architecture

### Directory Structure

```
backend/
├── config/                 # Configuration modules
│   ├── database.js         # Database configuration and initialization
│   └── upload.js           # File upload configuration
├── routes/                 # API route handlers
│   ├── violations.js      # Violation management routes
│   ├── upload.js           # File upload routes
│   └── risk.js            # Risk calculation routes
├── services/               # Business logic services
│   ├── parserService.js   # AI document parsing service
│   ├── databaseService.js # Database operations service
│   └── riskService.js     # Risk calculation service
├── uploads/                # File upload storage
├── server-refactored.js   # Main server application
└── parser.js              # Legacy parser (deprecated)
```

### Core Components

#### 1. Configuration Layer (`config/`)

**Purpose**: Centralized configuration management for database, uploads, and other system settings.

**Files**:
- `database.js`: Database connection, table creation, and seed data management
- `upload.js`: File upload configuration using Multer middleware

**Key Features**:
- Environment-based configuration
- Automatic database initialization
- File validation and storage management
- Error handling for configuration issues

#### 2. Service Layer (`services/`)

**Purpose**: Business logic implementation separated from HTTP concerns.

**Files**:
- `parserService.js`: AI-powered document parsing using OpenAI GPT models
- `databaseService.js`: Database operations abstraction layer
- `riskService.js`: Risk assessment and financial impact calculations

**Key Features**:
- Clean separation of concerns
- Comprehensive error handling
- Input validation and sanitization
- Detailed logging and monitoring

#### 3. Route Layer (`routes/`)

**Purpose**: HTTP request handling and API endpoint definitions.

**Files**:
- `violations.js`: CRUD operations for compliance violations
- `upload.js`: File upload and document processing endpoints
- `risk.js`: Risk calculation and assessment endpoints

**Key Features**:
- RESTful API design
- Input validation and sanitization
- Comprehensive error responses
- Detailed API documentation

#### 4. Main Server (`server-refactored.js`)

**Purpose**: Application initialization, middleware setup, and lifecycle management.

**Key Features**:
- Modular application structure
- Graceful startup and shutdown
- Comprehensive error handling
- Environment-based configuration

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── components/            # React components
│   ├── Header.tsx         # Application header
│   ├── UploadZone.tsx     # File upload component
│   ├── ViolationsList.tsx # Violations display component
│   ├── RiskCalculator.tsx # Risk assessment component
│   └── FilterBar.tsx     # Data filtering component
├── types.ts               # TypeScript type definitions
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

### Component Architecture

#### 1. App Component (`App.tsx`)
- **Purpose**: Main application container and state management
- **Responsibilities**: Data fetching, filtering, and component coordination
- **State Management**: Uses React hooks for local state management

#### 2. Header Component (`Header.tsx`)
- **Purpose**: Application branding and navigation
- **Features**: Logo, title, and version information

#### 3. UploadZone Component (`UploadZone.tsx`)
- **Purpose**: File upload interface with drag-and-drop support
- **Features**: PDF validation, progress indication, and error handling

#### 4. ViolationsList Component (`ViolationsList.tsx`)
- **Purpose**: Display compliance violations in a structured format
- **Features**: Sortable columns, severity indicators, and detailed information

#### 5. RiskCalculator Component (`RiskCalculator.tsx`)
- **Purpose**: Interactive risk assessment tool
- **Features**: Unit input, fine calculation, and risk level determination

#### 6. FilterBar Component (`FilterBar.tsx`)
- **Purpose**: Data filtering interface
- **Features**: Category, severity, and retailer filtering

## Data Flow

### 1. Document Upload and Processing

```
User Upload → Frontend Validation → Backend Upload → PDF Text Extraction → AI Parsing → Database Storage → Response
```

**Detailed Flow**:
1. User selects PDF file in frontend
2. Frontend validates file type and size
3. File sent to backend via multipart form data
4. Backend validates file and extracts text using pdf-parse
5. Text sent to OpenAI for structured data extraction
6. Parsed requirements stored in SQLite database
7. Success response sent to frontend
8. Frontend refreshes violation list

### 2. Risk Assessment

```
Violation Selection → Unit Input → Risk Calculation → Fine Estimation → Risk Level Determination → Display Results
```

**Detailed Flow**:
1. User selects violation from list
2. User inputs number of units affected
3. Frontend sends request to risk calculation endpoint
4. Backend retrieves violation details from database
5. Risk service calculates estimated fine based on fine structure
6. Risk level determined based on thresholds
7. Comprehensive assessment returned to frontend
8. Results displayed with risk factors and recommendations

### 3. Data Retrieval and Filtering

```
Filter Selection → API Request → Database Query → Data Processing → Response → Frontend Update
```

**Detailed Flow**:
1. User applies filters (category, severity, retailer)
2. Frontend sends filtered request to API
3. Backend queries database with filter parameters
4. Data processed and formatted for response
5. Frontend updates violation list with filtered results

## Database Schema

### Violations Table

```sql
CREATE TABLE violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requirement TEXT NOT NULL,           -- Compliance requirement text
  violation TEXT NOT NULL,             -- Description of what constitutes violation
  fine TEXT NOT NULL,                 -- Fine structure and amount
  category TEXT NOT NULL,             -- Category (Labeling, ASN, Packaging, etc.)
  severity TEXT NOT NULL,             -- Severity level (High, Medium, Low)
  retailer TEXT DEFAULT 'Unknown',    -- Retailer name
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Data Relationships

- **One-to-Many**: Retailer → Violations
- **One-to-Many**: Category → Violations
- **One-to-Many**: Severity → Violations

## API Endpoints

### Violations Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/violations` | Get all violations with optional filtering |
| GET | `/api/violations/:id` | Get specific violation by ID |
| GET | `/api/violations/categories` | Get all unique categories |
| GET | `/api/violations/retailers` | Get all unique retailers |
| GET | `/api/violations/database-view` | Get organized database view |
| GET | `/api/violations/database-view/:retailer/:category` | Get detailed view for specific retailer/category |
| GET | `/api/violations/stats` | Get database statistics |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and parse PDF compliance document |
| POST | `/api/upload/validate` | Validate PDF file without processing |
| GET | `/api/upload/info` | Get upload requirements and configuration |

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

## Security Considerations

### 1. File Upload Security
- File type validation (PDF only)
- File size limits (10MB maximum)
- Temporary file cleanup
- Input sanitization

### 2. API Security
- CORS configuration
- Input validation and sanitization
- Error message sanitization
- Rate limiting considerations

### 3. Data Security
- SQL injection prevention using parameterized queries
- Environment variable management for sensitive data
- Database file permissions

## Performance Considerations

### 1. Database Optimization
- Indexed columns for frequent queries
- Efficient query patterns
- Connection pooling considerations

### 2. File Processing
- Asynchronous file processing
- Temporary file cleanup
- Memory management for large files

### 3. API Performance
- Response caching where appropriate
- Efficient data serialization
- Error handling without performance impact

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless application design
- External database considerations
- Load balancer compatibility

### 2. Vertical Scaling
- Memory optimization
- CPU-intensive task optimization
- Database query optimization

### 3. Future Enhancements
- Microservices architecture potential
- Container deployment readiness
- Cloud service integration

## Monitoring and Logging

### 1. Application Logging
- Structured logging with timestamps
- Error tracking and reporting
- Performance metrics

### 2. Health Monitoring
- Health check endpoints
- Database connectivity monitoring
- External service status

### 3. Error Handling
- Comprehensive error responses
- User-friendly error messages
- Debug information in development

## Development Workflow

### 1. Code Organization
- Modular architecture
- Clear separation of concerns
- Consistent naming conventions

### 2. Documentation
- Comprehensive JSDoc comments
- API documentation
- Architecture documentation

### 3. Testing Considerations
- Unit test structure
- Integration test setup
- End-to-end test planning

## Deployment Architecture

### 1. Development Environment
- Local SQLite database
- File-based upload storage
- Environment variable configuration

### 2. Production Considerations
- Database migration strategy
- File storage solutions
- Environment configuration management
- Security hardening

### 3. Container Deployment
- Docker containerization
- Environment variable injection
- Volume management for persistent data

## Future Enhancements

### 1. Feature Additions
- User authentication and authorization
- Multi-tenant support
- Advanced reporting and analytics
- Integration with external compliance systems

### 2. Technical Improvements
- Microservices architecture
- Event-driven architecture
- Real-time notifications
- Advanced caching strategies

### 3. Performance Optimizations
- Database query optimization
- Caching layer implementation
- CDN integration for static assets
- Background job processing

This architecture provides a solid foundation for the RetailReady compliance management system while maintaining flexibility for future enhancements and scalability requirements.

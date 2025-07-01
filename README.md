# Saga SOA - NestJS API

A modern, scalable NestJS API application built with Nx monorepo tools, featuring MongoDB integration, comprehensive testing, and production-ready Docker deployment.

## 🚀 Features

- **NestJS Framework**: Modern Node.js framework with TypeScript
- **Nx Monorepo**: Advanced build system and development tools
- **MongoDB Integration**: Production-ready database layer with graceful degradation
- **Comprehensive Testing**: Unit tests, integration tests, and mocking
- **Docker Support**: Multi-stage builds for optimal production deployment
- **Type-Safe Configuration**: Zod-based validation with environment variables
- **Advanced Logging**: Structured logging with context
- **Health Checks**: Built-in health monitoring endpoints

## 📋 Prerequisites

- Node.js 20+ 
- pnpm 9+
- Docker and Docker Compose (for containerized deployment)
- MongoDB (optional - application runs without database)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saga-soa
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start the API in development mode
pnpm exec nx serve api

# API will be available at http://localhost:3000
```

### Production Build

```bash
# Build the application
pnpm exec nx build api

# Start the built application
cd dist/apps/api && node main.js
```

### Docker Deployment

```bash
# Start all services (API + MongoDB + Redis)
docker-compose up -d

# API will be available at http://localhost:3000
# MongoDB at localhost:27017
# Redis at localhost:6379
```

## 🧪 Testing

```bash
# Run all tests
pnpm exec nx test api

# Run tests with coverage
pnpm exec nx test api --coverage

# Run specific test file
pnpm exec nx test api --testNamePattern="CoreService"
```

## 📚 API Endpoints

### Health & Status
- `GET /health` - Application health check
- `GET /` - Basic API information

### Core Endpoints
- `GET /saga-soa` - ASCII art splash screen
- `GET /saga-soa/alive` - Sector alive status
- `GET /saga-soa/:sector/alive` - Dynamic sector status

### Users Management (requires database)
- `POST /users` - Create a new user
- `GET /users` - List users (with pagination)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/stats` - User statistics

## 🏗️ Architecture

### Project Structure
```
apps/api/src/app/
├── core/           # Core business logic (migrated from Express)
├── users/          # User management module
├── database/       # MongoDB integration
├── config/         # Configuration management
├── logger/         # Logging service
└── app.module.ts   # Root module
```

### Key Features

**Dependency Injection**: NestJS's powerful DI system replaces manual Inversify setup
**Configuration Management**: Zod-based validation with environment variable parsing
**Database Layer**: Repository pattern with MongoDB integration and graceful degradation
**Testing**: Comprehensive unit and integration tests using Jest and NestJS testing utilities
**Error Handling**: Built-in exception filters and consistent error responses

## 🔧 Configuration

The application uses environment variables for configuration:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=saga-soa

# Database
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DATABASE=saga-soa
MONGO_USERNAME=
MONGO_PASSWORD=

# Logging
LOG_LEVEL=info
```

## 🐳 Docker

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker build -f apps/api/Dockerfile -t saga-soa-api .

# Run production container
docker run -p 3000:3000 \
  -e MONGO_HOST=your-mongo-host \
  -e MONGO_DATABASE=saga-soa \
  saga-soa-api
```

## 📊 Migration Benefits

This project has been migrated from Express + Inversify to NestJS, providing:

| Aspect | Before | After |
|--------|---------|-------|
| **DI Setup** | Manual Inversify containers | Automatic NestJS modules |
| **Configuration** | Manual validation | Zod-based type-safe config |
| **Testing** | Custom setup | Built-in testing utilities |
| **Error Handling** | Custom middleware | Built-in exception filters |
| **Development** | Manual restart | Hot reload with watch |
| **Build System** | Turborepo | Nx with advanced caching |

## 🤝 Development

### Adding New Features

1. **Create a new module**
   ```bash
   pnpm exec nx g @nx/nest:module feature-name apps/api
   ```

2. **Add service and controller**
   ```bash
   pnpm exec nx g @nx/nest:service feature-name apps/api
   pnpm exec nx g @nx/nest:controller feature-name apps/api
   ```

3. **Write tests**
   - Unit tests: `feature-name.service.spec.ts`
   - Integration tests: `feature-name.integration.spec.ts`

### Code Quality

```bash
# Lint code
pnpm exec nx lint api

# Format code
pnpm format

# Type check
pnpm exec nx build api
```

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/health` endpoint
- Review the test files for usage examples
# Secure Express.js REST API with Supabase

A production-ready, secure Express.js REST API server with Supabase authentication, JWT token-based security, and comprehensive user management capabilities.

## 🚀 Features

### Core Features
- **Express.js REST API** with clean architecture
- **Supabase Authentication** for secure user management
- **JWT Token-based Security** with refresh token support
- **Comprehensive User Management** (CRUD operations)
- **Row Level Security (RLS)** policies
- **Input Validation & Sanitization**
- **Rate Limiting** to prevent abuse
- **Security Headers** with Helmet.js
- **CORS Protection** with configurable origins
- **Request Logging** with Winston
- **Health Check Endpoints** for monitoring

### Security Features
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CSRF protection
- Security-focused ESLint rules
- Environment variable validation
- Admin role-based access control

### Development Features
- **Docker Support** with multi-stage builds
- **Kubernetes Ready** with health probes
- **Comprehensive Testing** with Jest
- **Code Quality** with ESLint + Security plugins
- **API Documentation** with detailed endpoint specs
- **Database Migrations** and seed scripts

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account and project
- PostgreSQL database (via Supabase)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd secure-express-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Database Setup
Run the database schema in your Supabase SQL editor:

```bash
# Copy the contents of database/schema.sql to your Supabase SQL editor
```

### 5. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Logout User
```http
POST /api/v1/auth/logout
Authorization: Bearer <jwt_token>
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <jwt_token>
```

#### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Software Developer"
}
```

#### Delete User Account
```http
DELETE /api/v1/users/account
Authorization: Bearer <jwt_token>
```

### Admin Endpoints

#### Search Users (Admin Only)
```http
GET /api/v1/users/search?q=john&page=1&limit=10
Authorization: Bearer <admin_jwt_token>
```

#### Get User Statistics (Admin Only)
```http
GET /api/v1/users/stats
Authorization: Bearer <admin_jwt_token>
```

### Health Check Endpoints

#### Liveness Probe
```http
GET /health/liveness
```

#### Readiness Probe
```http
GET /health/readiness
```

#### Detailed Health Check
```http
GET /health/detailed
```

## 🐳 Docker Deployment

### Build and Run with Docker
```bash
# Build the image
docker build -t secure-express-api .

# Run the container
docker run -p 3000:3000 --env-file .env secure-express-api
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

The application includes Kubernetes-ready health check endpoints:

- **Liveness Probe**: `/health/liveness`
- **Readiness Probe**: `/health/readiness`

Example Kubernetes deployment configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-express-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: secure-express-api:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 24h |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | No | 12 |
| `CORS_ORIGINS` | Allowed CORS origins | No | localhost:3000,localhost:3001 |

### Security Configuration

The application implements multiple security layers:

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - Request throttling
4. **Input Validation** - Request sanitization
5. **JWT Authentication** - Token-based auth
6. **Row Level Security** - Database-level access control

## 🗄️ Database Schema

The application uses PostgreSQL with the following main table:

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚦 Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [], // Validation errors if applicable
  "timestamp": "2023-12-07T10:00:00.000Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📈 Monitoring & Logging

### Health Monitoring
- Liveness probe at `/health/liveness`
- Readiness probe at `/health/readiness`
- Detailed health check at `/health/detailed`

### Logging
- Winston logger with file and console output
- Request logging with Morgan
- Error tracking with stack traces
- Structured JSON logging in production

## 🧪 Testing Strategy

The project includes comprehensive tests:

1. **Unit Tests** - Individual function testing
2. **Integration Tests** - API endpoint testing
3. **Security Tests** - Vulnerability scanning
4. **Performance Tests** - Load testing capabilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Built with ❤️ using Node.js, Express.js, and Supabase**

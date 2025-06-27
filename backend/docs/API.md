# API Documentation

## Overview
This document provides detailed information about the Secure Express.js REST API endpoints, request/response formats, and authentication mechanisms.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [], // Optional validation errors
  "timestamp": "2023-12-07T10:00:00.000Z"
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "session": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### POST /auth/login
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "session": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresAt": 1672531200
    }
  }
}
```

## User Management Endpoints

### GET /users/profile
Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Software Developer",
    "createdAt": "2023-12-07T10:00:00.000Z",
    "updatedAt": "2023-12-07T10:00:00.000Z"
  }
}
```

### PUT /users/profile
Update the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "bio": "Senior Software Developer"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "bio": "Senior Software Developer",
    "updatedAt": "2023-12-07T10:00:00.000Z"
  }
}
```

## Admin Endpoints

### GET /users/search
Search users (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `q` (optional): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (firstName, lastName, email, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "createdAt": "2023-12-07T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Health Check Endpoints

### GET /health/liveness
Check if the application is running.

**Success Response (200):**
```json
{
  "status": "alive",
  "timestamp": "2023-12-07T10:00:00.000Z",
  "uptime": 3600
}
```

### GET /health/readiness
Check if the application is ready to serve requests.

**Success Response (200):**
```json
{
  "status": "ready",
  "timestamp": "2023-12-07T10:00:00.000Z",
  "checks": {
    "database": "healthy"
  }
}
```

## Rate Limiting
- 100 requests per 15-minute window per IP address
- Rate limit headers included in responses
- 429 status code when limit exceeded

## CORS Policy
- Configurable allowed origins
- Credentials supported
- Preflight requests handled

## Security Headers
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: same-origin
- And more via Helmet.js

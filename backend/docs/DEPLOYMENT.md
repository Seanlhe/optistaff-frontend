# Deployment Guide

This guide covers various deployment options for the Secure Express.js REST API.

## Local Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase project

### Setup Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Configure environment variables
5. Run database migrations
6. Start development server: `npm run dev`

## Docker Deployment

### Build Docker Image
```bash
docker build -t secure-express-api .
```

### Run Container
```bash
docker run -p 3000:3000 --env-file .env secure-express-api
```

### Docker Compose
```bash
docker-compose up -d
```

## Cloud Deployment

### Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set SUPABASE_URL=your-url`
5. Deploy: `git push heroku main`

### AWS ECS
1. Build and push image to ECR
2. Create ECS cluster
3. Define task definition
4. Create service
5. Configure load balancer

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/secure-express-api
gcloud run deploy --image gcr.io/PROJECT-ID/secure-express-api --platform managed
```

## Kubernetes Deployment

### Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-express-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: secure-express-api
  template:
    metadata:
      labels:
        app: secure-express-api
    spec:
      containers:
      - name: api
        image: secure-express-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: supabase-url
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

## Environment Variables

### Required Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: Secret for JWT token signing

### Optional Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode
- `CORS_ORIGINS`: Allowed CORS origins
- `RATE_LIMIT_WINDOW_MS`: Rate limit window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

## Monitoring and Logging

### Health Checks
- Configure load balancer health checks
- Use `/health/liveness` for liveness probes
- Use `/health/readiness` for readiness probes

### Logging
- Logs are written to files in production
- Use log aggregation services (ELK stack, Splunk, etc.)
- Configure log rotation

### Metrics
- Implement application metrics
- Use monitoring tools (Prometheus, DataDog, etc.)
- Set up alerts for critical metrics

## Security Considerations

### HTTPS
- Always use HTTPS in production
- Configure SSL certificates
- Implement HSTS headers

### Environment Variables
- Never commit secrets to version control
- Use secret management services
- Rotate secrets regularly

### Database Security
- Use connection pooling
- Implement proper backup strategies
- Enable database monitoring

## Performance Optimization

### Caching
- Implement Redis for session storage
- Cache frequently accessed data
- Use HTTP caching headers

### Database Optimization
- Use connection pooling
- Implement proper indexing
- Monitor query performance

### Load Balancing
- Use load balancers for high availability
- Implement sticky sessions if needed
- Configure health checks

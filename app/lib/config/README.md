# Configuration Guide

This document outlines all supported configuration options, validation rules, usage examples and troubleshooting guidance for the application's configuration system.

## Table of Contents

1. [Configuration Overview](#configuration-overview)
2. [Environment Variables](#environment-variables)
3. [Validation Rules](#validation-rules)
4. [Usage Examples](#usage-examples)
5. [Troubleshooting Guide](#troubleshooting-guide)

## Configuration Overview

The application uses a hierarchical configuration system that combines:
- Environment variables for deployment-specific settings
- Configuration files for default and environment-specific values
- Runtime validation to ensure configuration correctness

### Configuration Sources (Priority Order)

1. Environment variables (highest priority)
2. Environment-specific config files (e.g., `.env.production`)
3. Default configuration file (lowest priority)

## Environment Variables

### Required Variables

| Variable | Description | Format | Example |
|----------|-------------|--------|---------|
| `PORT` | Server listening port | Number | `3000` |
| `NODE_ENV` | Runtime environment | String | `development` |
| `DATABASE_URL` | Database connection string | URL | `mongodb://localhost:27017/myapp` |
| `API_KEY` | External API authentication | String | `sk_live_xxxxx` |

### Optional Variables

| Variable | Description | Default | Format | Example |
|----------|-------------|---------|--------|---------|
| `LOG_LEVEL` | Logging verbosity | `info` | String | `debug` |
| `CACHE_TTL` | Cache duration (seconds) | `3600` | Number | `7200` |
| `DEBUG` | Debug mode flag | `false` | Boolean | `true` |

## Validation Rules

### Data Types

- **Numbers**: Must be valid integers or floats depending on the field
- **Strings**: Non-empty unless explicitly allowed
- **URLs**: Must be valid URLs with supported protocols (http/https)
- **Booleans**: Accepts `true`, `false`, `1`, `0`, `yes`, `no`

### Specific Field Rules

#### PORT
- Must be a number between 1024 and 65535
- Cannot be a system reserved port
- Default: 3000

#### DATABASE_URL
- Must be a valid connection string
- Supported protocols: mongodb://, postgresql://
- Must include database name
- Credentials must be URL-encoded

#### API_KEY
- Must be non-empty
- Minimum length: 20 characters
- Should start with specified prefix (e.g., 'sk_')

## Usage Examples

### Development Environment

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
API_KEY=sk_test_abcdef123456
LOG_LEVEL=debug
DEBUG=true
```

### Production Environment

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/myapp
API_KEY=sk_live_xyz789
LOG_LEVEL=error
CACHE_TTL=7200
DEBUG=false
```

### Testing Environment

```env
NODE_ENV=test
PORT=3001
DATABASE_URL=mongodb://localhost:27017/myapp_test
API_KEY=sk_test_123test
LOG_LEVEL=debug
DEBUG=true
```

## Troubleshooting Guide

### Common Issues

#### "Invalid PORT configuration"
- **Cause**: Port number is invalid or already in use
- **Solution**: 
  1. Verify PORT is a number between 1024-65535
  2. Check if another process is using the port
  3. Try using a different port number

#### "Database connection failed"
- **Cause**: Invalid DATABASE_URL or connection issues
- **Solution**:
  1. Verify connection string format
  2. Check database server is running
  3. Confirm network connectivity
  4. Validate credentials

#### "Invalid API_KEY format"
- **Cause**: API key doesn't match required format
- **Solution**:
  1. Verify key starts with correct prefix
  2. Check key length meets minimum requirement
  3. Ensure key is from correct environment (test/live)

### Configuration Checklist

Before deployment, verify:

- [ ] All required environment variables are set
- [ ] Variables have correct format and values
- [ ] Environment-specific settings match target environment
- [ ] Sensitive values are properly secured
- [ ] Database connection is tested
- [ ] Logging is configured appropriately

### Debugging Configuration

To debug configuration issues:

1. Set `DEBUG=true` and `LOG_LEVEL=debug`
2. Check application logs for configuration errors
3. Verify environment variable loading order
4. Confirm no conflicting configuration sources

For additional support or configuration issues not covered here, please contact the development team.

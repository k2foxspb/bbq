# Configuration System Documentation

## Overview

This document describes the configuration system implemented in the MyApp project. The configuration system allows the application to use different settings based on the environment (development or production).

## Configuration File

The configuration is defined in the `config.tsx` file in the root directory of the project. This file exports configuration values for the current environment, which is determined by the `__DEV__` global variable provided by React Native.

### Configuration Values

The following configuration values are available:

- `apiUrl`: The URL for API requests
  - Development: `http://127.0.0.1:8000/api`
  - Production: `https://onthefarm.ru/api`
  
- `baseUrl`: The base URL for images and other resources
  - Development: `http://127.0.0.1:8000`
  - Production: `https://onthefarm.ru`
  
- `apiTimeout`: The timeout for API requests in milliseconds
  - Development: 10000 (10 seconds)
  - Production: 15000 (15 seconds)
  
- `enableLogging`: Whether to enable debug logging
  - Development: `true`
  - Production: `false`

### Helper Functions

The configuration file also exports a helper function:

- `logDebug(message, ...args)`: Logs a message to the console only in development mode

## Usage

### In API Requests

The API service (`api.ts`) uses the configuration values to create an axios instance:

```typescript
import { apiUrl, apiTimeout, logDebug } from '../config';

// API URL is configured in config.tsx based on the environment (development/production)
logDebug('Using API URL:', apiUrl);

// Create axios instance
const api = axios.create({
  baseURL: apiUrl,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### In Components

Components that need to load images from the server use the `baseUrl` configuration value:

```typescript
import { baseUrl } from '../../config';

// ...

<Image 
  source={item.image ? { uri: `${baseUrl}${item.image}` } : require('../../assets/images/icon.png')}
  style={styles.productImage}
  resizeMode="cover"
/>
```

## Switching Environments

The application automatically uses the correct configuration based on the environment:

- When running in development mode (using `npm start` or `expo start`), the development configuration is used.
- When building for production (using `expo build`), the production configuration is used.

## Adding New Configuration Values

To add a new configuration value:

1. Add the value to both the development and production configurations in `config.tsx`
2. Export the value from the configuration file
3. Import and use the value in your components or services

Example:

```typescript
// In config.tsx
const config = {
  development: {
    // ...
    newValue: 'development-value',
  },
  production: {
    // ...
    newValue: 'production-value',
  }
};

// Export the value
export const newValue = config[currentEnvironment].newValue;

// In your component
import { newValue } from '../config';

// Use the value
console.log(newValue);
```

## Troubleshooting

If you encounter issues with the configuration:

1. Check that you're importing the correct values from the configuration file
2. Verify that the configuration file is exporting the values you need
3. Use the `logDebug` function to log configuration values and debug issues
4. Make sure the environment is correctly detected by logging `__DEV__`
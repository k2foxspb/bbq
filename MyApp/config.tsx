/**
 * Configuration file for the application
 * Contains environment-specific settings
 */

// Define environment types
type Environment = 'development' | 'production';

// Determine current environment
// In a real app, you might want to use process.env.NODE_ENV or a similar approach
const currentEnvironment: Environment = __DEV__ ? 'development' : 'production';

// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://127.0.0.1:8000/api',
    baseUrl: 'http://127.0.0.1:8000', // Base URL for images and other resources
    apiTimeout: 10000, // 10 seconds
    enableLogging: true,
  },
  production: {
    apiUrl: 'https://onthefarm.ru/api',
    baseUrl: 'https://onthefarm.ru', // Base URL for images and other resources
    apiTimeout: 15000, // 15 seconds
    enableLogging: false,
  }
};

// Export the configuration for the current environment
export default config[currentEnvironment];

// Export individual configuration values for easier imports
export const apiUrl = config[currentEnvironment].apiUrl;
export const baseUrl = config[currentEnvironment].baseUrl;
export const apiTimeout = config[currentEnvironment].apiTimeout;
export const enableLogging = config[currentEnvironment].enableLogging;

// Helper function to log messages only in development
export const logDebug = (message: string, ...args: any[]): void => {
  if (config[currentEnvironment].enableLogging) {
    console.log(`[${currentEnvironment}] ${message}`, ...args);
  }
};
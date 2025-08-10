# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies (including dev dependencies for nodemon)
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port 3000
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Start the application
CMD ["npm", "run", "dev"]
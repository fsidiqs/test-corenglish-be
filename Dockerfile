# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --only=production && npm cache clean --force

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Accept port as build argument with default value
ARG PORT=3000

# Set port as environment variable
ENV PORT=${PORT}

# Expose the port that the app runs on
EXPOSE ${PORT}

# Define the command to run the application
CMD ["node", "dist/main.js"]

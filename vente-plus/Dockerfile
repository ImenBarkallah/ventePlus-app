# Multi-stage build for Angular application
# Stage 1: Build the Angular application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli@18

# Copy package.json and package-lock.json
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Build the Angular application for production (ignore budget warnings)
RUN npm run build -- --configuration=development

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the build stage
COPY --from=build /app/dist/vente-plus/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

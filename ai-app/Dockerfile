FROM node:20-slim AS builder

WORKDIR /app

# Copy package dependency files
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the React application for production
RUN npm run build

# Use lightweight Nginx image to serve the static files
FROM nginx:alpine

# Copy built static files from the builder stage into Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default port for Vite / Nginx preview
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
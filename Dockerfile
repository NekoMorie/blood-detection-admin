FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Set up build argument for environment variables
ARG VITE_BACKEND_API
ENV VITE_BACKEND_API=${VITE_BACKEND_API}

# Build the Vite application
RUN npm run build

# Expose port 3000 (standard for Node/Dokploy deployment)
EXPOSE 3000

# Run the Vite preview server using npm start
CMD ["npm", "start"]

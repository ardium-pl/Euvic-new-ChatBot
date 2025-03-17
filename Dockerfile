# Use the full Node.js image instead of slim
FROM node:18.19.0

# Set working directory
WORKDIR /app

# Copy and install root dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

COPY server/package.json server/package-lock.json ./server/

# Install dependencies for server
WORKDIR /app/server
RUN npm install --frozen-lockfile

# Copy the entire project directory **after installing dependencies**
WORKDIR /app
COPY . .

# Install poppler-utils for PDF processing
RUN apt-get update && apt-get install -y poppler-utils

# Expose the necessary ports
EXPOSE 8080 

# Start the application
CMD ["npm", "start"]
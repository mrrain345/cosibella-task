ARG BASE_IMAGE=node:26-alpine
ARG PORT=3000

FROM $BASE_IMAGE
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Switch to non-root user
USER node

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]

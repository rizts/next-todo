FROM node:20

WORKDIR /app

# The full 'node:20' image already includes build-essential and python,
# so we don't need to apt-get install them.

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Run in development mode (as specified in docker-compose)
CMD ["npm", "run", "dev"]

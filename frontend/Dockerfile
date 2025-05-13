FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app if you want to serve the production version
# RUN npm run build

# Expose the port
EXPOSE 5173

# Start the development server with the correct host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"] 
FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install full dependencies (includes devDeps for build)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Only keep production deps
RUN npm prune --production

# Set proper permissions
RUN chown -R node /usr/src/app
USER node

# Expose app port
EXPOSE 3000

# Start the compiled JS app
CMD ["npm", "run", "start:prod"]

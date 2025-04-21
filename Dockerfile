# Stage 1: Building the Next.js app
FROM node:20.15.1-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Setting up the production environment
FROM node:20.15.1-alpine AS runner

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built app from the previous stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs


# Set environment variables
ENV NODE_ENV production
ENV PORT 8080

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
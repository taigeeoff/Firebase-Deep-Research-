# Stage 1: Building the Next.js app
FROM node:24-alpine3.20 AS builder

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Setting up the production environment
FROM node:24-alpine3.20 AS runner

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built app from the previous stage
COPY --from=builder .next ./.next
COPY --from=builder public ./public
COPY --from=builder next.config.ts ./next.config.ts
COPY --from=builder .genkit ./.genkit
COPY --from=builder src/lib/ ./src/lib/

# Set environment variables
ENV NODE_ENV production
ENV PORT 8080

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
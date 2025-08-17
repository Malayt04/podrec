# Stage 1: Build the application
# Use a specific Node.js version for a predictable environment
FROM node:20-slim AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies, including devDependencies needed for the build
RUN npm ci

# Copy the rest of your application's code into the container
COPY . .

# Generate the Prisma Client based on your schema
RUN npx prisma generate

# Build the TypeScript code into JavaScript
RUN npm run build

# ---

# Stage 2: Create the final, lean production image
FROM node:20-slim

WORKDIR /usr/src/app

# Copy only the necessary production files from the 'base' stage
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/prisma ./prisma

# Run the database migrations. This command will run every time you deploy.
RUN npx prisma migrate deploy

# Expose the port your application will run on
EXPOSE 8080

# The command to start the application when the container launches
CMD ["npm", "run", "start"]
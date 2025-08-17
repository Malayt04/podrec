# Stage 1: Use a specific Node.js version for a predictable environment
FROM node:20-slim AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies using npm ci for faster, reliable builds
RUN npm ci --only=production

# Copy the rest of your application's code into the container
COPY . .

# Generate the Prisma Client based on your schema
# This is required for your TypeScript code to compile correctly
RUN npx prisma generate

# Build the TypeScript code into JavaScript
# The output will be in the 'dist' folder as per your tsconfig.json
RUN npm run build

# ---

# Stage 2: Create the final, smaller production image
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
# This runs the compiled JavaScript file from the 'dist' folder
CMD ["npm", "run", "start"]
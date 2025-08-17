# Stage 1: Build the application
FROM node:20-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ---

# Stage 2: Create the final, lean production image
FROM node:20-slim
WORKDIR /usr/src/app

# Copy necessary production files from the 'base' stage
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/prisma ./prisma

# Copy the new entrypoint script
COPY entrypoint.sh .
# Make the script executable
RUN chmod +x ./entrypoint.sh

EXPOSE 8080

# Set the entrypoint to our new script
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# The default command to run when the container starts
CMD ["npm", "run", "start:all"]
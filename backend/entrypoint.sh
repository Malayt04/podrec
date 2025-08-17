#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Run the database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Now, execute the main command (what's passed to the script)
exec "$@"
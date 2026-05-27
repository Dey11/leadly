#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Prisma migrations..."
  bunx prisma migrate deploy
fi

exec bun dist/index.js

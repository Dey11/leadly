# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
# but we need prisma dev dependency to generate client, so we might need to keep it or install just prisma
# actually, prisma client generation usually needs the schema and the CLI.
# The `bun install --production` skips devDeps.
# We will just copy node_modules from dev for now to ensure we have everything needed for build logic if any.
# Optimization: For a smaller image, we could separate this. But for simplicity and correctness first:

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Provide a dummy DATABASE_URL at build time for prisma generate.
# The real value is injected at runtime via env_file.
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma Client
RUN bunx prisma generate

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=prerelease /usr/src/app/node_modules node_modules
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/dist dist
COPY --from=prerelease /usr/src/app/prisma prisma
COPY --from=prerelease /usr/src/app/prisma.config.ts .

# Create logs directory with proper permissions for bun user
RUN mkdir -p /usr/src/app/logs && chown -R bun:bun /usr/src/app/logs

# Create startup script that runs migrations then starts app
RUN echo '#!/bin/sh\nbunx prisma migrate deploy\nexec bun dist/index.js' > /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# run the app
USER bun
ENTRYPOINT [ "/usr/src/app/start.sh" ]

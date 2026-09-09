FROM node:24.20.0-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e

# Workspace checkout precedes the repository install script.
RUN apt-get update \
    && apt-get install --no-install-recommends -y git ca-certificates \
    && git --version \
    && apt-get clean

LABEL org.opencontainers.image.title="HELIX-HARNESS Cursor Cloud Agent"
LABEL org.opencontainers.image.source="https://github.com/RetryYN/HELIX-HARNESS"
LABEL io.helix.node.version="24.20.0"
LABEL io.helix.node.manifest-digest="sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e"

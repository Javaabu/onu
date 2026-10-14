# Changesets

Every PR that changes `@javaabu/onu` adds a changeset: run `pnpm changeset`, pick the bump and describe the change for the changelog. The Release workflow (run by hand from the Actions tab) applies them, commits the version bump to main and publishes to npm.

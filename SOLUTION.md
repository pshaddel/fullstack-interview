# Solution to Eversports Coding Challenge

## Actions

### Preparation
- [ ] Add pnpm lock to gitignore
- [ ] Use newer versions of node without ts-node(v.22 support it without being experimental)
- [ ] Add dockerfile for running the app inside the container
- [ ] Add biome for formatting and linting
- [ ] Add vscode settings folder in the project root(add biome and jest extensions)
- [ ] Update dependencies
- [ ] Use Either SWC or Node Core Test Library
- [ ] Add the test coverage badge
- [ ] Add Formatter and Linter and Tests to the Github CI

### Implementation Phases
- [ ] Add Tests to the legacy codebases to re-use them in the modern codebase

### Refactoring Points
- [ ] Use Zod for validation in the modern codebase with proper error handling
- [ ] Refactor error messages to a http error handler
- [ ] Maybe go for uuid v7 for ids as it is sortable and has a timestamp
- [ ] Use Enum for the state of the memberships
- [ ] Maybe use express-zod library for express validation
- [ ] Maybe extract the type from a zod schema
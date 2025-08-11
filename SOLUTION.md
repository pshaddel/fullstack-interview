# Solution to Eversports Coding Challenge

## Actions

### Preparation
- [x] Add pnpm lock to gitignore
- [x] Add biome for formatting and linting
- [x] Add vscode settings folder in the project root(add biome and jest extensions)
- [x] Use Either SWC or Node Core Test Library
- [x] remove ts-node jest from project
- [ ] Add the test coverage badge
- [ ] Add Formatter and Linter and Tests to the Github CI
- [ ] Add a dot env file for the port configuration and also NODE_ENV
- [ ] Add dockerfile for running the app inside the container
- [ ] Update dependencies

### Implementation Phases
- [ ] Add Tests to the legacy codebases to re-use them in the modern codebase

### Refactoring Points
- [ ] Use Zod for validation in the modern codebase with proper error handling
- [ ] Refactor error messages to a http error handler
- [ ] Maybe go for uuid v7 for ids as it is sortable and has a timestamp
- [ ] Use Enum for the state of the memberships
- [ ] Maybe use express-zod library for express validation
- [ ] Maybe extract the type from a zod schema
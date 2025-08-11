# Solution to Eversports Coding Challenge

## Actions

### Preparation
- [x] Add pnpm lock to gitignore
- [x] Add biome for formatting and linting
- [x] Add vscode settings folder in the project root(add biome and jest extensions)
- [x] Use Either SWC or Node Core Test Library
- [x] remove ts-node jest from project
- [x] Add the test coverage badge
- [x] Add Formatter and Linter and Tests to the Github CI
- [x] Add a dot env file for the port configuration and also NODE_ENV
- [ ] Add dockerfile for running the app inside the container
- [ ] Update dependencies

### Implementation Phases
- [ ] Add Tests to the legacy codebases to re-use them in the modern codebase
- [ ] Fix billing periods: https://github.com/pshaddel/fullstack-interview/commit/36237251a43c337b51023480c439604d20dd89d6
- [ ] You cannot create any weekly memberships, you get `invalidBillingPeriods` error
- [ ] status of periods is always `planned`
- [ ] You will never have the status `active` :
```typescript
	let state = "active";
	if (validFrom > new Date()) {
    // Membership is not yet active - it starts in the future
		state = "pending";
	}
	if (validUntil < new Date()) {
    // Membership has expired
		state = "expired";
	}
```
- [ ] Periods are always calculatable from the membership, do we need to store them?

### Refactoring Points
- [ ] Use Zod for validation in the modern codebase with proper error handling
- [ ] Refactor error messages to a http error handler
- [ ] more readable version instead of all if else
- [ ] Maybe go for uuid v7 for ids as it is sortable and has a timestamp
- [ ] Use Enum for the state of the memberships
- [ ] Maybe use express-zod library for express validation
- [ ] Maybe extract the type from a zod schema
- [ ] Should not we store the membership periods in a file or db?(take a look in the end)
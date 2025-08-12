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
- [ ] Use Docker Compose Watch and Dev Containers for development
- [ ] Update dependencies

### Implementation Phases
- [x] Add Tests to the legacy codebases to re-use them in the modern codebase
- [x] Fix billing periods: https://github.com/pshaddel/fullstack-interview/commit/36237251a43c337b51023480c439604d20dd89d6
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
- [ ] id was missing in the membership interface
- [ ] Periods are always calculatable from the membership, do we need to store them?
- [ ] Remove magical numbers from the codebase, gather constants in a file, try to also bind them to the environment variables
- [ ] another bug in here:
```typescript
if (req.body.billingPeriods > 3) {
			if (req.body.billingPeriods > 10) {
				return res
					.status(400)
					.json({ message: "billingPeriodsMoreThan10Years" });
			} else {
				return res
					.status(400)
					.json({ message: "billingPeriodsLessThan3Years" });
			}
		}
```
the case does not makes sense, when the number of billing periods is more than 3, it should be more than 3 years, not less than 3 years.
- [ ] This is a bug:
```typescript
const periods = membershipPeriods.filter(
			(p) => p.membershipId === membership.id,
		);
```
there is no membershipId in the membershipPeriods, it should be `membership` instead of `p.membershipId`. - Fixed it in the json file

### Refactoring Points
- [ ] Refactor error messages to a http error handler
- [ ] Use Zod for validation in the modern codebase with proper error handling
- [ ] more readable version instead of all if else
- [ ] Maybe go for uuid v7 for ids as it is sortable and has a timestamp
- [ ] Use Enum for the state of the memberships
- [ ] Maybe use express-zod library for express validation
- [ ] Maybe extract the type from a zod schema
- [ ] Should not we store the membership periods in a file or db?(take a look in the end)
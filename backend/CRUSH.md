## Build, Lint, and Test Commands

- **Build:** `npm run build`
- **Start:** `npm run start`
- **Dev:** `npm run dev`
- **Start Worker:** `npm run start:worker`
- **Lint:** No linting command found. Consider adding one using ESLint or a similar tool.
- **Test:** No test command found. Consider adding one using Jest or a similar testing framework.

## Code Style Guidelines

- **Imports:**
  - Use ES6 import syntax.
  - Group imports from external libraries first, then internal modules.
- **Formatting:**
  - Use 2 spaces for indentation.
  - Use single quotes for strings.
  - Add trailing commas where appropriate.
- **Types:**
  - Use TypeScript for static typing.
  - Define explicit types for function parameters and return values.
  - Use interfaces for defining object shapes.
- **Naming Conventions:**
  - Use camelCase for variables and functions.
  - Use PascalCase for classes and interfaces.
- **Error Handling:**
  - Use try-catch blocks for handling errors in asynchronous operations.
  - Log errors to the console.
- **Project Structure:**
  - Separate concerns into different modules (e.g., routes, services, controllers).
  - Use a `utils` directory for shared utility functions.
  - Keep database-related files in the `prisma` directory.

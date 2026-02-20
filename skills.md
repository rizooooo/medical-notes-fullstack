# Project Skills & Best Practices

## Table Components
- **Generic Sorting**: Implementation of server-side sorting using TanStack Table. The `DataTable` component should be controlled via `sorting` and `onSortingChange` props, and the state should be persisted in the URL search parameters to allow for deep linking and page refreshes.
- **Pagination**: URL-synced pagination (1-indexed for users, 0-indexed for TanStack Table).
- **Edit/Delete Functionality**: 
  - Each record row in the table should have a dropdown menu with "Edit details" and "Delete record".
  - **Edit**: Opens a dedicated modal (`EditEntityModal`) that prefills with existing data.
  - **Delete**: Always requires a confirmation modal (`DeleteEntityModal` or `AlertDialog`) before performing the destructive action.
  - **Feedback**: After success, invalidate the TanStack router to refresh the data on the current page.

## Routing (TanStack Router)
- **Navigation**: Always use the `Link` component from `@tanstack/react-router` instead of standard `<a>` tags to ensure single-page application (SPA) transitions and proper breadcrumb/navigation state.
- **Search Parameter Validation**: Use Zod to define and validate search parameters (page, pageSize, sorting) in the `Route` definition.
- **Default Parameters**: When linking to paginated routes, always provide the required default search parameters (e.g., `page: 1`, `pageSize: 10`) to satisfy TypeScript.

## MongoDB & Server Functions
- **Repository Pattern**: Keep database logic in `.repo.ts` files and call them from TanStack `createServerFn` in `.functions.ts` files.
- **ObjectId Handling**: Ensure `_id` is converted from `ObjectId` to `string` (or vice versa) appropriately between the server and client.
- **Audit Fields**: Always update `updatedAt` on modifications and set `createdAt` on creation.

## TypeScript Style
- **Explicit Casting**: Provide explicit types for search parameters in `navigate` functions and `onPaginationChange` / `onSortingChange` handlers to avoid the `never` type error when spreading `old` search parameters.
- **Zod Infer**: Use `z.infer` to create TypeScript types from schemas to keep them in sync.
## Form Handling
- **Library**: Leverage **TanStack Form** for all form logic and state management.
- **Validation**: Use **Zod** for schema-based validation.
- **Standard Schema Support**: TanStack Form supports Zod schemas directly. Prefer passing the schema to the `validators` property in `useForm` (e.g., `validators: { onChange: mySchema }`) instead of using `zodAdapter`.
- **UX**: 
  - Show loading states (e.g., using a `Loader2` icon) on the submit button while the form is submitting.
  - Disable the submit button if the form has validation errors or is currently submitting.
  - Reset the form after successful submission if necessary.
## Design Aesthetics
- **Flat UI**: Avoid heavy shadows, large border-radii (use `rounded-md` or `rounded-lg` max), and complex gradients.
- **Simplification**: Use a clean, grayscale-leaning palette with a single primary accent (e.g., Indigo).
- **Density**: Optimize for 13-inch Macbook screens at 100% zoom. This means smaller text (`text-xs`, `text-[10px]`), reduced padding (`p-2`, `p-3` instead of `p-6`), and smaller component heights (`h-8` or `h-9` for buttons and inputs).
- **Standard Shadcn**: Favor the default look and feel of Shadcn UI components.
- **Print Friendly**: Always consider a print-friendly layout by hiding navigation and using high-contrast text.

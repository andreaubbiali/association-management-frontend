# Feature: users-page

**Status:** Architecture
**Repos affected:** association_management_BE, association-management-frontend

## Spec (analyst)

**Problem:**

The `/users` route exists in `router.js` and renders `src/views/Users.vue`, but today that view is a static placeholder ("Welcome to the Association" hero/about/CTA content) — it has nothing to do with the actual `User` registry. Andrea wants a real Users page: a paginated table of users with "main data" per row, a button per row that navigates to a full detail page for that user, and a section showing that user's relations (`UserRelation`) to other users with "main data about this relation".

This mirrors the existing Associates page (`src/views/Associates.vue` + `AssociatesFilteredTable.vue` + `useAssociates.js` + `associatesService.js`), which already implements server-side paginated/filtered table + row "Manage" action navigating to a detail route — that pattern should be reused rather than reinvented.

**Scope:**

1. Replace the placeholder `Users.vue` with a real list page: paginated, filterable table of users, built the same way `Associates.vue` composes `AssociatesFilteredTable.vue` via a `useAssociates`-style composable and `associatesService`-style Axios service.
2. A new route + view for the user detail page (e.g. `/users/:id`), showing full user data, reached via a button on each table row (same UX as the "Manage" button → `/associates/:id/manage`).
3. A relations section on the detail page showing, for the viewed user, their relations to other users (relation type + the other user's main identifying data), per the backend's new relations endpoint.
4. New/extended `usersService.js` (Axios wrapper) and a `useUsers.js` composable (list + detail + relations fetching), following the existing `associatesService.js` / `useAssociates.js` shape.

This depends on new backend endpoints that do not exist yet (see `docs/features/users-page.md` in `association_management_BE`): a paginated/filterable user list, a working `GET` for single-user detail (today `/users/<pk>` only supports `PATCH`), and a way to fetch a user's relations.

**Affected models/views/components:**

- Views: `src/views/Users.vue` (currently a placeholder — to become the list page), a new detail view (e.g. `src/views/UserManage.vue` or `UserDetail.vue` — naming TBD), both added to `src/router.js` (the `/users` route already exists and is wired with `meta: { requiresAuth: true }`; a new `/users/:id` route needs adding).
- Components: likely a new `UsersFilteredTable.vue` modeled on `src/components/AssociatesFilteredTable.vue` (filters row, sortable headers, server-side pagination controls, row action button emitting to the parent view).
- Composables: new `src/composables/useUsers.js` modeled on `src/composables/useAssociateManage.js` (reactive state, filters, page) — note there's both a list-oriented composable (`useAssociates.js`) and a detail-oriented one (`useAssociateManage.js`) in the associate flow; the users feature likely needs an equivalent pair, or one composable covering both.
- Services: new `src/services/usersService.js` modeled on `src/services/associatesService.js` (`searchUsers`, `getUser`, `getUserRelations` or similar), using the shared `api.js` Axios instance (JWT bearer header already attached automatically via interceptor).
- Env: pagination size likely reuses the existing `VITE_ITEMS_PER_PAGE` env var pattern used by `Associates.vue` (defaults to 5).

**Acceptance criteria:**

- `/users` renders a paginated table of users (not the current placeholder content), sourced from the backend's new list endpoint, with server-side pagination matching the Associates page's UX (page controls, "Showing X of Y" count).
- Each row shows the agreed "main data" fields (see open question in BE spec — needs Andrea's confirmation) and has an action button that navigates to that user's detail page.
- The detail page shows the full set of user data (all `User` model fields available from the backend's detail endpoint).
- The detail page has a relations section listing the user's relations to other users, each entry showing relation type and the other user's main identifying data (name/lastName, and ideally a link/button to that other user's own detail page, enabling navigation across related users).
- Loading/error/empty states are handled consistently with the existing Associates page conventions (loading spinner/message, dismissible error banner with retry, "no results" empty state).
- The page respects the existing auth guard (`requiresAuth: true`) — no new/different permission behavior from the rest of the app.
- No regressions to the current `/users` route's reachability (it keeps working, just with new content) or to any other navigation that currently links to it (grep confirms no other view links to `/users` today, so this is low-risk).

**Open questions — resolved by Andrea (2026-10-18):**

1. **Table "main data" columns** — resolved: `bloomId, name, lastName, email, fiscalCode, birthDate, phoneNumber` (matches BE spec).
2. **Search/filter UX** — resolved: server-side pagination with a search box on `name`, `email`, `bloomId` (matches BE spec's resolved filter fields).
3. **Detail page route & naming** — resolved: **read-only** for this iteration — no editing of `birthDate` or any other field from this page. Exact route naming (`/users/:id` vs. an alternative) left to the architect.
4. **Relations section placement** — resolved: part of the same user-detail page (not a standalone page).
5. **Navigating between related users** — resolved: yes, the other user's name/identifying data in a relation entry should be a clickable link to that user's own detail page.
6. **Creating/editing relations from this page** — resolved: out of scope. Display-only; no add/edit/remove UI or BE write endpoints for relations in this iteration.

**Note for architect:** whether relations are fetched via a dedicated BE endpoint or embedded in the user-detail response is left to the architect's judgment (see BE spec, open item 5) — the FE composable/service shape should accommodate either.

## Architecture (architect)

### Decision carried over from the BE doc

The backend exposes relations via a **dedicated `GET /user/<pk>/relations` endpoint**, not embedded in the user-detail payload (see `association_management_BE/docs/features/users-page.md` → Architecture for the reasoning). Consequence for the frontend: the detail view issues **two** requests when a user is opened (user detail, then/alongside relations), each with its own loading/error state — not one combined fetch. This also means the relations list is a flat JSON array (no pagination envelope), already shaped per-entry as `{ id, relationType, isRelatedUserReceiptHolder, otherUser: { id, bloomId, name, lastName } }`.

### Service: `src/services/usersService.js` (new)

New file, modeled directly on `src/services/associatesService.js` (same try/catch-log-rethrow shape, same `api.js` base client so the JWT bearer interceptor applies automatically):

```js
export const usersService = {
  async searchUsers(filters = {}) {
    // GET /user/search?name=&email=&bloomId=&page=&limit=
  },
  async getUser(id) {
    // GET /user/:id
  },
  async getUserRelations(id) {
    // GET /user/:id/relations
  }
}
```

- `searchUsers(filters)`: same query-param-building pattern as `associatesService.searchAssociates` (append only non-empty values). Expected filter keys: `name`, `email`, `bloomId`, `page`, `limit`.
- `getUser(id)`: hits the now-working `GET /user/:id` detail endpoint.
- `getUserRelations(id)`: hits the new dedicated relations endpoint.
- The existing `associatesService.updateBirthDate(userId, birthDate)` (which already `PATCH`es `/user/:id`) is **left where it is, unchanged** — this feature is read-only and does not add any write path, so there's no reason to move or duplicate that function into `usersService.js`.

### Composables

Following the existing associate-flow split of a list-oriented composable (`useAssociates.js`) and a detail-oriented one (`useAssociateManage.js`), this feature adds the equivalent pair rather than one composable covering both — kept separate because the list and detail pages have independent lifecycles and are never mounted together.

**`src/composables/useUsers.js`** (new, list-oriented, modeled on `useAssociates.js`):
- State: `users` (ref array), `loading`, `error`, `totalCount`, `filters` (ref object: `{ name: '', email: '', bloomId: '', page: 1, limit: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 5 }`).
- Methods: `fetchUsers()` (calls `usersService.searchUsers(filters.value)`, handles the paginated-results response shape the same way `fetchAssociates` does), `applyFilters(newFilters)` (merges + resets `page` to 1 + refetches), `clearFilters()`, `refreshUsers()`, `clearError()`, `changePage(page)`.
- No new env var: reuses the existing `VITE_ITEMS_PER_PAGE` pattern already used by `Associates.vue`.

**`src/composables/useUserManage.js`** (new, detail-oriented, modeled on `useAssociateManage.js`, but read-only — no update/mutation methods, since this iteration adds no write behavior beyond the pre-existing birthDate PATCH which stays in the associate flow's own composable):
- State: `user` (ref, null until loaded), `loading`, `error` (for the detail fetch), `relations` (ref array, default `[]`), `relationsLoading`, `relationsError` (separate state for the relations fetch, matching the two-request reality above).
- Methods: `fetchUser(id)`, `fetchUserRelations(id)`, `clearError()`, `clearRelationsError()`, `reset()`.
- Deliberately **no** `updateBirthDate`/edit methods here — the FE spec's resolved decision #3 makes this page read-only for this iteration.

### Components

**`src/components/UsersFilteredTable.vue`** (new, modeled closely on `src/components/AssociatesFilteredTable.vue`):
- Props: `users` (Array), `itemsPerPage` (Number), `totalCount` (Number), `currentPage` (Number) — same prop shape as `AssociatesFilteredTable`.
- Filter row: three inputs (`name`, `email`, `bloomId`) + "Search"/"Clear Filters" buttons, same markup/behavior pattern as the associates filter row (minus the fields that don't apply here, e.g. `validityYear`).
- Table columns, in order: `bloomId, name, lastName, email, fiscalCode, birthDate (formatted), phoneNumber` — exactly the resolved column list, plus an `Actions` column with a single button (label "View", not "Manage" — this page is read-only) that emits `view-user` with the row's user object.
- Pagination controls: same `Previous`/`Page X of Y`/`Next` block as `AssociatesFilteredTable`, same `v-if="totalCount > itemsPerPage"` guard.
- Emits: `apply-filters`, `page-change`, `view-user` (instead of `manage-associate`/`edit-associate`/`delete-associate` — there are no edit/delete actions on this page).

**`src/views/Users.vue`** (existing placeholder view, content replaced in place — route stays `/users`, already wired with `meta: { requiresAuth: true }` in `router.js`):
- Same composition shape as `Associates.vue`: `onMounted` → `fetchUsers()`; loading/error/empty states identical in spirit (loading message, dismissible error banner with retry button); renders `<UsersFilteredTable>` and handles its `view-user` emit by `router.push(`/users/${user.id}`)`.
- No "+ New User" button / create flow — out of scope, there is no user-creation UI independent of associate creation today, and this feature doesn't add one.

**`src/views/UserDetail.vue`** (new view; name chosen deliberately over `UserManage.vue` — "Manage" in this codebase implies edit actions, as in `AssociateManage.vue`, and this page is read-only, so a distinct name avoids implying write capability that doesn't exist):
- Route: `{ path: '/users/:id', name: 'UserDetail', component: UserDetail, meta: { requiresAuth: true } }`, added to `src/router.js` alongside the existing routes.
- On mount: reads `route.params.id`, calls `fetchUser(id)` and `fetchUserRelations(id)` (can run concurrently — they're independent requests with independent loading/error UI, consistent with the two-endpoint BE design).
- "User Information" card: all fields returned by the detail endpoint (`bloomId, name, lastName, email, secondaryEmail, fiscalCode, birthDate, birthCity, identityCardNumber, residenceAddress, residenceCity, residenceCAP, residenceProvince, phoneNumber, dataValidated`) — same `info-grid`/`info-item` label/value markup convention as `AssociateManage.vue`'s details card, but with no action buttons next to any field (read-only).
- "Relations" section below it: a simple table/list, one row per relation entry, columns: relation type, the other user's `name lastName` (or `bloomId`) rendered as a `<router-link :to="`/users/${entry.otherUser.id}`">` — satisfying the resolved cross-navigation requirement — and `isRelatedUserReceiptHolder` rendered with the same ✓/✗ icon convention `AssociateManage.vue` uses for boolean flags. Independent loading/error/empty state block (e.g. "No relations found.") driven by `relationsLoading`/`relationsError`/`relations.length === 0`, separate from the user-detail card's own loading/error block.
- Back button to `/users`, same convention as `AssociateManage.vue`'s "← Back to Associates".

### Router changes (`src/router.js`)

- Add `import UserDetail from './views/UserDetail.vue'`.
- Add `{ path: '/users/:id', name: 'UserDetail', component: UserDetail, meta: { requiresAuth: true } }` to the `routes` array.
- No change to the existing `/users` route entry itself — it keeps pointing at `Users.vue`, whose internal content is what's changing.

### Deploy/env impact (frontend side)

No new environment variables, no `.env.development`/`.env.production` changes, and no `docker-compose.yml`/devops changes are implied by this feature — it reuses the existing `VITE_ITEMS_PER_PAGE` pattern and the existing `api.js` Axios client/JWT interceptor. (The backend doc's Migration & Deploy Impact section confirms the same on the BE side: no new env vars or devops changes there either.)

### Post-implementation change (2026-10-21): receipt-holder column removed from the relations table

After implementation, Andrea flagged that the "Receipt Holder" column's underlying value (`isRelatedUserReceiptHolder`, surfaced as-is from the backend per this doc's direction-semantics note) is actually wrong when the viewed user is on the `related_user` side of a `UserRelation` row — the flag is a fixed fact about the row's two sides, not something that flips for whoever is viewing, so displaying it next to a viewer-relative "Other User" column produces an incorrect answer on one of the two viewing directions. See the backend doc's own note on this for the concrete example.

Given this feeds into receipt/payment attribution, Andrea asked to remove the column from the UI entirely for now rather than ship a column that can show the wrong answer, deferring the correctness fix (and the `isRelatedUserReceiptHolder` field in the API response itself) to a future iteration. Scope of this change: `UserDetail.vue`'s relations table no longer has a "Receipt Holder" column/cell; `UserDetail.spec.js` updated to match. The backend's `/user/<pk>/relations` endpoint is untouched — it still returns `isRelatedUserReceiptHolder`, just unused by the frontend for now.

### Deferred cleanup, flagged 2026-10-21 for future discussion (not fixed here)

While applying Andrea's PR-review feedback (`/simplify` pass), two things came up that are real but weren't fixed in this diff — noted here so the conversation can pick them up later rather than being lost:

1. **`useUsers.js`'s `fetchUsers` response handling has three shape-detection branches** (`Array.isArray(response)`, `response.results`, `response.data`) but `usersService.searchUsers` only ever hits `GET /user/search`, which always returns the one DRF-paginated `{count, next, previous, results}` envelope (`UserSearchView` always sets a real `pagination_class`, never `None`) — so two of the three branches can't currently be reached in production. Not simplified away because it's explicitly covered by its own test (`'handles a plain-array response by using its length as totalCount'` in `useUsers.spec.js`) and mirrors `useAssociates.js`'s identical defensive pattern app-wide — removing it means deleting intentionally-tested behavior and diverging from an established codebase convention, not just deleting dead code. Worth a conscious decision (keep as defensive/future-proofing, or simplify this and `useAssociates.js` together) rather than a quiet removal.
2. **Pagination-widget logic and `formatDate` are duplicated** across `UsersFilteredTable.vue`, `UserDetail.vue`, and the pre-existing `AssociatesFilteredTable.vue`/`AssociateManage.vue`/`Courses.vue` (3-4 near-identical copies app-wide, this feature added two more following the same pattern). A proper fix means extracting a shared `usePagination` composable and a date-formatting util and retrofitting the older components too — out of scope for this feature's diff since it touches already-shipped, unrelated views.

See the backend doc's equivalent note for one more item in the same category (`UserSearchView`'s redundant filtered/unfiltered branch, which also exists in `AssociateSearchView`).

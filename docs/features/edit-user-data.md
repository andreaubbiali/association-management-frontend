# Feature: edit-user-data

**Status:** Done
**Repos affected:** association_management_BE, association-management-frontend

## Spec (analyst)

**Problem:**

`UserDetail.vue` (`src/views/UserDetail.vue`), shipped by the users-page feature (`docs/features/users-page.md`), is read-only by explicit design — that feature's resolved scope says "no editing of `birthDate` or any other field from this page." Meanwhile, the only person-data edit UI that exists anywhere in the app lives on the wrong page: `AssociateManage.vue` (`src/views/AssociateManage.vue`) has an "Update Birth Date" modal (`showUpdateBirthDateModal`/`newBirthDate`/`updatingBirthDate` state, `openUpdateBirthDateModal`/`closeUpdateBirthDateModal`/`confirmUpdateBirthDate` methods, roughly lines 159-167 and 569-605 and 717-1251) that calls `associatesService.updateBirthDate(userId, birthDate)` (`src/services/associatesService.js`), which in turn `PATCH`es `/user/<id>`. `birthDate` is a `User` field, not an `Associate` field, so this edit capability sits on the associate-management flow purely because that's where it was first needed, not because it belongs there.

Every other `User` field correction (wrong email, address typo, fiscal code fix, etc.) has no UI at all today — Erica relies on Andrea to edit the database directly.

This feature moves all person-data editing onto `UserDetail.vue` (the page that already shows the full `User` record, per the users-page feature's "User Information" card — `bloomId, name, lastName, email, secondaryEmail, fiscalCode, birthDate, birthCity, identityCardNumber, residenceAddress, residenceCity, residenceCAP, residenceProvince, phoneNumber, dataValidated`), and removes the birthDate-edit UI from `AssociateManage.vue` entirely. After this ships, birthdate editing exists in exactly one place: the User detail page.

**Scope:**

1. Add edit capability to `UserDetail.vue`'s existing "User Information" card for the 13 agreed editable fields: `name, lastName, email, secondaryEmail, fiscalCode, birthDate, birthCity, identityCardNumber, residenceAddress, residenceCity, residenceCAP, residenceProvince, phoneNumber`. `bloomId` and `dataValidated` stay visible but are **not** editable (no input control, no edit affordance next to them) — same display as today, just read-only alongside the now-editable fields.
2. Remove the "Update Birth Date" modal and all of its supporting state/methods from `AssociateManage.vue` (the modal markup, `showUpdateBirthDateModal`/`newBirthDate`/`updatingBirthDate` refs, `openUpdateBirthDateModal`/`closeUpdateBirthDateModal`/`confirmUpdateBirthDate` functions, and the "Update birth date" button next to the Birth Date info item). After this feature ships, `AssociateManage.vue` has no birthDate-editing UI of any kind.
3. Remove or repurpose `associatesService.updateBirthDate` (`src/services/associatesService.js`) — see open question below for whether it's deleted outright or whether a new general-purpose update function is added to `usersService.js` instead and this one is deleted as dead code once nothing calls it.
4. Validation/error display for the new edit UI: at minimum, a duplicate `fiscalCode` or `identityCardNumber` submitted from the edit form must surface a field-level error message next to the relevant input (not a generic alert, not a console-only failure) — consistent with the backend returning a usable per-field error shape (see BE doc's open question on this).

This depends on the backend's `PATCH /user/<pk>` growing from birthDate-only to the full 13-field set — see `docs/features/edit-user-data.md` in `association_management_BE` for the backend-side spec and open questions (particularly the endpoint/validation-shape redesign, which this frontend work is coupled to).

**Affected models/views/components:**

- Views: `src/views/UserDetail.vue` — the "User Information" card (currently a static `info-grid` of `<span>` values) needs editable inputs for 13 of its 15 displayed fields, plus some kind of save/cancel interaction and per-field error display. `src/views/AssociateManage.vue` — the birthDate modal and its trigger button are deleted.
- Services: `src/services/usersService.js` (already exists, created by the users-page feature with `searchUsers`/`getUser`/`getUserRelations`) — likely gains a new `updateUser(id, data)` method wrapping `PATCH /user/:id` with the full field set (see open question). `src/services/associatesService.js` — `updateBirthDate` is removed once nothing in the codebase calls it (grep confirms today it is called only from `AssociateManage.vue`).
- Composables: `src/composables/useUserManage.js` (already exists — `fetchUser`, `fetchUserRelations`, plus loading/error state for each, explicitly documented today as having "no update/mutation methods ... since this iteration adds no write behavior" per the users-page FE doc's Architecture section) — needs a new mutation method (e.g. `updateUser(id, data)`) and accompanying `updating`/`updateError` state, following the same `loading`/`error` pattern already used for `fetchUser`. `src/composables/useAssociateManage.js` — loses whatever birthDate-update state/method it currently has supporting the modal (confirm exact current shape during implementation; the modal's logic lives in `AssociateManage.vue`'s own `<script setup>`, not clearly delegated to the composable based on the grep above, so this may be a `AssociateManage.vue`-only removal with no composable change needed — architect to confirm).
- Env/pattern reuse: no new env vars anticipated; error display should follow whatever per-field validation error convention already exists elsewhere in the app for forms (e.g. the associate-creation form), not invent a new one — architect to confirm the closest existing pattern to copy.

**Acceptance criteria:**

- All 13 listed fields (`name, lastName, email, secondaryEmail, fiscalCode, birthDate, birthCity, identityCardNumber, residenceAddress, residenceCity, residenceCAP, residenceProvince, phoneNumber`) are editable from `UserDetail.vue`.
- `bloomId`, `dataValidated`, and `id` are **not** editable from `UserDetail.vue` or anywhere else in the frontend — no input control is rendered for them.
- After a successful edit, `UserDetail.vue` reflects the new values without requiring a manual page refresh (either by re-rendering from the PATCH response or by refetching via `fetchUser`).
- Submitting a duplicate `fiscalCode` or `identityCardNumber` shows a clear, field-level error message in the edit UI (not a bare `alert()`, not a console-only error, not an unhandled exception) and does not corrupt the displayed `User` data (the card falls back to the last-known-good values, consistent with how `useUserManage.js`'s existing fetch-error handling already falls back to safe defaults rather than leaving stale/partial state).
- The "Update Birth Date" modal, its trigger button, and all supporting refs/methods no longer exist anywhere in `AssociateManage.vue` after this ships — birthDate editing is reachable only from `UserDetail.vue`.
- `associatesService.updateBirthDate` is either deleted or left as genuinely unused dead code only if Andrea explicitly says to keep it for some reason — the expectation is deletion, since leaving an unused PATCH-wrapper around that duplicates a new `usersService` method would contradict "consolidating all person-data editing into one place."
- The existing auth guard (`requiresAuth: true`) and JWT-bearer-header behavior are unchanged — no new permission tier.
- No regressions to the read-only "Relations" section of `UserDetail.vue` (untouched by this feature) or to any other part of `AssociateManage.vue` outside the birthDate modal.

**Open questions:**

1. **Does `associatesService.updateBirthDate` get deleted outright, or does a new general-purpose update function live in `usersService.js` instead, consolidating the single new `PATCH /user/<pk>` call behind one service function?** Andrea's stated expectation is "likely the latter" (one general update endpoint on the backend probably backs one general update service function on the frontend), but this is explicitly left for the architect to decide and document, coupled to the backend's own open question about how `PATCH /user/<pk>` is reshaped. Whichever is chosen, `associatesService.updateBirthDate` should not survive as a second, narrower way to do the same write once the general path exists.
2. **Composable/service split for the new edit call** — same item as above, restated at the composable layer: does `useUserManage.js` gain an `updateUser` method that calls a new `usersService.updateUser`, and is the old `updateBirthDate`-supporting state in `AssociateManage.vue`'s own script (not a composable, per the grep findings above) simply deleted with no composable-level change on the associate side? Left to the architect.
3. **Edit UX shape** — not specified by Andrea: inline per-field editing (click a field, it becomes an input, save/cancel per field) vs. a single "Edit" button that switches the whole card into an edit form with one Save/Cancel pair. Either is consistent with the acceptance criteria above; architect's call based on what's simplest to build consistent with existing app conventions (the associate-creation flow's form patterns are the closest existing reference).

## Architecture (architect)

### Design decisions (resolving the analyst's open questions)

**1. `associatesService.updateBirthDate` is deleted outright; a new `usersService.updateUser(id, data)` is added.** One general backend endpoint (`PATCH /user/<pk>`, now accepting all 13 fields — see the BE doc) backs one general frontend service function, consistent with Andrea's stated lean and with the acceptance criteria's explicit expectation of deletion ("leaving an unused PATCH-wrapper around ... would contradict consolidating all person-data editing into one place"). There is no scenario left where a narrower birthDate-only wrapper is still useful once the general one exists and the only caller of the narrow one is deleted in this same feature.

**2. `useUserManage.js` gains the mutation method; `useAssociateManage.js` is untouched.** Confirmed by grep against `AssociateManage.vue` and `useAssociateManage.js`: all of the birthDate-modal's state (`showUpdateBirthDateModal`, `newBirthDate`, `updatingBirthDate`) and methods (`openUpdateBirthDateModal`, `closeUpdateBirthDateModal`, `confirmUpdateBirthDate`) live directly in `AssociateManage.vue`'s own `<script setup>` — none of it is delegated through `useAssociateManage.js`. So removing it is a pure `AssociateManage.vue` deletion with zero composable-layer change on the associate side. The new mutation lands on `useUserManage.js` instead (the composable already backing `UserDetail.vue`), following the exact `loading`/`error` state-pair convention `fetchUser`/`fetchUserRelations` already use, just named `updating`/`updateError`.

**3. Edit UX shape: whole-card edit mode, per Andrea's explicit preference.** A single "Edit" button toggles the entire "User Information" card from display mode into one form with one Save/Cancel pair, rather than inline per-field editing. No concrete reason surfaced to diverge: the 13 fields are edited together far more often than one-at-a-time (e.g. correcting an address touches 4 fields at once), a single whole-card save maps directly onto the backend's one-`PATCH`-with-any-subset contract, and it avoids building 13 independent little save/cancel/error-state machines for marginal benefit. Default accepted as designed.

### Component/composable/service shape

- **`src/services/usersService.js`** — add `updateUser(id, data)`, mirroring the existing `getUser`/`getUserRelations` try/catch-and-log shape:
  ```js
  /**
   * Update a user's editable fields (partial update)
   * @param {number} id - User ID
   * @param {Object} data - Any subset of the 13 editable fields
   * @returns {Promise} API response (full updated user, same shape as getUser)
   */
  async updateUser(id, data) {
    try {
      const response = await api.patch(`/user/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }
  ```

- **`src/services/associatesService.js`** — delete `updateBirthDate` entirely (confirmed via grep its only caller is the modal being deleted in `AssociateManage.vue`).

- **`src/composables/useUserManage.js`** — add `updating`/`updateError` state and an `updateUser` method. Unlike the existing `runFetch` helper (which always overwrites `dataRef` with a `fallbackValue` on error), a failed edit must leave `user` at its last-known-good value — the acceptance criteria require the card to fall back to last-known-good data, not be blanked out — so this is a small dedicated function rather than a `runFetch` call:
  ```js
  const updating = ref(false)
  const updateError = ref(null)

  /**
   * Update a user's editable fields. On success, replaces `user` with the
   * server's response (same full shape as fetchUser) so the detail card can
   * re-render immediately without a refetch. On failure, `user` is left
   * untouched and `updateError` holds the DRF field-error object
   * (e.g. { fiscalCode: ["..."] }) for per-field display.
   * @param {number|string} id - User ID
   * @param {Object} data - Any subset of the 13 editable fields
   * @returns {Promise<boolean>} true on success, false on failure
   */
  const updateUser = async (id, data) => {
    updating.value = true
    updateError.value = null
    try {
      user.value = await usersService.updateUser(id, data)
      return true
    } catch (err) {
      console.error('useUserManage: updateUser failed:', err)
      updateError.value = err.response?.data || { non_field_errors: [err.message || 'Failed to update user'] }
      return false
    } finally {
      updating.value = false
    }
  }

  const clearUpdateError = () => {
    updateError.value = null
  }
  ```
  Export `updating`, `updateError`, `updateUser`, `clearUpdateError` alongside the existing returns; add the same three to `reset()`.

- **`src/views/UserDetail.vue`** — "User Information" card gains an `isEditing` local ref and an `editForm` reactive object (seeded from `user` when edit mode opens), per the whole-card edit decision above:
  - An "Edit" button next to the `<h2>User Information</h2>` heading, visible only when `!isEditing`, sets `isEditing = true` and seeds `editForm` from the 13 editable fields on `user` (not `bloomId`/`dataValidated` — those have no form fields at all, satisfying "no input control is rendered for them").
  - When `isEditing`, the 13 editable `info-item`s swap their `<span>` for an `<input>` (`type="email"` for `email`/`secondaryEmail`, `type="date"` for `birthDate`, `type="text"` for the rest) bound to `editForm.<field>`, reusing the `form-group`/`form-input` class names already established in `AssociateManage.vue`'s modal forms rather than inventing new ones. `bloomId` and `dataValidated` keep rendering exactly as today (plain `<span>`s), unconditionally.
  - A `field-error` paragraph under `fiscalCode`'s and `identityCardNumber`'s inputs (and any other field a backend validation error names), reusing the exact `.field-error` class/convention already used in `CreateAssociate.vue` rather than inventing a new error-display convention — e.g. `<p v-if="updateError?.fiscalCode" class="field-error">{{ updateError.fiscalCode[0] }}</p>`. A `non_field_errors` entry (covers the BE's rare `409` conflict case) renders as a single banner above the form, reusing the existing `.error-message` convention already used for the page's fetch-error banner.
  - Save/Cancel pair: Save calls `await updateUser(userId, editForm)`; on `true`, sets `isEditing = false` (the card now re-renders from the composable's updated `user`, no refetch needed). On `false`, stays in edit mode with `editForm` untouched so the user doesn't lose their in-progress input, and the per-field errors from `updateError` render inline. Cancel discards `editForm`, calls `clearUpdateError()`, and sets `isEditing = false` — `user` was never mutated during editing (only `editForm` was), so cancelling is a pure no-op against displayed data, consistent with the acceptance criteria's "does not corrupt the displayed User data" requirement.
  - Save button is disabled while `updating` is true, mirroring the `disabled` pattern already used on the (now-deleted) birthDate modal's submit button.

- **`src/views/AssociateManage.vue`** — delete, in full:
  - The modal markup block (`<!-- Update Birth Date Modal -->`, roughly lines 569-609).
  - The "📅 Update" trigger button and its wrapping wiring next to the Birth Date info item (roughly lines 159-171) — the Birth Date `info-item` reverts to a plain `<span>{{ formatDate(associate.user.birthDate) }}</span>`, matching the read-only pattern every other field in that card already uses (e.g. Last Name immediately above it).
  - The refs `showUpdateBirthDateModal`, `newBirthDate`, `updatingBirthDate` (roughly lines 720-722).
  - The methods `openUpdateBirthDateModal`, `closeUpdateBirthDateModal`, `confirmUpdateBirthDate` (roughly lines 1210-1251).
  - No change to `useAssociateManage.js` (see design decision 2 above) and no change to `associatesService` imports in this file beyond the removed `updateBirthDate` call — the service is still used here for everything else (`markFeePaid`, `markPaymentAsPaid`, etc.).

- **Env/pattern reuse:** no new env vars. No new `docker-compose.yml` changes needed in `association_management_devops` for this feature (there is no BE doc gap to fill here since the BE doc for this feature exists and already covers devops implications — stated there as "none").

## Result (documenter)

**What shipped:**

Implemented exactly as designed in the Architecture section above, verified by reading the shipped files directly:

- `src/services/usersService.js` — gained `updateUser(id, data)`, a thin `PATCH /user/${id}` wrapper matching the existing `try/catch`-and-log convention used by `getUser`/`getUserRelations`.
- `src/services/associatesService.js` — `updateBirthDate` is gone entirely (confirmed by reading the full file); the remaining methods (`createAssociate`, `searchAssociates`, `getAssociate`, `addCourseToAssociate`, `markFeePaid`, `markPaymentAsPaid`, `updateDeliveryStatus`) are untouched.
- `src/composables/useUserManage.js` — gained `updating`/`updateError` refs and an `updateUser(id, data)` method, implemented as a dedicated function rather than reusing the shared `runFetch` helper (because a failed update must leave `user` at its last-known-good value instead of being blanked to a `fallbackValue`, which is what `runFetch` would do). On success it replaces `user` with the server's response; on failure it stores `err.response?.data` (the DRF field-error object) in `updateError` and leaves `user` untouched. `clearUpdateError` and the three new state fields are included in `reset()`. `useAssociateManage.js` has zero references to `birthDate`/`updateBirthDate` — confirmed untouched, exactly as the architecture doc predicted (the birthDate-modal logic was never delegated to that composable in the first place).
- `src/views/UserDetail.vue` — the "User Information" card gained a single "Edit" button (`isEditing` ref, `editForm` reactive object seeded from `user` on edit-start). All 13 editable fields swap `<span>` for `<input>` (correct `type="email"`/`type="date"`/`type="text"` per field) when editing, each with a `.field-error` paragraph wired to `updateError.<field>`. `bloomId` and `dataValidated` remain plain, unconditional `<span>`s with no input and no edit affordance. Save calls `updateUser(userId, {...editForm})` and exits edit mode only on success; Cancel discards `editForm` and clears the error without ever having touched `user`. A `non_field_errors` banner renders above the form for the rare `409` case. Save button disables while `updating` is true. The Relations section below is untouched.
- `src/views/AssociateManage.vue` — the "Update Birth Date" modal, its trigger button, and all supporting refs/methods (`showUpdateBirthDateModal`, `newBirthDate`, `updatingBirthDate`, `openUpdateBirthDateModal`, `closeUpdateBirthDateModal`, `confirmUpdateBirthDate`) are gone. Confirmed by grep: the only remaining `birthDate` reference in the file is the plain read-only `<span>{{ formatDate(associate.user.birthDate) }}</span>`, identical in shape to every other read-only field on that card (e.g. Birth City immediately below it).
- Tests: `src/services/usersService.spec.js`, `src/composables/useUserManage.spec.js`, `src/services/associatesService.spec.js` (new), `src/views/UserDetail.spec.js`, `src/views/AssociateManage.spec.js` (new).

**Deviations from spec:**

One gap found and closed during verification, otherwise no deviations:

- The duplicate-value field-error acceptance criterion had only been exercised in tests for `fiscalCode`; a test for the equivalent `identityCardNumber` duplicate-error case was missing. Confirmed by reading `src/views/UserDetail.spec.js`: a test (`shows a field-level error near Identity Card Number too when the backend rejects a duplicate identityCardNumber`) now exists alongside the `fiscalCode` one and passed immediately against the already-correct implementation — this was a test-coverage addition, not a code change, since `UserDetail.vue`'s `.field-error` wiring is generic per-field and the `identityCardNumber` input/error block was already present and correct.
- Everything else — the deletion of `associatesService.updateBirthDate`, the `useUserManage`/`usersService` split, the whole-card edit UX, and leaving `useAssociateManage.js` untouched — shipped exactly as the Architecture section specified.

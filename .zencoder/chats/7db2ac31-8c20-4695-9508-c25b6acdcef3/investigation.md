# Investigation: challenge-based user levels

## Status and scope

Step 1 only: static investigation and proposed implementation plan. No application code or tests changed, and no plan checkboxes changed. Implementation must wait for user confirmation and the clarifications below.

## Bug summary

User requirement: level increases by one for every four unique completed challenges; profile displays `user.level` or falls back to 1.

Expected progression, assuming starting level 1: `1 + Math.floor(uniqueCompletedCount / 4)`. Counts 0–3 produce level 1, 4–7 level 2, and 8–11 level 3. Re-solving an already completed challenge must not increase the count or level.

Actual behavior found in code: the profile independently calculates `Math.floor(totalChallenges / 5) + 1` and calculates the next milestone using five challenges per level. Neither the user schema nor the inspected profile/auth response serializers defines or supplies a level.

No reproduction steps, runtime logs, or error messages were supplied. Findings are based on source inspection, not a live reproduction.

## Root cause analysis

- `.\frontend\src\pages\Profile.js:103-104` uses the wrong divisor (5 rather than 4) and calculates level locally rather than consuming a backend user level. Both the profile header and current-level summary use this local value (lines 204 and 325).
- `.\backend\models\User.js:34-39` stores completed challenge references but has no persisted or virtual level.
- `.\backend\routes\users.js:9-20` omits level from normalized profile responses. GET `/api/users/me` populates challenges and uses `lean()` (lines 81-94); adding a schema virtual alone will not make it available through this query and explicit response mapping.
- `.\backend\routes\auth.js:29-33` returns only id, name, and email in authentication responses. Consequently, the auth-context user also has no level.
- `.\frontend\src\pages\Profile.js:62-68` stores fetched profile data separately from the auth-context user. Its profile-save handler merges only name and email into context (lines 229-235). Using auth-context `user.level` without synchronizing fresh profile data could show a stale level.

## Completion tracking and affected components

- `.\backend\routes\execute.js:16-21`: successful individual submissions add the challenge ObjectId using `$addToSet`, already preventing new duplicate completions.
- `.\backend\index.js:363-378`: successful collaborative submissions use `$addToSet` for both participants. Any persisted-level approach must cover this path as well as individual execution.
- `.\backend\routes\users.js`: GET profile and PUT profile share the serializer. GET receives populated challenge documents; PUT currently passes unpopulated references. Level calculation must handle both without relying on challenge titles or other populated fields.
- `.\backend\routes\auth.js` and `.\frontend\src\context\AuthContext.js`: relevant if `user.level` means the authentication-context user rather than the fetched profile response.
- `.\frontend\src\pages\Profile.js`: header, summary, next milestone, fresh data handling, and profile-save behavior.

## Proposed solution, pending clarification

Recommended minimal approach: derive level on the backend from unique completed challenge IDs instead of maintaining a second mutable database value. This uses completion history as the source of truth, immediately covers existing users, and avoids double increments or races across individual and collaborative submissions.

1. Use one shared backend level calculation, handling missing arrays and both ObjectId references and populated documents. Deduplicate by normalized ID, not object identity. Return `1 + Math.floor(uniqueCompletedCount / 4)`.
2. Include numeric `level` in GET and PUT profile response serialization. If the required display source is the authentication-context user, also include level in signup/login/refresh responses and synchronize fresh profile level into context without discarding other user fields.
3. Replace the profile's five-challenge local level calculation with the confirmed server-user source and fallback 1.
4. Update the next-milestone calculation to a four-unique-challenge cadence, with 4 remaining at an exact threshold and 1 remaining immediately before the next threshold. Do not let fallback or stale context produce a negative milestone.
5. Preserve existing `$addToSet` completion writes. If stored level is required instead, design an atomic update that derives level from the updated unique completion set, covers both completion paths, and accounts for pre-existing users. Avoid an unconditional `$inc` or a read-then-increment sequence.
6. Add regression tests before the fix, then run relevant tests and available project verification commands. Keep unrelated progress metrics and charts out of scope.

## Edge cases and side effects

- Zero completions, missing completion arrays, boundary counts 3/4 and 7/8, and more than two levels.
- Repeated correct submissions, historical duplicate IDs, concurrent successful submissions, and collaboration credit for both users.
- Existing users must receive the correct level without needing to complete an additional challenge.
- GET populates references; missing/deleted referenced challenges may be removed by population. Clarify whether these historical completions should still count before choosing whether to calculate from raw stored references or populated results.
- Profile updates must preserve level and display consistency rather than falling back to 1 or using a stale context value after saving.
- If auth responses gain level, session restoration must preserve the same value and existing authentication tests must remain valid.

## Regression test plan

- Backend calculation: 0, 1, 3, 4, 5, 7, 8, and 12 unique completions; duplicate IDs; ObjectId and populated-document inputs; missing arrays.
- Profile routes: GET and PUT expose correct numeric level for existing accounts and consistent results across populated/unpopulated inputs.
- Authentication serializers/context, if selected: signup starts at level 1; login and refresh return current level.
- Submission behavior: repeated solves do not change level; fourth/eighth unique solves cross exactly one threshold; collaboration preserves unique credit for both participants.
- Frontend: both level displays use the supplied server value even when completion-list length would imply another level; missing level displays 1; milestones follow four challenges; profile saving keeps the correct level.

## Existing tests and verification commands

- `.\backend\package.json` configures Jest to discover only `**/tests/**/*.test.js`, with `npm test` running coverage and global 80% thresholds. Existing discovered suites cover ProgressService, AuthService, and SubmissionService; no dedicated profile/level suite was found.
- `.\backend\challenges.integration.test.js`, `.\backend\auth.verifyToken.test.js`, and `.\backend\progressService.test.js` are outside the configured backend discovery pattern; do not assume these run under the normal backend test script.
- `.\frontend\src\App.test.js` is a home-page smoke test, not profile coverage. React Testing Library is already installed.
- Backend verification from `.\backend\`: `npm test -- --runInBand`.
- Frontend verification from `.\frontend\`: `npm test -- --watchAll=false --runInBand`, then `npm run build`.
- Neither package defines a standalone lint or typecheck script. Frontend configuration uses the react-app ESLint preset. Ask for the intended standalone lint/typecheck commands, or confirmation that none are used.
- Tests/build/lint/typecheck were not run during this documentation-only investigation. No claims are made about baseline test health.

## Clarifications required before implementation

1. Is a backend-derived `level` response field acceptable, or must `level` be persisted in MongoDB and updated on successful completion?
2. Does “profile displays user.level” mean the freshly fetched `/api/users/me` response user, or specifically the `useAuth()` context user? Recommended: display the fresh profile response level with fallback 1; synchronize auth context only if required.
3. Should deleted challenges continue to count toward lifetime level? Recommended: use unique stored completion references, so deleting a challenge does not reduce earned level.
4. What standalone lint/typecheck commands should be run, if any? Neither package supplies them.

After these answers and approval, Step 2 can use this document for implementation. Do not proceed before confirmation.

## Implementation notes (Step 2)

- `.\backend\routes\users.js`: `normalizeUserResponse` now derives `completedChallengeCount` from a Set of stringified IDs (counting raw stored references, including ones pointing at deleted challenges) and computes `level` as `1 + Math.floor(completedChallengeCount / 4)`. Both GET and PUT `/api/users/me` use this shared logic against raw stored completions and populated challenge documents.
- `.\frontend\src\pages\Profile.js`: `level` now reads `profile?.level || 1` (fresh fetched profile response, fallback 1). `uniqueCompletedCount` prefers `profile?.completedChallengeCount`, falling back to a deduplicated count of visible completed challenges. `nextMilestoneCount` uses a four-challenge cadence (`4 - (uniqueCompletedCount % 4)`). Profile save flow continues to use the server-returned profile level.
- Added `.\backend\tests\UserLevels.test.js` covering GET/PUT level derivation across boundary counts (0,1,3,4,5,7,8,12), duplicate IDs, ObjectId vs. populated-document inputs, missing arrays, and deleted-challenge references. All 13 tests pass.
- Added `.\frontend\src\pages\Profile.test.js` covering both level displays using the fetched level (ignoring stale auth context and visible challenge count), fallback to 1 when level is missing, four-challenge milestone boundaries, deduplication of legacy completion lists, and level persistence across profile saves. All 9 tests pass.

## Test results

- Backend: `npx jest --config jest.config.js --runInBand` — `tests/UserLevels.test.js` passes (13/13). Three unrelated suites (`ProgressService.test.js`, `SubmissionService.test.js`, `AuthService.test.js`) fail with pre-existing `Cannot find module '../../services/...'` path errors, confirmed present before this change (unmodified files, same failure when implementation changes are stashed).
- Frontend: `npm test -- --watchAll=false --runInBand` — `src/pages/Profile.test.js` passes (9/9). `src/App.test.js` fails with a pre-existing `Cannot find module 'react-router-dom'` error, confirmed present before this change (same failure with implementation changes stashed).
- No standalone lint or typecheck scripts exist in either package (confirmed during investigation); none were run.
- Frontend `npm run build` was not run in this environment.

Step 2 implementation complete.

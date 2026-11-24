# Task Manager Final-Project-Notes

## Project details
- Student: Suzanne Todd
- Due: December 8, 2026
- App folder:  assign4/assignment3/materialize
- Final branch: final-project
- Submitted earlier branch: firebase-indexeddb

## Protect the earlier submission
- Leave firebase-indexeddb unchanged while grading is pending.
- Do not change the existing Firebase project's settings or data.
- Plan: Use a separate Firebase project for the final project.
- A Git branch separates code, not Firebase settings.
- final-project already includes the earlier Firebase/IndexedDB code.
- No merge is needed just to include those existing features.

## Completed Preparation
- [X] Review final assignment requirements.
- [X] Review Week 11 Firebase Authentication guide.
- [X] Check Source Control before creating the branch.
- [X] Create final-project from firebase-indexeddb.
- [X] Publish final-project to GitHub.
- [X] Verify both branches contain the same starting version.


## Implementation checklist
- [ ] Confirm and create a separate Firebase project.
- [ ] Add Materialize email/password sign-up and sign-in forms.
- [ ] Add logout and authentication-state handling.
- [ ] Associate cloud records with the signed-in user.
- [ ] Enforce ownership with Firestore Security Rules.
- [ ] Include the deployed rules in the repository.
- [ ] Isolate IndexedDB records and pending changes by user.
- [ ] Clear private screens on logout and prevent account mixing.
- [ ] Preserve offline CRUD, stable IDs, and retry-safe sync.
- [ ] Show per-record pending/synced status.
- [ ] Verify safe service-worker caching and offline loading.
- [ ] Verify manifest, installation, and installed launch.
- [ ] Verify responsive layouts and clear status/error messages.

## Final testing
- [ ] Online create: confirm the correct user's cloud record.
- [ ] Offline create/edit: refresh and confirm changes remain.
- [ ] Reconnect: confirm the same ID and no duplicates.
- [ ] Test offline deletion and failed-sync retries.
- [ ] Switch users: confirm no shared records or pending changes.
- [ ] Verify security rules reject unauthorized access.
- [ ] Sign in through another browser/device and load cloud data.
- [ ] Test offline shell, installation, and responsive layouts.
- [ ] Record procedures, results, and screenshots accurately.

## Submission
- [ ] Update README setup instructions and test summary.
- [ ]  Check that no private credentials are committed.
- [ ] Complete and review the required PDF report.
- [ ] Record the required demonstration video.
- [ ] Submit the correct repository link, PDF, and video.
- [ ] Optional: Verify live HTTPS deployment for  bonus points.

## Current checkpoint
- final-project is active locally and saved on GitHub.
- Earlier submitted branch remains unchanged.
- No final app-code or Firebase-setting changes have been made.
- Next: Confirm the separate Firebase project plan before setup.



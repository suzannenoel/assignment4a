# Midterm Work Notes
## branch and protected submission
working branch was created from submitted main in Prototype assignment. Keep main and submitted 
live app unchanged until Prototype grading is complete. Keep midterm changes on midterm-pwa.
App folder: 'assign4/assignment3/materialize'

## Starting Observation
The Prototype already has Materialize, CSS, responsive layout, navigation and app pages: index, contact, and about.
manifest.json exists-add the required application 'id'.
sw.js already has a versioned cache, and install, activate and fetch handlers.
Review the app-shell file list; add the files necessary for the interface to load offline.
Add 'offline.html' and an offline fallback.
Update the README to describe the PWA features.

## Midterm progress
- [x] Create and verify the midterm branch workspace
- [x] Complete the manifest requirements
- [x] Complete service-worker registration and caching
- [x] Add offline support
- [x] Update the README
- [x] Test required features in the browser and console

## Browser verification
- Online: the app loaded as expected, the service worker registered, and the task list appeared.
- Offline: the cached app showed the three existing tasks; the About and Contact pages also loaded.
- Fallback: an uncached test URL showed 'offline.html'; its link returned to the cached app and tasks.
- Console: the 'ibd' error no longer showed. Live Server and Firebase Analytics requests failed under  simulated offline mode; Firebase also showed a persistence deprecation warning.
- Screenshots of the offline tests are saved in the OpenOffice evidenceofworkingappoffline document.
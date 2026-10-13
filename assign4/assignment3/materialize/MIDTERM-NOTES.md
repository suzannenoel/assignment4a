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
- Online local test: the app loaded with four existing tasks, and 'sw.js' acitvated.
- First offline reload: the app shell loaded, but the task list was blank; the Console showed
failed requests for 'unpkg.com/ibd?module'and Google Fonts.
- After one normal online reload with the active service worker, 'task-manager-v5' contained the external dependancies, including 'ibd' and Firebase modules.
- Offline retest (Offline checked; Bypass unchecked): all four tasks, About and Contact loaded. An uncached URL showed 'offline.html'; its return button restored the task list.
- - Online task add/delete were tested on the Prototype on Oct 3; and I also added, described, and deleted a task on an Android OnePlus phone. These actions were not rerun online on the midterm branch; cross-device sync was not confirmed.
- Midterm local offline test ('127.0.0.1:5500'; DevTools Offline; 'navigator.onLine' was 'false'): added and deleted a temporary task before restoring the network.
- Editing existing tasks and automatic sync of offline task changes were not tested.; this verification was local at '127.0.0.1:5500'.
- Screenshots of the offline tests are saved in the OpenOffice evidenceofworkingappoffline document.
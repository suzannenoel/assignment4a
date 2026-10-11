# Task Manager App

This app will help users keep track of daily tasks. Users can add tasks using the plus icon, view tasks in the task list, and delete tasks using the trash icon. This app is user-friendly, and anyone can use it. Additional features will be added in the future.

[Open the live Task Manager App](https://suzannenoel.github.io/assignment4a/assign4/assignment3/materialize/index.html)
## Progressive Web App (PWA)
- 'manifest.json' provides the app metadata.
- 'sw.js' caches the app shell and selected assets so the app can load offline.
- If an uncached page cannot be reached, the service worker shows 'offline.html', which links back to the app.


### Test offline locally
1. Open this folder 'index.html' with VS Code Live Server while still online.
2. In Chrome Dev Tools, open **Application > Service Workers**.
3. Check **Offline**, leave **Bypass for network** unchecked, and reload the app.

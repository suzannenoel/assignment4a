# Task Manager - Firebase and IndexedDB

Task Manager is a progressive web app (PWA) for creating, viewing, editing, and
deleting daily tasks. It uses Firebase Firestore for online storage and IndexedDB for 
local offline storage. Pending offline storage changes synchronize with Firebase when the app reconnects to the internet.

## How storage works with the Task Manager App

When the app is online, it stores tasks in the Firebase Firestore in the tasks-firebase-indexeddb online collection.

Tasks are stored locally in IndexedDB, when the app is offline. The name of the database is 
taskManagerFirebaseIndexedDB. The tasks object store keeps the records available after a page reload.

## How to use the app offline and online

- How to create a task: Click the plus (+) button, and enter a title and a description,
then click the ADD button.
- How to view tasks: Tasks that are saved will appear in the task list along with titles and descriptions.
- How to edit a task: Click on the task card, change the title or description, then click EDIT to save your changes.
- How to delete a task: Click the trash icon next to the task card.

These controls can work whether you are online or offline. When offline the changes are saved locally to IndexedDB. The 
changes will reappear after a reload. Continue using the same local address and browser to access saved data.

## Synchronizing and task IDs

Once a task is deleted offline, the IndexedDB keeps a deletion marker so that the app
remembers to remove it from the Firebase. Once you have reconnected, the app will delete
the Firebase document using the same task ID, then it will remove the local record.

## Connection and synchronization messages
Once the app goes offline, a message will display that tells the user that changes will
be saved on the device. Once the app reconnects and successfully synchronizes, the app
will display "You are back online. Changes synced." If a task has failed to synchronize, 
it will display "Some changes could not sync. Please try again."

## Setup and running locally

1. Clone or download this repository and use the firebase-indexeddb branch.
2. Open the repository folder in VS Code and install the Live Server extension.
3. Open assign4/assignment3/materialize/index.html with Live Server.
4. Connect to the Internet for the first load so Firebase and the required resources can load.
5. Wait for the service worker to activate, then reload once while online before testing offline. 

## Testing checklist

Use the same browser and local address while applying these tests.

1. While online, create a task with a title and a description. Edit a task, reload the page, and check that the changes remain.
2. Open the browser DevTools if in Chrome, and select Network>Offline. Create a task, edit a task, and delete a task.
   Reload the page while still offline, and check that these changes still remain.
3. Turn off the Offline setting to restore the connection. Check that the app displays "You are back online. Changes synced."
4. In Firebase Firestore, check that the created and edited tasks match what is on the app and that the deleted task is gone.
5. Reload the app while online and check that the task list still matches the changes made offline.

## Browser and device testing

- After syncing online, close and reopen the browser.
- Open the app again and check that the saved tasks appear.
- Open the app in another supported browser or on another device while still online and check
  that it loads the tasks stored in Firebase.
- Offline changes made in one browser will not appear in another device until the original 
  browser reconnects and syncs with Firebase.

Record the browser, device and results when completing these tests.

## Known limitations

  - The app needs an internet connection on your first visit
    so the service worker and required resources can load.
  - Offline tasks are saved in the current browser. Clearing the site's browser data
    can remove locally saved tasks and changes that have not synced.
  - Changes made offline cannot reach Firebase or another device until the app reconnects
    and synchronization succeeds. 
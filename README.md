# Task Manager - Firebase and IndexedDB

Task Manager is a progressive web app (PWA) for creating, viewing, editing, and
deleting daily tasks. It uses Firebase Firestore for online storage and IndexedDB for 
local offline storage. Pending offline storage changes synchronize with Firebase when the app reconnects to the internet.

## How storage works with the Task Manager App

When online, the app stores each signed-in user's tasks in Firestore at users/{uid}/tasks/{taskId}.

Tasks are stored locally in IndexedDB, when the app is offline. The name of the database is 
taskManagerFinal-{uid}. The tasks object store keeps the records available after a page reload.
Each user's local database is separate. Signing out clears the task list from the screen but preserves
that users local records and pending changes.

Firestore Security Rules allow access to users/{uid}/tasks/{taskId} only when the signed-in user's
UID matches {uid}. The rules are included in firestore.rules at the repository root.

## How to use the app offline and online
- Create an account, then sign in with your email and password. An internet connection is required
to create an account or sign in. 

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
Each task shows "Waiting to sync" when it has pending local changes and "Synced"
after those changes have synchronized with Firebase.
Once the app goes offline, a message will display that tells the user that changes will
be saved on the device. Once the app reconnects and successfully synchronizes, the app
will display "You are back online. Changes synced." If a task has failed to synchronize, 
it will display "Some changes could not sync. Please try again."

## Setup and running locally

1. Clone or download this repository and use the final-project branch.
2. Open the repository folder in VS Code and install the Live Server extension.
3. Open assign4/assignment3/materialize/index.html with Live Server.
4. Connect to the Internet for the first load so Firebase and the required resources can load.
5. Wait for the service worker to activate, then reload once while online before testing offline. 

## Firebase configuration

This final version uses Firebase Authentication and Cloud Firestore.

1. Create a Firebase project and register a web app.
2. In Authentication, enable the Email/Password sign-in provider.
3. Create a Cloud Firestore database and publish the rules from firestore.rules
at the repository root.
4. In assign4/assignment3/materialize/js/firebaseDB.js, replace the firebaseConfig
object's values with your Firebase web app configuration. Keep all Firebase SDK
imports on the same version.
5. Run the app with Live Server, create a test account, and sign-in. Never commit
account passwords, service-account private keys, or other private credentials.

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

### Earlier prototype testing results

- I tested offline reloads in both Chrome and Edge, and the saved tasks appeared.
- In Edge, I closed and reopened the browser then I checked that the tasks still appeared after an offline reload.
- I created and edited a temporary task offline, reloaded the page, and confirmed the changes reached Firebase after reconnecting. I also confirmed that an offline deletion synced to Firebase.
- I checked the mobile layouts using an IPhone SE and Pixel 9 Pro presets in Chrome DevTools. The task cards, text, delete button, and add button fit the screen.
- I opened the app on a Samsung phone over the same Wi-Fi and confirmed that all three tasks appeared. This was an online viewing test, not an offline or syncing
test.
- I temporarily simulated database-opening failures and confirmed that helpful save and delete error messages appeared. After reloading, I deleted the temporary task test normally and confirmed that only the three original tasks remained in the app and Firebase.

### Final-project testing results
- Created accounts, signed in and out, and confirmed signing out clears tasks from the screen.
- Switched between two accounts in the same browser and confirmed each showed only its own tasks.
- Confirmed account A's offline pending task stayed unsynced, while account B was signed in,
then synced after returning to account A.
- Created, edited, and deleted tasks offline, then reconnected and confirmed the expected
results remained after an online refresh.
- Confirmed a newly created offline task survived an offline refresh and kept the same ID
when its local synced value changed from false to true after reconnecting.
- Opened the app offline with Chrome's normal browser cache disabled and confirmed
the task list and images loaded through the service worker.
- Confirmed task labels changed from "Synced" to "Waiting to sync" after an offline edit,
then returned to "Synced" after reconnecting.
- Signed into account A in a separate Chrome Incognito session and confirmed its three
cloud tasks loaded.
- Used Firestore Rules Playground to confirm signed-out reads were denied, owner reads
and deletes were allowed, and another user's reads and deletes were denied.
- Installed the PWA locally and reopened it from Windows search; all three account A
tasks and their Synced labels appeared.
- Checked task-list layouts at 320px, 768px, and desktop widths, and confirmed the task
form fit at 320px.

## Known limitations

  - The app needs an internet connection on your first visit
    so the service worker and required resources can load.
  - Offline tasks are saved in the current browser. Clearing the site's browser data
    can remove locally saved tasks and changes that have not synced.
  - Changes made offline cannot reach Firebase or another device until the app reconnects
    and synchronization succeeds. 
import { openDB } from "https://unpkg.com/idb?module";
import {
  addTask as addTaskToFirebase,
  getTasks as getTasksFromFirebase,
  deleteTask as deleteTaskFromFirebase,
  updateTask as updateTaskInFirebase,
  signInUser,
  signUpUser,
  signOutUser,
  watchAuthState
} from "./firebaseDB.js";
let currentUser = null;
let authSession = 0;
let authBusy = false;
let creatingAccount = false;
let syncQueue = Promise.resolve();
function checkAuthSession(session) {
  if (!currentUser || session !== authSession) {
    throw new Error("Your session changed. Please try again.");
  }
}
document.addEventListener("DOMContentLoaded", async function () {
  const signInForm= document.querySelector("#sign-in-form");
  const signUpForm= document.querySelector("#sign-up-form");
  function setAuthButtonsDisabled(disabled) {
    document.querySelectorAll("#auth-section button, #sign-out-button").forEach((button) =>{
        button.disabled = disabled;
      });
  }
  document.querySelector("#show-sign-up").addEventListener("click", () => {
    signInForm.hidden = true;
    signUpForm.hidden = false;
    document.querySelector("#auth-heading").textContent = "Create an account";
  });
  document.querySelector("#show-sign-in").addEventListener("click", () => {
    signUpForm.hidden = true;
    signInForm.hidden = false;
    document.querySelector("#auth-heading").textContent = "Sign in to Task Manager";
  });
  signInForm.addEventListener("submit", async(event)  => {
    event.preventDefault();
    if (authBusy) return;
    authBusy = true;
    setAuthButtonsDisabled(true);
    const email = signInForm.elements.email.value.trim();
    const password = signInForm.elements.password.value;
    try {
      document.querySelector("#sign-in-message").textContent = "";
      await signInUser(email, password);
    } catch (error) {
      document.querySelector("#sign-in-message").textContent =
      "Could not sign in. Check your email and password and try again.";
    } finally {
      authBusy = false;
      setAuthButtonsDisabled(false);
    }
  });
  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (authBusy) return;
    authBusy = true;
    setAuthButtonsDisabled(true);
    creatingAccount = true;
    const email = signUpForm.elements.email.value.trim();
    const password = signUpForm.elements.password.value;
    try {
      document.querySelector("#sign-up-message").textContent = "";
      await signUpUser(email, password);
      signUpForm.hidden = true;
      signInForm.hidden = false;
      document.querySelector("#auth-heading").textContent = "Sign in to Task Manager";
      document.querySelector("#sign-in-message").textContent =
      "Account created. Please sign in.";
    } catch (error) {
      document.querySelector("#sign-up-message").textContent =
      "Could not create an account. Please check your information and try again.";
    } finally {
      creatingAccount = false;
      authBusy = false;
      setAuthButtonsDisabled(false);
    }
  });
  document.querySelector("#sign-out-button").addEventListener("click", async () => {
    if (authBusy || !currentUser) return;
    authBusy = true;
    setAuthButtonsDisabled(true);
    try {
      await signOutUser();
    
  } catch (error) {
    M.toast({ html: "Could not sign out. Please try again.", displayLength: 6000 });
  } finally {
    authBusy = false;
    setAuthButtonsDisabled(false);
  }  
  });
  watchAuthState(async(user) => {
    if (creatingAccount && user) return;
  authSession += 1;
  currentUser = user;
  setAuthButtonsDisabled(authBusy);
  signInForm.reset();
  signUpForm.reset();
  document.querySelector(".add-task").reset();
  document.querySelector("#form-action-button").textContent = "Add";
  M.Sidenav.getInstance(document.querySelector(".side-form"))?.close();
  document.querySelector(".tasks").innerHTML = "";
  document.querySelector("#auth-section").hidden = !!user;
  document.querySelector("#user-controls").hidden = !user;
  document.querySelector(".fixed-action-btn").hidden = !user;
  if (!user) return;
  const session = authSession;
  try {
    if (navigator.onLine) {
      await syncTasks();
      checkAuthSession(session);
    }
    await loadTasks();
    checkAuthSession(session);
  } catch (error) {
    if (session !== authSession || !currentUser) return;
    console.error("Could not load your tasks:", error);
    M.toast({ html: "Could not load your tasks. Please try again.", displayLength:
      6000
    });
  }
});
  const menus = document.querySelector(".sidenav");
  M.Sidenav.init(menus, { edge: "right" });

  const forms = document.querySelector(".side-form");
  M.Sidenav.init(forms, { edge: "left" });

  const formActionButton = document.querySelector("#form-action-button");
  if (formActionButton) {
    formActionButton.addEventListener("click", async () => {
      const taskId = document.querySelector("#task-id").value;
      const title = document.querySelector("#title").value;
      const description = document.querySelector("#description").value;

      if (!title) return;
      const session = authSession;

      try {
        if (taskId) {
        await editTask(taskId, { title, description, status: "pending" });
      } else {
        await addTask({ title, description, status: "pending" });
      }
      checkAuthSession(session);
      } catch (error) {
      console.error("Error saving task: ", error);
      M.toast({ html: "Could not save the task. Please try again.", displayLength: 6000 });
       return;
      }

      document.querySelector("#title").value = "";
      document.querySelector("#description").value = "";
      document.querySelector("#task-id").value = "";
      formActionButton.textContent = "Add";

      const instance = M.Sidenav.getInstance(forms);
      instance.close();

      try {
        await loadTasks();
      } catch (error) {
        console.error("Error refreshing task list:", error);
        M.toast({
          html: "Your task was saved, but the list could not refresh. Please reload and try again.",
          displayLength: 6000
    });
  }
});
}


checkStorageUsage();
});
window.addEventListener("online", async() => {
  if (!currentUser) {
    return;
  }
  const session = authSession;
  try {
  const allSynced = await syncTasks();
  checkAuthSession(session);
      await loadTasks();
      checkAuthSession(session);
     
  if (allSynced) {
    M.toast({
      html: "You are back online. Changes synced.",
      displayLength: 6000
    });
  } else {
    M.toast({
      html: "Some changes could not sync. Please try again.",
      displayLength: 6000
    });
  }
  } catch (error) {
    console.error("Error reconnecting:", error);
    M.toast({
    html: "Could not finish reconnecting. Please reload and try again.",
    displayLength: 6000
  });
  }
});//End of the online handler
async function createDB() {
  if (!currentUser) {
    throw new Error("Please sign in before opening task storage.");
  }
  const db = await openDB(`taskManagerFinal-${currentUser.uid}`, 1, {
    upgrade (db) {
      const store = db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("status", "status");
     },
   });
   return db;
  }
 
 async function addTask(task) { 
  if (!currentUser) {
    throw new Error("Please sign in before adding a task.");
  }
  const session = authSession;
  const db = await createDB();
  checkAuthSession(session);
  let taskId = crypto.randomUUID();

  if (navigator.onLine) {
    const saveTask = await addTaskToFirebase({ ...task, id: taskId}, currentUser.uid);
    checkAuthSession(session);
    taskId = saveTask.id;
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put({ ...task, id: taskId, synced: true });
    await tx.done;
  } else {
    
    const taskToStore = { ...task, id: taskId, synced: false };
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.add(taskToStore);
    await tx.done;
  }
  checkAuthSession(session);
  checkStorageUsage();
  return { ...task, id: taskId };
}

async function editTask(id, updatedData) {
  if (!currentUser) {
    throw new Error("Please sign in before editing a task.");
  }
  if (!id) {
    console.error("Invalid Id passed to editTask");
    return;
  }
  const session = authSession;
  const db = await createDB();
  checkAuthSession(session);
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  await store.put({ ...updatedData, id: id, synced: false });
  await tx.done;
  checkAuthSession(session);
  if (navigator.onLine) {
    const allSynced = await syncTasks();
    checkAuthSession(session);

    if (!allSynced) {
      M.toast({
        html: "Your edit was saved on this device, but could not sync. Please try again.",
        displayLength: 6000
    });
    }
}
}
//Send pending local changes to Firebase using same task IDs
//Keep the failed changes pending so synchronization can be retried
function syncTasks() {
  const session = authSession;
  const nextSync = syncQueue.catch(() => false).then(() => {
    if (!currentUser || session !== authSession) return false;
    return runSyncTasks();
  });
  syncQueue = nextSync;
  return nextSync;
}

async function runSyncTasks() {
  if (!currentUser) {
    return false;
  }
  const session = authSession;
  let allSynced = true;
  const db = await createDB();
  checkAuthSession(session);
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const tasks = await store.getAll();
  await tx.done;


  for (const task of tasks) {
    checkAuthSession(session);
    if (!task.synced && navigator.onLine) {
      try {
        if (task.deleted) {
          await deleteTaskFromFirebase(task.id, currentUser.uid);

          checkAuthSession(session);
          const txDelete = db.transaction("tasks", "readwrite");
          const deleteStore = txDelete.objectStore("tasks");
          const latestDeletedTask = await deleteStore.get(task.id);
          if (latestDeletedTask &&
            JSON.stringify(latestDeletedTask) === JSON.stringify(task)) {
              await deleteStore.delete(task.id);
            } else if (latestDeletedTask && !latestDeletedTask.synced) {
              allSynced = false;
            }
            await txDelete.done;
          
          continue;
        }
        const taskToSync = {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
        };
        const savedTask = await addTaskToFirebase(taskToSync, currentUser.uid);
        checkAuthSession(session);
        const txUpdate = db.transaction("tasks", "readwrite");
        const storeUpdate = txUpdate.objectStore("tasks");
        
        const latestTask = await storeUpdate.get(task.id);
        if (latestTask && JSON.stringify(latestTask) === JSON.stringify(task)) {
         await storeUpdate.put({...latestTask, synced: true});
        } else if(latestTask && !latestTask.synced) {
         allSynced = false;
        }
        await txUpdate.done;
      } catch (error) {
        allSynced = false;
        console.error("Error syncing task: ", error);
      }
    }
  }
  return allSynced;
}

async function deleteTask(id) {
  if (!currentUser) {
    throw new Error("Please sign in before deleting a task.");
  }
  if (!id) {
    return;
  }
  const session = authSession;
  const db = await createDB();
  checkAuthSession(session);
    
    await db.put("tasks", { id, deleted: true, synced: false});
    checkAuthSession(session);
    const taskCard = document.querySelector(`[data-id="${id}"]`);
    if (taskCard) taskCard.remove();

    if (navigator.onLine) {
      const allSynced = await syncTasks();
      checkAuthSession(session);
      if (!allSynced) {
        M.toast({
          html: "Deletion saved on this device. Sync is still pending.",
          displayLength: 6000
        });
      }
    }
    checkStorageUsage();
  }
 
async function loadTasks() {
  if (!currentUser) {
    document.querySelector(".tasks").innerHTML = "";
    return;
  }
  const session = authSession;
  const db = await createDB();
  checkAuthSession(session);
  const taskContainer = document.querySelector(".tasks");
  taskContainer.innerHTML = "";

  if (navigator.onLine) {
    const firebaseTasks = await getTasksFromFirebase(currentUser.uid);
    checkAuthSession(session);
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    for (const task of firebaseTasks) {
      //Keep pending local changes instead of replacing them with Firebase data
      const localTask = await store.get(task.id);
      checkAuthSession(session);
      if (localTask && !localTask.synced) {
        if(!localTask.deleted) displayTask(localTask);
        continue;
      }
      await store.put({ ...task, synced: true });
      checkAuthSession(session);
      displayTask(task);
    }
    //Show pending local tasks that are not in Firebase yet
    const firebaseIds = new Set(firebaseTasks.map(task => task.id));
    const localTasks = await store.getAll();
    checkAuthSession(session);
    for (const localTask of localTasks) {
      if(!localTask.synced && !localTask.deleted &&
        !firebaseIds.has(localTask.id)) {
          displayTask(localTask);
      }
    }
    await tx.done;
  } else {
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");
    const tasks = await store.getAll();
    await tx.done;
    checkAuthSession(session);
    tasks.forEach((task) => {
      if(!task.deleted) displayTask(task);
    });
  }
}

function displayTask(task) {
  const taskContainer = document.querySelector(".tasks");
  const html = `
    <div class="card-panel white row valign-wrapper">
      <div class="col s2">
        <img src="css/img/img/task.png" class="circle responsive-img" alt="Task icon" style="max-width: 100%; height: auto" />
      </div>
      <div class="task-detail col s8">
        <h5 class="task-title black-text"></h5>
        <div class="task-description"></div>
        <div class="task-sync-status">
        ${task.synced === false ? "Waiting to sync" : "Synced"}
      </div>
      </div>
      <div class="col s2 right-align">
        <button class="task-delete btn-flat" aria-label="Delete task">
          <i class="large material-icons black-text-darken-1" style="font-size: 30px">delete_outline</i>
        </button>
      </div>
    </div>`;
  taskContainer.insertAdjacentHTML("beforeend", html);

  const taskCard = taskContainer.lastElementChild;
  taskCard.dataset.id = task.id;
  taskCard.querySelector(".task-title").textContent = task.title;
  taskCard.querySelector(".task-description").textContent = task.description;
  const deleteBtn = taskCard.querySelector(".task-delete");
  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      await deleteTask(task.id);
    } catch(error){
      console.error("Error deleting task: ", error);
      M.toast({ html: "Could not delete the task. Please try again.", displayLength: 6000 });
    }
  });

  taskCard.addEventListener("click", (e) => {
    if (!e.target.closest(".task-delete")) {
      openEditForm(task.id, task.title, task.description);
    }
  });
}

function openEditForm(id, title, description) {
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const taskIdInput = document.querySelector("#task-id");
  const formActionButton = document.querySelector("#form-action-button");

  titleInput.value = title;
  descriptionInput.value = description;
  taskIdInput.value = id;
  M.updateTextFields();
  formActionButton.textContent = "Edit";

  const forms = document.querySelector(".side-form");
  const instance = M.Sidenav.getInstance(forms);
  instance.open();
}

async function checkStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    const usageInMB = (usage / (1024 * 1024)).toFixed(2);
    const quotaInMB = (quota / (1024 * 1024)).toFixed(2);
    console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

    const storageInfo = document.querySelector("#storage-info");
    if (storageInfo) {
      storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
    }

    const storageWarning = document.querySelector("#storage-warning");
    if (storageWarning) {
      if (usage / quota > 0.8) {
        storageWarning.textContent = "Warning: You are running low on storage";
        storageWarning.style.display = "block";
      } else {
        storageWarning.textContent = "";
        storageWarning.style.display = "none";
      }
    }
  }
} 
window.addEventListener("offline", () => M.toast({ html: "You are offline. Changes will be saved on this device.", displayLength: 6000}));

import { openDB } from "https://unpkg.com/idb?module";
import {
  addTask as addTaskToFirebase,
  getTasks as getTasksFromFirebase,
  deleteTask as deleteTaskFromFirebase
} from "./firebaseDB.js";

document.addEventListener("DOMContentLoaded", function () {
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

      if (taskId) {
        await editTask(taskId, { title, description, status: "pending" });
      } else {
        await addTask({ title, description, status: "pending" });
      }

      document.querySelector("#title").value = "";
      document.querySelector("#description").value = "";
      document.querySelector("#task-id").value = "";
      formActionButton.textContent = "Add";

      const instance = M.Sidenav.getInstance(forms);
      instance.close();

      loadTasks();
    });
  }

  loadTasks();
  syncTasks();
  checkStorageUsage();
});

async function createDB() {
  const db = await openDB("taskManager", 1, {
    upgrade(db) {
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
  const db = await createDB();
  let taskId;

  if (navigator.onLine) {
    const saveTask = await addTaskToFirebase(task);
    taskId = saveTask.id;
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put({ ...task, id: taskId, synced: true });
    await tx.done;
  } else {
    taskId = `temp-${Date.now()}`;
    const taskToStore = { ...task, id: taskId, synced: false };
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.add(taskToStore);
    await tx.done;
  }

  checkStorageUsage();
  return { ...task, id: taskId };
}

async function editTask(id, updatedData) {
  if (!id) {
    console.error("Invalid Id passed to editTask");
    return;
  }
  const db = await createDB();
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  await store.put({ ...updatedData, id: id, synced: navigator.onLine });
  await tx.done;
}

async function syncTasks() {
  const db = await createDB();
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const tasks = await store.getAll();
  await tx.done;

  for (const task of tasks) {
    if (!task.synced && navigator.onLine) {
      try {
        const taskToSync = {
          title: task.title,
          description: task.description,
          status: task.status,
        };
        const savedTask = await addTaskToFirebase(taskToSync);
        const txUpdate = db.transaction("tasks", "readwrite");
        const storeUpdate = txUpdate.objectStore("tasks");
        await storeUpdate.delete(task.id);
        await storeUpdate.put({ ...task, id: savedTask.id, synced: true });
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing task: ", error);
      }
    }
  }
}

async function deleteTask(id) {
  if (!id) {
    console.error("Invalid Id passed to deleteTask");
    return;
  }
  const db = await createDB();

  if (navigator.onLine) {
    await deleteTaskFromFirebase(id);
  }

  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");
  try {
    await store.delete(id);
  } catch (e) {
    console.error("Error deleting the task from IndexedDB:", e);
  }
  await tx.done;

  const taskCard = document.querySelector(`[data-id="${id}"]`);
  if (taskCard) {
    taskCard.remove();
  }

  checkStorageUsage();
}

async function loadTasks() {
  const db = await createDB();
  const taskContainer = document.querySelector(".tasks");
  taskContainer.innerHTML = "";

  if (navigator.onLine) {
    const firebaseTasks = await getTasksFromFirebase();
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    for (const task of firebaseTasks) {
      await store.put({ ...task, synced: true });
      displayTask(task);
    }
    await tx.done;
  } else {
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");
    const tasks = await store.getAll();
    await tx.done;
    tasks.forEach((task) => {
      displayTask(task);
    });
  }
}

function displayTask(task) {
  const taskContainer = document.querySelector(".tasks");
  const html = `
    <div class="card-panel white row valign-wrapper" data-id="${task.id}">
      <div class="col s2">
        <img src="css/img/img/task.png" class="circle responsive-img" alt="Task icon" style="max-width: 100%; height: auto" />
      </div>
      <div class="task-detail col s8">
        <h5 class="task-title black-text">${task.title}</h5>
        <div class="task-description">${task.description}</div>
      </div>
      <div class="col s2 right-align">
        <button class="task-delete btn-flat" aria-label="Delete task">
          <i class="large material-icons black-text-darken-1" style="font-size: 30px">delete_outline</i>
        </button>
      </div>
    </div>`;
  taskContainer.insertAdjacentHTML("beforeend", html);

  const taskCard = taskContainer.querySelector(`[data-id="${task.id}"]`);
  const deleteBtn = taskCard.querySelector(".task-delete");
  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await deleteTask(task.id);
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

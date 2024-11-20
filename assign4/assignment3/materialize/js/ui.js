import{ openDB } from "https:unpkg.com/idb?module";
import { addTaskToFirebase } from "./firebaseDB";
document.addEventListener("DOMContentLoaded", function () {
    // Sidenav Initialization
    const menus = document.querySelector(".sidenav");
    M.Sidenav.init(menus, { edge: "right" });
    //Add Tasks
    const forms = document.querySelector(".side-form");
    M.Sidenav.init(forms, { edge: "left" });

   //load tasks
   loadTasks();
   syncTasks();
    checkStorageUsage();
  });
   //
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/serviceworker.js")
      .then((req) => console.log("Service Worker Registered!", req))
      .catch((err) => console.log("Service Worker registration failed", err));
  }
   //
  //create indexedDB database
  async function createDB(){
    const db = await openDB("taskManager", 1,{
      upgrade(db){
        const store = db.createObjectStore("tasks", {
          keyPath: "id",
          autoIncrement:true,
        });
        store.createIndex("status","status");
      },
    });
        return db;
  }

//Add Task
async function addTask(task){
  const db = await createDB();
  let taskID;//VS wouldn't allow me to make the l in "let" smallcase, it kept capitalizing the "L"

if(navigator.online) {
  const saveTask = await addTaskToFirebase(task);
   taskId = saveTask.id;
   const tx = db.transaction("tasks","readwrite");
   const store = tx.ObjectStore("tasks");
   await store.put({ ...task, id: taskId, synced: true });   
   await tx.done;
  }else {
    taskId='temp-${Date.now()}';
    console.log(taskId);

const taskToStore = { ...task, taskId, synced: false};
if(!taskToStore.id){
  console.error("Failed to generate a valid ID for the task.");
  return;//Exit if ID is invalid
}
   
//start transaction
const tx = db.transaction("tasks","readwrite");
const store = tx.ObjectStore("tasks");
//Add task to store
await store.add(taskToStore);
//complete transaction
await tx.done;
//update storeage usage//see next
}

checkStorageUsage();
//return task with ID
return{...task, id: taskId }
};
//
async function editTask(id, updatedData){
if (!id){
  console.error("Invalid Id passed to edit task");
  return;
}
  const db = await createDB();
  let taskID;//VS wouldn't allow me to make the l in "let" small
  if(navigator.online) {
  const saveTask = await addTaskToFirebase(task);
   taskId = saveTask.id;
   const tx = db.transaction("tasks","readwrite");
   const store = tx.ObjectStore("tasks");
   await store.put({ ...task, id: taskId, synced: true });   
   await tx.done;
  }else {
    taskId ='temp-${Date.now()}';
    console.log(taskId);
   const taskToStore = { ...task, taskId, synced: false};
  (!taskToStore.id){
  console.error("Failed to generate a valid ID for the task.");
  return;//Exit if ID is invalid
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.OjectStore("tasks");
  await store.put(taskToStore);
  await tx.done;
  }

}
}
//Sync tasks from indexedDB to firebase
async function syncTasks(){
  const db = await createDB();
  const tx = db.transaction("task", "readonly");
  const store = tx.objectStore("tasks");

  //fetch all unsynced tasks
  const tasks = await store.getAll();
  await tx.done;

  for( const task of tasks){
    if (!task.synced && navigator.online){
      try{
        const taskToSync ={
          title: task.title,
          description: task.description,
          status: task.status,
        };

        //send the task to firebase
        const savedTask = await addTaskToFirebase(taskToSync)

        //replace temporary Id with firebase ID
        const txUpdate = db.transaction("tasks", "readwrite")
        const storeUpdate = txUpdate.objectStore("tasks")

        await storeUpdate.delete(task.id)
        await storeUpdate.put({...task, id:savedTask.id, synced: true})
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing task: ", error);
      }
        }
      }
    }
  }
//Delete task with transaction
async function deleteTask(id){
  if(!id){
    console.error("Invalid Id passed to deleteTask");
    return;
  }
const db = await createDB();
if (navigator.online){
 await deleteTaskFromFirebase(id);
console.log(id);
//start transaction
const tx = db.transaction("tasks","readwrite");
const store = tx.ObjectStore("tasks");

try{
 //delete task by id
await store.delete(id);
} catch(e) {
  console.error("Error deleting the task from indexedDB:",e);
}
}


await tx.done;

//Remove task from UI
const taskCard = document.querySelector(['data-id="${id}"']); 
if (taskCard) {
  taskCard.remove();
}

  //update storage usage
  checkStorageUsage();
 
  
  //Load Tasks with transaction
  async function loadTasks(){
    const db = await createDB()

    const taskContainer = document.querySelector(".tasks");
    taskContainer.innerHTML ="";//Clear current tasks
    if (navigator.online){
       const firebaseTasks = await getTasksFromFirebase();
//start transaction (read only)
const tx = db.transaction("tasks","readwrite");
const store = tx.ObjectStore("tasks");

for (const task of firebaseTasks){
await store.put({...task, synced: true})
displayTask(task);
}
await tx.done;
}else {
//start transaction (read only)
const tx = db.transaction("tasks","readwrite");
const store = tx.ObjectStore("tasks");
//get all tasks
const tasks= await store.getAll();
//complete transaction
await tx.done;
tasks.forEach((task)=>{
displayTask(task);
});
}

}


//Display task using the existing HTML structure
function displayTask(task){
  const taskContainer = document.querySelector(".tasks");
  const html = '
<div class="tasks container grey-text text-darken-1">
  <div class="card-panel white row valign-wrapper" data-id=${task.id}>
    <div class="col s2">
      <img
        src="/css/img/img/task.png"//change to garden//
        class="circle responsive-img"
        alt="Task icon"
        style="max-width: 100%; height: auto"
      />
    </div>
    <div class="task-detail col s8">
      <h5 class="task-title black-text">${task.title}</h5>
      <div class="task-description">${task.description}</div>
    </div>
    <div class="col s2 right-align">
      <button class="task-delete btn-flat" aria-label="Delete task">
        <i
          class="large material-icons black-text-darken-1"
          style="font-size: 30px"
          >delete_outline</i
        >
      </button>
    </div>
  </div>';
taskContainer.insertAdjacentHTML("beforeend", html);

//Attach delete event listener
const deleteButton = taskContainer.querySelector(['data-id="${task.id}" .task-delete']); 

}


deleteButton.addEventListener("click",()=>deleteTask (task.id));
  }



//Add task button listener/and edit
const editButton = document.querySelector(".btn-small");
editButton.addEventListener("click", async()=>{
  '[data-id="${task.id}"] .task-edit'
});

//check if we are adding or editing a task
const taskId= taskInputId.value;
if(!taskId){
  const taskData ={
    title: titleInput.value,
    description: descriptionInput.value,
    status: "pending",
  };
  const savedTask = await addTask(taskData);//Add task 
  displayTask(savedtask);//Add task to check
}else{
await editTask(taskId,taskData);
}

}

  openEditForm(task.id, task.title, task.description )
  const descriptionInput = document.querySelector("#description");

  const task ={
    title: titleInput.value,
    description: descriptionInput.value,
    status: "pending",
  };
  const savedTask = await addTask(task);//Add task to indexedDB
  displayTask(savedtask);//Add task to UI
  closeForm();
});

  titleInput.value = "";
  descriptionInput.value = "";
  };
const forms= document.querySelector(".side-form");
const instance = M.Sidenav.getInstance(forms);
instance.close();//should I remove this?
  //


});
//open edit form
function openEditform(id, title, description){
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const taskIdInput= document.querySelector("#task-id");
  const formActionButton= document.querySelector("#form-action-button");
  titleInput.value=title;
  descriptionInput.value= description;
  taskIdInput.value=id;
  M.updateTexfFields();
  formActionButton.textContent="Edit";
  formActionButton.onclick= async()=>{
    const updatedTask={
      title: titleInput.value,
      description: descriptionInput.value,
      status: "pending",
    };
    await editTask(id, updatedTask);
    loadTasks();
   titleInput.value="";
   descriptionInput.value="";

  const forms=document.querySelector(".side-form");
  const instance= M.Sidenav.getInstance(forms);
  instance.close();
  };
const forms=document.querySelector(".side-form");
const instance= M.Sidenav.getInstance(forms);
instance.open();

function closeForm(){
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const taskIdInput= document.querySelector("#task-id");
  const formActionButton= document.querySelector("#form-action-button");
  titleInput.value=title;
  descriptionInput.value= "";
  taskIdInput.value=id;
  formActionButton.textContent="Add";

}
    
 



  }
}

async function checkStorageUsage(){
  if (navigator.storage && navigator.storage.estimate) {
    const {usage, quota} = await navigator.storage.estimate();
    
    const usageInMB = (usage /(1024 * 1024)). toFixed(2);
    const quotaInMB = (usage /(1024 * 1024)). toFixed(2);

    console.log('Storage used: ${usageInMB} MB of ${quotaInMB} MB');

    //upddate the UI
    const storageInfo = document.querySelector("#storage-info");
    if(storageInfo){
      storageInfo.textContent = 'Storage used: ${usageInMB} MB of ${quotaInMB} MB';
       if (usage /quota > 0.8) {
        const storageWarning = document.querySelector("#storage-warning");
        if (storageWarning){
          storageWarning.textContent = "Warning:  You are running low on data";
          storageWarning.style.display ="block";
        }else{
        const storageWarning = document.querySelector("#storage-warning");
        if (storageWarning) {
          storageWarning.textContent = "";
          storageWarning.style.display ="none";

        }
        

        }
       }

    }



  }
}

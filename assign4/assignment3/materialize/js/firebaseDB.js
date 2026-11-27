
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  
  import { getFirestore, collection, doc, setDoc, getDocsFromServer, deleteDoc, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
   } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
  apiKey: "AIzaSyCeeDBns6j9sYMCZ8nCYGVVj076m7xsuBU",
  authDomain: "task-manager-final-5a9f6.firebaseapp.com",
  projectId: "task-manager-final-5a9f6",
  storageBucket: "task-manager-final-5a9f6.firebasestorage.app",
  messagingSenderId: "724270595795",
  appId: "1:724270595795:web:f469989bda638fd3059e26"
};
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  
  const db = getFirestore(app);
// Enable offline support via IndexedDB
enableIndexedDbPersistence(db).catch((err) => {
  console.warn('IndexedDB persistence failed:', err.code);
});
export async function signInUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function signUpUser(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await signOut(auth);
  return result;
}
export async function signOutUser() {
  return signOut(auth);
}
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
function getUserTasksCollection(expectedUserId) {
  const user = auth.currentUser;

  if (!user || user.uid !== expectedUserId) {
    throw new Error("Please sign in before accessing tasks.");
  }
  return collection(db, "users", user.uid, "tasks");
}
  //Add a task
  export async function addTask(task, expectedUserId){
    try{
     let taskId = task.id;
     if (!taskId) {
      taskId= crypto.randomUUID();
     }
     const taskData = {
      title: task.title,
      description: task.description,
      status: task.status
     };
     const taskRef = doc(getUserTasksCollection(expectedUserId), taskId);
     await setDoc(taskRef, taskData);
     return {
      id: taskId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
     };

    }  catch(error) {
        console.error("error adding task: ", error);
        throw error;
    } 
    }

   
  //get tasks
  export async function getTasks(expectedUserId){
   const tasks = [];
   try{
const querySnapshot = await getDocsFromServer(getUserTasksCollection(expectedUserId));
querySnapshot.forEach((doc)=>{
tasks.push({id: doc.id, ...doc.data()});
})
   }catch(error){
    console.error("error retrieving task: ",error);
    throw error;
   }
   return tasks;
  }
  //delete tasks
  export async function deleteTask(id, expectedUserId){
   try{
    await deleteDoc(doc(getUserTasksCollection(expectedUserId), id));
   }catch(error){
    console.error("error deleting task: ",error);
    throw error;
   }
  }
  //update tasks
  export async function updateTask(id, updateData, expectedUserId){
    try{
     const taskRef= doc(getUserTasksCollection(expectedUserId), id);
     await updateDoc(taskRef, updateData);   
    }catch(error){
        console.error("error updating task: ",error);
        throw error;
       }   
    }

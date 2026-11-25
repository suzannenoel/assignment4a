
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
  import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, updateDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
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
    apiKey: "AIzaSyBIV9m5vbJ2VkJpb3UgEStxHcUoHM3wYOo",
    authDomain: "suzproj-d8400.firebaseapp.com",
    projectId: "suzproj-d8400",
    storageBucket: "suzproj-d8400.firebasestorage.app",
    messagingSenderId: "815671352500",
    appId: "1:815671352500:web:c21f0b9be5e056a62ecbe1",
    measurementId: "G-4XHNZJK7GR"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  const analytics = getAnalytics(app);
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
function getUserTasksCollection() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in before accessing tasks.");
  }
  return collection(db, "users", user.uid, "tasks");
}
  //Add a task
  export async function addTask(task){
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
     const taskRef = doc(getUserTasksCollection(), taskId);
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
  export async function getTasks(params){
   const tasks = [];
   try{
const querySnapshot = await getDocs(getUserTasksCollection());
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
  export async function deleteTask(id){
   try{
    await deleteDoc(doc(getUserTasksCollection(), id));
   }catch(error){
    console.error("error deleting task: ",error);
    throw error;
   }
  }
  //update tasks
  export async function updateTask(id, updateData){
    try{
     const taskRef= doc(getUserTasksCollection(), id);
     await updateDoc(taskRef, updateData);   
    }catch(error){
        console.error("error updating task: ",error);
        throw error;
       }   
    }

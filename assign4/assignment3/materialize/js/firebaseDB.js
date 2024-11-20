
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
  import { getFirestore,collection,doc,addDoc,getDocs,deleteDoc,updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  //Add a task
  export async function addTask(task){
    try{
     const docRef= await addDoc(collection(db, "tasks"),task);
     return {id: docRef.id, ...task}

    }  catch(error) {
        console.error("error adding task: ", error);
    } 
    }

const task= {
    title: "example task",
    description: "This is a test",
    status: true,

};
    addTask(task);
  //get tasks
  export async function getTasks(params){
   const tasks[];
   try{
const querySnapshot = await getDocs(collection(db,"tasks"));
querySnapshot.forEach((doc)=>{
tasks.push({id: doc.id, ...doc.data()});
})
   }catch(error){
    console.error("error retrieving task: ",error);
   }
   return tasks;
  }
  //delete tasks
  export async function deleteTask(id){
   try{
    await deleteDoc(doc(db, "tasks",id));
   }catch(error){
    console.error("error deleting task: ",error);
   }
  }
  //update tasks
  export async function updateTask(id, updateData){
    try{
     const taskRef= doc(db, "tasks",id);
     await updateDoc(taskRef, updatedData);   
    }catch(error){
        console.error("error updating task: ",error);
       }   
    }

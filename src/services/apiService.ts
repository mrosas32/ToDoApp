import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";

import { db } from "../firebase";

export interface Tarea {
  id: string;
  title: string;
  done: boolean;
}

export const getTasks = async (uid: string): Promise<Tarea[]> => {
  const tasksRef = collection(db, "users", uid, "tasks");
  const q = query(tasksRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data() as DocumentData;

    return {
      id: d.id,
      title: String(data.title ?? ""),
      done: Boolean(data.done ?? false),
    };
  });
};

export const addTask = async (uid: string, title: string): Promise<void> => {
  const tasksRef = collection(db, "users", uid, "tasks");
  await addDoc(tasksRef, {
    title,
    done: false,
    createdAt: serverTimestamp(),
  });
};

export const deleteTask = async (uid: string, taskId: string): Promise<void> => {
  const taskRef = doc(db, "users", uid, "tasks", taskId);
  await deleteDoc(taskRef);
};

export const toggleTaskDone = async (
  uid: string,
  taskId: string,
  done: boolean
): Promise<void> => {
  const taskRef = doc(db, "users", uid, "tasks", taskId);
  await updateDoc(taskRef, { done });
};

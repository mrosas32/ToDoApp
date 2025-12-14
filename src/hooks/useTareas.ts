import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Filesystem, Directory, FilesystemEncoding } from '@capacitor/filesystem';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string | null;
  ubicacion?: { lat: number; lng: number };
  createdAt?: Timestamp;
}

export const useTareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);

  const getUid = (): string | null => {
    return auth.currentUser ? auth.currentUser.uid : null;
  };

  const getFileName = (uid: string) => `tasks_${uid}.json`;

  const cargarTareasLocalmente = async (uid: string): Promise<Tarea[]> => {
    if (!uid) return [];
    try {
      const result = await Filesystem.readFile({
        path: getFileName(uid),
        directory: Directory.Data,
        encoding: FilesystemEncoding.UTF8
      });
      const parsed = JSON.parse(result.data as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error: any) {
      return [];
    }
  };

  const guardarTareasLocalmente = async (nuevasTareas: Tarea[], uid: string): Promise<void> => {
    if (!uid) return;
    try {
      await Filesystem.writeFile({
        path: getFileName(uid),
        data: JSON.stringify(nuevasTareas),
        directory: Directory.Data,
        encoding: FilesystemEncoding.UTF8
      });
    } catch (error) {
      console.error(error);
    }
  };

  const cargarDesdeFirestore = async (): Promise<Tarea[]> => {
    const uid = getUid();
    if (!uid) {
      setTareas([]);
      return [];
    }

    try {
      const ref = collection(db, "users", uid, "tasks");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data: Tarea[] = snap.docs.map((d) => {
        const x = d.data() as DocumentData;
        return {
          id: Number(x.id),
          titulo: String(x.titulo),
          descripcion: String(x.descripcion),
          imagenUrl: x.imagenUrl ?? null,
          ubicacion: x.ubicacion
            ? { lat: Number(x.ubicacion.lat), lng: Number(x.ubicacion.lng) }
            : undefined,
          createdAt: x.createdAt as Timestamp | undefined,
        };
      });

      if (data.length > 0) {
        setTareas(data);
        await guardarTareasLocalmente(data, uid);
      }
      
      return data;
    } catch (error) {
      return [];
    }
  };

  const descargarDeNube = async (): Promise<number> => {
    const data = await cargarDesdeFirestore();
    return data.length;
  };

  const importarDesdeApiExterna = async (): Promise<number> => {
    const uid = getUid();
    if (!uid) return 0;

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3');
      const data = await response.json();
      
      const tareasExternas: Tarea[] = data.map((d: any) => ({
        id: Date.now() + d.id, 
        titulo: `[API] ${d.title}`,
        descripcion: 'Dato adicional importado de API Externa',
        imagenUrl: null,
        ubicacion: undefined
      }));

      const tareasLocales = await cargarTareasLocalmente(uid);
      const nuevaLista = [...tareasExternas, ...tareasLocales];
      
      await guardarTareasLocalmente(nuevaLista, uid);
      setTareas(nuevaLista);
      
      return tareasExternas.length;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const subirANube = async (): Promise<number> => {
    const uid = getUid();
    if (!uid) return 0;

    const tareasLocales = await cargarTareasLocalmente(uid);
    let contador = 0;

    for (const tarea of tareasLocales) {
      try {
        const tareaLimpia = {
            ...tarea,
            imagenUrl: tarea.imagenUrl || null,
            ubicacion: tarea.ubicacion || null,
            createdAt: tarea.createdAt || serverTimestamp(),
        };
        
        const taskRef = doc(db, "users", uid, "tasks", String(tarea.id));
        await setDoc(taskRef, tareaLimpia, { merge: true });
        contador++;
      } catch (e) {
        console.error(e);
      }
    }

    await cargarDesdeFirestore();
    return contador;
  };

  const agregarTarea = async (nuevaTarea: Tarea): Promise<void> => {
    const uid = getUid();
    if (!uid) return;

    const tareasLocales = await cargarTareasLocalmente(uid);
    const listaActualizada = [nuevaTarea, ...tareasLocales]; 

    await guardarTareasLocalmente(listaActualizada, uid);
    setTareas(listaActualizada);

    if (navigator.onLine) {
      try {
        const tareaLimpia = {
          ...nuevaTarea,
          imagenUrl: nuevaTarea.imagenUrl || null,
          ubicacion: nuevaTarea.ubicacion || null,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", uid, "tasks", nuevaTarea.id.toString()), tareaLimpia);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const eliminarTarea = async (id: number): Promise<void> => {
    const uid = getUid();
    if (!uid) return;

    const tareasLocales = await cargarTareasLocalmente(uid);
    const listaActualizada = tareasLocales.filter(t => t.id !== id);

    await guardarTareasLocalmente(listaActualizada, uid);
    setTareas(listaActualizada);

    if (navigator.onLine) {
      await deleteDoc(doc(db, "users", uid, "tasks", String(id))).catch(console.error);
    }
  };

  const editarTarea = async (id: number, titulo: string, descripcion: string): Promise<void> => {
    const uid = getUid();
    if (!uid) return;

    const tareasLocales = await cargarTareasLocalmente(uid);
    const listaActualizada = tareasLocales.map(t => t.id === id ? { ...t, titulo, descripcion } : t);

    await guardarTareasLocalmente(listaActualizada, uid);
    setTareas(listaActualizada);

    if (navigator.onLine) {
      await updateDoc(doc(db, "users", uid, "tasks", String(id)), { titulo, descripcion }).catch(console.error);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      const uid = getUid();
      
      if (uid) {
        const localData = await cargarTareasLocalmente(uid);
        setTareas(localData);

        if (navigator.onLine) {
          subirANube(); 
        }
      } else {
        setTareas([]);
      }
    };

    inicializar();
  }, [auth.currentUser]);

  return {
    tareas,
    agregarTarea,
    eliminarTarea,
    editarTarea,
    descargarDeNube,
    subirANube,
    importarDesdeApiExterna
  };
};

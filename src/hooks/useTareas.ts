import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { apiService } from '../services/apiService';

export type Tarea = {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;      
  ubicacion?: { lat: number; lng: number };
  prioridad?: string; 
};

export function useTareas(usuarioActual: string | null) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);

  const getStorageKey = () => `tareas_${usuarioActual}`;

  useEffect(() => {
    const cargar = async () => {
      if (!usuarioActual) {
        setTareas([]);
        setCargando(false);
        return;
      }
      setCargando(true);
      
      const { value } = await Preferences.get({ key: getStorageKey() });
      if (value) setTareas(JSON.parse(value));
      else setTareas([]);
      
      setCargando(false);

      await descargarDeNube(true);
    };
    
    cargar();
  }, [usuarioActual]);

  useEffect(() => {
    if (!cargando && usuarioActual) {
      Preferences.set({
        key: getStorageKey(),
        value: JSON.stringify(tareas),
      });
    }
  }, [tareas, cargando, usuarioActual]);

  const descargarDeNube = async (silencioso = false) => {
    if (!usuarioActual) return 0;

    try {

      const tareasRemotas = await apiService.getTareas(usuarioActual);
      
      const tareasMapeadas: Tarea[] = tareasRemotas.map((t: any) => ({
        ...t,
        prioridad: 'API' 
      }));

      setTareas(prev => {
        const nuevas = tareasMapeadas.filter(remota => 
          !prev.some(local => local.titulo === remota.titulo)
        );
        if (nuevas.length === 0) return prev;
        return [...prev, ...nuevas];
      });
      
      return tareasMapeadas.length;
    } catch (e) {
      if (!silencioso) throw e;
      return 0;
    }
  };

  const subirANube = async () => {
    if (!usuarioActual) return 0;
    let contador = 0;
    for (const tarea of tareas) {
      await apiService.syncTarea(tarea, usuarioActual);
      contador++;
    }
    return contador;
  };

  const agregarTarea = async (nueva: Tarea) => {
    setTareas(prev => [...prev, nueva]);
    if (usuarioActual) {
      try {
        await apiService.syncTarea(nueva, usuarioActual);
      } catch (error) {
        console.warn(error);
      }
    }
  };
  
  const eliminarTarea = (id: number) => {
    setTareas(prev => prev.filter(t => String(t.id) !== String(id)));
  };
  
  const editarTarea = (id: number, titulo: string, desc: string) => {
    setTareas(prev => prev.map(t => String(t.id) === String(id) ? { ...t, titulo: titulo, descripcion: desc } : t));
  };

  const importarTareasExternas = (nuevas: Tarea[]) => setTareas(prev => [...prev, ...nuevas]);

  return { 
    tareas, cargando, agregarTarea, eliminarTarea, editarTarea, 
    importarTareasExternas, descargarDeNube, subirANube 
  };
}
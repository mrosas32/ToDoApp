import { Preferences } from '@capacitor/preferences';

const API_URL = 'https://jsonplaceholder.typicode.com/todos'; 

interface ApiTarea {
  id?: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  ubicacion?: any;
}

export const apiService = {
  getTareas: async (username: string): Promise<ApiTarea[]> => {
    let tareasNubeGenericas: ApiTarea[] = [];
    const USER_DB_KEY = `server_db_${username}`;

    try {
      const response = await fetch(`${API_URL}?_limit=3`, { cache: 'no-store' });
      if (response.ok) {
        const dataApi = await response.json();
        tareasNubeGenericas = dataApi.map((item: any, index: number) => ({
          id: Date.now() + index, 
          titulo: item.title || item.titulo,
          descripcion: 'Tarea de ejemplo API',
        }));
      }
    } catch (error) {
      console.warn('Offline mode');
    }

    try {
      const { value } = await Preferences.get({ key: USER_DB_KEY });
      const tareasSubidasReales = value ? JSON.parse(value) : [];
      
      return [...tareasSubidasReales, ...tareasNubeGenericas];
    } catch (error) {
      return [];
    }
  },

  syncTarea: async (tarea: ApiTarea, username: string) => {
    const USER_DB_KEY = `server_db_${username}`;

    try {
      const tareaParaNube = {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        imagenUrl: tarea.imagenUrl || '',
        ubicacion: tarea.ubicacion || null
      };

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tareaParaNube),
        cache: 'no-store'
      });
    } catch (error) {
      console.warn('Offline mode sync');
    }

    try {
      const { value } = await Preferences.get({ key: USER_DB_KEY });
      const currentRemoteTasks = value ? JSON.parse(value) : [];
      
      const exists = currentRemoteTasks.some((t: any) => t.titulo === tarea.titulo && t.descripcion === tarea.descripcion);
      
      if (!exists) {
        currentRemoteTasks.push({ ...tarea, id: Date.now() }); 
        
        await Preferences.set({
          key: USER_DB_KEY,
          value: JSON.stringify(currentRemoteTasks)
        });
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};
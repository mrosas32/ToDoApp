import { useState } from 'react';
import { isPlatform } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

export function useCamera() {
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string>('');

  const tomarFoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      const originalPath = image.path ?? image.webPath;
      
      if (!originalPath) {
        setError('No se pudo obtener la ruta de la imagen');
        return;
      }

      let finalUri: string;

      if (isPlatform('hybrid')) {
        const fileName = Date.now() + '.' + image.format;

        const savedFile = await Filesystem.copy({
          from: originalPath,
          to: fileName,
          toDirectory: Directory.Data,
        });

        finalUri = Capacitor.convertFileSrc(savedFile.uri);
        
      } else {
        if (!image.webPath) throw new Error("No web path available");
        
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        finalUri = await blobToDataURL(blob);
      }
      
      setFoto(finalUri);
      setError('');

    } catch (e: any) {
      console.error(e);
      setError('No se pudo tomar la foto');
    }
  };

  const limpiarFoto = () => setFoto(undefined);

  return { 
    foto, 
    tomarFoto, 
    limpiarFoto, 
    errorCamera: error 
  };
}

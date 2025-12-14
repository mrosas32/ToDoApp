import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useCamera() {
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [errorCamera, setErrorCamera] = useState<string>('');

  const tomarFoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 50,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image.dataUrl) {
        setFoto(image.dataUrl);
        setErrorCamera('');
      } else {
        setErrorCamera('No se pudo obtener la información de la imagen.');
      }

    } catch (e: any) {
      console.error(e);
      setErrorCamera('');
    }
  };

  const limpiarFoto = () => setFoto(undefined);

  return { 
    foto, 
    tomarFoto, 
    limpiarFoto, 
    errorCamera
  };
}
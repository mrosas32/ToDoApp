import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useHistory } from 'react-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon,
  IonToast, IonModal, IonSpinner, IonThumbnail, IonImg, IonChip,
  IonButtons, IonAlert
} from '@ionic/react';
import { 
  addOutline, createOutline, trashOutline, 
  cameraOutline, locationOutline, cloudDownloadOutline, 
  cloudUploadOutline, logOutOutline
} from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';

import { useCamera } from '../hooks/useCamera';
import { useTareas, Tarea } from '../hooks/useTareas';

export default function Tareas() {
  const { logout, username } = useAuth(); 
  const history = useHistory();

  const { tareas, agregarTarea, eliminarTarea, editarTarea, descargarDeNube, subirANube } = useTareas(username);
  const { foto, tomarFoto, limpiarFoto, errorCamera } = useCamera();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacionTemp, setUbicacionTemp] = useState<{lat: number; lng: number} | undefined>(undefined);
  const [cargandoGeo, setCargandoGeo] = useState(false);
  const [cargandoApi, setCargandoApi] = useState(false);
  
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const [toast, setToast] = useState('');
  const [alerta, setAlerta] = useState(false);

  const handleLogout = () => {
    logout(); 
    history.replace('/login'); 
  };

  const handleAgregar = () => {
    const t = titulo.trim();
    const d = descripcion.trim();
    
    if (!t) { 
      setToast('Falta el título'); 
      return; 
    }

    agregarTarea({
      id: Date.now(),
      titulo: t,
      descripcion: d,
      imagenUrl: foto,
      ubicacion: ubicacionTemp
    });

    setTitulo(''); 
    setDescripcion(''); 
    limpiarFoto(); 
    setUbicacionTemp(undefined);
    setToast('Tarea creada');
  };

  const handleObtenerUbicacion = async () => {
    setCargandoGeo(true);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 3000
      });
      setUbicacionTemp({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setToast('Ubicación obtenida');
    } catch (error) { 
      setToast('Error de GPS: Intenta de nuevo'); 
    } finally { 
      setCargandoGeo(false); 
    }
  };

  const handleImportarApi = async () => {
    setCargandoApi(true);
    try {
      const cantidad = await descargarDeNube();
      setToast(`Se importaron ${cantidad} tareas.`);
    } catch (error) { 
      setToast('Error al conectar con API'); 
    } finally { 
      setCargandoApi(false); 
      setAlerta(false); 
    }
  };

  const handleSincronizar = async () => {
    if (tareas.length === 0) {
        setToast('Nada que sincronizar');
        return;
    }
    setCargandoApi(true);
    try {
      const cantidad = await subirANube();
      setToast(`Sincronización exitosa: ${cantidad} tareas.`);
    } catch (error) { 
      setToast('Error al subir datos');
    } finally { 
      setCargandoApi(false); 
    }
  };

  const handleGuardarEdicion = () => {
    const t = editTitulo.trim();
    const d = editDesc.trim();

    if (editId && t) {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      editarTarea(editId, t, d);
      setEditId(null);
      setToast('Editado correctamente');
    } else {
        setToast('El título no puede estar vacío');
    }
  };

  const abrirEdicion = (t: Tarea) => {
    setEditId(t.id); 
    setEditTitulo(t.titulo); 
    setEditDesc(t.descripcion);
  };

  if (errorCamera && !toast) setToast(errorCamera);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tareas de {username}</IonTitle>
          
          <IonButtons slot="end">
            <IonButton onClick={() => setAlerta(true)} disabled={cargandoApi} title="Importar">
                <IonIcon slot="icon-only" icon={cloudDownloadOutline}/>
            </IonButton>
            <IonButton onClick={handleSincronizar} disabled={cargandoApi} title="Subir">
                <IonIcon slot="icon-only" icon={cloudUploadOutline}/>
            </IonButton>
            <IonButton onClick={handleLogout} color="danger" title="Salir">
                <IonIcon slot="icon-only" icon={logOutOutline}/>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {cargandoApi && <div className="ion-text-center"><IonSpinner /><p>Conectando...</p></div>}
        
        <div className="form-card">
          <h3>Nueva Tarea</h3>
          <IonInput 
            label="Título" 
            labelPlacement="stacked" 
            value={titulo} 
            onIonInput={e => setTitulo(e.detail.value!)} 
          />
          <IonInput 
            label="Descripción" 
            labelPlacement="stacked" 
            value={descripcion} 
            onIonInput={e => setDescripcion(e.detail.value!)} 
            className="ion-margin-bottom"
          />
          
          <div className="ion-margin-bottom" style={{ display: 'flex', gap: '10px' }}>
            <IonButton size="small" fill="outline" onClick={tomarFoto}>
              <IonIcon slot="start" icon={cameraOutline} /> {foto ? 'Foto OK' : 'Foto'}
            </IonButton>
            <IonButton size="small" fill="outline" onClick={handleObtenerUbicacion} disabled={cargandoGeo}>
              <IonIcon slot="start" icon={locationOutline} /> {cargandoGeo ? '...' : (ubicacionTemp ? 'GPS OK' : 'Ubicación')}
            </IonButton>
          </div>
          
          {(foto || ubicacionTemp) && <p style={{fontSize:'0.8rem'}}>Adjuntos listos</p>}

          <IonButton expand="block" onClick={handleAgregar} color="dark" className="ion-margin-top">Agregar</IonButton>
        </div>

        <div className="list-card">
          <h3>Mis Tareas</h3>
          <IonList>
            {tareas.length === 0 ? (
                <div className="empty-message ion-text-center">Sin tareas registradas</div> 
            ) : (
                tareas.map(t => (
                  <IonItem key={t.id} lines="full">
                    {t.imagenUrl && <IonThumbnail slot="start"><IonImg src={t.imagenUrl} /></IonThumbnail>}
                    <IonLabel>
                      <h2>{t.titulo}</h2>
                      <p>{t.descripcion}</p>
                      
                      {t.ubicacion && (
                        <IonChip outline color="medium" style={{height:20, fontSize:10, margin:0}}>
                          📍 {t.ubicacion.lat.toFixed(4)}, {t.ubicacion.lng.toFixed(4)}
                        </IonChip>
                      )}

                    </IonLabel>
                    <IonButton fill="clear" onClick={() => abrirEdicion(t)}>
                        <IonIcon slot="icon-only" icon={createOutline} />
                    </IonButton>
                    <IonButton fill="clear" color="danger" onClick={() => eliminarTarea(t.id)}>
                        <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonButton>
                  </IonItem>
            )))}
          </IonList>
        </div>

        <IonModal isOpen={editId !== null} onDidDismiss={() => setEditId(null)} className="edit-dialog">
          <div className="modal-wrapper ion-padding">
            <h3>Editar Tarea</h3>
            <IonInput 
                label="Título" 
                labelPlacement="stacked" 
                value={editTitulo} 
                onIonInput={e => setEditTitulo(e.detail.value!)} 
            />
            <IonInput 
                label="Descripción" 
                labelPlacement="stacked" 
                value={editDesc} 
                onIonInput={e => setEditDesc(e.detail.value!)} 
                className="ion-margin-bottom"
            />
            <IonButton expand="block" onClick={handleGuardarEdicion} color="dark">Guardar</IonButton>
            <IonButton expand="block" fill="outline" onClick={() => setEditId(null)}>Cancelar</IonButton>
          </div>
        </IonModal>

        <IonAlert 
            isOpen={alerta} 
            onDidDismiss={() => setAlerta(false)} 
            header={'Importar Tareas'} 
            message={'¿Deseas traer tareas desde la Nube?'}
            buttons={[{ text: 'Cancelar', role: 'cancel' }, { text: 'Importar', handler: handleImportarApi }]} 
        />
        <IonToast isOpen={!!toast} message={toast} duration={1500} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
}
import { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonToast, IonModal
} from '@ionic/react';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';

type Tarea = {
    id: number;
    titulo: string;
    descripcion: string;
};

export default function Tareas() {
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const [editId, setEditId] = useState<number | null>(null);
    const [editTitulo, setEditTitulo] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const [toast, setToast] = useState('');

    const agregar = () => {
        const t = titulo.trim();
        const d = descripcion.trim();

        if (!t) {
            setToast('Escribe un título para la tarea');
            return;
        }

        const nuevaTarea: Tarea = {
            id: Date.now(),
            titulo: t,
            descripcion: d
        };

        setTareas(prev => [...prev, nuevaTarea]);
        setTitulo('');
        setDescripcion('');
        setToast('Tarea agregada correctamente');
    };

    const eliminar = (id: number) => {
        setTareas(prev => prev.filter(t => t.id !== id));
        setToast('Tarea eliminada');
    };

    const abrirEdicion = (id: number) => {
        const tareaEncontrada = tareas.find(t => t.id === id);
        if (tareaEncontrada) {
            setEditId(id);
            setEditTitulo(tareaEncontrada.titulo);
            setEditDesc(tareaEncontrada.descripcion);
        }
    };

    const guardarEdicion = () => {
        if (editId === null) return;

        const t = editTitulo.trim();
        const d = editDesc.trim();

        if (!t) {
            setToast('El título no puede quedar vacío');
            return;
        }

        setTareas(prev => prev.map(tarea => 
            tarea.id === editId ? { ...tarea, titulo: t, descripcion: d } : tarea
        ));

        setEditId(null);
        setToast('Tarea editada correctamente');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Lista de Tareas</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                
                <div className="form-card">
                    <h3>Agregar tarea</h3>
                    
                    <IonInput
                        label="Título"
                        labelPlacement="stacked"
                        placeholder="Ingrese título"
                        value={titulo}
                        onIonChange={(e) => setTitulo(e.detail.value ?? '')}
                    />
                    
                    <IonInput
                        label="Descripción"
                        labelPlacement="stacked"
                        placeholder="Ingrese descripción"
                        value={descripcion}
                        onIonChange={(e) => setDescripcion(e.detail.value ?? '')}
                        className="ion-margin-bottom"
                    />

                    <IonButton expand="block" onClick={agregar} color="dark">
                        <IonIcon slot="start" icon={addOutline} />
                        Agregar
                    </IonButton>
                </div>

                <div className="list-card">
                    <h3>Mis Tareas</h3>
                    
                    {tareas.length === 0 ? (
                        <div className="empty-message ion-text-center">
                            No hay tareas registradas.
                        </div>
                    ) : (
                        <IonList>
                            {tareas.map((t) => (
                                <IonItem key={t.id} lines="full">
                                    <IonLabel>
                                        <h2>{t.titulo}</h2>
                                        {t.descripcion && <p>{t.descripcion}</p>}
                                    </IonLabel>

                                    <IonButton fill="clear" color="medium" onClick={() => abrirEdicion(t.id)}>
                                        <IonIcon slot="icon-only" icon={createOutline} />
                                    </IonButton>

                                    <IonButton fill="clear" color="danger" onClick={() => eliminar(t.id)}>
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                    </IonButton>
                                </IonItem>
                            ))}
                        </IonList>
                    )}
                </div>

                <IonModal
                    isOpen={editId !== null}
                    onDidDismiss={() => setEditId(null)}
                    className="edit-dialog"
                >
                    <div className="modal-wrapper ion-padding">
                        <h3 className="ion-padding-top" style={{ marginTop: 0 }}>Editar tarea</h3>
                        
                        <IonInput
                            label="Título"
                            labelPlacement="stacked"
                            value={editTitulo}
                            onIonChange={(e) => setEditTitulo(e.detail.value ?? '')}
                        />

                        <IonInput
                            label="Descripción"
                            labelPlacement="stacked"
                            value={editDesc}
                            onIonChange={(e) => setEditDesc(e.detail.value ?? '')}
                            className="ion-margin-bottom"
                        />

                        <IonButton expand="block" onClick={guardarEdicion} color="dark">
                            Guardar cambios
                        </IonButton>
                        
                        <IonButton expand="block" fill="outline" color="medium" onClick={() => setEditId(null)}>
                            Cancelar
                        </IonButton>
                    </div>
                </IonModal>

                <IonToast
                    isOpen={!!toast}
                    message={toast}
                    duration={1500}
                    position="bottom"
                    onDidDismiss={() => setToast('')}
                />

            </IonContent>
        </IonPage>
    );
}
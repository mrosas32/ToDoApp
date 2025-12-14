import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  IonPage, IonContent, IonInput, IonButton, IonHeader,
  IonToolbar, IonTitle, IonIcon, IonToast, IonText
} from '@ionic/react';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, isLoggedIn } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [toast, setToast] = useState('');

  if (isLoggedIn) {
    return <Redirect to="/tareas" />;
  }

  const handleAction = async () => {
    const u = usuario.trim();
    const c = clave.trim();

    if (!u || !c) {
      setToast('Por favor completa todos los campos');
      return;
    }

    if (isRegistering) {
      const success = await register(u, c);
      if (success) {
        setToast('¡Cuenta creada! Ya puedes ingresar.');
        setIsRegistering(false);
      } else {
        setToast('El usuario ya existe o es inválido. Intenta con otro.');
      }
    } else {
      const success = await login(u, c);
      if (!success) {
        setToast('Credenciales incorrectas.');
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        <div className="form-card" style={{ maxWidth: '400px', margin: '50px auto' }}>
          <IonIcon
            icon={isRegistering ? personAddOutline : logInOutline}
            style={{ fontSize: '64px', color: '#333', marginBottom: '20px' }}
          />

          <h3>{isRegistering ? 'Registro de Usuario' : 'Bienvenido'}</h3>

          <IonInput
            label="Usuario"
            labelPlacement="stacked"
            placeholder="Ej: juanperez"
            value={usuario}
            onIonInput={(e) => setUsuario(e.detail.value ?? '')}
          />

          <IonInput
            label="Contraseña"
            labelPlacement="stacked"
            type="password"
            placeholder="******"
            value={clave}
            onIonInput={(e) => setClave(e.detail.value ?? '')}
            className="ion-margin-bottom"
          />

          <IonButton expand="block" onClick={handleAction} color="dark" className="ion-margin-top">
            {isRegistering ? 'Registrarme' : 'Ingresar'}
          </IonButton>

          <div className="ion-margin-top">
            <IonText color="medium">
              <p>{isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</p>
            </IonText>

            <IonButton
              fill="clear"
              size="small"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Volver al Login' : 'Crear una cuenta nueva'}
            </IonButton>
          </div>
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={2000}
          onDidDismiss={() => setToast('')}
          position="bottom"
          color={toast.includes('creada') ? 'success' : 'danger'}
        />
      </IonContent>
    </IonPage>
  );
}

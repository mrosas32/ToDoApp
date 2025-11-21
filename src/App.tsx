import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Tareas from './pages/Tareas';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

import './global.css';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import './theme/variables.css';

setupIonicReact();

const ProtectedRoute: React.FC<any> = ({ component: Component, ...rest }) => {
  const { isLoggedIn } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const MainApp: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />
        <ProtectedRoute exact path="/tareas" component={Tareas} />
        <Redirect exact from="/" to="/login" />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;

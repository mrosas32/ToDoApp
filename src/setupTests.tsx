import React from 'react';
import '@testing-library/jest-dom';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as any;

global.Response = class {
    ok = true;
    status = 200;
    json() { return Promise.resolve({}); }
    text() { return Promise.resolve(""); }
} as any;

jest.mock('@ionic/react', () => ({
  IonPage: ({ children }: any) => <div data-testid="IonPage">{children}</div>,
  IonHeader: ({ children }: any) => <header>{children}</header>,
  IonToolbar: ({ children }: any) => <div role="toolbar">{children}</div>,
  IonTitle: ({ children }: any) => <h1>{children}</h1>,
  IonContent: ({ children }: any) => <main>{children}</main>,
  IonList: ({ children }: any) => <ul>{children}</ul>,
  IonItem: ({ children }: any) => <li>{children}</li>,
  IonLabel: ({ children }: any) => <label>{children}</label>,
  IonInput: (props: any) => (
    <input 
      data-testid={props.label || "input"} 
      onChange={(e) => props.onIonInput && props.onIonInput({ detail: { value: e.target.value } })}
    />
  ),
  IonButton: (props: any) => <button onClick={props.onClick}>{props.children}</button>,
  IonIcon: ({ icon }: any) => <div data-testid="icon" />,
  IonToast: () => <div />,
  IonModal: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  IonSpinner: () => <div>Cargando...</div>,
  IonThumbnail: ({ children }: any) => <div>{children}</div>,
  IonImg: () => <img alt="test" />,
  IonChip: ({ children }: any) => <div>{children}</div>,
  IonButtons: ({ children }: any) => <div>{children}</div>,
  IonAlert: () => <div />,
  IonRouterOutlet: () => <div />,
  IonApp: ({ children }: any) => <div>{children}</div>,
  setupIonicReact: jest.fn(),
  isPlatform: () => false,
}));

jest.mock('@ionic/react-router', () => ({
    IonReactRouter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('./firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123', email: 'test@duoc.cl' },
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  },
  db: {},
}));

jest.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: jest.fn().mockResolvedValue({ webPath: 'test-photo.jpg' }),
  },
}));

jest.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    getCurrentPosition: jest.fn().mockResolvedValue({
      coords: { latitude: -33.4, longitude: -70.6 }
    }),
  },
}));

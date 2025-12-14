import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tareas from './Tareas';

jest.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: jest.fn(),
  },
}));

jest.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    getCurrentPosition: jest.fn(),
  },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    username: 'TestUser',
    logout: jest.fn()
  })
}));

jest.mock('../hooks/useTareas', () => ({
  useTareas: () => ({
    tareas: [],
    agregarTarea: jest.fn(),
    eliminarTarea: jest.fn(),
    editarTarea: jest.fn(),
    descargarDeNube: jest.fn(),
    subirANube: jest.fn(),
    importarDesdeApiExterna: jest.fn()
  })
}));

jest.mock('../hooks/useCamera', () => ({
  useCamera: () => ({
    foto: null,
    tomarFoto: jest.fn(),
    limpiarFoto: jest.fn(),
    errorCamera: ''
  })
}));

describe('Página de Tareas', () => {
  test('renderiza correctamente los elementos básicos', () => {
    render(<Tareas />);
    
    expect(screen.getByText(/Nueva Tarea/i)).toBeInTheDocument();
    expect(screen.getByText(/Foto/i)).toBeInTheDocument();
    expect(screen.getByText(/Ubicación/i)).toBeInTheDocument();
  });
});

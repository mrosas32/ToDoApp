import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tareas from './Tareas';
import { vi } from 'vitest';

// 1. Mocks (Igual que antes)
vi.mock('react-router', () => ({
  useHistory: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ username: 'usuario_test', logout: vi.fn(), isLoggedIn: true })
}));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn().mockResolvedValue({ webPath: 'path/to/photo.jpg', format: 'jpeg' })
  },
  CameraResultType: { Uri: 'uri' },
  CameraSource: { Camera: 'camera' }
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    getCurrentPosition: vi.fn().mockResolvedValue({ coords: { latitude: -33, longitude: -70 } })
  }
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: vi.fn().mockResolvedValue({ value: null }), set: vi.fn() }
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { copy: vi.fn().mockResolvedValue({ uri: 'file://test.jpg' }) },
  Directory: { Data: 'DATA' }
}));

// 2. Tests Ajustados
describe('Página Tareas - Pruebas Unitarias U2', () => {
  
  test('Debe renderizar los botones de Foto y Ubicación', () => {
    render(<Tareas />);
    // Buscamos texto flexible (case insensitive)
    expect(screen.getByText(/Foto/i)).toBeDefined();
    expect(screen.getByText(/Ubicación/i)).toBeDefined();
  });

  test('Debe llamar a la Cámara al hacer clic', async () => {
    const { Camera } = await import('@capacitor/camera');
    render(<Tareas />);
    
    // ESTRATEGIA SEGURA: Buscar el texto y hacer clic en él directamente
    // Ionic maneja el clic bubbling correctamente
    const textoFoto = screen.getByText(/Foto/i);
    fireEvent.click(textoFoto);

    await waitFor(() => {
      expect(Camera.getPhoto).toHaveBeenCalled();
    });
  });

  test('Debe llamar al GPS al hacer clic', async () => {
    const { Geolocation } = await import('@capacitor/geolocation');
    render(<Tareas />);
    
    const textoGps = screen.getByText(/Ubicación/i);
    fireEvent.click(textoGps);

    await waitFor(() => {
      expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });
});
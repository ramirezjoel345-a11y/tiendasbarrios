// lib/env.dart

class Env {
  /// Devuelve la URL base del backend de TiendasBarrios.
  /// Ajusta según el entorno donde estés corriendo la app.
  static String apiBaseUrl() {
    // Si corres en Flutter Web o escritorio (Windows/Mac/Linux)
    return 'http://localhost:4000/api/v1';

    // ⚠️ Si corres en Android Emulator, usa esto:
    // return 'http://10.0.2.2:4000/api/v1';

    // ⚠️ Si corres en iOS Simulator, usa esto:
    // return 'http://127.0.0.1:4000/api/v1';
  }
}

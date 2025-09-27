// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../models/user.dart';

/// Provider de autenticación:
/// - ApiClient persiste token y maneja Authorization.
/// - Mantiene en memoria usuario y estados.
class AuthProvider extends ChangeNotifier {
  final _auth = AuthService();
  final _client = ApiClient();

  bool _loading = true;
  User? _user;
  String? _error;

  bool get loading => _loading;
  bool get isAuthenticated => _user != null;
  User? get user => _user;
  String? get error => _error;

  void _setLoading(bool v) {
    _loading = v;
    notifyListeners();
  }

  Future<void> init() async {
    _setLoading(true);
    try {
      _user = await _auth.me();
      _error = null;
    } catch (_) {
      _user = null;
      _error = null;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String role = 'user',
  }) async {
    _setLoading(true);
    try {
      final (token, user) = await _auth.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      await _client.persistToken(token);
      _user = user;
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = 'Registro falló: $e';
      _user = null;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    try {
      final (token, user) = await _auth.login(email: email, password: password);
      await _client.persistToken(token);
      _user = user;
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = 'Login falló: $e';
      _user = null;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    await _client.persistToken(null);
    _user = null;
    notifyListeners();
  }
}

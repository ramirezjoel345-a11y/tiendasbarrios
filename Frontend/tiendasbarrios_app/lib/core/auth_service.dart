// lib/core/auth_service.dart
import 'package:dio/dio.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  final _client = ApiClient();

  Future<(String token, User user)> register({
    required String name,
    required String email,
    required String password,
    String role = 'user',
  }) async {
    final Response res = await _client.dio.post(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    final data = res.data as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    return (token, user);
  }

  Future<(String token, User user)> login({
    required String email,
    required String password,
  }) async {
    final Response res = await _client.dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    final data = res.data as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    return (token, user);
  }

  Future<User> me() async {
    final Response res = await _client.dio.get('/auth/me');
    final data = res.data as Map<String, dynamic>;
    return User.fromJson(data['user'] as Map<String, dynamic>);
  }
}

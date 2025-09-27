// lib/core/api_client.dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'env.dart';

class ApiClient {
  static final ApiClient _i = ApiClient._internal();
  factory ApiClient() => _i;

  ApiClient._internal() {
    _dio.interceptors.add(LogInterceptor(
      request: true,
      requestHeader: true,
      requestBody: true,
      responseHeader: false,
      responseBody: true,
      error: true,
    ));
  }

  static const _prefsKey = 'auth_token';

  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl(),
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 20),
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status != null && status < 400,
    ),
  );

  Dio get dio => _dio;

  void setAuthHeaderSync(String? token) {
    if (token == null || token.isEmpty) {
      _dio.options.headers.remove('Authorization');
    } else {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  Future<void> persistToken(String? token) async {
    final prefs = await SharedPreferences.getInstance();
    if (token == null || token.isEmpty) {
      await prefs.remove(_prefsKey);
      setAuthHeaderSync(null);
    } else {
      await prefs.setString(_prefsKey, token);
      setAuthHeaderSync(token);
    }
  }

  Future<void> loadTokenOnBoot() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_prefsKey);
    setAuthHeaderSync(token);
  }
}

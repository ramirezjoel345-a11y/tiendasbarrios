// lib/core/health_service.dart
import 'package:dio/dio.dart';
import 'api_client.dart';

class HealthService {
  final _client = ApiClient();

  Future<Map<String, dynamic>> getApiHealth() async {
    final Response res = await _client.dio.get('/health');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> getDbHealth() async {
    final Response res = await _client.dio.get('/db/health');
    return Map<String, dynamic>.from(res.data as Map);
  }
}

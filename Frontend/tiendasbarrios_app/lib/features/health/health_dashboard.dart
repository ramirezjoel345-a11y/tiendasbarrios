// lib/features/health/health_dashboard.dart
import 'package:flutter/material.dart';
import '../../core/health_service.dart';

class HealthDashboard extends StatefulWidget {
  const HealthDashboard({super.key});

  @override
  State<HealthDashboard> createState() => _HealthDashboardState();
}

class _HealthDashboardState extends State<HealthDashboard> {
  final _svc = HealthService();

  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _api;
  Map<String, dynamic>? _db;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = await _svc.getApiHealth();
      final db = await _svc.getDbHealth();
      setState(() {
        _api = api;
        _db = db;
      });
    } catch (e) {
      setState(() {
        _error = '$e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cards = <Widget>[];

    Widget buildCard(String title, Map<String, dynamic>? data) {
      final ok = (data?['ok'] == true) &&
          ((data?['status'] ?? '').toString().toLowerCase() != 'unhealthy');

      return Card(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(ok ? Icons.check_circle : Icons.error,
                  color: ok ? Colors.green : Colors.red),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text(
                      data == null
                          ? 'Sin datos'
                          : 'status: ${data['status']} • ts: ${data['timestamp']}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_api != null || _loading) {
      cards.add(buildCard('API /health', _api));
    }
    if (_db != null || _loading) {
      cards.add(buildCard('Base de Datos /db/health', _db));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Estado del Backend')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_loading) ...[
              const LinearProgressIndicator(),
              const SizedBox(height: 16),
            ],
            if (_error != null) ...[
              Card(
                // Reemplazo de withOpacity(): usar withValues(alpha: ...)
                color: Colors.red.withValues(alpha: 0.08),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'Error: $_error',
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.red),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            ...cards,
          ],
        ),
      ),
    );
  }
}

// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/api_client.dart';
import 'providers/auth_provider.dart';
import 'features/auth/login_page.dart';
import 'features/health/health_dashboard.dart';
import 'models/user.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient().loadTokenOnBoot();
  runApp(const TiendasBarriosApp());
}

class TiendasBarriosApp extends StatelessWidget {
  const TiendasBarriosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'TiendasBarrios',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
          useMaterial3: true,
        ),
        home: const RootRouter(),
      ),
    );
  }
}

class RootRouter extends StatelessWidget {
  const RootRouter({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (auth.loading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (!auth.isAuthenticated) {
          return const LoginPage();
        }
        return const HomePage();
      },
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final User? u = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inicio'),
        actions: [
          IconButton(
            tooltip: 'Estado Backend',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const HealthDashboard()),
              );
            },
            icon: const Icon(Icons.health_and_safety),
          ),
          IconButton(
            onPressed: () => context.read<AuthProvider>().logout(),
            icon: const Icon(Icons.exit_to_app),
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: u == null
                ? const Text('Sin usuario')
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('ID: ${u.id}'),
                      Text('Nombre: ${u.name}'),
                      Text('Email: ${u.email}'),
                      Text('Rol: ${u.role}'),
                      const SizedBox(height: 12),
                      const Text('Sesión de demo activa con el backend.'),
                      const SizedBox(height: 8),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                                builder: (_) => const HealthDashboard()),
                          );
                        },
                        icon: const Icon(Icons.monitor_heart),
                        label: const Text('Ver estado del backend'),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

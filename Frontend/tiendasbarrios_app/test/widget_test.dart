// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tiendasbarrios_app/main.dart';
import 'package:tiendasbarrios_app/features/health/health_dashboard.dart';


void main() {
  testWidgets('TiendasBarriosApp renders correctly', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const TiendasBarriosApp());

    // Verifica que la app se renderiza correctamente
    expect(find.text('TiendasBarrios • Estado del Backend'), findsOneWidget);
    expect(find.byType(HealthDashboard), findsOneWidget);
    
    // También puedes verificar otros elementos específicos de tu app
    expect(find.byIcon(Icons.refresh), findsOneWidget); // Botón de actualizar
  });
}
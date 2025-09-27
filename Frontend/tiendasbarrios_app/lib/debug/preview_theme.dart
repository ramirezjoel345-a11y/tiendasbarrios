// lib/debug/preview_theme.dart
import 'package:flutter/material.dart';
// ✅ Eliminada importación innecesaria: '../theme/app_theme.dart'

class PreviewThemePage extends StatelessWidget {
  const PreviewThemePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Preview Tema'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Preview de colores
            _buildColorSection(context),
            const SizedBox(height: 24),
            
            // Preview de tipografía
            _buildTypographySection(),
            const SizedBox(height: 24),
            
            // Preview de componentes
            _buildComponentsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildColorSection(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Colores', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildColorCard('Primary', scheme.primary),
            _buildColorCard('On Primary', scheme.onPrimary),
            _buildColorCard('Surface', scheme.surface),
            _buildColorCard('On Surface', scheme.onSurface),
            // ✅ Corregido: 'background' -> 'surface'
            _buildColorCard('Background', scheme.surface), // surface en lugar de background
            _buildColorCard('Error', scheme.error),
          ],
        ),
      ],
    );
  }

  Widget _buildColorCard(String label, Color color) {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color.computeLuminance() > 0.5 ? Colors.black : Colors.white,
              fontSize: 10,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTypographySection() {
    return Builder(
      builder: (context) {
        final textTheme = Theme.of(context).textTheme;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tipografía', style: textTheme.headlineSmall),
            const SizedBox(height: 16),
            Text('Display Large', style: textTheme.displayLarge),
            Text('Headline Medium', style: textTheme.headlineMedium),
            Text('Title Large', style: textTheme.titleLarge),
            Text('Body Large', style: textTheme.bodyLarge),
            Text('Label Large', style: textTheme.labelLarge),
          ],
        );
      },
    );
  }

  Widget _buildComponentsSection() {
    return Builder(
      builder: (context) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Componentes', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            
            ElevatedButton(
              onPressed: () {},
              child: const Text('Elevated Button'),
            ),
            const SizedBox(height: 8),
            
            FilledButton(
              onPressed: () {},
              child: const Text('Filled Button'),
            ),
            const SizedBox(height: 8),
            
            OutlinedButton(
              onPressed: () {},
              child: const Text('Outlined Button'),
            ),
            const SizedBox(height: 16),
            
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text('Tarjeta de ejemplo', style: Theme.of(context).textTheme.bodyLarge),
              ),
            ),
          ],
        );
      },
    );
  }
}
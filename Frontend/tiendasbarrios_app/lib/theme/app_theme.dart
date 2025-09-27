// lib/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Color semilla (verde)
  static const Color seedColor = Color(0xFF16A34A);

  static ThemeData get light => _fromSeed(Brightness.light);
  static ThemeData get dark => _fromSeed(Brightness.dark);

  static ThemeData _fromSeed(Brightness brightness) {
    final ColorScheme scheme = ColorScheme.fromSeed(
      seedColor: seedColor,
      brightness: brightness,
    );

    final baseText = GoogleFonts.interTextTheme();
    final text = baseText.copyWith(
      displayLarge: baseText.displayLarge?.copyWith(fontWeight: FontWeight.w700),
      headlineLarge: baseText.headlineLarge?.copyWith(fontWeight: FontWeight.w700),
      headlineMedium: baseText.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
      titleLarge: baseText.titleLarge?.copyWith(fontWeight: FontWeight.w700),
      titleMedium: baseText.titleMedium?.copyWith(fontWeight: FontWeight.w600),
      titleSmall: baseText.titleSmall?.copyWith(fontWeight: FontWeight.w600),
      bodyLarge: baseText.bodyLarge,
      bodyMedium: baseText.bodyMedium,
      labelLarge: baseText.labelLarge?.copyWith(letterSpacing: 0.2, fontWeight: FontWeight.w700),
    );

    final OutlineInputBorder baseBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: BorderSide(color: scheme.outline),
    );

    final OutlineInputBorder focusBorder = baseBorder.copyWith(
      borderSide: BorderSide(color: scheme.primary, width: 1.6),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: text,
      scaffoldBackgroundColor: scheme.surface,
      appBarTheme: AppBarTheme(
        elevation: 0,
        backgroundColor: scheme.surface,
        foregroundColor: scheme.onSurface,
        centerTitle: false,
        titleTextStyle: text.titleLarge?.copyWith(letterSpacing: -0.2),
        iconTheme: IconThemeData(color: scheme.onSurface),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surfaceContainerHighest.withAlpha(brightness == Brightness.light ? 102 : 64),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: baseBorder,
        enabledBorder: baseBorder,
        focusedBorder: focusBorder,
        errorBorder: baseBorder.copyWith(borderSide: BorderSide(color: scheme.error)),
        focusedErrorBorder: focusBorder.copyWith(borderSide: BorderSide(color: scheme.error)),
        labelStyle: TextStyle(color: scheme.onSurfaceVariant),
        hintStyle: TextStyle(color: scheme.onSurfaceVariant.withAlpha(204)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          backgroundColor: scheme.primary,
          foregroundColor: scheme.onPrimary,
          textStyle: text.labelLarge,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          elevation: 0,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: text.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          side: BorderSide(color: scheme.outline),
          foregroundColor: scheme.onSurface,
          textStyle: text.labelLarge,
        ),
      ),
      // ✅ CORREGIDO: CardTheme -> CardThemeData
      cardTheme: CardThemeData(
        elevation: 0,
        color: scheme.surface,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        surfaceTintColor: Colors.transparent,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: scheme.onInverseSurface,
        contentTextStyle: text.bodyMedium?.copyWith(color: scheme.inverseSurface),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      iconTheme: IconThemeData(color: scheme.onSurfaceVariant),
      dividerTheme: DividerThemeData(color: scheme.outlineVariant),
      checkboxTheme: CheckboxThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        side: BorderSide(color: scheme.outline),
      ),
      switchTheme: SwitchThemeData(
        thumbIcon: WidgetStateProperty.resolveWith<Icon?>((states) {
          if (states.contains(WidgetState.selected)) return const Icon(Icons.check);
          return null;
        }),
      ),
    );
  }
}
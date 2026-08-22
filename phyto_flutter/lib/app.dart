import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phyto_flutter/core/router/app_router.dart';
import 'package:phyto_flutter/core/theme/phyto_tokens.dart';

class PhytoApp extends ConsumerWidget {
  const PhytoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Phyto',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: PhytoColors.deepGreen,
          primary: PhytoColors.deepGreen,
          surface: PhytoColors.surface,
        ),
        scaffoldBackgroundColor: PhytoColors.surface,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: PhytoColors.forest,
          elevation: 0,
        ),
      ),
      routerConfig: appRouter,
    );
  }
}

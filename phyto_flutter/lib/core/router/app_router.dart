import 'package:go_router/go_router.dart';
import 'package:phyto_flutter/presentation/shell/app_shell.dart';
import 'package:phyto_flutter/presentation/pages/nursery/manage_products.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const AppShell(),
      routes: [
        GoRoute(
          path: 'manage-products',
          builder: (context, state) => const ManageProducts(),
        ),
      ],
    ),
  ],
);
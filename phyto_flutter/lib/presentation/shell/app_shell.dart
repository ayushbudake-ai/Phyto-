import 'package:flutter/material.dart';
import 'package:phyto_flutter/core/theme/phyto_tokens.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phyto_flutter/data/state/session_store.dart';
import 'package:phyto_flutter/presentation/shell/sidebar.dart';
import 'package:phyto_flutter/presentation/pages/home_page.dart';
import 'package:phyto_flutter/presentation/pages/shop_page.dart';
import 'package:phyto_flutter/presentation/pages/cart_page.dart';
import 'package:phyto_flutter/presentation/pages/checkout_page.dart';
import 'package:phyto_flutter/presentation/pages/login_page.dart';
import 'package:phyto_flutter/presentation/pages/nursery/nursery_dashboard.dart';
import 'package:phyto_flutter/presentation/pages/delivery/delivery_dashboard.dart';

enum AppArea { home, shop, cart, checkout, login, admin, nursery, delivery }

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  AppArea area = AppArea.home;

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= 980;
    final session = ref.watch(sessionProvider);

    Widget page = switch (area) {
      AppArea.home => const HomePage(),
      AppArea.shop => const ShopPage(),
      AppArea.cart => const CartPage(),
      AppArea.checkout => const CheckoutPage(),
      AppArea.login => const LoginPage(),
      AppArea.nursery => const NurseryDashboard(),
      AppArea.delivery => const DeliveryDashboard(),
      AppArea.admin => const NurseryDashboard(), // temporary: admin shares dashboard shell
    };

    // Hide partner portals unless logged in as those roles (hackathon mode).
    if ((area == AppArea.nursery || area == AppArea.delivery || area == AppArea.admin) && !session.isAuthed) {
      area = AppArea.login;
      page = const LoginPage();
    }

    if (!isWide) {
      return Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [PhytoColors.cream, PhytoColors.mint],
            ),
          ),
          child: SafeArea(child: page),
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _bottomIndex(area),
          onTap: (i) => setState(() => area = _areaFromBottom(i)),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), label: 'Shop'),
            BottomNavigationBarItem(icon: Icon(Icons.shopping_cart_outlined), label: 'Cart'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Login'),
          ],
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          Sidebar(
            selected: area,
            onSelect: (a) => setState(() => area = a),
            showPartners: session.isAuthed,
          ),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [PhytoColors.cream, PhytoColors.mint],
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: page,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  int _bottomIndex(AppArea a) => switch (a) {
        AppArea.home => 0,
        AppArea.shop => 1,
        AppArea.cart => 2,
        _ => 3,
      };

  AppArea _areaFromBottom(int i) => switch (i) {
        0 => AppArea.home,
        1 => AppArea.shop,
        2 => AppArea.cart,
        _ => AppArea.login,
      };
}


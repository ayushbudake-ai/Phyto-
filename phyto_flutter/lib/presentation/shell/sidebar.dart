import 'package:flutter/material.dart';
import 'package:phyto_flutter/core/theme/phyto_tokens.dart';
import 'package:phyto_flutter/presentation/shell/app_shell.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key, required this.selected, required this.onSelect, required this.showPartners});

  final AppArea selected;
  final ValueChanged<AppArea> onSelect;
  final bool showPartners;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.75),
        border: const Border(right: BorderSide(color: PhytoColors.stroke)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Phyto', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: PhytoColors.forest)),
            const SizedBox(height: 12),
            const Text('Smart Plant Care Platform', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0x990F2A1D))),
            const SizedBox(height: 18),
            _NavItem(
              icon: Icons.home_outlined,
              label: 'Home',
              active: selected == AppArea.home,
              onTap: () => onSelect(AppArea.home),
            ),
            _NavItem(
              icon: Icons.storefront_outlined,
              label: 'Shop',
              active: selected == AppArea.shop,
              onTap: () => onSelect(AppArea.shop),
            ),
            _NavItem(
              icon: Icons.shopping_cart_outlined,
              label: 'Cart',
              active: selected == AppArea.cart,
              onTap: () => onSelect(AppArea.cart),
            ),
            const SizedBox(height: 10),
            const Divider(height: 24),
            if (showPartners) ...[
              const Text('Partner portals', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0x990F2A1D))),
              const SizedBox(height: 10),
              _NavItem(
                icon: Icons.inventory_2_outlined,
                label: 'Nursery',
                active: selected == AppArea.nursery,
                onTap: () => onSelect(AppArea.nursery),
              ),
              _NavItem(
                icon: Icons.local_shipping_outlined,
                label: 'Delivery',
                active: selected == AppArea.delivery,
                onTap: () => onSelect(AppArea.delivery),
              ),
              _NavItem(
                icon: Icons.admin_panel_settings_outlined,
                label: 'Admin',
                active: selected == AppArea.admin,
                onTap: () => onSelect(AppArea.admin),
              ),
            ],
            const Spacer(),
            _NavItem(
              icon: Icons.person_outline,
              label: 'Login',
              active: selected == AppArea.login,
              onTap: () => onSelect(AppArea.login),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.icon, required this.label, required this.active, required this.onTap});
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          color: active ? const Color(0xFFDAF0DF) : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: active ? PhytoColors.forest : const Color(0x990F2A1D)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: active ? PhytoColors.forest : const Color(0x990F2A1D),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


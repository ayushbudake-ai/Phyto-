import 'package:flutter/material.dart';

class PhytoAppBar extends StatelessWidget {
  const PhytoAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PhytoAppBar')),
      body: const Center(child: Text('PhytoAppBar')),
    );
  }
}

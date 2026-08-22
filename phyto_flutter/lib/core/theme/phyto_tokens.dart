import 'package:flutter/material.dart';

class PhytoColors {
  static const forest = Color(0xFF0F2A1D);
  static const deepGreen = Color(0xFF2D6A4F);
  static const leaf = Color(0xFF52B788);
  static const mint = Color(0xFFDCEDC8);
  static const cream = Color(0xFFF1F8E9);
  static const surface = Color(0xFFFAFBF7);
  static const stroke = Color(0x1A0F2A1D);
}

class PhytoRadii {
  static const xl = 28.0;
  static const leafCard = BorderRadius.only(
    topLeft: Radius.circular(30),
    bottomRight: Radius.circular(30),
    topRight: Radius.circular(16),
    bottomLeft: Radius.circular(16),
  );
}


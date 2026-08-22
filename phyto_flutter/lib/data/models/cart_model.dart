import 'product_model.dart';

class CartItemModel {
  final int id;
  final int productId;
  final int quantity;
  final bool includeKit;
  final bool includeService;
  final ProductModel? product;

  CartItemModel({
    required this.id,
    required this.productId,
    required this.quantity,
    this.includeKit = false,
    this.includeService = false,
    this.product,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: json['id'] as int? ?? 0,
      productId: json['product_id'] as int? ?? 0,
      quantity: json['quantity'] as int? ?? 1,
      includeKit: json['include_kit'] as bool? ?? false,
      includeService: json['include_service'] as bool? ?? false,
      product: json['product'] != null
          ? ProductModel.fromJson(json['product'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'product_id': productId,
        'quantity': quantity,
        'include_kit': includeKit,
        'include_service': includeService,
        'product': product?.toJson(),
      };
}

class CartModel {
  final int id;
  final int userId;
  final List<CartItemModel> items;
  final int totalItems;
  final double subtotal;

  CartModel({
    required this.id,
    required this.userId,
    this.items = const [],
    this.totalItems = 0,
    this.subtotal = 0.0,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final list = (json['items'] as List<dynamic>?)
            ?.map((e) => CartItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return CartModel(
      id: json['id'] as int? ?? 0,
      userId: json['user_id'] as int? ?? 0,
      items: list,
      totalItems: json['total_items'] as int? ?? list.length,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
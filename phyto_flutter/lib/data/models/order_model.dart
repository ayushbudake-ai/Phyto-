import 'product_model.dart';

class OrderItemModel {
  final int id;
  final int productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final bool includeKit;
  final bool includeService;
  final ProductModel? product;

  OrderItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    this.includeKit = false,
    this.includeService = false,
    this.product,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as int? ?? 0,
      productId: json['product_id'] as int? ?? 0,
      productName: json['product_name'] as String? ?? '',
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] as int? ?? 1,
      includeKit: json['include_kit'] as bool? ?? false,
      includeService: json['include_service'] as bool? ?? false,
      product: json['product'] != null
          ? ProductModel.fromJson(json['product'] as Map<String, dynamic>)
          : null,
    );
  }
}

class OrderModel {
  final int id;
  final int customerId;
  final int? nurseryId;
  final int? deliveryPartnerId;
  final String status;
  final double totalAmount;
  final String paymentMethod;
  final String paymentStatus;
  final String? shippingName;
  final String? shippingStreet;
  final String? shippingCity;
  final String? shippingPincode;
  final String? shippingPhone;
  final DateTime? placedAt;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.customerId,
    this.nurseryId,
    this.deliveryPartnerId,
    required this.status,
    required this.totalAmount,
    required this.paymentMethod,
    required this.paymentStatus,
    this.shippingName,
    this.shippingStreet,
    this.shippingCity,
    this.shippingPincode,
    this.shippingPhone,
    this.placedAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final list = (json['items'] as List<dynamic>?)
            ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return OrderModel(
      id: json['id'] as int? ?? 0,
      customerId: json['customer_id'] as int? ?? 0,
      nurseryId: json['nursery_id'] as int?,
      deliveryPartnerId: json['delivery_partner_id'] as int?,
      status: json['status'] as String? ?? 'pending',
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['payment_method'] as String? ?? 'cod',
      paymentStatus: json['payment_status'] as String? ?? 'pending',
      shippingName: json['shipping_name'] as String?,
      shippingStreet: json['shipping_street'] as String?,
      shippingCity: json['shipping_city'] as String?,
      shippingPincode: json['shipping_pincode'] as String?,
      shippingPhone: json['shipping_phone'] as String?,
      placedAt: json['placed_at'] != null
          ? DateTime.tryParse(json['placed_at'].toString())
          : null,
      items: list,
    );
  }
}
class ProductModel {
  final int id;
  final String name;
  final String? description;
  final double price;
  final int stock;
  final String? type;
  final String? sunlight;
  final String? environment;
  final String? imageUrl;
  final double popularityScore;
  final List<String> tags;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.stock,
    this.type,
    this.sunlight,
    this.environment,
    this.imageUrl,
    this.popularityScore = 0.0,
    this.tags = const [],
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      stock: json['stock'] as int? ?? 0,
      type: json['type'] as String?,
      sunlight: json['sunlight'] as String?,
      environment: json['environment'] as String?,
      imageUrl: json['image_url'] as String?,
      popularityScore: (json['popularity_score'] as num?)?.toDouble() ?? 0.0,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((t) => t is Map ? (t['tag'] as String? ?? '') : t.toString())
              .where((t) => t.isNotEmpty)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'stock': stock,
        'type': type,
        'sunlight': sunlight,
        'environment': environment,
        'image_url': imageUrl,
        'popularity_score': popularityScore,
        'tags': tags,
      };
}
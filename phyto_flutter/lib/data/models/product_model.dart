class ProductModel {
  final int id;
  final String name;
  final String? scientificName;
  final String? description;
  final double price;
  final int stock;
  final String? type;
  final String? category;
  final String? sunlight;
  final String? lightRequirement;
  final String? waterRequirement;
  final String? maintenance;
  final String? environment;
  final List<String> suitableSpace;
  final bool isPetFriendly;
  final bool beginnerFriendly;
  final String? benefits;
  final double rating;
  final String? imageUrl;
  final double popularityScore;
  final List<String> tags;
  final Map<String, dynamic>? careGuide;

  ProductModel({
    required this.id,
    required this.name,
    this.scientificName,
    this.description,
    required this.price,
    required this.stock,
    this.type,
    this.category,
    this.sunlight,
    this.lightRequirement,
    this.waterRequirement,
    this.maintenance,
    this.environment,
    this.suitableSpace = const [],
    this.isPetFriendly = false,
    this.beginnerFriendly = false,
    this.benefits,
    this.rating = 4.8,
    this.imageUrl,
    this.popularityScore = 0.0,
    this.tags = const [],
    this.careGuide,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final rawId = json['id'];
    final int parsedId;
    if (rawId is int) {
      parsedId = rawId;
    } else if (rawId is String) {
      parsedId = int.tryParse(rawId.replaceAll(RegExp(r'[^0-9]'), '')) ?? 1;
    } else {
      parsedId = 1;
    }

    return ProductModel(
      id: parsedId,
      name: json['name'] as String? ?? '',
      scientificName: json['scientificName'] as String? ?? json['scientific_name'] as String?,
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      stock: (json['stock'] as int?) ?? (json['stock_quantity'] as int?) ?? 10,
      type: json['type'] as String?,
      category: json['category'] as String?,
      sunlight: json['sunlight'] as String?,
      lightRequirement: json['lightRequirement'] as String? ?? json['light_requirement'] as String?,
      waterRequirement: json['waterRequirement'] as String? ?? json['water_requirement'] as String?,
      maintenance: json['maintenance'] as String? ?? json['difficulty'] as String?,
      environment: json['environment'] as String?,
      suitableSpace: (json['suitableSpace'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          (json['suitable_space'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      isPetFriendly: json['isPetFriendly'] as bool? ?? (json['petSafety'] == 'Pet-Friendly'),
      beginnerFriendly: json['beginnerFriendly'] as bool? ?? false,
      benefits: json['benefits'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      imageUrl: json['imageUrl'] as String? ?? json['image_url'] as String?,
      popularityScore: (json['popularity'] as num?)?.toDouble() ??
          (json['popularity_score'] as num?)?.toDouble() ??
          0.0,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((t) => t is Map ? (t['tag'] as String? ?? '') : t.toString())
              .where((t) => t.isNotEmpty)
              .toList() ??
          const [],
      careGuide: json['careGuide'] as Map<String, dynamic>? ??
          json['care_guide'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'scientific_name': scientificName,
        'description': description,
        'price': price,
        'stock': stock,
        'type': type,
        'category': category,
        'sunlight': sunlight,
        'light_requirement': lightRequirement,
        'water_requirement': waterRequirement,
        'maintenance': maintenance,
        'environment': environment,
        'suitable_space': suitableSpace,
        'is_pet_friendly': isPetFriendly,
        'beginner_friendly': beginnerFriendly,
        'benefits': benefits,
        'rating': rating,
        'image_url': imageUrl,
        'popularity_score': popularityScore,
        'tags': tags,
        'care_guide': careGuide,
      };
}
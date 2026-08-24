class ProductModel {
  final int id;
  final String name;
  final String? scientificName;
  final String? description;
  final double price;
  final int stock;
  final String? type;
  final String? category;
  final String? mainCategory;
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
  final String? nurseryCity;
  final String? nurseryName;
  final int greenPointsAwarded;
  final String? packSize;
  final String? material;
  final String? dimensions;
  final String? usage;

  ProductModel({
    required this.id,
    required this.name,
    this.scientificName,
    this.description,
    required this.price,
    required this.stock,
    this.type,
    this.category,
    this.mainCategory,
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
    this.nurseryCity,
    this.nurseryName,
    this.greenPointsAwarded = 100,
    this.packSize,
    this.material,
    this.dimensions,
    this.usage,
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
      name: json['name'] as String? ?? 'Plant',
      scientificName: json['scientificName'] as String?,
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      type: json['type'] as String?,
      category: json['category'] as String?,
      mainCategory: json['mainCategory'] as String?,
      sunlight: json['sunlight'] as String?,
      lightRequirement: json['lightRequirement'] as String?,
      waterRequirement: json['waterRequirement'] as String?,
      maintenance: json['maintenance'] as String?,
      environment: json['environment'] as String?,
      suitableSpace: (json['suitableSpace'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      isPetFriendly: json['isPetFriendly'] as bool? ?? false,
      beginnerFriendly: json['beginnerFriendly'] as bool? ?? false,
      benefits: json['benefits'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      imageUrl: json['imageUrl'] as String?,
      popularityScore:
          (json['popularity'] as num?)?.toDouble() ?? 0.0,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      careGuide: json['careGuide'] as Map<String, dynamic>? ??
          (json['care'] as Map<String, dynamic>?),
      nurseryCity: json['nurseryCity'] as String?,
      nurseryName: json['nurseryName'] as String?,
      greenPointsAwarded: (json['greenPointsAwarded'] as num?)?.toInt() ?? 100,
      packSize: json['packSize'] as String?,
      material: json['material'] as String?,
      dimensions: json['dimensions'] as String?,
      usage: json['usage'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'scientificName': scientificName,
      'description': description,
      'price': price,
      'stock': stock,
      'type': type,
      'category': category,
      'mainCategory': mainCategory,
      'sunlight': sunlight,
      'lightRequirement': lightRequirement,
      'waterRequirement': waterRequirement,
      'maintenance': maintenance,
      'environment': environment,
      'suitableSpace': suitableSpace,
      'isPetFriendly': isPetFriendly,
      'beginnerFriendly': beginnerFriendly,
      'benefits': benefits,
      'rating': rating,
      'imageUrl': imageUrl,
      'popularity': popularityScore,
      'tags': tags,
      'careGuide': careGuide,
      'nurseryCity': nurseryCity,
      'nurseryName': nurseryName,
      'greenPointsAwarded': greenPointsAwarded,
      'packSize': packSize,
      'material': material,
      'dimensions': dimensions,
      'usage': usage,
    };
  }
}
import 'package:dio/dio.dart';
import '../models/product_model.dart';

class ProductRepository {
  final Dio _dio;
  final String baseUrl;

  ProductRepository({Dio? dio, this.baseUrl = 'http://localhost:8000'})
      : _dio = dio ?? Dio();

  static final List<ProductModel> fallbackProducts = [
    ProductModel(
      id: 1,
      name: 'Monstera Deliciosa',
      scientificName: 'Monstera deliciosa',
      description: 'Iconic Swiss Cheese plant with striking fenestrated split leaves. Perfect statement piece.',
      price: 699.0,
      stock: 45,
      type: 'plants',
      category: 'Indoor Plants',
      sunlight: 'partial',
      lightRequirement: 'Medium',
      waterRequirement: 'Medium',
      maintenance: 'Easy',
      environment: 'indoor',
      suitableSpace: ['Living room', 'Bedroom', 'Office'],
      isPetFriendly: false,
      beginnerFriendly: true,
      benefits: 'Air-purifying and adds tropical aesthetics',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      popularityScore: 99.0,
      tags: ['air-purifying', 'low-maintenance', 'beginner-friendly'],
    ),
    ProductModel(
      id: 2,
      name: 'Snake Plant Laurentii',
      scientificName: 'Dracaena trifasciata',
      description: 'Indestructible architectural plant that produces oxygen overnight. Ideal for bedrooms.',
      price: 349.0,
      stock: 60,
      type: 'plants',
      category: 'Air-Purifying Plants',
      sunlight: 'shade',
      lightRequirement: 'Low',
      waterRequirement: 'Low',
      maintenance: 'Easy',
      environment: 'indoor',
      suitableSpace: ['Bedroom', 'Living room', 'Desk'],
      isPetFriendly: false,
      beginnerFriendly: true,
      benefits: 'Filters formaldehyde and releases oxygen at night',
      rating: 4.85,
      imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80',
      popularityScore: 98.0,
      tags: ['air-purifying', 'low-maintenance', 'beginner-friendly'],
    ),
    ProductModel(
      id: 3,
      name: 'Spider Plant',
      scientificName: 'Chlorophytum comosum',
      description: 'Playful cascading foliage with baby plantlets. 100% pet-friendly and NASA-certified air purifier.',
      price: 279.0,
      stock: 50,
      type: 'plants',
      category: 'Air-Purifying Plants',
      sunlight: 'partial',
      lightRequirement: 'Medium',
      waterRequirement: 'Medium',
      maintenance: 'Easy',
      environment: 'indoor',
      suitableSpace: ['Living room', 'Bedroom', 'Balcony'],
      isPetFriendly: true,
      beginnerFriendly: true,
      benefits: 'Removes 95% of airborne toxins; safe for cats & dogs',
      rating: 4.88,
      imageUrl: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=800&q=80',
      popularityScore: 97.0,
      tags: ['pet-friendly', 'air-purifying', 'beginner-friendly'],
    ),
  ];

  Future<List<ProductModel>> fetchProducts({
    String? categoryId,
    String? type,
    String? sunlight,
    String? environment,
    String? tag,
    double? priceMax,
    String? query,
    int skip = 0,
    int limit = 50,
  }) async {
    try {
      final response = await _dio.get(
        '$baseUrl/products',
        queryParameters: {
          if (categoryId != null) 'category_id': categoryId,
          if (type != null) 'type': type,
          if (sunlight != null) 'sunlight': sunlight,
          if (environment != null) 'environment': environment,
          if (tag != null) 'tag': tag,
          if (priceMax != null) 'price_max': priceMax,
          if (query != null) 'q': query,
          'skip': skip,
          'limit': limit,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final items = data['items'] as List<dynamic>? ?? [];
        if (items.isNotEmpty) {
          return items
              .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
      return fallbackProducts;
    } catch (e) {
      return fallbackProducts;
    }
  }

  Future<ProductModel?> fetchProductById(int id) async {
    try {
      final response = await _dio.get('$baseUrl/products/$id');
      if (response.statusCode == 200) {
        return ProductModel.fromJson(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    return fallbackProducts.firstWhere(
      (p) => p.id == id,
      orElse: () => fallbackProducts.first,
    );
  }
}

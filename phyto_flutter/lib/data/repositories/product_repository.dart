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
      mainCategory: 'Plants',
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
      nurseryCity: 'Pune',
      nurseryName: 'Green Leaf Nursery, Pune',
      greenPointsAwarded: 100,
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
      mainCategory: 'Plants',
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
      nurseryCity: 'Pune',
      nurseryName: 'Sahyadri Flora, Kothrud',
      greenPointsAwarded: 100,
      tags: ['air-purifying', 'low-maintenance', 'beginner-friendly'],
    ),
    ProductModel(
      id: 3,
      name: 'Kashmiri Red Fragrant Rose',
      scientificName: 'Rosa damascena',
      description: 'Deep crimson heritage blooms with classic damask fragrance.',
      price: 349.0,
      stock: 40,
      type: 'flowers',
      category: 'Flowering Plants',
      mainCategory: 'Flowers',
      sunlight: 'full-sun',
      lightRequirement: 'Bright',
      waterRequirement: 'Medium',
      maintenance: 'Moderate',
      environment: 'outdoor',
      suitableSpace: ['Balcony', 'Terrace', 'Garden'],
      isPetFriendly: true,
      beginnerFriendly: true,
      benefits: 'Intense damask scent and organic rose water',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      popularityScore: 98.0,
      nurseryCity: 'Pune',
      nurseryName: 'Green Leaf Nursery, Pune',
      greenPointsAwarded: 100,
      tags: ['flowering', 'gifting', 'flowers'],
    ),
    ProductModel(
      id: 4,
      name: 'Heirloom San Marzano Tomato Seeds',
      scientificName: 'Solanum lycopersicum',
      description: 'Prized Italian plum tomato seeds with rich sweet flavor for homemade sauce.',
      price: 99.0,
      stock: 120,
      type: 'seeds',
      category: 'Seeds',
      mainCategory: 'Seeds',
      sunlight: 'full-sun',
      lightRequirement: 'Bright',
      waterRequirement: 'Medium',
      maintenance: 'Easy',
      environment: 'outdoor',
      suitableSpace: ['Balcony', 'Terrace', 'Garden'],
      isPetFriendly: false,
      beginnerFriendly: true,
      packSize: '50 seeds / pack',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
      popularityScore: 98.0,
      nurseryCity: 'Pune',
      nurseryName: 'Green Leaf Nursery, Pune',
      greenPointsAwarded: 40,
      tags: ['seeds', 'beginner-friendly', 'fast-growing'],
    ),
    ProductModel(
      id: 5,
      name: '100% Organic Vermicompost (5kg)',
      scientificName: 'Eisenia fetida humus',
      description: 'Aged organic earthworm castings for microbial soil revitalization.',
      price: 199.0,
      stock: 80,
      type: 'fertilizers',
      category: 'Fertilizers',
      mainCategory: 'Fertilizers',
      sunlight: 'partial',
      lightRequirement: 'Medium',
      waterRequirement: 'Low',
      maintenance: 'Easy',
      environment: 'both',
      suitableSpace: ['Balcony', 'Terrace', 'Living room'],
      isPetFriendly: true,
      beginnerFriendly: true,
      packSize: '5 kg bag',
      rating: 4.96,
      imageUrl: 'https://images.unsplash.com/photo-1585336261026-0a0684f50682?auto=format&fit=crop&w=800&q=80',
      popularityScore: 99.0,
      nurseryCity: 'Pune',
      nurseryName: 'Green Leaf Nursery, Pune',
      greenPointsAwarded: 60,
      tags: ['fertilizer', 'beginner-friendly'],
    ),
    ProductModel(
      id: 6,
      name: 'Matte Nordic White Ceramic Planter',
      scientificName: 'High-fired ceramic',
      description: 'Minimalist 8-inch ceramic pot with drainage hole and matching saucer.',
      price: 349.0,
      stock: 50,
      type: 'pots',
      category: 'Pots',
      mainCategory: 'Pots',
      sunlight: 'partial',
      lightRequirement: 'Medium',
      waterRequirement: 'Low',
      maintenance: 'Easy',
      environment: 'both',
      suitableSpace: ['Living room', 'Desk', 'Office'],
      isPetFriendly: true,
      beginnerFriendly: true,
      dimensions: '8 inch x 7.5 inch',
      material: 'Glazed Ceramic',
      rating: 4.96,
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      popularityScore: 99.0,
      nurseryCity: 'Pune',
      nurseryName: 'Green Leaf Nursery, Pune',
      greenPointsAwarded: 60,
      tags: ['pots', 'gifting'],
    ),
  ];

  Future<List<ProductModel>> getProducts({String? category, String? query}) async {
    try {
      final response = await _dio.get(
        '$baseUrl/products',
        queryParameters: {
          if (category != null && category != 'All') 'category': category,
          if (query != null && query.isNotEmpty) 'q': query,
        },
      );
      if (response.statusCode == 200) {
        final List<dynamic> list = response.data['products'] ?? response.data;
        return list.map((json) => ProductModel.fromJson(json as Map<String, dynamic>)).toList();
      }
    } catch (_) {
      // Fallback
    }

    return fallbackProducts.where((p) {
      if (category != null && category != 'All' && p.category != category && p.mainCategory != category) {
        return false;
      }
      if (query != null && query.isNotEmpty) {
        final q = query.toLowerCase();
        return p.name.toLowerCase().contains(q) ||
            (p.scientificName?.toLowerCase().contains(q) ?? false);
      }
      return true;
    }).toList();
  }
}

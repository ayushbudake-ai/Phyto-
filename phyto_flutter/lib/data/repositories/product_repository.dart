import 'package:dio/dio.dart';
import '../models/product_model.dart';

class ProductRepository {
  final Dio _dio;
  final String baseUrl;

  ProductRepository({Dio? dio, this.baseUrl = 'http://localhost:8000'})
      : _dio = dio ?? Dio();

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
        return items
            .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<ProductModel?> fetchProductById(int id) async {
    try {
      final response = await _dio.get('$baseUrl/products/$id');
      if (response.statusCode == 200) {
        return ProductModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

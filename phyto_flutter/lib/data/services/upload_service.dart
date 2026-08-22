import 'dart:typed_data';
import 'package:dio/dio.dart';

class UploadService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:8000/api/v1',
    // In production, we would use api_endpoints.dart
  ));

  Future<String> uploadProductImage(int productId, Uint8List fileBytes, String fileName) async {
    FormData formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(fileBytes, filename: fileName),
    });

    try {
      final response = await _dio.post(
        '/products/$productId/images',
        data: formData,
      );
      
      return response.data['image_url'] as String;
    } catch (e) {
      throw Exception('Failed to upload image: $e');
    }
  }

  Future<void> deleteProductImage(int productId, int imageId) async {
    try {
      await _dio.delete('/products/$productId/images/$imageId');
    } catch (e) {
      throw Exception('Failed to delete image: $e');
    }
  }
}

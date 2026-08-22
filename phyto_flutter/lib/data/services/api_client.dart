import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiClient {
  ApiClient._(this.dio);

  final Dio dio;

  static Future<ApiClient> create() async {
    final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:8000';
    final dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: const Duration(seconds: 15)));
    return ApiClient._(dio);
  }
}


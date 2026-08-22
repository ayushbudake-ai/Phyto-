import 'package:dio/dio.dart';
import 'package:phyto_flutter/data/services/api_client.dart';

class AuthService {
  AuthService(this._dio);

  final Dio _dio;

  static Future<AuthService> create() async {
    final client = await ApiClient.create();
    return AuthService(client.dio);
  }

  Future<AuthSession> devLogin({required String email, required String role}) async {
    final res = await _dio.post('/auth/dev-login', data: {'email': email, 'role': role});
    return AuthSession.fromJson(res.data);
  }
}

class AuthSession {
  AuthSession({required this.accessToken, required this.role, required this.userId});

  final String accessToken;
  final String role;
  final int userId;

  factory AuthSession.fromJson(dynamic json) {
    final map = (json as Map).cast<String, dynamic>();
    return AuthSession(
      accessToken: map['access_token'] as String,
      role: map['role'] as String,
      userId: (map['user_id'] as num).toInt(),
    );
  }
}


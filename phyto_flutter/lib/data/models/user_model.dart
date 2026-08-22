class UserModel {
  final int id;
  final String email;
  final String name;
  final String? phone;
  final String role;
  final String? addressStreet;
  final String? addressCity;
  final String? addressState;
  final String? addressZip;
  final String? profileImageUrl;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    required this.role,
    this.addressStreet,
    this.addressCity,
    this.addressState,
    this.addressZip,
    this.profileImageUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'customer',
      addressStreet: json['address_street'] as String?,
      addressCity: json['address_city'] as String?,
      addressState: json['address_state'] as String?,
      addressZip: json['address_zip'] as String?,
      profileImageUrl: json['profile_image_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'phone': phone,
        'role': role,
        'address_street': addressStreet,
        'address_city': addressCity,
        'address_state': addressState,
        'address_zip': addressZip,
        'profile_image_url': profileImageUrl,
      };
}
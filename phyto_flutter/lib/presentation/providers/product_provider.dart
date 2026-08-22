import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/product_model.dart';
import '../../data/repositories/product_repository.dart';

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepository();
});

final productsFutureProvider =
    FutureProvider.autoDispose<List<ProductModel>>((ref) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.fetchProducts();
});

final productDetailProvider =
    FutureProvider.autoDispose.family<ProductModel?, int>((ref, id) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.fetchProductById(id);
});

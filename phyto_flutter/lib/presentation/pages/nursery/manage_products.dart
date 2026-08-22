import 'package:flutter/material.dart';

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:phyto_flutter/data/services/upload_service.dart';

class ManageProducts extends StatefulWidget {
  const ManageProducts({super.key});

  @override
  State<ManageProducts> createState() => _ManageProductsState();
}

class _ManageProductsState extends State<ManageProducts> {
  final UploadService _uploadService = UploadService();
  final int _currentProductId = 1; // Stub product ID for now
  
  List<Map<String, dynamic>> _images = [];
  bool _isUploading = false;
  String baseUrl = 'http://localhost:8000';

  Future<void> _pickAndUploadImage() async {
    if (_images.length >= 5) return;

    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true, // Needed for web
    );

    if (result != null && result.files.single.bytes != null) {
      setState(() {
        _isUploading = true;
      });

      try {
        final fileName = result.files.single.name;
        final bytes = result.files.single.bytes!;
        
        final imageUrl = await _uploadService.uploadProductImage(_currentProductId, bytes, fileName);
        
        setState(() {
          _images.add({
            'id': DateTime.now().millisecondsSinceEpoch, // Stub ID until fetch
            'url': imageUrl,
            'is_primary': _images.isEmpty,
          });
        });
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Upload failed: $e')),
          );
        }
      } finally {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  Future<void> _deleteImage(int index) async {
    final imageId = _images[index]['id'];
    try {
      await _uploadService.deleteProductImage(_currentProductId, imageId);
      setState(() {
        final wasPrimary = _images[index]['is_primary'];
        _images.removeAt(index);
        if (wasPrimary && _images.isNotEmpty) {
          _images[0]['is_primary'] = true;
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Delete failed: $e')),
        );
      }
    }
  }

  void _setPrimary(int index) {
    setState(() {
      for (var img in _images) {
        img['is_primary'] = false;
      }
      _images[index]['is_primary'] = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Products')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Product Images', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Upload up to 5 images. Marking one as primary is required.', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 16),
            
            if (_isUploading) ...[
              const LinearProgressIndicator(),
              const SizedBox(height: 16),
            ],
            
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: List.generate(_images.length, (index) {
                final img = _images[index];
                return Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        border: Border.all(color: img['is_primary'] ? Colors.green : Colors.grey, width: 2),
                        borderRadius: BorderRadius.circular(8),
                        image: DecorationImage(
                          image: NetworkImage(baseUrl + img['url']),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _deleteImage(index),
                        child: const CircleAvatar(
                          radius: 12,
                          backgroundColor: Colors.red,
                          child: Icon(Icons.delete, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Radio<bool>(
                              value: true,
                              groupValue: img['is_primary'],
                              onChanged: (_) => _setPrimary(index),
                              visualDensity: VisualDensity.compact,
                              activeColor: const Color(0xFF2D6A4F),
                            ),
                            const Text('Primary', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              }),
            ),
            
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _images.length < 5 ? _pickAndUploadImage : null,
              icon: const Icon(Icons.upload),
              label: const Text('Upload Image'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2D6A4F),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

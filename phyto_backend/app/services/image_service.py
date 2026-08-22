import os
import uuid
from io import BytesIO
from fastapi import UploadFile, HTTPException
from PIL import Image

def save_product_image(file: UploadFile, product_id: int) -> str:
    # 1. Validate file type
    allowed_extensions = {"jpg", "jpeg", "png", "webp"}
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only jpg, jpeg, png, webp allowed.")
    
    # Read bytes
    file_bytes = file.file.read()
    
    # 2. Validate file size (max 5MB)
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB.")
        
    try:
        # 3. Resize image to max 1200x1200 using Pillow (preserve aspect ratio)
        img = Image.open(BytesIO(file_bytes))
        
        # Convert to RGB (handles PNG transparency)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
            
        img.thumbnail((1200, 1200))
        
        # 4. Generate filename: {product_id}_{uuid4().hex[:8]}.jpg
        filename = f"{product_id}_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join("uploads", "products", filename)
        
        # 5. Save as JPEG quality=85
        img.save(filepath, "JPEG", quality=85)
        
        # Return relative URL path
        return f"/uploads/products/{filename}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

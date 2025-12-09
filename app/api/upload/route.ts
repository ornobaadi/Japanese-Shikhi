import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';
    
    console.log('📤 Upload request received:', { 
      fileName: file?.name, 
      fileType: file?.type, 
      fileSize: file?.size,
      uploadType: type 
    });
    
    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json({ 
        error: 'No file uploaded',
        success: false 
      }, { status: 400 });
    }

    // Validate file type based on upload type
    let allowedTypes: string[] = [];
    let maxSize = 5 * 1024 * 1024; // Default 5MB

    if (type === 'video') {
      allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      maxSize = 100 * 1024 * 1024; // 100MB for videos
    } else if (type === 'document') {
      allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];
      maxSize = 10 * 1024 * 1024; // 10MB for documents
    } else if (type === 'course-thumbnail') {
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      maxSize = 3 * 1024 * 1024; // 3MB for thumbnails
    } else {
      // Image
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      maxSize = 5 * 1024 * 1024; // 5MB for images
    }

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        success: false
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      console.error('❌ File too large:', file.size);
      return NextResponse.json({ 
        error: `File size exceeds ${sizeMB}MB limit`,
        success: false
      }, { status: 400 });
    }

    // Convert file to base64 for serverless environment
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    console.log(`✅ Successfully converted ${type}: ${file.name} (${(file.size / 1024).toFixed(2)} KB) to base64`);
    
    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      filename: file.name,
      type: type 
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file. Please try again.',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

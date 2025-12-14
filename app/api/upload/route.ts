import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ];
      maxSize = 20 * 1024 * 1024; // 20MB for documents
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

    // Upload to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${safeFileName}`;
    const bucket = 'uploads';

    // Upload file to Supabase Storage bucket
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError.message);
      return NextResponse.json({
        error: 'Failed to upload file to Supabase',
        success: false,
        details: uploadError.message
      }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uniqueFileName);
    const fileUrl = publicUrlData?.publicUrl || '';

    console.log(`✅ Successfully uploaded to Supabase: ${file.name} as ${uniqueFileName}`);
    console.log(`📁 Supabase File URL: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
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

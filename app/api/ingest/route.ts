import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side operations
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Debug logging
    console.log('Form data keys:', Array.from(formData.keys()));
    
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('File:', file);
    console.log('UserId:', userId);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', receivedKeys: Array.from(formData.keys()) },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', receivedKeys: Array.from(formData.keys()) },
        { status: 400 }
      );
    }

    // Validate file type (PDFs, text files, docs)
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Create unique file name
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${userId}/${timestamp}_${sanitizedFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study-materials') // Make sure this bucket exists in Supabase
      .upload(uniqueFileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from('study-materials')
      .getPublicUrl(uniqueFileName);

    // Extract text content based on file type
    let extractedText = '';
    
    if (file.type === 'text/plain') {
      extractedText = await file.text();
    } else if (file.type === 'application/pdf') {
      // For PDF extraction, you'll need: npm install pdf-parse
      extractedText = 'PDF content - to be extracted when needed';
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      // For DOCX extraction, you'll need: npm install mammoth
      extractedText = 'DOCX content - to be extracted when needed';
    }

    // Store extracted text in a separate column (you may want to add this to your table)
    // For now, we'll just note that it exists

    // Store file metadata in user_files table
    const { data: dbData, error: dbError } = await supabase
      .from('user_files')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to delete the uploaded file if DB insert fails
      await supabase.storage
        .from('study-materials')
        .remove([uniqueFileName]);
      
      return NextResponse.json(
        { error: 'Failed to save file metadata', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        id: dbData.id,
        name: file.name,
        url: urlData.publicUrl,
        uploadedAt: dbData.uploaded_at,
        extractedText: extractedText.substring(0, 1000) // Return first 1000 chars
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's files
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: data
    }, { status: 200 });

  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
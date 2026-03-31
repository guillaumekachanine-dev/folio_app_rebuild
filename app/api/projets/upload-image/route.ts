import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, imageData } = await request.json();

    if (!fileName || !imageData) {
      return NextResponse.json(
        { error: 'Missing fileName or imageData' },
        { status: 400 }
      );
    }

    // Extract base64 image data (remove style encoding if present)
    // Format: "data:image/jpeg;base64,<base64-image>|<encoded-style>"
    let base64Data = imageData.split(',')[1];
    // Remove style data if appended (after the pipe character)
    if (base64Data.includes('|')) {
      base64Data = base64Data.split('|')[0];
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase storage (using SERVICE_ROLE_KEY from createClient)
    const { data, error } = await supabase.storage
      .from('projects_covers')
      .upload(`${user.id}/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('projects_covers')
      .getPublicUrl(`${user.id}/${fileName}`);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

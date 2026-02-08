import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    // Get the form data (multipart/form-data for file upload)
    const formData = await request.formData();
    
    const response = await fetch(`${BACKEND_URL}/api/clients/import`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
      },
      body: formData,
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error importing clients:', error);
    return NextResponse.json(
      { success: false, message: 'Error importing clients to backend', error: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

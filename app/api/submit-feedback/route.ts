import { NextRequest, NextResponse } from 'next/server';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 1000;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateInput(body: unknown): { valid: boolean; error?: string; data?: { name: string; email?: string; message: string } } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { name, email, message } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be ${MAX_NAME_LENGTH} characters or less` };
  }
  if (!/^[a-zA-Z0-9\s\-_.,]+$/.test(name)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  if (email !== undefined && email !== null && email !== '') {
    if (typeof email !== 'string') {
      return { valid: false, error: 'Invalid email format' };
    }
    if (email.length > MAX_EMAIL_LENGTH) {
      return { valid: false, error: `Email must be ${MAX_EMAIL_LENGTH} characters or less` };
    }
    if (!EMAIL_REGEX.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
  }

  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }
  if (message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` };
  }

  return {
    valid: true,
    data: {
      name: name.trim(),
      email: email && typeof email === 'string' ? email.trim() : undefined,
      message: message.trim(),
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/submit-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

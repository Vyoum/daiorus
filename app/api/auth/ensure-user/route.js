import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upsertUserFromAuth } from '@/lib/admin/users';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await upsertUserFromAuth(user);
    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      role: profile.role,
    });
  } catch (err) {
    console.error('ensure-user error:', err);
    return NextResponse.json({ error: 'Could not sync user' }, { status: 500 });
  }
}

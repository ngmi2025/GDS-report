'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Signed in as {session.user?.email}
        </span>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn('google')}>
      Sign in with Google
    </Button>
  );
} 
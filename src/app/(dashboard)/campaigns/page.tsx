'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CampaignsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard?tab=campaigns');
  }, [router]);

  return null;
}

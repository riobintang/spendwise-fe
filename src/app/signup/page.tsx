'use client';

import dynamicImport from 'next/dynamic';

const SignupPage = dynamicImport(() => import('@/app-pages/Signup'), {
  ssr: false,
});

export default function Signup() {
  return <SignupPage />;
}

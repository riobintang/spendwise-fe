'use client';

import dynamicImport from 'next/dynamic';

const LoginPage = dynamicImport(() => import('@/app-pages/Login'), {
  ssr: false,
});

export default function Login() {
  return <LoginPage />;
}

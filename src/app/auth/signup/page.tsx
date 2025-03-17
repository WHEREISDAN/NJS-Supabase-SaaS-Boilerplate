import { SignUpForm } from '@/components/auth/sign-up-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="w-full max-w-md">
        <SignUpForm />
        <div className="text-center mt-4">
          <p>
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

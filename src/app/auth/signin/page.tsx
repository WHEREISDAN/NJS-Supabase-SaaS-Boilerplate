import { SignInForm } from '../components/sign-in-form';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="w-full max-w-md">
        <SignInForm />
        <div className="text-center mt-4 space-y-2">
          <p>
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-base-content/70">
            Need to verify your email?{' '}
            <Link href="/auth/verify" className="text-primary hover:underline">
              Resend verification email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { SignInForm } from '../components/sign-in-form';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="w-full max-w-md">
        <SignInForm />
        <div className="text-center mt-4">
          <p>
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

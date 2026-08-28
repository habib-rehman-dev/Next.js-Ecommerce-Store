import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full h-full flex justify-center items-center p-10">
      <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/" />
    </div>
  );
}
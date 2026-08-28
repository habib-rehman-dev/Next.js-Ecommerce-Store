import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full h-full flex justify-center items-center p-10">
      <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/" />
    </div>
  );
}
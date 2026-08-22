import { SignUp } from "@clerk/nextjs";
import React from "react";

export const page = () => {
  return (
    <div className="w-full h-full flex justify-center items-center p-10">
      <SignUp signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}/>
    </div>
  );
};

export default page
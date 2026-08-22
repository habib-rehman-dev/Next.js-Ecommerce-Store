import { SignIn } from "@clerk/nextjs"


const page = () => {
  return (
    <div className="w-full h-full flex justify-center items-center p-10">
        <SignIn signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}/>
    </div>
  )
}

export default page
import {
  Alert,
  // AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";

import {  InfoIcon } from "lucide-react";
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      
       
      
      <Alert className="w-2/3">
        <InfoIcon />
        <AlertTitle>New feature available</AlertTitle> 
         <AlertDescription>
          We&apos;ve added dark mode support. You can enable it in your account
          settings.
        </AlertDescription>
      </Alert>
      
    </div>
  );
}

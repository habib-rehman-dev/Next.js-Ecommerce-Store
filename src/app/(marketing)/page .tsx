// import { ChatMarkdownRenderer } from "@/components/markdownRender";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FileCodeIcon, FileTextIcon, XIcon } from "lucide-react";
import Image from "next/image";

export default async function Home() {
  const images = [
    {
      name: "workspace.png",
      meta: "PNG · 820 KB",
      src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
      alt: "Workspace",
    },
    {
      name: "desk-reference.jpg",
      meta: "JPG · 1.1 MB",
      src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80",
      alt: "Desk",
    },
    {
      name: "office-reference.jpg",
      meta: "JPG · 940 KB",
      src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80",
      alt: "Office",
    },
  ];

  return (
    <div className="p-10">
      {/* --------------------------------------------------------------------------------------- */}
      {/* <div className="border rounded-lg p-10 border-black m-3">
        <h2 className="text-red-700 text-center ">Bubble</h2>
      </div> */}
      {/* <Separator />*/}
      {/* --------------------------------------------------------------------------------------- */}
      <div className="flex w-1/2 mx-auto  flex-col gap-8 py-12 border rounded-lg px-10 border-black m-3">
        <h2 className="text-red-700 text-center ">Bubble</h2>
        <Bubble align="end">
          <BubbleContent>Hey there! what&apos;s up?</BubbleContent>
        </Bubble>
        <BubbleGroup>
          <Bubble variant="muted">
            <BubbleContent>Hey! Want to see chat bubbles?</BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>
              I am very happy and now I am in the hall with Friends.
            </BubbleContent>
            <BubbleReactions>
              <span>👍</span>
              <span>🔥</span>
              <span>👀</span>
              <span>+2</span>
            </BubbleReactions>
          </Bubble>
        </BubbleGroup>
         
      </div>
      {/* --------------------------------------------------------------------------------------- */}
      <Separator />
      <div className="border rounded-lg p-10 border-black m-3">
        <h2 className="text-red-700 text-center ">Accordion</h2>
        <Accordion defaultValue={["shipping"]} className="max-w-lg">
          <AccordionItem value="shipping">
            <AccordionTrigger>What are your shipping options?</AccordionTrigger>
            <AccordionContent>
              We offer standard (5-7 days), express (2-3 days), and overnight
              shipping. Free shipping on international orders.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>What is your return policy?</AccordionTrigger>
            <AccordionContent>
              Returns accepted within 30 days. Items must be unused and in
              original packaging. Refunds processed within 5-7 business days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="support">
            <AccordionTrigger>
              How can I contact customer support?
            </AccordionTrigger>
            <AccordionContent>
              Reach us via email, live chat, or phone. We respond within 24
              hours during business days.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* --------------------------------------------------------------------------------------- */}
      <Separator />
      <div className="border rounded-lg p-10 border-black m-3">
        <h2 className="text-red-700 text-center ">AlertDialog</h2>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            Show Dialog
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* --------------------------------------------------------------------------------------- */}
      <Separator />
      <div className="border rounded-lg p-10 border-black m-3">
        <h2 className="text-red-700 text-center ">AspectRatio</h2>
        <AspectRatio
          ratio={9 / 16}
          className="w-full max-w-40 rounded-lg bg-muted"
        >
          <Image
            fill
            className="rounded-lg object-cover   dark:brightness-20"
            src="https://plus.unsplash.com/premium_photo-1676478746990-4ef5c8ef234a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Image"
          />
        </AspectRatio>
      </div>
      {/* --------------------------------------------------------------------------------------- */}
      <Separator />
      <div className="border rounded-lg p-10 border-black m-3">
        <h2 className="text-red-700 text-center ">Attachment</h2>
        <Attachment>
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>sales-dashboard.txt</AttachmentTitle>
            <AttachmentDescription>TXT · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove sales-dashboard.pdf">
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Separator />
        <AttachmentGroup>
          {images.map((image) => (
            <Attachment key={image.name} orientation="vertical">
              <AttachmentMedia variant="image">
                <img src={image.src} alt={image.alt} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{image.name}</AttachmentTitle>
                <AttachmentDescription>{image.meta}</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          ))}
        </AttachmentGroup>
        <Attachment state="uploading" className="w-full">
          <AttachmentMedia>
            <Spinner />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
            <AttachmentDescription>Uploading · 64%</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Cancel upload">
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment className="w-full">
          <AttachmentMedia>
            <FileCodeIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>message-renderer.tsx</AttachmentTitle>
            <AttachmentDescription>TypeScript · 12 KB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove message-renderer.tsx">
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </div>
    </div>
  );
}

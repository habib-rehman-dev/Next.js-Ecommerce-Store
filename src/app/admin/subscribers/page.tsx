// import { getSubscribers, deleteSubscriberForm } from "@/features/newsletter/actions/subscribe";
import { deleteSubscriberForm } from "@/features/newsletter/actions/subscribe";
import { getSubscribers } from "@/features/newsletter/queries/get-subscribers";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Check, X } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import type { INewsletter } from "@/models/Newsletter";

type NewsletterSubscriber = INewsletter & { _id: string };

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  await requireAdmin();
  const subscribers = await getSubscribers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your email subscribers
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {subscribers.length} subscribers
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No subscribers yet
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((sub: NewsletterSubscriber) => (
                <TableRow key={sub._id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {sub.source || "homepage"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sub.isConfirmed ? (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200">
                        <Check className="h-3 w-3 mr-1" /> Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={deleteSubscriberForm}>
                      <input type="hidden" name="subscriberId" value={sub._id} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
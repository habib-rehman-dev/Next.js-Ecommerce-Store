// src/features/address/components/AddressList.tsx
"use client";

import { useState, useTransition } from "react";
import { MapPin, Star, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { IAddressDTO } from "../types";
import { deleteAddress } from "../actions/delete-address";
import { setDefaultAddress } from "../actions/set-default-address";
import { AddressFormDialog } from "./AddressForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AddressList({ addresses }: { addresses: IAddressDTO[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddressDTO | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingAddress(null);
    setDialogOpen(true);
  }

  function handleEdit(address: IAddressDTO) {
    setEditingAddress(address);
    setDialogOpen(true);
  }

  function handleDelete(address: IAddressDTO) {
    if (!confirm(`Delete the address for "${address.fullName}"? This can't be undone.`)) return;

    setPendingId(address.id);
    startTransition(async () => {
      const result = await deleteAddress(address.id);
      setPendingId(null);
      if (!result.success) toast.error(result.message);
      else toast.success(result.message ?? "Address removed");
    });
  }

  function handleSetDefault(address: IAddressDTO) {
    setPendingId(address.id);
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      setPendingId(null);
      if (!result.success) toast.error(result.message);
      else toast.success(result.message ?? "Default address updated");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Addresses</h2>
          <p className="text-sm text-muted-foreground">
            Manage the shipping addresses on your account.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            You haven&apos;t saved any addresses yet.
          </p>
          <Button variant="outline" size="sm" onClick={handleAdd} className="mt-2">
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => {
            const isRowPending = isPending && pendingId === address.id;
            return (
              <Card
                key={address.id}
                className={cn(address.isDefault && "ring-2 ring-primary/40")}
              >
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{address.fullName}</p>
                      {address.isDefault && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(address)}
                        disabled={isRowPending}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(address)}
                        disabled={isRowPending}
                      >
                        {isRowPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-sm text-muted-foreground">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <p className="pt-1">{address.phone}</p>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address)}
                      disabled={isRowPending}
                    >
                      Set as default
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} address={editingAddress} />
    </div>
  );
}
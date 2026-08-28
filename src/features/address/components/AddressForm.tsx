// src/features/address/components/AddressForm.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertCircle } from "lucide-react";

import { createAddress } from "../actions/create-address";
import { updateAddress } from "../actions/update-address";
import type { IAddressDTO } from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: IAddressDTO | null;
};

export function AddressFormDialog({ open, onOpenChange, address }: DialogProps) {
  const mode = address ? "edit" : "create";
  // Remount the form whenever the target address or open-state changes so
  // defaultValue-based fields (and the isDefault checkbox state) reset cleanly.
  const formKey = `${address?.id ?? "new"}-${open}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Address" : "Edit Address"}</DialogTitle>
        </DialogHeader>
        <AddressFormBody
          key={formKey}
          mode={mode}
          address={address}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddressFormBody({
  mode,
  address,
  onDone,
}: {
  mode: "create" | "edit";
  address?: IAddressDTO | null;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("isDefault", String(isDefault));
    if (mode === "edit" && address) formData.set("id", address.id);

    startTransition(async () => {
      const result =
        mode === "create" ? await createAddress(formData) : await updateAddress(formData);

      if (!result.success) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={address?.fullName}
            required
            placeholder="Jane Doe"
          />
          {fieldErrors.fullName?.[0] && (
            <p className="text-xs text-destructive">{fieldErrors.fullName[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={address?.phone}
            required
            placeholder="+1 555 123 4567"
          />
          {fieldErrors.phone?.[0] && (
            <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          name="addressLine1"
          defaultValue={address?.addressLine1}
          required
          placeholder="123 Main St"
        />
        {fieldErrors.addressLine1?.[0] && (
          <p className="text-xs text-destructive">{fieldErrors.addressLine1[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">
          Address Line 2{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="addressLine2"
          name="addressLine2"
          defaultValue={address?.addressLine2}
          placeholder="Apt, suite, unit, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={address?.city} required />
          {fieldErrors.city?.[0] && (
            <p className="text-xs text-destructive">{fieldErrors.city[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={address?.state} required />
          {fieldErrors.state?.[0] && (
            <p className="text-xs text-destructive">{fieldErrors.state[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            defaultValue={address?.postalCode}
            required
          />
          {fieldErrors.postalCode?.[0] && (
            <p className="text-xs text-destructive">{fieldErrors.postalCode[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={address?.country} required />
          {fieldErrors.country?.[0] && (
            <p className="text-xs text-destructive">{fieldErrors.country[0]}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        Set as default shipping address
      </label>

      <DialogFooter>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving…" : mode === "create" ? "Add Address" : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
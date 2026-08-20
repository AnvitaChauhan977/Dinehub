import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — DineHub" },
      {
        name: "description",
        content: "Update your name, phone number and saved delivery address for faster checkout.",
      },
      { property: "og:title", content: "My profile — DineHub" },
      { property: "og:description", content: "Save your delivery details for faster checkout." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,phone,address")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!profile.data) return;
    setFullName(profile.data.full_name ?? "");
    setPhone(profile.data.phone ?? "");
    setAddress(profile.data.address ?? "");
  }, [profile.data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-4xl">SIGN IN TO VIEW YOUR PROFILE</h1>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/profile" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone, address });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">MY PROFILE</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>

      <form className="surface-card mt-8 space-y-4 p-6" onSubmit={save}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Default delivery address</Label>
          <Textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
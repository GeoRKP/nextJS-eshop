"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { Loader2 } from "lucide-react";


export default function CredentialsSignInForm() {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button className="w-full" variant="default" type="submit" disabled={pending}>
        {pending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}
      </Button>
    );
  };
  return (
    <form action={action}>
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="current-password"
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
          <SignInButton />
          {data && !data.success && (
            <div className=" text-center text-destructive">
              {data.message}
            </div>
          )}
          <div className="text-sm text-center text-muted-foreground mt-2">
            Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import { Suspense } from "react";
import { authClient } from "@/components/providers";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import logo from "@/../public/logo.svg";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src={logo}
            alt="Hizitickets"
            width={100}
            height={100}
            className="mx-auto"
            priority
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: callbackUrl })}
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
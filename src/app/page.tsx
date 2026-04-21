"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/../public/logo.svg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50" data-theme="corporate">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default">Get Started</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Your Experience Right Now!</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/events")}
            >
              View Events
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Create Your Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto flex max-w-xl flex-col justify-between px-4 md:px-8 lg:max-w-screen-xl lg:flex-row lg:pt-16">
        <div className="mb-16 pt-16 lg:mb-0 lg:max-w-lg lg:pt-32 lg:pr-5">
          <div className="mb-6 max-w-xl">
            <div>
              <p className="mb-4 inline-block rounded-full bg-teal-100 px-3 py-px text-xs font-semibold uppercase tracking-wider text-teal-900">
                What&apos;s new?
              </p>
            </div>
            <h2 className="mb-6 max-w-lg text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-none">
              We understand
              <br className="hidden md:block" />{" "}
              <span className="text-teal-600 inline-block">
                your ticketing needs.
              </span>
            </h2>
            <p className="text-base text-gray-700 md:text-lg">
              Welcome to Hizitickets.
            </p>
          </div>
          <div className="flex items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 mr-6">
                  Get started
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Your Experience Right Now!</DialogTitle>
                </DialogHeader>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/events")}
                  >
                    View Events
                  </Button>
                  <Button onClick={() => router.push("/dashboard")}>
                    Create Your Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div>
          <div className="mockup-phone">
            <div className="camera"></div>
            <div className="display">
              <div className="phone-1 artboard artboard-demo flex items-center justify-center">
                <Image src={logo} alt="hizitickets" width={150} height={150} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
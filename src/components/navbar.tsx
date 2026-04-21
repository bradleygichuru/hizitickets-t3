"use client";

import { authClient } from "@/components/providers";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "@/../public/logo.svg";

import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Nav() {
  const { data: session } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <nav className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image priority={true} src={logo} alt="hizitickets" width={100} height={50} />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/dashboard" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/events" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium">
                Events
              </Link>
              <Link href="/help" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium">
                Get Help
              </Link>
              <ProfileDropdown />
            </div>
          </div>
          <div className="md:hidden">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md block px-3 py-2 text-base font-medium">
              Dashboard
            </Link>
            <Link href="/events" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md block px-3 py-2 text-base font-medium">
              Events
            </Link>
            <Link href="/help" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md block px-3 py-2 text-base font-medium">
              Get Help
            </Link>
            <div className="pt-4">
              <ProfileDropdown mobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function ProfileDropdown({ mobile = false }: { mobile?: boolean }) {
  const { data: session } = authClient.useSession();

  const handleLogout = () => {
    authClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={mobile ? "default" : "icon"}
          className={mobile ? "w-full justify-start" : ""}
        >
          {mobile ? (
            <>
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
            </>
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {session ? (
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/auth/signin">Sign in</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
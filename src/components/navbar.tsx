import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import logo from "../../public/logo.svg";

import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export default function Nav() {
  const [isDashboard, setIsDashboard] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const router = useRouter();
  useEffect(() => {
    if (router.pathname == "/dashboard") {
      setIsDashboard(true);
    }
  }, []);

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
              <Image priority={true} src={logo} alt="hizitickets" />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/events">Events</NavLink>
              <NavLink href="/help">Get Help</NavLink>
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink href="/dashboard" mobile>
              Dashboard
            </NavLink>
            <NavLink href="/events" mobile>
              Events
            </NavLink>
            <NavLink href="/help" mobile>
              Get Help
            </NavLink>
            <div className="pt-4">
              <ProfileDropdown mobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
}

function NavLink({ href, children, mobile = false }: NavLinkProps) {
  const baseClasses =
    "text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200";
  const desktopClasses = "px-3 py-2 text-sm font-medium";
  const mobileClasses = "block px-3 py-2 text-base font-medium";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses}`}
    >
      {children}
    </Link>
  );
}

function ProfileDropdown({ mobile = false }: { mobile?: boolean }) {
  const [isDashboard, setIsDashboard] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    if (router.pathname == "/dashboard") {
      setIsDashboard(true);
    }
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    signOut();
    console.log("Logging out...");
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
      {router.pathname == "/dashboard" ? (
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
        ""
      )}
    </DropdownMenu>
  );
}

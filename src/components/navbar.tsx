import { useSession,signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BiHelpCircle, BiHomeHeart, BiStats, BiHistory } from "react-icons/bi";
import logo from "../../public/Untitled-1.png";
export default function Nav() {
  const [isDashboard, setIsDashboard] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const router = useRouter();
  useEffect(() => {
    if (router.pathname == "/dashboard") {
      setIsDashboard(true);
    }
  }, []);
  return (
    <>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link className="btn btn-ghost text-accent" href="/events">
                  <a className="btn btn-ghost  text-accent">Events</a>
                </Link>
              </li>
              <li>
                <Link className="btn btn-ghost text-accent" href="/dashboard">
                <a className="btn btn-ghost  text-accent">Dashboard</a>
                </Link>
              </li>
              <li tabIndex={0}>
                <a className="btn btn-ghost  text-accent">History</a>
                <ul className="p-2 bg-base-100">
                  <li>
                    <a className="btn btn-ghost  text-accent">Event history</a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="btn btn-ghost  text-accent">Get Help</a>
              </li>
            </ul>
          </div>
          <a className="btn btn-ghost normal-case text-xl">
            <Image height={54} width={139} src={logo} alt="hizitickets" />
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal p-0">
            <li>
              <Link className="btn btn-ghost text-accent" href="/dashboard">
                <a className="btn btn-ghost  text-accent">Dashboard</a>
              </Link>
            </li>
            <li>
              <Link className="btn btn-ghost text-accent" href="/events">
                <a className="btn btn-ghost  text-accent">Events</a>
              </Link>
            </li>
            <li tabIndex={0}>
              <a className="btn btn-ghost text-accent">
                History
                <svg
                  className="fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </a>
              <ul className="p-2 bg-base-100">
                <li>
                  <a className="btn btn-ghost  text-accent">Event history</a>
                </li>
              </ul>
            </li>
            <li>
              <a className="btn btn-ghost  text-accent">Get Help</a>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          {isDashboard && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src={`${session?.user?.image} `} alt="profile image" />
                 
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <a onClick={()=>{signOut()}}>Logout</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

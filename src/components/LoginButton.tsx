import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div>
        Signed in as {session?.user?.email}
        <button className="btn-primary btn" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="grid h-screen place-items-center">
      <button className="btn-primary btn" onClick={() => signIn()}>
        Sign in
      </button>
    </div>
  );
}

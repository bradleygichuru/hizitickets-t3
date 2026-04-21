import { authClient } from "@/components/providers";

export default function LoginButton() {
  const { data: session } = authClient.useSession();
  if (session) {
    return (
      <div>
        Signed in as {session?.user?.email}
        <button className="btn-primary btn" onClick={() => authClient.signOut()}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="grid h-screen place-items-center">
      <button className="btn-primary btn" onClick={() => authClient.signIn.social({ provider: "google" })}>
        Sign in
      </button>
    </div>
  );
}
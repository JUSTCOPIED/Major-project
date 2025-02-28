import { auth0 } from "@/lib/auth0"
import "./globals.css"

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession()

  // If no session, show sign-up and login buttons
  if (!session) {
    return (
      <main>
        <h1 className="font-bold text-4xl text-center m-9">Major Project</h1>
        <p className="font-bold text-2xl text-center m-9">Welcome to Major Project this is our landing page for our project </p>
        <a href="/auth/login?screen_hint=signup">
          <button className="font-bold text-2xl text-center m-4">Sign up</button>
        </a>
        <a href="/auth/login">
          <button className="font-bold text-2xl text-center m-4">Log in</button>
        </a>
      </main>
    )
  }

  // If session exists, show a welcome message and logout button
  return (
    <main>
      <h1 className="font-bold text-4xl text-center m-9">Welcome, {session.user.name}!</h1>
      <p className="font-bold text-2xl text-center m-9">Welcome this is our user home for our project the user will uplaod model here </p>
      <p>
        <a href="/auth/logout">
          <button className="font-bold text-2xl text-center m-9">Log out</button>
        </a>
      </p>
    </main>
  )
}

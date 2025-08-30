"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../components/auth-provider";

export default function LoginPage(){
  const router = useRouter();
  const { user } = useAuth();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    if(user) router.replace("/Home");
  }, [user, router]);

  const onSubmit = async (e)=>{
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/Home");
    } catch(err){
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border border-border rounded-sm bg-card text-card-foreground">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <Input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
            <Input id="password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button disabled={loading} type="submit" className="w-full">{loading?"Signing in...":"Sign In"}</Button>
        <Button type="button" variant="outline" className="w-full" onClick={async()=>{ setError(""); setLoading(true); try { const provider = new GoogleAuthProvider(); await signInWithPopup(auth, provider); router.push('/Home'); } catch(e){ setError(e.message);} finally { setLoading(false);} }}>Continue with Google</Button>
      </form>
      <p className="text-xs mt-4">No account? <Link className="underline" href="/signin">Sign up</Link></p>
    </div>
  );
}

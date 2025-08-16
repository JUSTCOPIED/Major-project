"use client";

import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Protected({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(()=>{
    if(!loading && !user) router.push("/login");
  },[user, loading, router]);
  if(loading || !user) return <div className="p-8">Loading...</div>;
  return children;
}

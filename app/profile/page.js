"use client";

import { Protected } from "@/components/protected";
import { useAuth } from "@/components/auth-provider";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";

export default function ProfilePage(){
  return (
    <Protected>
      <ProfileInner />
    </Protected>
  );
}

function ProfileInner(){
  const { user } = useAuth();
  const [runs,setRuns] = useState([]);
  useEffect(()=>{
    if(!user) return;
    const r = ref(database, `testRuns/${user.uid}`);
    const unsub = onValue(r, snap => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id,data])=>({id,...data})).sort((a,b)=>b.timestamp-a.timestamp).slice(0,10);
      setRuns(arr);
    });
    return ()=>unsub();
  },[user]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-sm opacity-80">User ID: {user.uid}</p>
      </section>
      <section className="grid gap-2 md:grid-cols-2">
        <div className="border border-border rounded-sm p-4 bg-card text-card-foreground">
          <h2 className="font-semibold mb-2">Account</h2>
          <ul className="text-sm space-y-1">
            <li><strong>Name:</strong> {user.displayName || "—"}</li>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Verified:</strong> {user.emailVerified?"Yes":"No"}</li>
          </ul>
        </div>
        <div className="border border-border rounded-sm p-4">
          <h2 className="font-semibold mb-2">Stats</h2>
          <p className="text-sm">Runs saved: {runs.length}</p>
          <p className="text-sm">Last run: {runs[0]? new Date(runs[0].timestamp).toLocaleString(): "—"}</p>
        </div>
      </section>
      <section>
        <h2 className="font-semibold mb-3">Recent Test Runs</h2>
        <div className="space-y-3">
          {runs.map(run => (
            <details key={run.id} className="border border-border rounded-sm p-3 text-sm">
              <summary className="cursor-pointer flex justify-between items-center">{new Date(run.timestamp).toLocaleString()} <span>{run.cases.filter(c=>c.passed).length}/{run.cases.length} passed</span></summary>
              <ul className="mt-2 grid grid-cols-2 gap-1">
                {run.cases.map(c=> <li key={c.name} className={`px-2 py-1 rounded-sm text-center ${c.passed?"bg-accent/10":"bg-destructive/20"}`}>{c.name}: {c.passed?"PASS":"FAIL"}</li>)}
              </ul>
            </details>
          ))}
          {!runs.length && <p className="text-sm opacity-60">No runs yet.</p>}
        </div>
      </section>
    </div>
  );
}

"use client";

import { Protected } from "@/components/protected";
import { useAuth } from "@/components/auth-provider";
import { database } from "@/lib/firebase";
import { ref, onValue, get, runTransaction, update } from "firebase/database";
import { useEffect, useState, useMemo } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProfilePage(){
  return (
    <Protected>
      <ProfileInner />
    </Protected>
  );
}

function ProfileInner(){
  const { user } = useAuth();
  const [tests,setTests] = useState([]);
  const [displayName,setDisplayName] = useState(user.displayName || "");
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState("");

  useEffect(()=>{
    if(!user) return;
    const userTestsRef = ref(database, `userTests/${user.uid}`);
    const unsub = onValue(userTestsRef, async snap => {
      const val = snap.val() || {};
      const testNos = Object.keys(val).map(n=>Number(n)).sort((a,b)=>b-a).slice(0,20);
      const summaries = [];
      for(const no of testNos){
        // eslint-disable-next-line no-await-in-loop
        const testSnap = await get(ref(database, `tests/${no}`));
        if(testSnap.exists()) summaries.push({ testNo:no, ...testSnap.val() });
      }
      setTests(summaries);
    });
    return ()=>unsub();
  },[user]);

  const hasChanges = useMemo(()=> (displayName.trim() !== (user.displayName || "")), [displayName, user.displayName]);

  const onSave = async (e)=>{
    e.preventDefault();
    if(!hasChanges) return;
    setSaving(true); setMessage("");
    try {
      const safeName = displayName.trim().slice(0,60) || null;
      await updateProfile(auth.currentUser, { displayName: safeName });
      // mirror to user profile document
      if(safeName){
        await update(ref(database, `users/${user.uid}`), { displayName: safeName });
      }
      setMessage("Profile updated.");
    } catch(err){ setMessage(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-sm opacity-70">User ID: {user.uid}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Manage identifying information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="displayName" className="block text-xs font-medium mb-1">Display Name</label>
                <Input id="displayName" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="text-xs opacity-70 space-y-0.5">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Verified:</strong> {user.emailVerified? 'Yes':'No'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!hasChanges || saving}>{saving? 'Saving…':'Update Profile'}</Button>
                {message && <span className="text-xs opacity-80">{message}</span>}
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage Stats</CardTitle>
            <CardDescription>Recent activity snapshot</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Tests: {tests.length}</p>
            <p>Last test: {tests[0]? new Date(tests[0].timestamp).toLocaleString(): '—'}</p>
            <p>Recent pass avg: {tests.length? Math.round(tests.reduce((acc,t)=> acc + (t.passRate||0),0)/tests.length): '—'}%</p>
          </CardContent>
        </Card>
      </div>
      <section className="space-y-4">
  <h2 className="text-lg font-semibold tracking-tight">Recent Tests</h2>
        <div className="space-y-3">
          {tests.map(t => (
            <div key={t.testNo} className="border border-border rounded-sm p-3 text-sm flex flex-wrap gap-2 justify-between items-center">
              <span className="font-mono text-xs">#{t.testNo}</span>
              <span className="text-xs opacity-70">{new Date(t.timestamp).toLocaleString()}</span>
              <span className="px-2 py-0.5 rounded-sm bg-accent/10 text-xs">{t.passCount}/{t.totalCases} passed</span>
              <span className="text-[10px] uppercase opacity-60">{t.environment}</span>
              <span className="text-[10px] opacity-60">PR {t.passRate}%</span>
            </div>
          ))}
          {!tests.length && <p className="text-sm opacity-60">No tests yet.</p>}
        </div>
      </section>
    </div>
  );
}

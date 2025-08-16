"use client";

import { Protected } from "@/components/protected";
import { useAuth } from "@/components/auth-provider";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage(){
  return (
    <Protected>
      <SettingsInner />
    </Protected>
  );
}

function SettingsInner(){
  const { user } = useAuth();
  const [name,setName] = useState(user.displayName || "");
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState("");

  const save = async (e)=>{
    e.preventDefault();
    setSaving(true); setMessage("");
    try { await updateProfile(auth.currentUser, { displayName: name }); setMessage("Saved"); }
    catch(err){ setMessage(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <form onSubmit={save} className="space-y-4 border border-border rounded-sm p-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="name">Display Name</label>
          <Input id="name" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <Button type="submit" disabled={saving}>{saving?"Saving...":"Save"}</Button>
        {message && <p className="text-xs opacity-80">{message}</p>}
      </form>
    </div>
  );
}

"use client";

// Settings merged into profile. Keep route for backward compatibility and redirect.
import { redirect } from "next/navigation";
export default function SettingsPage(){
  redirect('/profile');
}

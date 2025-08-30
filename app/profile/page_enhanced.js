"use client";

import { Protected } from "../../components/protected";
import { useAuth } from "../../components/auth-provider";
import { database } from "../../lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { useEffect, useState, useMemo } from "react";
import { updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import Link from "next/link";

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
  const [userDetails,setUserDetails] = useState(null);
  
  // Editable fields
  const [displayName,setDisplayName] = useState(user?.displayName || "");
  const [bio,setBio] = useState("");
  const [timezone,setTimezone] = useState("");
  const [notifications,setNotifications] = useState(true);
  const [theme,setTheme] = useState("system");
  const [defaultEnvironment,setDefaultEnvironment] = useState("staging");
  const [autoThreshold,setAutoThreshold] = useState(80);
  
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState("");
  const [verificationSent,setVerificationSent] = useState(false);

  // Load user details and tests
  useEffect(()=>{
    if(!user) return;
    const detailsRef = ref(database, `user/${user.uid}/details`);
    const detailsUnsub = onValue(detailsRef, snap => {
      const details = snap.val();
      if(details){
        setUserDetails(details);
        setBio(details.bio || "");
        setTimezone(details.timezone || "");
        setNotifications(details.notifications !== false);
        setTheme(details.theme || "system");
        setDefaultEnvironment(details.defaultEnvironment || "staging");
        setAutoThreshold(details.autoThreshold || 80);
      }
    });

    const testsRef = ref(database, `user/${user.uid}/tests`);
    const testsUnsub = onValue(testsRef, snap => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([k,v])=> ({ testNo:Number(k), ...v })).sort((a,b)=> b.testNo - a.testNo);
      setTests(list);
    });
    
    return ()=> {
      detailsUnsub();
      testsUnsub();
    };
  },[user]);

  const hasChanges = useMemo(()=> {
    if(!user || !userDetails) return false;
    return (
      displayName.trim() !== (user.displayName || "") ||
      bio.trim() !== (userDetails.bio || "") ||
      timezone !== (userDetails.timezone || "") ||
      notifications !== (userDetails.notifications !== false) ||
      theme !== (userDetails.theme || "system") ||
      defaultEnvironment !== (userDetails.defaultEnvironment || "staging") ||
      autoThreshold !== (userDetails.autoThreshold || 80)
    );
  }, [displayName, bio, timezone, notifications, theme, defaultEnvironment, autoThreshold, user, userDetails]);

  const onSave = async (e)=>{
    e.preventDefault();
    if(!hasChanges) return;
    setSaving(true); setMessage("");
    try {
      const safeName = displayName.trim().slice(0,60) || null;
      const safeBio = bio.trim().slice(0,200) || null;
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName: safeName });
      
      // Update database profile with all fields
      await update(ref(database, `user/${user.uid}/details`), {
        displayName: safeName,
        bio: safeBio,
        timezone: timezone || null,
        notifications,
        theme,
        defaultEnvironment,
        autoThreshold,
        updatedAt: Date.now()
      });
      
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch(err){ 
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(""), 5000);
    }
    finally { setSaving(false); }
  };

  const sendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      setMessage("Verification email sent!");
      setTimeout(() => setMessage(""), 3000);
    } catch(err) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Calculate advanced stats
  const stats = useMemo(() => {
    if(!tests.length) return { totalTests: 0, totalCases: 0, overallPassRate: 0, streak: 0, environments: {}, lastWeek: 0 };
    
    const totalTests = tests.length;
    const totalCases = tests.reduce((sum, t) => sum + (t.totalCases || 0), 0);
    const totalPassed = tests.reduce((sum, t) => sum + (t.passCount || 0), 0);
    const overallPassRate = totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : 0;
    
    // Calculate current passing streak
    let streak = 0;
    for(const test of tests) {
      if(test.passCount === test.totalCases) streak++;
      else break;
    }
    
    // Environment breakdown
    const environments = tests.reduce((acc, t) => {
      acc[t.environment] = (acc[t.environment] || 0) + 1;
      return acc;
    }, {});
    
    // Tests in last week
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const lastWeek = tests.filter(t => t.timestamp > weekAgo).length;
    
    return { totalTests, totalCases, overallPassRate, streak, environments, lastWeek };
  }, [tests]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <div className="flex items-center gap-4 text-sm opacity-70">
          <span>User ID: {user?.uid}</span>
          <span>•</span>
          <span>Member since: {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : '—'}</span>
          <span>•</span>
          <span>Last login: {userDetails?.lastLogin ? new Date(userDetails.lastLogin).toLocaleString() : '—'}</span>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs opacity-60">{stats.lastWeek} this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overall Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallPassRate}%</div>
            <p className="text-xs opacity-60">{stats.totalPassed}/{stats.totalCases} cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-xs opacity-60">consecutive perfect runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Environments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.environments).map(([env, count]) => (
                <Badge key={env} variant="outline" className="text-xs">
                  {env}: {count}
                </Badge>
              ))}
              {Object.keys(stats.environments).length === 0 && <span className="text-xs opacity-60">—</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account & Personal Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your personal details and account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium mb-2">Display Name</label>
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={e=>setDisplayName(e.target.value)} 
                    placeholder="Your display name"
                    maxLength={60}
                  />
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium mb-2">Timezone</label>
                  <select 
                    id="timezone" 
                    value={timezone} 
                    onChange={e=>setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select timezone</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Asia/Kolkata">Mumbai</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
                <textarea 
                  id="bio" 
                  value={bio} 
                  onChange={e=>setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none"
                />
                <p className="text-xs opacity-60 mt-1">{bio.length}/200 characters</p>
              </div>

              <div className="text-sm space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-xs opacity-70">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Unverified</Badge>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={sendVerification}
                          disabled={verificationSent}
                        >
                          {verificationSent ? 'Sent!' : 'Verify'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map(t => (
                  <Button 
                    key={t} 
                    type="button" 
                    size="sm" 
                    variant={theme === t ? 'default' : 'outline'}
                    onClick={() => setTheme(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Default Environment</label>
              <div className="flex gap-2 flex-wrap">
                {['staging', 'production', 'dev'].map(env => (
                  <Button 
                    key={env} 
                    type="button" 
                    size="sm" 
                    variant={defaultEnvironment === env ? 'default' : 'outline'}
                    onClick={() => setDefaultEnvironment(env)}
                    className="capitalize"
                  >
                    {env}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Auto Threshold: {autoThreshold}%</label>
              <input 
                type="range" 
                min={50} 
                max={100} 
                value={autoThreshold} 
                onChange={e => setAutoThreshold(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Notifications</label>
              <Button 
                type="button" 
                size="sm" 
                variant={notifications ? 'default' : 'outline'}
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={onSave} disabled={!hasChanges || saving} className="min-w-32">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        {message && (
          <span className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-600'}`}>
            {message}
          </span>
        )}
      </div>

      {/* Recent Tests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Tests</h2>
          <Link href="/test" className="text-sm underline">Run New Test</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tests.slice(0, 6).map(t => (
            <Link 
              key={t.testNo} 
              href={`/test/${t.testNo}`} 
              className="border border-border rounded-md p-4 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">#{t.testNo}</span>
                <Badge variant={t.passCount === t.totalCases ? 'success' : 'destructive'}>
                  {t.passCount}/{t.totalCases}
                </Badge>
              </div>
              <div className="text-xs opacity-70 space-y-1">
                <p>{new Date(t.timestamp).toLocaleDateString()}</p>
                <p>Env: {t.environment} • {t.passRate}% pass rate</p>
                {t.note && <p className="italic">&ldquo;{t.note}&rdquo;</p>}
              </div>
            </Link>
          ))}
          {!tests.length && (
            <div className="col-span-full text-center py-8 text-sm opacity-60">
              <p>No tests yet. <Link href="/test" className="underline">Run your first test</Link></p>
            </div>
          )}
        </div>
        {tests.length > 6 && (
          <div className="text-center">
            <p className="text-sm opacity-60">Showing 6 of {tests.length} tests</p>
          </div>
        )}
      </section>
    </div>
  );
}

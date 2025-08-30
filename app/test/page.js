"use client";

import { Protected } from "../../components/protected";
import { useAuth } from "../../components/auth-provider";
import { useState, useRef } from "react";
import { database, FIREBASE_ENV_ISSUES } from "../../lib/firebase";
import { ref, push, runTransaction, set } from "firebase/database";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useRouter } from "next/navigation";

const ALL_CASES = [
  { name:"Auth flow", group:"Core" },
  { name:"Profile update", group:"Core" },
  { name:"Data fetch", group:"API" },
  { name:"Accessibility", group:"Quality" },
  { name:"Performance", group:"Quality" },
  { name:"Analytics events", group:"Instrumentation" },
  { name:"Security headers", group:"Security" },
  { name:"Rate limiting", group:"Security" },
];

function StartTestInner(){
  const { user } = useAuth();
  const router = useRouter();
  const [environment,setEnvironment] = useState("staging");
  const [concurrency,setConcurrency] = useState(3);
  const [threshold,setThreshold] = useState(80);
  const [selected,setSelected] = useState(()=> ALL_CASES.map(c=>c.name));
  const [note,setNote] = useState("");
  const [running,setRunning] = useState(false);
  const [progress,setProgress] = useState([]); // {name, passed, duration}
  const [error,setError] = useState("");
  const abortRef = useRef(false);

  const toggleCase = (name)=> {
    setSelected(sel => sel.includes(name)? sel.filter(n=>n!==name): [...sel,name]);
  };
  const selectGroup = (group)=> {
    const groupCases = ALL_CASES.filter(c=>c.group===group).map(c=>c.name);
    setSelected(sel => {
      const allIn = groupCases.every(g=> sel.includes(g));
      if(allIn) return sel.filter(s=> !groupCases.includes(s));
      return Array.from(new Set([...sel, ...groupCases]));
    });
  };

  const start = async ()=>{
    setError("");
    if (FIREBASE_ENV_ISSUES.length){
      setError("Missing Firebase env vars: " + FIREBASE_ENV_ISSUES.join(", "));
      return;
    }
    if(!selected.length || running) return;
    setRunning(true); setProgress([]); abortRef.current=false;
    const startTs = Date.now();
    const casesToRun = selected.map(name=> ({ name }));
    const results = [];
    for(const test of casesToRun){
      if(abortRef.current) break;
      // simulated parallelism factor influences duration
      await new Promise(r=> setTimeout(r, 250 + Math.random()*400 / concurrency));
      const passed = Math.random()*100 <= threshold + (Math.random()*10 -5);
      const duration = 200 + Math.floor(Math.random()*400);
      const record = { name:test.name, passed, duration };
      results.push(record);
      setProgress([...results]);
    }
    const passCount = results.filter(r=>r.passed).length;
    const failCount = results.length - passCount;
    const passRate = results.length? Math.round(passCount/results.length*100):0;
    // Get sequential test number using transaction counter
    const counterRef = ref(database, 'counters/testNo');
    let testNo;
    await runTransaction(counterRef, (current)=>{
      if(current === null) return 1; return current + 1;
    }, { applyLocally:false }).then(res=> { testNo = res.snapshot.val(); });
    // Store summary + details (cases + config)
    const testSummary = {
      uid: user.uid,
      timestamp: startTs,
      environment,
      totalCases: results.length,
      passCount,
      failCount,
      passRate,
      threshold,
      concurrency,
      note: note.trim() || null
    };
    const baseRef = ref(database, `user/${user.uid}/tests/${testNo}`);
    await set(baseRef, testSummary);
    // cases 1..N with group if available
    const nameToGroup = (name)=> (ALL_CASES.find(c=>c.name===name)?.group || null);
    const casesObj = results.reduce((acc, r, i)=> {
      acc[i+1] = { name: r.name, group: nameToGroup(r.name), passed: r.passed, duration: r.duration };
      return acc;
    }, {});
    await set(ref(database, `user/${user.uid}/tests/${testNo}/cases`), casesObj);
    await set(ref(database, `user/${user.uid}/tests/${testNo}/config`), {
      environment,
      threshold,
      concurrency,
      note: note.trim() || null
    });
  // Update user stats (tests count & rolling pass rate)
  const userStatsRef = ref(database, `user/${user.uid}/details/stats`);
    try {
      await runTransaction(userStatsRef, (current)=>{
        if(!current){
          return { tests:1, passRate: passRate };
        }
        const tests = (current.tests || 0) + 1;
        const newRate = current.passRate == null ? passRate : Math.round(((current.passRate * (tests-1)) + passRate)/tests);
        return { tests, passRate: newRate };
      });
      router.push('/Home');
    } catch(e){
      console.error("Test run save failed", e);
      setError(e?.message || 'Failed to save test');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Start New Test Run</h1>
        <p className="text-sm opacity-70">Configure and execute a focused test suite.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test Case Selection</CardTitle>
            <CardDescription>Pick the scope for this run</CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {[...new Set(ALL_CASES.map(c=>c.group))].map(group => {
                  const groupCases = ALL_CASES.filter(c=>c.group===group).map(c=>c.name);
                  const active = groupCases.every(c=> selected.includes(c));
                  return <Button key={group} size="sm" variant={active? 'default':'outline'} onClick={()=>selectGroup(group)}>{group}</Button>;
                })}
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ALL_CASES.map(tc => {
                  const active = selected.includes(tc.name);
                  return (
                    <li key={tc.name}>
                      <button type="button" onClick={()=>toggleCase(tc.name)} className={`w-full text-left px-3 py-2 rounded-sm border text-xs flex justify-between items-center transition ${active? 'bg-primary text-primary-foreground border-primary':'border-border hover:bg-accent/10'}`} aria-pressed={active}>
                        <span className="truncate">{tc.name}</span>
                        {active && <span className="text-[10px] font-medium">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Execution parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium">Environment</label>
              <div className="flex gap-2 flex-wrap">
                {['staging','production','dev'].map(env => <Button key={env} size="sm" variant={environment===env? 'default':'outline'} onClick={()=>setEnvironment(env)}>{env}</Button>)}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" htmlFor="concurrency">Concurrency: {concurrency}</label>
              <input id="concurrency" type="range" min={1} max={8} value={concurrency} onChange={e=>setConcurrency(Number(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" htmlFor="threshold">Target Pass % Threshold: {threshold}%</label>
              <input id="threshold" type="range" min={50} max={100} step={1} value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" htmlFor="note">Run Note (optional)</label>
              <Input id="note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Context or ticket ref" />
            </div>
            <div className="text-[11px] opacity-70 leading-relaxed">
              <p>Pass probability scales with threshold ± noise. Concurrency reduces per-test delay.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Execution Preview</CardTitle>
          <CardDescription>Validate scope before running</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selected.map(s=> <Badge key={s}>{s}</Badge>)}
            {!selected.length && <p className="text-xs opacity-60">No test cases selected.</p>}
          </div>
          <div className="text-xs opacity-70 space-y-1">
            <p><strong>Estimated Duration:</strong> ~{Math.max(1, Math.round(selected.length * (0.4/concurrency)))}s</p>
            <p><strong>Environment:</strong> {environment}</p>
            <p><strong>Target Pass Threshold:</strong> {threshold}%</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={start} disabled={!selected.length || running} className="min-w-40">{running? 'Running…':'Start Run'}</Button>
            {running && <Button variant="outline" onClick={()=> { abortRef.current=true; setRunning(false); }} size="sm">Abort</Button>}
          </div>
          {!!error && <p className="text-xs text-destructive">{error}</p>}
          {running && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-border rounded-sm overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(progress.length/selected.length)*100}%` }} />
              </div>
              <ul className="text-xs border border-border rounded-sm divide-y divide-border">
                {progress.map(p => (
                  <li key={p.name} className="flex justify-between px-2 py-1">
                    <span className="truncate">{p.name}</span>
                    <span className={p.passed? 'text-green-600 dark:text-green-400':'text-destructive'}>{p.passed? 'PASS':'FAIL'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StartTestPage(){
  return (
    <Protected>
      <StartTestInner />
    </Protected>
  );
}

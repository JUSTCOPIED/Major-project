"use client";

import { Protected } from "@/components/protected";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage(){
  return (
    <Protected>
      <DashboardInner />
    </Protected>
  );
}

function DashboardInner(){
  const { user } = useAuth();
  const [running,setRunning] = useState(false);
  const [results,setResults] = useState([]); // current run live
  const [history,setHistory] = useState([]); // saved runs
  const [filter,setFilter] = useState("all");

  // Load prior runs (latest 5)
  useEffect(()=>{
    if(!user) return;
    const runsRef = ref(database, `testRuns/${user.uid}`);
    const unsub = onValue(runsRef, (snap)=>{
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id,data])=>({id,...data})).sort((a,b)=>b.timestamp-a.timestamp).slice(0,5);
      setHistory(arr);
    });
    return ()=>unsub();
  },[user]);

  const runTests = async ()=>{
    setRunning(true);
    setResults([]);
    const testCases = ["Auth flow", "Profile update", "Data fetch", "Accessibility", "Performance"];
    const runData = [];
    for(const name of testCases){
      // simulate async run
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r=>setTimeout(r, 400));
      const passed = Math.random() > 0.2;
      const record = { name, passed };
      runData.push(record);
      setResults([...runData]);
    }
    // Save run
    await push(ref(database, `testRuns/${user.uid}`), { timestamp: Date.now(), cases: runData });
    setRunning(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm opacity-70">Welcome back {user.displayName || user.email}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pass Rate</CardTitle>
            <CardDescription>Last run snapshot</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {history[0]? `${history[0].cases.filter(c=>c.passed).length}/${history[0].cases.length}`: '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved Runs</CardTitle>
            <CardDescription>Total stored</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{history.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Execution</CardTitle>
            <CardDescription>Timestamp</CardDescription>
          </CardHeader>
            <CardContent className="text-base font-mono">{history[0]? new Date(history[0].timestamp).toLocaleTimeString(): '—'}</CardContent>
        </Card>
      </div>
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Test Suite Runner</CardTitle>
              <CardDescription>Execute synthetic tests (demo)</CardDescription>
            </div>
            <Button disabled={running} onClick={runTests}>{running?"Running…":"Run Suite"}</Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Case</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {results.map(r=> (
                  <TR key={r.name}>
                    <TD>{r.name}</TD>
                    <TD>{r.passed?<Badge variant="success">PASS</Badge>:<Badge variant="destructive">FAIL</Badge>}</TD>
                  </TR>
                ))}
                {!results.length && <TR><TD colSpan={2} className="opacity-60">No execution yet.</TD></TR>}
              </TBody>
            </Table>
            {running && <p className="text-xs mt-2 animate-pulse">Executing…</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine recent runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              {['all','pass','fail'].map(f => <Button key={f} size="sm" variant={filter===f? 'default':'outline'} onClick={()=>setFilter(f)}>{f}</Button>)}
            </div>
            <p className="text-xs opacity-70">Showing {filter} cases.</p>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Recent Runs</h2>
        <div className="overflow-auto border border-border rounded-sm">
          <Table>
            <THead>
              <TR>
                <TH>Time</TH>
                <TH>Pass Rate</TH>
                <TH>Failures</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {history.map(run => {
                const pass = run.cases.filter(c=>c.passed).length;
                const failList = run.cases.filter(c=>!c.passed);
                return (
                  <TR key={run.id}>
                    <TD className="whitespace-nowrap text-xs">{new Date(run.timestamp).toLocaleString()}</TD>
                    <TD><Badge variant={pass===run.cases.length? 'success':'outline'}>{pass}/{run.cases.length}</Badge></TD>
                    <TD className="text-xs">{failList.length? failList.map(f=>f.name).join(', '): '—'}</TD>
                    <TD>
                      <details className="text-xs cursor-pointer">
                        <summary className="opacity-70">View</summary>
                        <ul className="mt-1 space-y-1">
                          {run.cases.filter(c=> filter==='all' || (filter==='pass'?c.passed:!c.passed)).map(c=> (
                            <li key={c.name} className="flex justify-between gap-4"><span>{c.name}</span><span>{c.passed? '✅':'❌'}</span></li>
                          ))}
                        </ul>
                      </details>
                    </TD>
                  </TR>
                );
              })}
              {!history.length && <TR><TD colSpan={4} className="text-sm opacity-60">No runs stored.</TD></TR>}
            </TBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

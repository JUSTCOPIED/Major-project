"use client";

import { Protected } from "../../components/protected";
import { useAuth } from "../../components/auth-provider";
import { useState, useEffect, useMemo } from "react";
import { database, FIREBASE_ENV_ISSUES } from "../../lib/firebase";
import { ref, onValue, runTransaction, set } from "firebase/database";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import Link from "next/link";

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
  const [history,setHistory] = useState([]); // aggregated test summaries
  const [filter,setFilter] = useState("all");
  const [error,setError] = useState("");

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    if (filter === "pass") return history.filter(r => r.passCount === r.totalCases);
    if (filter === "fail") return history.filter(r => r.passCount !== r.totalCases);
    return history;
  }, [history, filter]);

  // Listen directly to embedded tests under user/{uid}/tests
  useEffect(()=>{
    if(!user) return;
    const testsRef = ref(database, `user/${user.uid}/tests`);
    const unsub = onValue(testsRef, (snap)=>{
      const val = snap.val() || {};
      const list = Object.entries(val).map(([k,v])=> ({ testNo:Number(k), ...v })).sort((a,b)=> b.testNo - a.testNo).slice(0,5);
      setHistory(list);
    });
    return ()=>unsub();
  },[user]);

  const runTests = async ()=>{
    setError("");
    if (FIREBASE_ENV_ISSUES.length){
      setError("Missing Firebase env vars: " + FIREBASE_ENV_ISSUES.join(", "));
      return;
    }
    setRunning(true);
    setResults([]);
    const testCases = ["Auth flow", "Profile update", "Data fetch", "Accessibility", "Performance"];
    const runData = [];
    for(const name of testCases){
      await new Promise(r=>setTimeout(r, 350));
      const passed = Math.random() > 0.2;
      runData.push({ name, passed });
      setResults([...runData]);
    }
    const passCount = runData.filter(c=>c.passed).length;
    const failCount = runData.length - passCount;
    const passRate = Math.round(passCount/runData.length*100);
    // allocate test number
    const counterRef = ref(database, 'counters/testNo');
    let testNo;
    try {
      await runTransaction(counterRef, (current)=> current == null ? 1 : current + 1, { applyLocally:false }).then(res=> { testNo = res.snapshot.val(); });
      const summary = { uid:user.uid, timestamp: Date.now(), environment: 'quick', totalCases: runData.length, passCount, failCount, passRate, threshold: null, concurrency: null, note: 'quick-run' };
  await set(ref(database, `user/${user.uid}/tests/${testNo}`), summary);
  // stats update
  const userStatsRef = ref(database, `user/${user.uid}/details/stats`);
      await runTransaction(userStatsRef, (current)=>{
        if(!current) return { tests:1, passRate };
        const tests = (current.tests||0)+1; const newRate = current.passRate==null? passRate : Math.round(((current.passRate*(tests-1))+passRate)/tests);
        return { tests, passRate:newRate };
      });
    } catch(e){
      console.error("Quick run failed", e);
      setError(e?.message || 'Failed to save test');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm opacity-70">Welcome back {user.displayName || user.email}</p>
        </div>
        <div className="flex gap-3">
          <Button as={Link} href="/test" variant="outline" size="sm">Start New Test</Button>
          <Button onClick={runTests} disabled={running} size="sm">{running?"Running…":"Quick Run"}</Button>
        </div>
      </header>
  <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pass Rate</CardTitle>
            <CardDescription>Last test summary</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {history[0]? `${history[0].passCount}/${history[0].totalCases}`: '—'}
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
  {!!error && <p className="text-xs text-destructive">{error}</p>}
      <section className="grid gap-6 lg:grid-cols-3">
  <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Test (Demo)</CardTitle>
              <CardDescription>Ad-hoc smoke run; stored as summary only</CardDescription>
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
            <p className="text-xs opacity-70">Showing {filteredHistory.length} of {history.length} runs.</p>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Runs</h2>
          <p className="text-xs opacity-60">Latest 5 tests (summary)</p>
        </div>
        <div className="overflow-auto border border-border rounded-sm">
          <Table>
            <THead>
              <TR>
                <TH>Time</TH>
                <TH>Pass Rate</TH>
                <TH>Env</TH>
                <TH>Cases</TH>
                <TH>Test #</TH>
              </TR>
            </THead>
            <TBody>
              {filteredHistory.map(run => (
                <TR key={run.testNo}>
                  <TD className="whitespace-nowrap text-xs">{new Date(run.timestamp).toLocaleString()}</TD>
                  <TD><Badge variant={run.passCount===run.totalCases? 'success':'outline'}>{run.passCount}/{run.totalCases}</Badge></TD>
                  <TD className="text-xs">{run.environment}</TD>
                  <TD className="text-xs">{run.totalCases}</TD>
                  <TD className="text-xs font-mono">
                    <Link href={`/test/${run.testNo}`} className="underline hover:opacity-80">#{run.testNo}</Link>
                  </TD>
                </TR>
              ))}
              {!history.length && <TR><TD colSpan={5} className="text-sm opacity-60">No tests yet.</TD></TR>}
            </TBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

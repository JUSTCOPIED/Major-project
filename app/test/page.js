"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Protected } from "@/components/protected";
import { database } from "@/lib/firebase";
import { ref, onValue, set, runTransaction } from "firebase/database";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Optional dummy Table components if they exist, otherwise basic HTML works
const Table = ({ children }) => <table className="w-full text-left border-collapse">{children}</table>
const THead = ({ children }) => <thead className="bg-muted text-muted-foreground">{children}</thead>
const TBody = ({ children }) => <tbody>{children}</tbody>
const TR = ({ children }) => <tr className="border-b">{children}</tr>
const TH = ({ children }) => <th className="p-2 font-medium">{children}</th>
const TD = ({ children }) => <td className="p-2">{children}</td>

function ReportChat({ testProgress }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !testProgress.length) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const report_data = testProgress.map(p => ({
        test: p.name,
        passed: p.passed,
        metrics: p.details ? {
          fairlearn: p.details.fairlearn,
          aif360: p.details.aif360,
          custom: p.details.custom
        } : null
      }));

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          report_data
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("API error response:", data);
        throw new Error(data.detail || "Error connecting to AI");
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", error: true, content: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-blue-500/20 shadow-md">
      <CardHeader className="bg-blue-50/5 dark:bg-blue-900/10 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          EquiTest AI Assistant
        </CardTitle>
        <CardDescription>Ask questions about your fairness audit results</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="h-[300px] overflow-auto space-y-4 pr-4">
          {messages.length === 0 && (
            <div className="text-center opacity-50 mt-10">Ask me to compare the models, or explain what Disparate Impact means!</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[85%] text-sm ${m.error ? 'bg-destructive/10 text-destructive' : m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs opacity-50 ml-2">AI is thinking...</div>}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about the test results..."
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}

const ALL_CASES = [
  { name: 'Merit-Based Selection', basis: 'merit', group: 'fair' },
  { name: 'Systemic Bias Simulation', basis: 'biased', group: 'unfair' },
  { name: 'External ATS Ranking (Groq Cloud Llama-3 API)', basis: 'ai_ranked', group: 'fair' },
];

function DeepDiveTabs({ results }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!results.length) return null;

  const validResults = results.filter(r => r.details);
  if (!validResults.length) return null;

  const activeResult = validResults[activeIdx] || validResults[0];
  const det = activeResult.details;
  const candidates = det.selected_candidates || [];

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold">Deep Dive Analysis</h2>

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {validResults.map((result, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeIdx === idx
              ? 'bg-primary/10 border-b-2 border-primary text-primary'
              : 'hover:bg-muted text-foreground/70'
              }`}
          >
            {result.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card className={`border ${activeResult.passed ? 'border-primary' : 'border-destructive'}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {activeResult.name}
            <Badge variant={activeResult.passed ? 'success' : 'destructive'}>
              {activeResult.passed ? 'PASSED FAIRNESS' : 'BIASED'}
            </Badge>
          </CardTitle>
          <CardDescription>Raw metrics from Fairlearn and AIF360, plus candidates specifically chosen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 border rounded-md">
              <p className="opacity-70 text-xs">AIF360 Disparate Impact (Gender)</p>
              <p className="font-mono text-lg font-bold">{det.aif360?.gender?.di?.toFixed(3) || 'N/A'}</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="opacity-70 text-xs">Fairlearn DP Ratio (Gender)</p>
              <p className="font-mono text-lg font-bold">{det.fairlearn?.gender?.dp_ratio?.toFixed(3) || 'N/A'}</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="opacity-70 text-xs">AIF360 Disparate Impact (Uni)</p>
              <p className="font-mono text-lg font-bold">{det.aif360?.university_tier?.di?.toFixed(3) || 'N/A'}</p>
            </div>
            <div className="p-3 border rounded-md border-red-500/20">
              <p className="opacity-70 text-xs text-red-500">Predicted Pay Gap</p>
              <p className="font-mono text-lg font-bold text-red-500">{det.custom?.pay_gap_percent?.toFixed(1) || '0'}%</p>
            </div>
          </div>

          {det.charts_html && (
            <div className="mt-4 border rounded shadow-inner overflow-hidden">
              <iframe sandbox="allow-scripts allow-same-origin" srcDoc={det.charts_html} className="w-full h-[600px] border-none" />
            </div>
          )}

          {/* Candidate Table */}
          <div className="overflow-auto border border-border rounded-sm max-h-[400px]">
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Name</TH>
                  <TH>Gender</TH>
                  <TH>Uni Tier</TH>
                  <TH>Exp (Yrs)</TH>
                  <TH>Company</TH>
                  <TH>Salary (LPA)</TH>
                </TR>
              </THead>
              <TBody>
                {candidates.map(c => (
                  <TR key={c.candidate_id}>
                    <TD className="text-xs font-mono">{c.candidate_id}</TD>
                    <TD className="text-xs font-medium">{c.name}</TD>
                    <TD className="text-xs">{c.gender}</TD>
                    <TD className="text-xs">{c.university_tier}</TD>
                    <TD className="text-xs">{c.experience_years}</TD>
                    <TD className="text-xs">{c.company_tier}</TD>
                    <TD className="text-xs">{c.salary_lpa}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StartTestInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [environment, setEnvironment] = useState("staging");
  const [candidatesToSelect, setCandidatesToSelect] = useState(50);
  const [selected, setSelected] = useState(() => ALL_CASES.map(c => c.name));
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [error, setError] = useState("");
  const abortRef = useRef(false);

  const toggleCase = (name) => {
    setSelected(sel => sel.includes(name) ? sel.filter(n => n !== name) : [...sel, name]);
  };
  const selectGroup = (group) => {
    const groupCases = ALL_CASES.filter(c => c.group === group).map(c => c.name);
    setSelected(sel => {
      const allIn = groupCases.every(g => sel.includes(g));
      if (allIn) return sel.filter(s => !groupCases.includes(s));
      return Array.from(new Set([...sel, ...groupCases]));
    });
  };

  const start = async () => {
    setError("");
    if (!selected.length || running) return;
    setRunning(true); setProgress([]); abortRef.current = false;
    const startTs = Date.now();

    const casesToRun = selected.map(name => ALL_CASES.find(c => c.name === name));
    const results = [];

    const backendUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/detect_bias` : "http://localhost:8000/api/detect_bias";

    for (const test of casesToRun) {
      if (abortRef.current) break;

      const caseStartTs = Date.now();
      let passed = false;
      let details = null;
      let duration = 0;

      try {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            n_select: candidatesToSelect,
            basis: test.basis
          })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("API error response:", data);
          throw new Error(data.detail || "API responded with " + response.status);
        }

        const genderDPR = data?.fairlearn?.gender?.dp_ratio;
        passed = (genderDPR !== undefined && genderDPR >= 0.8 && genderDPR <= 1.25);
        details = data;
      } catch (err) {
        console.error("Test failed:", err);
        setError("Test failed: " + err.message);
      }

      duration = Date.now() - caseStartTs;
      const record = { name: test.name, passed, duration, details };
      results.push(record);
      setProgress([...results]);
    }

    const passCount = results.filter(r => r.passed).length;
    const failCount = results.length - passCount;
    const passRate = results.length ? Math.round(passCount / results.length * 100) : 0;

    const counterRef = ref(database, 'counters/testNo');
    let testNo;
    await runTransaction(counterRef, (current) => {
      if (current === null) return 1; return current + 1;
    }, { applyLocally: false }).then(res => { testNo = res.snapshot.val(); });

    const testSummary = {
      uid: user.uid,
      timestamp: startTs,
      environment,
      totalCases: results.length,
      passCount,
      failCount,
      passRate,
      candidatesToSelect,
    };
    const baseRef = ref(database, `user/${user.uid}/tests/${testNo}`);
    await set(baseRef, testSummary);

    const nameToGroup = (name) => (ALL_CASES.find(c => c.name === name)?.group || null);
    const casesObj = results.reduce((acc, r, i) => {
      let sanitizedDetails = null;
      if (r.details) {
        sanitizedDetails = JSON.parse(JSON.stringify(r.details));
      }
      acc[i + 1] = {
        name: r.name,
        group: nameToGroup(r.name),
        passed: r.passed,
        duration: r.duration,
        details: sanitizedDetails
      };
      return acc;
    }, {});

    await set(ref(database, `user/${user.uid}/tests/${testNo}/cases`), casesObj);
    await set(ref(database, `user/${user.uid}/tests/${testNo}/config`), {
      environment,
      candidatesToSelect,
    });

    const userStatsRef = ref(database, `user/${user.uid}/details/stats`);
    try {
      await runTransaction(userStatsRef, (current) => {
        if (!current) {
          return { tests: 1, passRate: passRate };
        }
        const tests = (current.tests || 0) + 1;
        const newRate = current.passRate == null ? passRate : Math.round(((current.passRate * (tests - 1)) + passRate) / tests);
        return { tests, passRate: newRate };
      });
      // Removed router.push('/Home') so the user stays to view Deep Dive
    } catch (e) {
      console.error("Test run save failed", e);
      setError(e?.message || 'Failed to save test');
    } finally {
      setRunning(false);
      setLastResults(results);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Run Real AI Bias Audit</h1>
        <p className="text-sm opacity-70">Execute fairness checks using EthosGuard on synthetic resume data.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Bias Testing Scope</CardTitle>
            <CardDescription>Select selection methodologies to audit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              {[...new Set(ALL_CASES.map(c => c.group))].map(group => {
                const groupCases = ALL_CASES.filter(c => c.group === group).map(c => c.name);
                const active = groupCases.every(c => selected.includes(c));
                return <Button key={group} size="sm" variant={active ? 'default' : 'outline'} onClick={() => selectGroup(group)}>{group}</Button>;
              })}
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {ALL_CASES.map(tc => {
                const active = selected.includes(tc.name);
                return (
                  <li key={tc.name}>
                    <button type="button" onClick={() => toggleCase(tc.name)} className={`w-full text-left px-3 py-2 rounded-sm border text-xs flex justify-between items-center transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent/10'}`} aria-pressed={active}>
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
            <CardDescription>Selection parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium" htmlFor="candidates">Candidates to Select: {candidatesToSelect}</label>
              <input id="candidates" type="range" min={10} max={200} step={10} value={candidatesToSelect} onChange={e => setCandidatesToSelect(Number(e.target.value))} className="w-full" />
            </div>
            <div className="text-[11px] opacity-70 leading-relaxed">
              <p>Will simulate selecting candidates from a pool of 1000 resumes and measure Fairlearn and AIF360 metrics on the output demographics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit Preview</CardTitle>
          <CardDescription>Validate scope before running</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selected.map(s => <Badge key={s}>{s}</Badge>)}
            {!selected.length && <p className="text-xs opacity-60">No audit cases selected.</p>}
          </div>
          <div className="text-xs opacity-70 space-y-1">
            <p><strong>Database:</strong> Simulated Resumes Pool (N=1000)</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={start} disabled={!selected.length || running} className="min-w-40">{running ? 'Running Analysis…' : 'Start Audit'}</Button>
            {running && <Button variant="outline" onClick={() => { abortRef.current = true; setRunning(false); }} size="sm">Abort</Button>}
          </div>
          {!!error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Progress Bars */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress.map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{p.name}</span>
                  <span className={p.passed ? 'text-green-500' : 'text-destructive'}>{p.passed ? 'PASSED' : 'BIASED'}</span>
                </div>
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Deep Dive Analysis & UI Component */}
      {lastResults.length > 0 && <DeepDiveTabs results={lastResults} />}

      {/* Groq Chat Robot */}
      {lastResults.length > 0 && <ReportChat testProgress={lastResults} />}

    </div>
  );
}

export default function StartTestPage() {
  return (
    <Protected>
      <StartTestInner />
    </Protected>
  );
}

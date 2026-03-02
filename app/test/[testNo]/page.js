"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Protected } from "@/components/protected";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
          EthosGuard AI Assistant
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
              <iframe srcDoc={det.charts_html} className="w-full h-[600px] border-none" />
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

function DetailsInner() {
  const { user } = useAuth();
  const params = useParams();
  const testNoParam = params?.testNo; // keep as string to avoid NaN on first render
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user || !testNoParam) return;
    const base = ref(database, `user/${user.uid}/tests/${testNoParam}`);
    const unsub = onValue(base, snap => {
      setData(snap.val());
    });
    return () => unsub();
  }, [user, testNoParam]);

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-sm opacity-70">Loading test #{testNoParam}…</p>
      </div>
    );
  }

  const cases = Object.entries(data.cases || {}).map(([k, v]) => ({ idx: Number(k), ...v }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test #{testNoParam} History</h1>
        <Link href="/Home" className="text-xs underline">Back to Dashboard</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>{new Date(data.timestamp).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Env: {data.environment}</p>
            <p>Pass: {data.passCount}/{data.totalCases} ({data.passRate}%)</p>
            {data.note && <p>Note: {data.note}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Config</CardTitle>
            <CardDescription>Run parameters</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Candidates to Select: {data?.config?.candidatesToSelect ?? data.candidatesToSelect ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Overall</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={data.passCount === data.totalCases ? 'success' : 'destructive'}>
              {data.passCount === data.totalCases ? 'FAIR' : 'BIASED'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Deep Dive Tables */}
      {cases.length > 0 && <DeepDiveTabs results={cases} />}

      {/* AI Chatbot */}
      {cases.length > 0 && <ReportChat testProgress={cases} />}

    </div>
  );
}

export default function TestDetailsPage() {
  return (
    <Protected>
      <DetailsInner />
    </Protected>
  );
}
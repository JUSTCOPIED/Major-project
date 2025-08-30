"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { Protected } from "../../../components/protected";
import { database } from "../../../lib/firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import Link from "next/link";

function DetailsInner(){
  const { user } = useAuth();
  const params = useParams();
  const testNo = Number(params?.testNo);
  const [data,setData] = useState(null);

  useEffect(()=>{
    if(!user || !testNo) return;
    const base = ref(database, `user/${user.uid}/tests/${testNo}`);
    const unsub = onValue(base, snap => {
      setData(snap.val());
    });
    return ()=>unsub();
  },[user, testNo]);

  if(!data){
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-sm opacity-70">Loading test #{testNo}…</p>
      </div>
    );
  }

  const cases = Object.entries(data.cases||{}).map(([k,v])=> ({ idx:Number(k), ...v }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test #{testNo}</h1>
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
            <p>Threshold: {data?.config?.threshold ?? data.threshold ?? '—'}</p>
            <p>Concurrency: {data?.config?.concurrency ?? data.concurrency ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Overall</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={data.passCount===data.totalCases? 'success':'destructive'}>
              {data.passCount===data.totalCases? 'PASS':'FAILURES'}
            </Badge>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
          <CardDescription>Full list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-sm">
            <Table>
              <THead>
                <TR>
                  <TH>#</TH>
                  <TH>Case</TH>
                  <TH>Group</TH>
                  <TH>Duration</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {cases.map(c => (
                  <TR key={c.idx}>
                    <TD className="text-xs font-mono">{c.idx}</TD>
                    <TD className="text-xs">{c.name}</TD>
                    <TD className="text-xs opacity-70">{c.group || '—'}</TD>
                    <TD className="text-xs">{c.duration != null ? `${c.duration}ms` : '—'}</TD>
                    <TD>{c.passed ? <Badge variant="success">PASS</Badge> : <Badge variant="destructive">FAIL</Badge>}</TD>
                  </TR>
                ))}
                {!cases.length && <TR><TD colSpan={5} className="text-sm opacity-60">No cases stored.</TD></TR>}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TestDetailsPage(){
  return (
    <Protected>
      <DetailsInner />
    </Protected>
  );
}
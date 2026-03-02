import numpy as np
import pandas as pd
import json
import os

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    ST_OK = True
except ImportError:
    ST_OK = False

try:
    import plotly.express as px
    import plotly.graph_objects as go
    PLOTLY_OK = True
except ImportError:
    PLOTLY_OK = False

try:
    from fairlearn.metrics import demographic_parity_ratio, demographic_parity_difference
    FL_OK = True
except ImportError:
    FL_OK = False

try:
    from aif360.datasets import BinaryLabelDataset
    from aif360.metrics import BinaryLabelDatasetMetric
    AIF_OK = True
except ImportError:
    AIF_OK = False

REQ = ["candidate_id","gender","experience_years","salary_lpa","university_tier","company_tier","cgpa","university"]

def _pick_priv(df, col, preferred=None):
    vals = df[col].dropna().astype(str).unique().tolist()
    if not vals: return None
    if preferred and str(preferred) in vals: return str(preferred)
    return str(df[col].astype(str).value_counts().idxmax())

def _grp(df, col):
    out = {}
    for v, sub in df.groupby(col, dropna=False):
        n = len(sub); sel = int(sub["selected"].sum())
        out[str(v)] = {"n": int(n), "sel": sel, "rate": (sel/n if n else 0.0)}
    return out

def _fairlearn(df, col):
    if not FL_OK: return {"error":"fairlearn_not_installed"}
    try:
        y = df["selected"].astype(int).values
        sf = df[col].astype(str).values
        if len(pd.Series(sf).dropna().unique()) < 2: return {"error":"single_group"}
        dpr = float(demographic_parity_ratio(y, y, sensitive_features=sf))
        dpd = float(demographic_parity_difference(y, y, sensitive_features=sf))
        return {"dp_ratio": dpr, "dp_diff": dpd, "rates": _grp(df, col)}
    except Exception as e:
        return {"error": str(e)}

def _aif(df, col, preferred=None):
    if not AIF_OK: return {"error":"aif360_not_installed"}
    try:
        priv = _pick_priv(df, col, preferred)
        if priv is None: return {"error":"no_groups"}
        tmp = df[[col,"selected"]].copy()
        tmp["priv"] = (tmp[col].astype(str) == str(priv)).astype(int)
        if tmp["priv"].nunique() < 2: return {"error":"single_group"}
        ds = BinaryLabelDataset(df=tmp[["selected","priv"]],
                                label_names=["selected"],
                                protected_attribute_names=["priv"])
        m  = BinaryLabelDatasetMetric(ds,
              unprivileged_groups=[{"priv":0}],
              privileged_groups=[{"priv":1}])
        br_p = float((tmp.loc[tmp["priv"]==1,"selected"].sum())/max(1, (tmp["priv"]==1).sum()))
        br_u = float((tmp.loc[tmp["priv"]==0,"selected"].sum())/max(1, (tmp["priv"]==0).sum()))
        di_raw = m.disparate_impact()
        di = float(di_raw) if np.isfinite(di_raw) else float((br_u+1e-12)/(br_p+1e-12))
        spd = float(m.statistical_parity_difference())
        return {"priv": str(priv), "br_priv": br_p, "br_unpriv": br_u, "di": di, "spd": spd, "groups": _grp(df, col)}
    except Exception as e:
        return {"error": str(e)}

def _select(df, n, basis):
    n = int(max(1, min(n, len(df))))
    b = basis.lower().strip()
    if b in ("merit","m"):
        x = df.copy()
        x["s1"] = x["experience_years"] / (x["experience_years"].max() + 1e-9)
        x["s2"] = ((x["cgpa"] - 6.5) / 3.3).clip(0,1)
        x["s3"] = x["university_tier"].map({"T1":1.0,"T2":0.75,"T3":0.5,"T3-Autonomous":0.5}).fillna(0.5)
        x["s4"] = x["company_tier"].map({"Giant":1.0,"Unicorn":0.85,"Product":0.75,"MNC":0.6,"Startup":0.5}).fillna(0.5)
        x["merit"] = (0.35*x["s1"] + 0.25*x["s3"] + 0.20*x["s4"] + 0.20*x["s2"]) * 100
        sel = x.nlargest(n, "merit")
        name = "Merit"
    elif b in ("random","r"):
        sel = df.sample(n=n, random_state=42); name = "Random"
    elif b in ("biased","b"):
        x = df.copy()
        x["score"] = x["experience_years"].astype(float) * 10.0
        x.loc[x["gender"]=="Male","score"] *= 1.4
        x.loc[x["gender"]=="Female","score"] *= 0.7
        sel = x.nlargest(n, "score"); name = "Biased"
    elif b == "ai_ranked":
        try:
            from groq import Groq
            import json
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            
            # We select a random 300 candidates first to prevent blowing up the free-tier API token limits 
            # while still strictly testing external fairness
            x = df.sample(n=min(300, len(df)), random_state=42).copy()
            
            resume_lines = []
            for _, row in x.iterrows():
                resume_lines.append(f"{row['candidate_id']}: {row['experience_years']}y, {row['university_tier']}, {row['company_tier']}")
            
            prompt = f"You are an Applicant Tracking System. I have {len(x)} candidates. I need the best {n} candidates for a Senior Role (requires high experience, T1/Giant background preferred). Here are the candidates:\n"
            prompt += "\n".join(resume_lines)
            prompt += f"\n\nReturn EXACTLY a JSON list of the {n} best candidate_id strings. Return NOTHING ELSE. Example: [\"IND001\", \"IND002\"]"

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=800
            )
            
            raw_out = completion.choices[0].message.content
            start = raw_out.find('[')
            end = raw_out.rfind(']') + 1
            if start != -1 and end != -1:
                selected_ids = json.loads(raw_out[start:end])
                sel = x[x['candidate_id'].isin(selected_ids)]
            else:
                sel = x.head(0)

            # If LLM failed to return exactly n, pad it with random from that 300-pool to satisfy the UI requirement
            if len(sel) < n:
                rem = n - len(sel)
                pool = x[~x['candidate_id'].isin(sel['candidate_id'])]
                sel = pd.concat([sel, pool.sample(n=min(rem, len(pool)), random_state=42)])
                
            sel = sel.head(n) # Ensure exact length
            name = "External ATS API (Groq)"
        except Exception as e:
            print("Groq API Error:", e)
            sel = df.sample(n=n, random_state=42); name = "External ATS API (Fallback)"
    else:  # diversity / d
        parts = []
        for g, sub in df.groupby("gender", dropna=False):
            if len(sub): parts.append(sub.sample(max(1, int(n*len(sub)/len(df))), random_state=42))
        sel = pd.concat(parts).head(n) if parts else df.head(n); name = "Diversity"
    out = df.copy()
    out["selected"] = 0
    out.loc[out["candidate_id"].isin(sel["candidate_id"]), "selected"] = 1
    return out, sel, name

def generate_charts_html(df_pool, df_sel):
    if not PLOTLY_OK:
        return "<div>Plotly not installed.</div>"
        
    df_pool = df_pool.copy()
    df_sel = df_sel.copy()
    df_pool["src"] = "Pool"
    df_sel["src"] = "Selected"
    dfa = pd.concat([df_pool, df_sel], ignore_index=True)
    
    html_parts = []
    
    # 1. Gender distribution
    gen_counts = dfa.groupby(["gender", "src"]).size().reset_index(name="count")
    fig1 = px.bar(gen_counts, x="gender", y="count", color="src", barmode="group", title="Gender Selection Comparison")
    html_parts.append(fig1.to_html(full_html=False, include_plotlyjs='cdn', default_height='400px'))
    
    # 2. 3D Scatter
    fig2 = px.scatter_3d(dfa, x="experience_years", y="cgpa", z="salary_lpa",
                         color="company_tier", symbol="src",
                         title="3D Insight: Experience vs CGPA vs Salary")
    fig2.update_traces(marker=dict(size=4))
    html_parts.append(fig2.to_html(full_html=False, include_plotlyjs=False, default_height='500px'))
    
    # 3. Box plot by Company Tier
    if "company_tier" in dfa.columns:
        fig3 = px.box(dfa, x="company_tier", y="salary_lpa", color="src", title="Salary by Company Tier")
        html_parts.append(fig3.to_html(full_html=False, include_plotlyjs=False, default_height='400px'))

    html_content = "".join([f'<div class="chart">{p}</div>' for p in html_parts])
    
    return f'''
    <html>
    <head><style>body {{ margin: 0; padding: 10px; font-family: sans-serif; }} .chart {{ margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }}</style></head>
    <body>{html_content}</body>
    </html>
    '''

def get_bias_metrics(df, n, basis):
    if len(df) == 0:
        return {"error": "Empty dataset"}
    
    miss = [c for c in REQ if c not in df.columns]
    if miss:
        return {"error": f"Missing columns: {miss}"}
        
    for c in ["salary_lpa","experience_years","cgpa","age"]:
        if c in df.columns: 
            df[c] = pd.to_numeric(df[c], errors="coerce")
            
    df, sel, name = _select(df, n, basis)
    
    notes = []
    if df["selected"].sum() < 10: 
        notes.append(f"Low positives: {int(df['selected'].sum())} — metrics may be unstable.")
    for col in ["gender","university_tier"]:
        g = _grp(df, col)
        if sum(1 for v in g.values() if v["sel"] > 0) <= 1:
            notes.append(f"One-sided positives in {col}.")

    fl_g = _fairlearn(df, "gender")
    fl_u = _fairlearn(df, "university_tier")
    aif_g= _aif(df, "gender", preferred="Male")
    aif_u= _aif(df, "university_tier", preferred="T1")
    
    pce = df[df["university"].astype(str).str.contains("Pillai", case=False, na=False)]
    pce_sel = int((pce["selected"]==1).sum())
    sal_m = df.loc[(df["selected"]==1)&(df["gender"]=="Male"), "salary_lpa"]
    sal_f = df.loc[(df["selected"]==1)&(df["gender"]=="Female"), "salary_lpa"]
    
    pay_gap = None
    if len(sal_m)>0 and len(sal_f)>0:
        pay_gap = ((sal_m.mean() - sal_f.mean()) / max(1e-12, sal_m.mean())) * 100
        
    return {
        "selection_name": name,
        "pool_size": len(df),
        "selected_size": int(df['selected'].sum()),
        "notes": notes,
        "fairlearn": {
            "gender": fl_g,
            "university_tier": fl_u
        },
        "aif360": {
            "gender": aif_g,
            "university_tier": aif_u
        },
        "custom": {
            "pce_selected": pce_sel,
            "pce_total": len(pce),
            "pce_rate": (pce_sel/len(pce)) if len(pce) else 0.0,
            "pay_gap_percent": pay_gap
        },
        "charts_html": generate_charts_html(df, sel) if len(df) <= 2000 else "",
        "selected_candidates": sel.head(100).to_dict(orient="records")
    }

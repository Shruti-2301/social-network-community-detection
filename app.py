from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import networkx as nx
import io, os

app = Flask(__name__)
RESULTS = pd.DataFrame()

def detect_communities(G):
    if G.number_of_nodes() == 0:
        return {}
    communities = nx.community.louvain_communities(G, seed=42)
    result = {}
    for i, members in enumerate(communities, 1):
        for node in members:
            result[str(node)] = i
    return result

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    global RESULTS
    file = request.files.get("file")
    if not file:
        return jsonify({"error":"Please upload a CSV file."}), 400
    try:
        df = pd.read_csv(file)
        cols = [c.lower().strip() for c in df.columns]
        df.columns = cols
        if "source" not in df.columns or "target" not in df.columns:
            return jsonify({"error":"CSV must contain 'source' and 'target' columns."}), 400

        G = nx.from_pandas_edgelist(df, "source", "target")
        communities = detect_communities(G)
        RESULTS = pd.DataFrame({
            "User": list(communities.keys()),
            "Community": list(communities.values())
        }).sort_values(["Community","User"])

        degree = dict(G.degree())
        top_user = max(degree, key=degree.get) if degree else "-"
        sizes = RESULTS["Community"].value_counts().sort_index().to_dict()

        nodes = [{"id":str(n), "community":communities.get(str(n), 0), "degree":degree.get(n,0)} for n in G.nodes()]
        edges = [{"source":str(u), "target":str(v)} for u,v in G.edges()]

        return jsonify({
            "nodes":nodes, "edges":edges,
            "stats":{
                "nodes":G.number_of_nodes(),
                "edges":G.number_of_edges(),
                "communities":len(sizes),
                "density":round(nx.density(G),4) if G.number_of_nodes()>1 else 0,
                "top_user":str(top_user),
                "top_degree":degree.get(top_user,0) if degree else 0
            },
            "community_sizes": {str(k):v for k,v in sizes.items()},
            "rows": RESULTS.head(100).to_dict(orient="records")
        })
    except Exception as e:
        return jsonify({"error":str(e)}), 400

@app.route("/sample")
def sample():
    data = """source,target
1,2
1,3
2,3
2,4
3,4
5,6
5,7
6,7
6,8
7,8
4,5
8,9
9,10
8,10
"""
    return send_file(io.BytesIO(data.encode()), mimetype="text/csv",
                     as_attachment=True, download_name="sample_social_network.csv")

@app.route("/download")
def download():
    if RESULTS.empty:
        return jsonify({"error":"Run an analysis first."}), 400
    out=io.BytesIO()
    RESULTS.to_csv(out,index=False)
    out.seek(0)
    return send_file(out,mimetype="text/csv",as_attachment=True,
                     download_name="community_results.csv")

if __name__ == "__main__":
    app.run(debug=True)

# Social Network Community Detection

FML mini project website for detecting communities in social networks using the Louvain community detection algorithm.

## Features
- CSV upload
- Dataset validation and preview
- Interactive network visualization
- Louvain community detection
- Network statistics
- Community-size bar chart
- Community results table
- Download detected communities
- Sample dataset download

## CSV format
Your CSV must contain exactly these two required columns:

source,target

Each row represents a connection between two users/nodes.

## Run in VS Code

1. Open this folder in VS Code.
2. Open Terminal.
3. Create a virtual environment:
   python -m venv .venv
4. Activate it on Windows:
   .venv\Scripts\activate
5. Install packages:
   pip install -r requirements.txt
6. Run:
   python app.py
7. Open the URL shown in the terminal, normally:
   http://127.0.0.1:5000

## Project flow
Upload CSV -> Build Graph -> Louvain Detection -> Visualize Communities -> Download Results

let chart=null;
const colors=["#168a75","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#ec4899","#84cc16"];

document.getElementById("uploadForm").addEventListener("submit", async e=>{
 e.preventDefault();
 const msg=document.getElementById("message");
 const file=document.getElementById("file").files[0];
 if(!file)return;
 msg.innerHTML='<div class="alert alert-info">Analyzing network...</div>';
 const fd=new FormData(); fd.append("file",file);
 try{
   const r=await fetch("/analyze",{method:"POST",body:fd});
   const data=await r.json();
   if(!r.ok) throw new Error(data.error||"Analysis failed");
   msg.innerHTML='<div class="alert alert-success">Analysis completed successfully.</div>';
   updateDashboard(data);
 }catch(err){msg.innerHTML='<div class="alert alert-danger">'+err.message+'</div>'}
});

function updateDashboard(d){
 document.getElementById("nodes").textContent=d.stats.nodes;
 document.getElementById("edges").textContent=d.stats.edges;
 document.getElementById("communities").textContent=d.stats.communities;
 document.getElementById("density").textContent=d.stats.density;
 document.getElementById("topuser").textContent=d.stats.top_user;
 document.getElementById("topdegree").textContent=" "+d.stats.top_degree+" connections";
 renderGraph(d.nodes,d.edges);
 renderChart(d.community_sizes);
 const body=document.getElementById("results"); body.innerHTML="";
 d.rows.forEach(r=>{body.innerHTML+=`<tr><td>${r.User}</td><td><span class="badge" style="background:${colors[(r.Community-1)%colors.length]}">${r.Community}</span></td></tr>`});
}

function renderGraph(nodes,edges){
 const cy=cytoscape({
  container:document.getElementById("cy"),
  elements:{nodes:nodes.map(n=>({data:{id:n.id,community:n.community,degree:n.degree}})),
            edges:edges.map((e,i)=>({data:{id:"e"+i,source:e.source,target:e.target}}))},
  style:[
   {selector:"node",style:{"background-color":ele=>colors[(ele.data("community")-1)%colors.length],"label":"data(id)","width":ele=>22+ele.data("degree")*3,"height":ele=>22+ele.data("degree")*3,"font-size":10,"color":"#172033","text-valign":"center","text-halign":"center","border-width":2,"border-color":"#fff"}},
   {selector:"edge",style:{"line-color":"#cbd5e1","width":1.5,"curve-style":"bezier"}}
  ],
  layout:{name:"cose",animate:true,padding:35}
 });
 window.cy=cy;
}

function renderChart(sizes){
 const labels=Object.keys(sizes).map(x=>"Community "+x), vals=Object.values(sizes);
 if(chart)chart.destroy();
 chart=new Chart(document.getElementById("communityChart"),{
  type:"bar",data:{labels,datasets:[{label:"Members",data:vals,backgroundColor:labels.map((_,i)=>colors[i%colors.length]),borderRadius:7}]},
  options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}
 });
}

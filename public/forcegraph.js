document.writeln("<script type='text/javascript' src='//unpkg.com/3d-force-graph'></script>");
document.writeln("<script type='text/javascript' src='//unpkg.com/3d-force-graph-vr'></script>")
//document.writeln("<script type='text/javascript' src='//d3js.org/d3.v4'></script> charset='utf-8'")
//document.writeln("<script type='text/javascript' src='d3-scale-chromatic.v1.min.js' charset='utf-8'></script>")


let data = []
let relationships = []
let formatted = {
    'nodes': [],
    'links': []
}

function formatData(response) {
    data = response
    data.forEach((e, i) => {
        data[i] = data[i].n
    })
    data.forEach(e => {
        e['id'] = e.identity
        if (e.properties.hasOwnProperty('title')) {
            e['name'] = e.properties.title
            e['val'] = 1 //e.properties.released
            e['group'] = e.labels[0]
        } else {
            e['name'] = e.properties.name
            e['val'] = 1 //e.properties.born
            e['group'] = e.labels[0]
        }
    })
    formatted.nodes = data
    return formatted
}

function formatRelationship(response) {
    relationships = response
    relationships.forEach((e, i) => {
        relationships[i] = relationships[i].r
    })
    relationships.forEach(e => {
        e['source'] = e.start
        e['target'] = e.end
        e['type'] = e.type
        e['value'] = e.type.length
    })
    formatted.links = relationships
    return formatted
}

function fetchRelationship() {
    axios.get('/links')
        .then(function(response) {
            console.log(response.data);
            // formatRelationship(response.data)
            renderGraph(formatRelationship(response.data))
        })
        .catch(function(error) {
            console.log(error);
        });
    //let respLink = localStorage.getItem("links");
    //renderGraph(formatRelationship(respLink))
}

function fetchData() {
    axios.get('/nodes')
        .then(function(response) {
            formatData(response.data)
            fetchRelationship()
        })
        .catch(function(error) {
            console.log(error);
        });
    //console.log(localStorage.length)
    //let respNode = localStorage.getItem("nodes")
    //console.log(respNode)
    //formatData(respNode)
    //fetchRelationship()

}
var Graph
var groupMap

function renderGraph(data) {

    const highlightNodes = new Set();
    const highlightLinks = new Set();
    groupMap = new Map();
//    const distance = 1400;

    let hoverNode = null;
    let gData = data;

// cross-link node objects
    gData.links.forEach(link => {
      const a = gData.nodes[link.source];
      const b = gData.nodes[link.target];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });


//    let elem = document.getElementById('3d-graph')
//    const Graph = ForceGraphVR()
//        (elem)
//        .graphData(data)
//        .nodeAutoColorBy('group')
//        .linkAutoColorBy('type')
//        .linkDirectionalParticles('value')
//        .linkDirectionalParticleSpeed(d => d.value * 0.001)
//        .nodeThreeObject(node => {
//          const sprite = new SpriteText(node.name);
//          sprite.color = node.color;
//          sprite.textHeight = 8;
//          return sprite;
//        })
//        .nodeLabel(node => `${node.name}`)
//        .onNodeHover(node =>
//            elem.style.cursor = node ? 'pointer' : null);
//        Graph = ForceGraphVR()
        Graph = ForceGraph3D()
        (document.getElementById('3d-graph'))
        .graphData(gData)
        .nodeColor(node => {
            if (highlightNodes.has(node))
              if (node === hoverNode)
                return 'rgb(255,0,0,1)'
              else
                return 'rgba(255,160,0,0.8)'
            else
                if (groupMap.has(node.group))
                    return groupMap.get(node.group)
                else {
                    randomColor = getRandomColor()
                    groupMap.set(node.group,randomColor)
                    return randomColor
                }
        })
        .onNodeClick(node => {
        // Aim at node from outside it
        const distance = 400;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition({
            x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
            );
        })
        .linkLabel('type')
        .linkWidth(link => highlightLinks.has(link) ? 4 : 1)
        .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
        .linkDirectionalParticleWidth(4)
        .onNodeHover(node => {
          // no state change
          if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

          highlightNodes.clear();
          highlightLinks.clear();
          if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
            node.links.forEach(link => highlightLinks.add(link));
          }

          hoverNode = node || null;

          updateHighlight();
        })
        .onLinkHover(link => {
          highlightNodes.clear();
          highlightLinks.clear();

          if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
          }

          updateHighlight();
        });
//        .enableNodeDrag(false)
//        .enableNavigationControls(false)
//        .showNavInfo(false)
//        .cameraPosition({ z: distance });
//        let angle = 0;
//            setInterval(() => {
//              Graph.cameraPosition({
//                x: distance * Math.sin(angle),
//                z: distance * Math.cos(angle)
//              });
//              angle += Math.PI / 300;
//            }, 100);
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function updateHighlight() {
  // trigger update of highlighted objects in scene
  Graph
    .nodeColor(Graph.nodeColor())
    .linkWidth(Graph.linkWidth())
    .linkDirectionalParticles(Graph.linkDirectionalParticles());
}

function createLegend(){
    // select the svg area
    var Svg = d3.select("#my_dataviz2")

    // create a list of keys
    var keys = groupMap.keys()

    // Usually you have a color scale in your chart already
    var color = groupMap.values();

    console.log("Legend")
    console.log(keys)
    console.log(color)
//    // Add one dot in the legend for each name.
//    Svg.selectAll("mydots")
//      .data(keys)
//      .enter()
//      .append("circle")
//        .attr("cx", 100)
//        .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
//        .attr("r", 7)
//        .style("fill", function(d){ return color(d)})
//
//    // Add one dot in the legend for each name.
//    Svg.selectAll("mylabels")
//      .data(keys)
//      .enter()
//      .append("text")
//        .attr("x", 120)
//        .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
//        .style("fill", function(d){ return color(d)})
//        .text(function(d){ return d})
//        .attr("text-anchor", "left")
//        .style("alignment-baseline", "middle")

}

fetchData()
//createLegend()

const express = require('express');
const neo4j = require('neo4j-driver');
const path = require('path');
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

let url = '';
let user = '';
let password = '';


var driver
var session

var nodes
var links

app.get('/', (req, res)=>{
    if (!url || !user || !password)
        res.redirect('/login');
    else
        res.redirect('/dv');
});

app.get('/login', (req, res)=>{
    res.sendFile(__dirname + '/static/login.html');
});
app.post('/login', async (req, res) => {
    try{
        url = req.body.url;
        user = req.body.username;
        password = req.body.password;

        console.log("URI: "+url)
        console.log("User: "+user)
        console.log("Password: "+password)

        driver = neo4j.driver(url, neo4j.auth.basic(user, password),{ disableLosslessIntegers: true })
          try {
              await driver.verifyConnectivity()
               session = driver.session()
          } catch (error) {
            console.log(`connectivity verification failed. ${error}`)
            res.status(401).send('Incorrect Username and/or Password!');
          }
          console.log('Driver created')
          res.redirect('/dv')
        } catch(error){
        console.log(`Error. ${error}`)
    }
//    renderData();
});
app.get('/dv', (req, res)=>{
//  res.sendFile(path.join(__dirname + '/html/basic.html'));
  res.sendFile(path.join(__dirname + '/html/named.html'));
});

app.get('/nodes', async (req, res)=>{
    try {
           const readQueryNode = `MATCH (n) RETURN n`
             const readResultNode = await session.readTransaction(tx =>
               tx.run(readQueryNode)
             )
             let arrNode = []
             readResultNode.records.forEach(record => {
               arrNode.push(record.toObject())
             })
          const data = JSON.stringify(arrNode)
        console.log(nodes)
//        var data = JSON.stringify(nodes)
          res.send(data)
      } catch (error) {
          console.log("error", error);
      }
});

app.get('/links', async (req, res)=>{
      try {
            const readQueryLink = `MATCH ()-[r]->()
                                     RETURN r`

            const readResultLink = await session.readTransaction(tx =>
            tx.run(readQueryLink)
            )
            let arrLink = []
            readResultLink.records.forEach(record => {
            arrLink.push(record.toObject())
            })
            const data = JSON.stringify(arrLink)
//            var data = JSON.stringify(links);
            res.send(data)
        } catch (error) {
            console.log("error", error);
        }
});

app.listen(PORT, ()=>{
  console.log("Server running");
});

function renderData() {
    session
          .run('MATCH (n)-->(m) RETURN { id: id(n), label:head(labels(n)), caption:n.name } as source, { id: id(m), label:head(labels(m)), caption:m.name } as target LIMIT $limit', {limit: neo4j.int(5000)})
          .then(function (result) {
            nodes = {}
            links = result.records.map(r => {
    	       var source = r.get('source');source.id = source.id.toNumber();
               nodes[source.id] = source;
    	       var target = r.get('target');target.id = target.id.toNumber();
               nodes[target.id] = target;
    	       return {source:source.id,target:target.id}
    	    });
    	    console.log(nodes)
    	    console.log(links)
    session.close();
    });
}
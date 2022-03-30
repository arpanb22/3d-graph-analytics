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
//        url = req.body.url;
//        user = req.body.username;
//        password = req.body.password;
        url = 'neo4j+s://3235df21.databases.neo4j.io:7687';
        user = 'neo4j';
        password = 'welcome1';

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
            res.send(data)
        } catch (error) {
            console.log("error", error);
        }
});

app.listen(PORT, ()=>{
  console.log("Server running");
});
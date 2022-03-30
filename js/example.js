(async() => {
 const neo4j = require('neo4j-driver')
 const fs = require('fs');

 const uri = 'neo4j+s://3235df21.databases.neo4j.io:7687';
 const user = 'neo4j';
 const password = 'welcome1';

 const driver = neo4j.driver(uri, neo4j.auth.basic(user, password),{ disableLosslessIntegers: true })
 const session = driver.session()

 try {

   const readQueryNode = `MATCH (n)
                      RETURN n`
   const readResultNode = await session.readTransaction(tx =>
     tx.run(readQueryNode)
   )
   let arrNode = []
   readResultNode.records.forEach(record => {
     arrNode.push(record.toObject())
   })

   const readQueryLink = `MATCH ()-[r:ACTED_IN]->()
                         RETURN r`
      const readResultLink = await session.readTransaction(tx =>
        tx.run(readQueryLink)
      )
      let arrLink = []
      readResultLink.records.forEach(record => {
        arrLink.push(record.toObject())
      })

//      let data = {
//       nodes : arrNode,
//       links : arrLink
//      };
//    console.log("From example.js")
//    console.log(JSON.stringify(data))
//    var fileJSON = JSON.stringify(data);
//    fs.writeFile("data.json", fileJSON, function(err, result) {
//        if(err) console.log('error', err);
//    });

//  fs.writeFile("records.json", JSON.stringify(arrNode), function(err, result) {
//          if(err) console.log('error', err);
//      });
//    fs.writeFile("relationships.json", JSON.stringify(arrLink), function(err, result) {
//            if(err) console.log('error', err);
//        });
    localStorage.removeItem("nodes");
    localStorage.removeItem("links");
    localStorage.setItem("nodes",JSON.stringify(arrNode))
    localStorage.setItem("links",JSON.stringify(arrLink))

 } catch (error) {
   console.error('Something went wrong: ', error)
 } finally {
   await session.close()
 }

 // Don't forget to close the driver connection when you're finished with it
 await driver.close()
})();
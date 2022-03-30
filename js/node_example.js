(async() => {
 const neo4j = require('neo4j-driver')
 const fs = require('fs');

 const uri = 'neo4j+s://3235df21.databases.neo4j.io:7687';
 const user = 'neo4j';
 const password = 'welcome1';

 const driver = neo4j.driver(uri, neo4j.auth.basic(user, password),{ disableLosslessIntegers: true })
 const session = driver.session()

 const person1Name = 'Alice'
 const person2Name = 'David'

 try {
   // To learn more about the Cypher syntax, see https://neo4j.com/docs/cypher-manual/current/
   // The Reference Card is also a good resource for keywords https://neo4j.com/docs/cypher-refcard/current/
   const writeQuery = `MERGE (p1:Person1 { name: $person1Name })
                       MERGE (p2:Person1 { name: $person2Name })
                       MERGE (p1)-[:KNOWS]->(p2)
                       RETURN p1, p2`

   // Write transactions allow the driver to handle retries and transient errors
   const writeResult = await session.writeTransaction(tx =>
     tx.run(writeQuery, { person1Name, person2Name })
   )
   writeResult.records.forEach(record => {
     const person1Node = record.get('p1')
     const person2Node = record.get('p2')
     console.log(
       `Created friendship between: ${person1Node.properties.name}, ${person2Node.properties.name}`
     )
   })

   const readQueryNode = `MATCH (n:Person1)
                      RETURN n`
   const readResultNode = await session.readTransaction(tx =>
     tx.run(readQueryNode)
   )
   let arrNode = []
   readResultNode.records.forEach(record => {
     arrNode.push(record.toObject()['n'])
   })

   const readQueryLink = `MATCH (:Person1)-[r:KNOWS]->(:Person1)
                         RETURN r`
      const readResultLink = await session.readTransaction(tx =>
        tx.run(readQueryLink)
      )
      let arrLink = []
      readResultLink.records.forEach(record => {
        arrLink.push(record.toObject()['r'])
      })

      let data = {
       nodes : arrNode,
       links : arrLink
      };
    console.log(JSON.stringify(data))
    var fileJSON = JSON.stringify(data);
    fs.writeFile("data.json", fileJSON, function(err, result) {
        if(err) console.log('error', err);
    });
 } catch (error) {
   console.error('Something went wrong: ', error)
 } finally {
   await session.close()
 }

 // Don't forget to close the driver connection when you're finished with it
 await driver.close()
})();
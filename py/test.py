import logging
import sys

from neo4j import GraphDatabase
import csv


def enable_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    logging.getLogger("neo4j").addHandler(handler)
    logging.getLogger("neo4j").setLevel(logging.DEBUG)


# establish the connection
with open("../credentials/cred2.txt") as f1:
    data = csv.reader(f1, delimiter=",")
    for row in data:
        username = row[0]
        pwd = row[1]
        uri = row[2]
print(username, pwd, uri)
driver = GraphDatabase.driver(uri=uri, auth=(username, pwd))
session = driver.session()


def create_node(name, id):
    q1 = """
    MERGE (n:Employee{NAME:$name,ID:$id})
    """
    map = {"name": name, "id": id}
    try:
        session.run(q1, map)
        print("employee node is created with employee name = " + name + " and id = " + str(id))
    except Exception as e:
        print(str(e))


def display_node():
    q1 = """
    match (n:Employee) return n.NAME as NAME ,n.ID as ID
    """
    results = session.run(q1)
    data = results.data()
    print("Data: " + str(data))
    f = open("../data/console.txt", "w")
    f.write(str(data))
    return data


def delete_all_node():
    query = """MATCH (n:Employee)
            DELETE n"""
    try:
        session.run(query)
        print("All Employee Node deleted")
    except Exception as e:
        print(str(e))


if __name__ == "__main__":
    enable_logging()
    delete_all_node()
    create_node("Arpan", 1)
    create_node("Sachin", 2)
    create_node("Manish", 3)
    display_node()
    driver.close()

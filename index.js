console.log("Fast Mongo Export")

const mongo = require('mongodb')
const { URL } = require('url')
const JSONStream = require('JSONStream')
const fs = require("fs")
const ProgressBar = require('progress')
const databaseURL = process.env.DATABASE_URL
const collection_name = process.env.COLLECTION
const urlObject = (new URL(databaseURL))

const connect = function (urlObject) {
  var host = urlObject.host
  console.log('Connecting to mongodb at', host)
  return mongo.MongoClient.connect(urlObject.href, { useNewUrlParser: true })
    .then(function (client) {
      console.log('Connected to mongodb at', host)
      return client.db()
    })
}

const insert_many = function(db, collection_name, callback) {
  console.log("Inserting some test data...")
  db.collection(collection_name).insertMany([
    { a: 1, b: "2", c: true },
    { a: 10, b: "20", c: false },
    { a: 100, b: "200", c: true },
    { a: 1000, b: "2000", c: false },
    { a: 10000, b: "20000", c: true }
  ], function(err, result){
    callback(db, collection_name)
  })
}

const export_collection = function (db, collection_name) {
  const cursor = db.collection(collection_name).find()
  cursor.count(function (err, count) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    const bar = new ProgressBar('Exporting [:bar] :current/:total (:percent) Elapsed: :elapseds, ETA: :etas', {
      total: count,
      width: 50
    })
    const stream = cursor.stream()
    const file = fs.createWriteStream(process.env.OUTPUT)
    stream.on('data', function () {
      bar.tick()
    })
    stream.on('error', function (err) {
      console.error(err)
      process.exit(1)
    })
    file.on('close', function () {
      process.exit(0)
    })
    stream
      .pipe(JSONStream.stringify('', '\n', '\n'))
      .pipe(file)
  })
}

connect(urlObject)
  .then(function (db) {
    if (process.env.INSERT_TEST_DATA === '1')
      insert_many(db, collection_name, export_collection)
    else
      export_collection(db, collection_name)
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })

// for i in 19 20; do docker run--rm - v / mnt / data / social - analytics / dumps: /data --link objective_sammet:db -e DATABASE_URL=mongodb:/ / db: 27017 / social_analytics - e COLLECTION =2018_08_$i - e OUTPUT = /data/dump_2018_08_$i.json - d qcrisw / fastmongoexport: 3; done
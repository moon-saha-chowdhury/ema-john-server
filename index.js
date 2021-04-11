const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

//Middle wire
const app = express()
app.use(bodyParser.json());
app.use(cors());
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello World! I am Here')
})

//Creating MongoDB connection
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sr6rc.mongodb.net/emaJohnStore?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db("emaJohnStore").collection("products");
  const ordersCollection = client.db("emaJohnStore").collection("orders");
  // perform actions on the collection object
//   console.log('database connected successfully');

 //Insert Product into DB

 app.post('/addProduct',(req, res)=>{
     const product = req.body;
     productsCollection.insertOne(product)
     .then(result =>{
         console.log(result.insertedCount);
         res.send(result.insertedCount)
     })
 })

 //Loading data from database through search input
 app.get('/products',(req,res)=>{
  //  productsCollection.find({}).limit(20) mane onk data theke 20 ta dao
  const search = req.query.search;
  productsCollection.find({name: {$regex:search}})
   .toArray((err,documents)=>{
     res.send(documents);
   })
 })


 //Loading single item by product key
 app.get('/products/:key',(req,res)=>{
  productsCollection.find({key: req.params.key})
  .toArray((err,documents)=>{
    res.send(documents[0]);
    //we are trying to returning a single item from an array so that we have used documents[0]here..
  })
})

//Sending data to review page through client side

app.post('/productByKeys',(req,res)=>{
  const productKeys = req.body;
  productsCollection.find({key:{$in:productKeys} })
  .toArray((err,documents)=>{
    res.send(documents);
  })
})


//Insert shipment data in a new collection in db
app.post('/addOrder',(req, res)=>{
  const order = req.body;
  ordersCollection.insertOne(order)
  .then(result =>{
      console.log(result.insertedCount);
      res.send(result.insertedCount>0)
  })
})




});


app.listen(process.env.PORT || port);
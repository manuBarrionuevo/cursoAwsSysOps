var http = require('https');

const maxLoopCount =1000;
let currentLoopCount =1;
const url = require('url');
let parsedUrl = null;

// Get process.stdin as the standard input object.
var standard_input = process.stdin;

// Set input character encoding.
standard_input.setEncoding('utf-8');

// Prompt user to input data in console.
console.log("Please enter the api url for your lambda application.");

// When user input data and click enter key.
standard_input.on('data', async (data)=> {  
    parsedUrl=  url.parse(data)
   await startLoop();
    process.exit()
});

function delay(seconds=2){
 return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
function getAllItems(){
  return new Promise((resolve, reject) => {
var request = http.request({
 
  host: parsedUrl.host,
  port: 443,
  path: parsedUrl.path
}, (response)=>{

  var str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
  resolve()
  });
});
request.on('error', (error) => {
 reject(error)
})
request.end()
  })
}

function createItem(intentionalFail=false){
  return new Promise((resolve, reject) => {
  let data=null;
  if(intentionalFail){
    data= {}//pass empty body to fail
  }
  else{
    data= {
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5) // create random id
    }
  }

  data = JSON.stringify(data)
 
  const createItemRequest = http.request(
    {
   
      host: parsedUrl.host,
      port: 443,
      path: parsedUrl.path,
      method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    }
    }
    , (res) => {
  
    res.on('data', (d) => {
      process.stdout.write(d)
    })
    res.on('end', function () {
      resolve()
      });
  })
  
  createItemRequest.on('error', (error) => {
    console.error(error)
    reject(error)
  })
  
  createItemRequest.write(data)
  createItemRequest.end()
})
}
 function  startLoop(){
  return new Promise(async (resolve, reject) => {
    while(true){
      console.log(`\n ${currentLoopCount} out of ${maxLoopCount}`)
      await delay(1);
      try{  await createItem()}catch(err){}
      try{  await createItem(true)}catch(err){}
      currentLoopCount+=1;
      
      if(maxLoopCount<=currentLoopCount){
       console.log(`\n Api call terminated after ${maxLoopCount} requests`)
       resolve()
       return;
    }
  }
 
})
}



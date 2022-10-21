// main.js
function makeRequest(){
  postMessage("System Initiated...");
// GET request using fetch()

fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/")


	// Converting received data to JSON
	.then(response => {
    response.json();
    console.log("response receieved!");
    setTimeout(3000);
  })
  //.then(_alert => window.alert("Hello world"))
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
  console.log("It is not working");
 
 
}

makeRequest();

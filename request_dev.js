// function makeRequest(){
//   postMessage("System Initiated...");
//   var requestOptions = {
//     method: 'GET',
//     redirect: 'follow'
//   };

// fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
// .then(response => {
//   response.json();
//   console.log("response receieved!");
// })
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));
//   console.log("work done!=");
//   //console.log("response" + response)
//   //console.log("result" + result)

// }

// makeRequest();


// main.js
function makeRequest(){
  postMessage("System Initiated...");
// GET request using fetch()

fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/")

	// Converting received data to JSON
	.then(response => {
    response.json();
    console.log("response receieved!");
  })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    console.log("work done!=");

	// Display result
	//document.getElementById("Result").innerHTML = li;

}

makeRequest();

// // main.js
// function makeRequest(){
//   postMessage("System Initiated...");
// // GET request using fetch()

// fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/")


// 	// Converting received data to JSON
// 	// .then(response => {
//   //   response.json();
//   //   console.log("response receieved!");
//   //   //
//   //   setTimeout(3000);
//   // })
//   // //.then(_alert => window.alert("Hello world"))
//   // .then(result => console.log(result))
//   // .catch(error => console.log('error', error));
//   // console.log("It is not working");
 
 
// }

// makeRequest();
// const axios = require('axios').default;
// function makeRequest(path) {
//   postMessage("System Initiated...");
// 	return new Promise(function (resolve, reject) {
// 		axios.get(path).then(
// 			(response) => {
// 				var result = response.data;
// 				console.log('Processing Request');
// 				resolve(result);
// 			},
// 				(error) => {
// 				reject(error);
// 			}
// 		);
// 	});
// }

// async function main() {
// 	var result = await makeRequest('https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/');
// 	console.log(result.result);
// 	console.log('Statement 2');
// }
// main();
function makeRequest(){
     postMessage("System Initiated...");
const fetchPromise = fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/");
const main = document.getElementById("Result");
// Loading Placeholder
main.innerHTML = "<p>Loading...";
fetchPromise.then(response => {
  return response.json();
})
// function listOfNames(people) {
//   const names = people.map(person => `<li>${person.name}</li>`).join("\n");
//   return `<ul>${names}</ul>`
// }
}
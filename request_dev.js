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

function jsonData(url) {
  return fetch('https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/')
    .then(res => {
      if (res.status == 200) {
        return res.json();
      } else {
        throw new Error(res.status);
      }
    });
}

jsonData('non') 
  .catch(); // Error: 404
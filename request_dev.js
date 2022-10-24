function makeRequest(){
  postMessage("System Initiated...");
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
    .then(response => {
      response.json();
      console.log("response receieved!");
  
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

makeRequest();


// async function makeRequest() {
//   let response = await fetch('https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/');

//   console.log(response.status); // 200
//   console.log(response.statusText); // OK

//   if (response.status === 200) {
//       let data = await response.text();
//       // handle data
//   }
// }
// makeRequest();
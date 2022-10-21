function makeRequest(){
  postMessage("System Initiated...");
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
  .then(response => {
    console.log(response.json());
    return response.json();
  })
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
  console.log("work done!=");
  //console.log("response" + response)
  //console.log("result" + result)

}

makeRequest();

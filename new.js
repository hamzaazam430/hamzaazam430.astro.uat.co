function makeRequest(){
  postMessage("System Initiated...");
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("https://flujp7e2qiftmsvzvvmcqobvga0zvynu.lambda-url.us-east-1.on.aws/", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

makeRequest();
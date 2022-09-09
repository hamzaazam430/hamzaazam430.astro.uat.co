function makeRequest(){
  postMessage("API CALLED");
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("https://eanooxhmk6nzczju7oppecbxty0qlpkc.lambda-url.us-east-1.on.aws/", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

makeRequest();
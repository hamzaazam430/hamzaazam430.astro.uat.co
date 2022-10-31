  function makeRequest(){
    postMessage("System Initiated...");
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
  
    fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }
  
  makeRequest();
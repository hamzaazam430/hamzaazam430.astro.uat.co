function makeRequest(){
  postMessage("System Initiated...");
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  const r=fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
  var data=r.json();
  console.log("work done!="+data);
  console.log("response" + response)
  console.log("result" + result)

    //.then(response => response.text())
    //.then(result => console.log(result))
    //.catch(error => console.log('error', error));
}

makeRequest();

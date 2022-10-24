var makeRequest = function(){
    postMessage("System Initiated...");
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    const fetchPromise = fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/",requestOptions)
    .then(response => {
          response.json();
          console.log("response receieved!");
      
        })
  console.log(fetchPromise);
  widows.alert("Complete Processing");
      }
  
  makeRequest();
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

  // console.log("Entered second function");
  // let myPromise = new Promise(function(myResolve, myReject) {
  //   // "Producing Code" (May take some time)
  //   var requestOptions = {
  //     method: 'GET',
  //     redirect: 'follow'
  //   };
  // fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
  //   .then(response => {
  //     response.json();
  //     console.log("response receieved!");
  
  //   })
  //   //.then(response => response.text())
  //   .then(result => console.log(result))
  //   .catch(error => console.log('error', error));
    
    }

makeRequest();



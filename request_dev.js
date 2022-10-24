var makeRequest = function(){
  postMessage("System Initiated...");
  const fetchPromise = fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/");
console.log(fetchPromise);
alert("Complete Processing");

 
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
    
  //     myResolve(); // when successful
  //     myReject();  // when error
  //   });
    
  //   // "Consuming Code" (Must wait for a fulfilled Promise)
  //   myPromise.then(
  //     function(value) { /* code if successful */ },
  //     function(error) { /* code if some error */ }
  //   );
      
    
    }




makeRequest();



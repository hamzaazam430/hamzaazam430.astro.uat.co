var makeRequest = function(){
  postMessage("System Initiated...");
 
  console.log("Entered second function");
return new Promise(resolve => {
    setTimeout(function() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
    fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/", requestOptions)
      .then(response => {
        response.json();
        console.log("response receieved!");
    
      })
      //.then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
      resolve("\t\t This is second promise");
      console.log("Returned second promise");
    }, 4000);
});
};


makeRequest();


async function makeRequest() {
  let response = await fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/")
  // let data = await response.text();
  .then(response => {
    response.json();
    console.log("response receieved!");

  })
  //.then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
  console.log(data);
}
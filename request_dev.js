function makeRequest(){
    let requests =  fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/");

    Promise.all(requests)
      .then(responses => {
        // all responses are resolved successfully
        for(let response of responses) {
          alert(`${response.url}: ${response.status}`); // shows 200 for every url
        }
    
        return responses;
      })
      console.log("result" + responses);
    //   // map array of responses into an array of response.json() to read their content
    //   .then(responses => Promise.all)
    //   // all JSON answers are parsed: "users" is the array of them
    //   .then(user => alert(user.data));
  
}
makeRequest();
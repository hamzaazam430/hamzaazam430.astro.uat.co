function makeRequest(){
     postMessage("System Initiated...");
const fetchPromise = fetch("https://oaf7f6gd22mwknracpnhfkilqm0tpsii.lambda-url.us-east-1.on.aws/");
const main = document.getElementById("Result");
// Loading Placeholder
main.innerHTML = "<p>Loading...";
fetchPromise.then(response => {
  return response.json();
})

}
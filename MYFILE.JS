const aws = require("aws-sdk");
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  Bucket: process.env.S3_BUCKET_NAME,
});
const yaml = require("js-yaml");
const xlsxFile = require("read-excel-file/node");
var qs = require("qs");
var axios = require('axios');
var fs = require('fs');
var util = require('util');


const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const awsConfig = {
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.region,
};

aws.config.update(awsConfig);

//================================================================
//                      CLASS VARIABLES
//================================================================

var excel_file;
var excel_file_sheet;
var row_containing_parameter_names;

var yaml_data;

var records = [];
var record_types = {};
var bucketName = process.env.S3_BUCKET_NAME;

var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var hostname = "https://astrotest.cdgportal.com";
var url = {
  query: hostname + "/main/infr/m_infr_query_table.php",
  api: hostname + "/main/infr/m_infr_app_request.php"
}

var excel_sheet_objects = [];

var subscriberId = "";
var guarantorId = "";
var sessionId = "";
var accountId = "";
var serviceAddressId = "";

var equipments_added = [];
var site_services_added = [];
var product_codes = [];
var service_numbers = [];
var cdf_fields = [];

var existing_subscriber;
var response_message = "";
var log_data = "";

var apiSetting = {
  companyId: "3240",
  requestUserId: "demombs8",
  apiReturnFormat: "JSON",
};

var config = {
  method: 'post',
  url: '',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': 0

  },
  data: null
};

var MBSEqpAttrCodeMap = {
  "Active Subscriptions": "ACTV_SUBSCRP",
  "Address Book Opt": "ADDR_BOOK",
  "Address Eqp Sharing": "ADDR_SHARE",
  "Administrators": "ADMINS",
  "Agent Call Rules": "AGENT_RULES",
  "Agents": "AGENTS",
  "Aliases": "ALIASES",
  "Busy Route Number": "BUSY_ROUTE",
  "Call Ans Grp Type": "CAG_TYPE",
  "Charging Number": "CHARGE_NO",
  "Client Type": "CLIENT_TYPE",
  "Customer Owned": "COE",
  "Contact Phone Number": "CONTACT_NO",
  "Cust Info 1": "CUST_INFO_1",
  "Device Password": "DEV_PASSWORD",
  "Device Password opt": "DEV_PWD_OPT",
  "Provisioned Password": "DEV_PWD_PROV",
  "E911 Call back No.": "E911_CALLBAK",
  "E911 Notif. Email": "E911_EMAIL",
  "E911 Notif SMS No.": "E911_SMS_NO",
  "Firmware": "FIRMWARE",
  "Group Tag": "GROUP_TAG",
  "Hot Desk": "HOT_DESK",
  "Location": "LOCATION",
  "Max Group Size": "MAX_GROUP_SZ",
  "Max Call Queue Size": "MAX_QUEUE_SZ",
  "Name": "NAME",
  "No Answer Action": "NO_ANS_ACTN",
  "Numbers": "NUMBERS",
  "Public Name": "PUBLIC_NAME",
  "Public Number": "PUBLIC_NO",
  "Shareable": "SHARE",
  "Site": "SITE",
  "Site Name": "SITE_NAME",
  "Site ID Prefix": "SITE_PREFIX",
  "Status": "STATUS",
  "Sub domain": "SUB_DOMAIN",
  "Terminal Type": "TERM_TYPE",
  "Time Zone": "TIMEZONE",
  "User can set LKEYs": "USER_KEY_OK",
  "Vendor": "VENDOR",
  "Wait Time": "WAIT_TIME",
};

exports.handler = async function(event, context) {

  // var response = await querySubscriberByName();
  // console.log(JSON.stringify(response));

  // const ssm = new(require('aws-sdk/clients/ssm'))();
  // const data = await ssm.getParameters({
  //       Names: [`Astro_System_Status`]
  //   }).promise();
  //   var status = data["Parameters"][0]["Value"];
  //   if (status === 'Idle') {
  //     console.log("Started Running the System");
  //     var params = {
  //       Name: 'Astro_System_Status',
  //       Value: 'Running',
  //       Overwrite: true,
  //       Type: 'String'
  //     };
  //     await ssm.putParameter(params).promise();
  //     setTimeout(async function() {
  //       console.log("System Ended running");
  //       var params = {
  //         Name: 'Astro_System_Status',
  //         Value: 'Idle',
  //         Overwrite: true,
  //         Type: 'String'
  //       };
  //       await ssm.putParameter(params).promise();
  //     }, 60000);
  //   } else {
  //     return "System is already running";
  //   }
  // ============
  const promise = await new Promise(async function(resolve, reject) {
    console.log("in promise, handler");
    await loadConfig();
    // await resolve("System Executed");
    console.log("loadconfig executed successfully");

  });

  //console.log("outside handler"); 

};

async function createFileS3Log(system_logs) {
  var clientS3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY
    },
    region: process.env.S3_REGION,
  });

  await new Promise(async function(resolve, reject) {
    //var currentTimeInMilliseconds = Date.now().toString(32);
    var params = {
      Body: system_logs,
      ACL: 'public-read-write',
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'Logs/system_logs.txt'.split('.').join(' ' + new Date().toISOString().replace('T', ' ').replace(':', ':').substr(0, 19) + '.'),
      ContentType: 'text/plain',
      Metadata: {
        'ctime': process.env.X_AMZ_META_CTIME,
        'mode': process.env.X_AMZ_META_MODE,
      }

    };

    try {
      const data = await clientS3.send(new PutObjectCommand(params));
      console.log("Success", data);
      console.log("Function is working");
      return data;
    }
    catch (err) {
      console.log("Error", err);
    }

  });
}


//================================================================
//                         MAIN FUNCTION
//================================================================

async function main(data) {

  var account = data.filter(element => {
    if (element["Record Type"] === "Account") {
      return true;
    }
    return false;
  });

  existing_subscriber = await querySubscriberByName(account[0]["Customer"]); // "AstroMBS Demo5"

  var subscriberExists = existing_subscriber["subscribers"].length ? true : false;

  if (subscriberExists) {
    console.log("Subscriber already exists");
    response_message = "Subscriber: " + account[0]["Customer"] + " already exist.";
    log_data = "Subscriber: " + account[0]["Customer"] + " already exist.";
    //await updateExistingCustomer();
  }
  else {
    console.log("Create new subscriber")
    await setupCompleteAstroCustomer(data);
    response_message = "New Subscriber: " + account[0]["Customer"] + " has been created.";
  }
  await createFileS3Log(log_data);
}

async function setupCompleteAstroCustomer(data) {

  var account = data.filter(element => {
    if (element["Record Type"] === "Account") {
      return true;
    }
    return false;
  });

  product_codes = await getProductCodesAndDesc();
  product_codes = product_codes["QRT59"];

  // service_numbers = await getAvailableServiceNumbers();
  // service_numbers = service_numbers["QRT64"];

  cdf_fields = await getCompanyDefinedFieldsAndIds();
  cdf_fields = cdf_fields["QRT69"];

  var equipments = data.filter(element => {
    if (element["Record Type"] === "Equipment") {
      return true;
    }
    return false;
  });

  var site_services = data.filter(element => {
    if (element["Record Type"] === "Site Service") {
      return true;
    }
    return false;
  });

  var products = data.filter((element) => {
    if (element["Record Type"] === "User") {
      return true;
    }
    return false;
  });

  var one_time_charges = data.filter((element) => {
    if (element["Record Type"] === "NRC") {
      return true;
    }
    return false;
  });
  
 

  await addEquipments(equipments);
  await addSiteServices(site_services);

  await addCompleteSubscriber(account, products);

  await addProduct(products);

  await addOneTimeCharges(one_time_charges);
  
  await completeSubscriberSession();
  

}

async function updateExistingCustomer() {};

//================================================================
//                      UTILITY FUNCTIONS
//================================================================


async function readExcelFile(xlFile) {

  var logData = '';

  xlsxFile(xlFile, { sheet: excel_file_sheet }).then(async (rows) => {
    for (let i = 1; i < row_containing_parameter_names; i++) {
      rows.shift();
    }
    var headers = [];
    headers = rows.shift();

    const objs = rows.map((row) => {
      const obj = {};
      var record_type = "";
      row.forEach((cell, i) => {
        if (headers[i] === "Record Type") {
          record_type = cell;
          if (record_type != null) {
            obj["Record Type"] = record_type;
          }
        }

        if (cell != null || cell != undefined) {
          if (record_type !== null) {
            var range =
              records[record_types[record_type]][record_type][0]["range"];
            var indexes = getCellIndexes(range["start"], range["end"]);
            if (i >= indexes["start"] - 1 && i <= indexes["end"] - 1) {
              obj[headers[i]] = cell;
            }
          }
        }
      });
      return obj;
    });
    excel_sheet_objects = objs.filter((element) => {
      if (Object.keys(element).length > 1) {
        return true;
      }

      return false;
    });

    // console.log(excel_sheet_objects);//=========
    await main(excel_sheet_objects);
  });
}

function getCellIndexes(start, end) {
  var startindex = 0;
  var endindex = 0;

  if (start.length > 1) {
    var sum = 0;
    for (let i = 0; i < start.length; i++) {
      sum =
        sum +
        (alphabets.indexOf(start[i]) + 1) * Math.pow(26, start.length - 1 - i);
    }
    startindex = sum;
  }
  else {
    startindex = alphabets.indexOf(start) + 1;
  }

  if (end.length > 1) {
    var sum = 0;
    for (let i = 0; i < end.length; i++) {
      sum =
        sum +
        (alphabets.indexOf(end[i]) + 1) * Math.pow(26, end.length - 1 - i);
    }
    endindex = sum;
  }
  else {
    endindex = alphabets.indexOf(end) + 1;
  }

  return {
    start: startindex,
    end: endindex,
  };
}

async function loadConfig() {

  var fileKey = "demo_config.yaml";

  return await s3.getObject({ Bucket: bucketName, Key: fileKey },
    async (err, data) => {
      if (err) {
        console.log(err);
        return false;
      }
      try {
        yaml_data = yaml.load(data.Body.toString("utf-8"));

        excel_file = yaml_data["excel_file"];
        excel_file_sheet = yaml_data["excel_file_sheet"];
        row_containing_parameter_names =
          yaml_data["row_containing_parameter_names"];
        records = yaml_data["Records"];

        loadRecordTypes();

        var excelFileToRead = await s3
          .getObject({ Bucket: bucketName, Key: excel_file })
          .createReadStream();

        await readExcelFile(excelFileToRead);

      }
      catch (e) {
        console.log(e);
      }
    }

  );
}

function loadRecordTypes() {
  for (let i = 0; i < records.length; i++) {
    record_types[Object.keys(records[i])[0]] = i;
  }
}

//================================================================
//                      QUERY FUNCTIONS
//================================================================

async function getEquipmentModelData(modelNameHint) {

  // Fetches Equipment model data
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    QRTQueryId: "52",
    QRTFilter: "EQP_MODEL_NAME LIKE '%" + modelNameHint + "%'",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeQueryRequest(data);
  return response;
}

async function completeSubscriberSession() {

  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    subscriberId: subscriberId,
    sessionId: sessionId,
    processSamRequest: "N",
    completeSession: "Y",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await completeSubscriberSession(data);
  return response;
}

async function getProductCodesAndDesc() {
  // Fetches all the product codes and short description
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    QRTQueryId: "59",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeQueryRequest(data);
  return response;
}

async function getAvailableServiceNumbers() {
  // Fetches all the available service numbers
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    QRTQueryId: "64",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeQueryRequest(data);
  return response;
}

async function getCompanyDefinedFieldsAndIds() {
  // Fetches the company defined fields and their Ids
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    QRTQueryId: "69", //"57",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeQueryRequest(data);
  return response;
}

async function getServiceChargeData(charge_code) {
  // Fetches the service provided and service charge data based on charge code
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    QRTQueryId: "66",
    QRTFilter: `CHG_CODE LIKE '%${charge_code}%'`,
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeQueryRequest(data);
  return response;
}

async function makeQueryRequest(data) {
  const response = await new Promise((resolve, reject) => {
    // Request Configuration
    config.url = url.query;
    config.headers["Content-Length"] = data.length;
    config.data = data;

    axios(config).then(function(response) {
        resolve(JSON.stringify(response.data));
      })
      .catch(function(error) {
        console.log(error);
      });
  }).then((query_response) => {
    return JSON.parse(query_response);
  });
  return response;
}

//================================================================
//                      API CALL FUNCTIONS
//================================================================

async function makeAPIRequest(data) {
  const response = await new Promise((resolve, reject) => {
    // Request Configuration
    config.url = url.api;
    config.headers["Content-Length"] = data.length;
    config.data = data;

    axios(config).then(function(response) {
        resolve(JSON.stringify(response.data));
      })
      .catch(function(error) {
        console.log(error);
      });
  }).then((query_response) => {
    return JSON.parse(query_response);
  });
  return response;
}


// Adds Equipment in MBS from excel sheet
async function addEquipments(equipments_data) {

  let dataString = "";

  // Equipment data coming from excel sheet
  for (var i = 0; i < equipments_data.length; i++) {
    var equipmentResponse = "";

    // Gets EQP_TYPE & EQP_MODEL for each equipment
    var eqpData = await getEquipmentModelData(
      equipments_data[i]["Terminal Type"]
    );

    // Adds Equipment in MBS
    var data = qs.stringify({
      companyId: apiSetting.companyId,
      requestUserId: apiSetting.requestUserId,
      webServiceKey: process.env.WEB_SERVICE_KEY,
      appRequest: "companyAddEquipment",
      equipmentType: eqpData["QRT52"][0]["EQP_TYPE"],
      equipmentModel: eqpData["QRT52"][0]["EQP_MODEL"],
      equipmentIdentifier: equipments_data[i]["MAC Address"], //+"EEEE",//"MACIDEMOEQL" + i, //"A1D2EF4E65F",
      equipmentStatus: "A",
      serviceAddressId: serviceAddressId,
      apiReturnFormat: apiSetting.apiReturnFormat,
    });

    let equipmentResult = await makeAPIRequest(data);

    if (equipmentResult["returnCode"] === "BATCHCOMPLETE") { // Equipment Added successfully
      log_data = log_data + "\n\nNew equipment added successfully having MAC address: " + equipments_data[i]["MAC Address"] + " & Id: " + equipmentResult["equipmentId"];;
    }
    else {
      log_data = log_data + "\nEquipment having MAC Address: " + equipments_data[i]["MAC Address"] + " - " + equipmentResult["returnMessage"];
    }

    // console.log("Equipment Response:-", equipmentResult);

    equipments_added.push(equipmentResult);

    var objKeys = Object.keys(equipments_data[i]);
    // console.log("objKeys",objKeys);


    for (var j = 0; j < objKeys.length; j++) {
      var equipmentAttributeResponse = '';
      if (objKeys[j] !== 'MAC Address' && objKeys[j] !== 'Record Type' && objKeys[j] !== 'Manufacturer') {

        // Update an Equipment Attribute
        var data = qs.stringify({
          'requestUserId': apiSetting.requestUserId,
          'companyId': apiSetting.companyId,
          'webServiceKey': process.env.WEB_SERVICE_KEY,
          'appRequest': 'serviceUpdateEquipmentAttribute',
          'equipmentId': equipmentResult.equipmentId,
          'equipmentAttributeCode': MBSEqpAttrCodeMap[objKeys[j]],
          'attributeValue': equipments_data[i][objKeys[j]],
          'apiReturnFormat': apiSetting.apiReturnFormat,
        });

        await makeAPIRequest(data);

      }
    }
  }
}

async function addSiteServices(site_services_data) {
  let dataString = "";

  for (var i = 0; i < site_services_data.length; i++) {
    var equipmentResponse = "";
    var eqpData = await getEquipmentModelData(
      site_services_data[i]["Equipment Model"]
    );

    // Create a Equipment
    // companyAddEquipment - to add equipment to inventory
    var data = qs.stringify({
      companyId: apiSetting.companyId,
      requestUserId: apiSetting.requestUserId,
      webServiceKey: process.env.WEB_SERVICE_KEY,
      appRequest: "companyAddEquipment",
      equipmentType: eqpData["QRT52"][0]["EQP_TYPE"],
      equipmentModel: eqpData["QRT52"][0]["EQP_MODEL"],
      equipmentIdentifier: "" + site_services_data[i]["Site Name"].replaceAll(" ", ""), //+"EEEE",
      equipmentStatus: "A",
      serviceAddressId: serviceAddressId,
      apiReturnFormat: apiSetting.apiReturnFormat,
    });

    let equipmentResult = await makeAPIRequest(data);
    equipmentResult["site"] = site_services_data[i]["Site Name"];
    equipmentResult["status"] = "new";
    equipmentResult["attached_service"] = "";

    if (equipmentResult["returnCode"] === "BATCHCOMPLETE") {
      log_data = log_data + "\n\nNew Site service added successfully having Site-Name: " + site_services_data[i]["Site Name"] + " & Id: " + equipmentResult["equipmentId"];
    }
    else {
      log_data = log_data + "\nSite service with Site-Name: " + site_services_data[i]["Site Name"] + " - " + equipmentResult["returnMessage"];
    }

    // console.log("Site Service Response:-", equipmentResult);

    site_services_added.push(equipmentResult);
    var objKeys = Object.keys(site_services_data[i]);
    for (var j = 0; j < objKeys.length; j++) {
      var equipmentAttributeResponse = '';
      if (objKeys[j] !== 'Equipment Model' && objKeys[j] !== 'Equipment Type') {
        if (MBSEqpAttrCodeMap[objKeys[j].replaceAll(/ /g, ' ')] !== null && MBSEqpAttrCodeMap[objKeys[j].replaceAll(/ /g, ' ')] !== undefined) {

          // Add an Equipment Attribute
          var data = qs.stringify({
            'companyId': apiSetting.companyId,
            'requestUserId': apiSetting.requestUserId,
            'webServiceKey': process.env.WEB_SERVICE_KEY,
            'appRequest': 'serviceUpdateEquipmentAttribute',
            'equipmentId': equipmentResult.equipmentId,
            'equipmentAttributeCode': MBSEqpAttrCodeMap[objKeys[j].replaceAll(/ /g, ' ')],
            'attributeValue': site_services_data[i][objKeys[j]],
            'apiReturnFormat': apiSetting.apiReturnFormat,
          });

          await makeAPIRequest(data);

        }
      }
    }
  }
}

async function addCompleteSubscriber(xl_data, products) {

  // FIRST - Create a subscriber with one product

  var service_address_data = await addServiceAddress(xl_data);

  let dataString = '';
  var completeSubscriberResponse = '';

  // Create a Subscriber
  var data = qs.stringify({
    'companyId': apiSetting.companyId,
    'requestUserId': apiSetting.requestUserId,
    'webServiceKey': process.env.WEB_SERVICE_KEY,
    'appRequest': 'subscriberAddComplete',
    'subscriberType': (xl_data[0]["Account Type"] === "Business" ? "B" : "R"),
    'accountStructureId': (xl_data[0]["Account Type"] === "Business" ? "2" : "1"), // 2:Business , 1:Residential
    'organizationName': (xl_data[0]["Account Type"] === "Business" ? xl_data[0]['Customer'] /*"AstroMBS Demo5"*/ : ""),
    'personFirstName': xl_data[0]["Contact First Name"],
    'personLastName': xl_data[0]["Contact Last Name"],
    'creditClass': 'B',
    'addressLine1': xl_data[0]["Street"],
    'addressPostalCode': xl_data[0]["Code"],
    'addressStateProvId': xl_data[0]["State"],
    'addressCityId': xl_data[0]["City"],
    'accountType': xl_data[0]["Account Type"],
    'taxCountryId': 1,
    // 'activationDate': (xl_data[0]["Activation Date"] ? xl_data[0]["Activation Date"] : null),
    'invoiceChargeMethod': 'A',
    'paymentTermId': 'Standard',
    'productCode': products[0]["Product Code"],
    'serviceAddressId': serviceAddressId,
    'apiReturnFormat': 'JSON'
  });

  completeSubscriberResponse = await makeAPIRequest(data);

  // console.log("Subscriber Response:-", completeSubscriberResponse);

  if (completeSubscriberResponse["returnCode"] === "BATCHCOMPLETE") {
    log_data = log_data + "\n\nNew subscriber created with Subscriber Id: " + completeSubscriberResponse["subscriberId"] + " & Account name: " + (xl_data[0]["Account Type"] === "Business" ? xl_data[0]['Customer'] : xl_data[0]["Contact First Name"] + " " + xl_data[0]["Contact Last Name"]);
    log_data = log_data + "\nAdded a Product with code: " + products[0]["Product Code"] + " & generated service Id: " + completeSubscriberResponse["LNDserviceId"];
  }
  else {
    log_data = log_data + "\nERROR: " + completeSubscriberResponse["returnMessage"];
  }

  // SECOND - Attach the first equipment with the service created

  subscriberId = completeSubscriberResponse.subscriberId;
  sessionId = completeSubscriberResponse.sessionId;
  accountId = completeSubscriberResponse.accountId;
  guarantorId = completeSubscriberResponse.guarantorId;

  var serviceEquipmentResponse = '';

  // Link a Service and an Equipment

  var data = qs.stringify({
    'companyId': apiSetting.companyId,
    'requestUserId': apiSetting.requestUserId,
    'webServiceKey': process.env.WEB_SERVICE_KEY,
    'appRequest': 'serviceAddEquipment',
    'subscriberId': subscriberId,
    'serviceId': completeSubscriberResponse["LNDserviceId"],
    'equipmentId': equipments_added[0]["equipmentId"],
    'comment': '',
    'sessionId': sessionId,
    'apiReturnFormat': apiSetting.apiReturnFormat,
  });

  serviceEquipmentResponse = await makeAPIRequest(data);

  // console.log("Equipment Attach Response:-", serviceEquipmentResponse);

  if (serviceEquipmentResponse["returnCode"] === "BATCHCOMPLETE") {
    log_data = log_data + "\n\nEquipment with Id: " + equipments_added[0]["equipmentId"] + " has been attached with the service with Id: " + completeSubscriberResponse["LNDserviceId"];
  }
  else {
    log_data = log_data + "\nERROR: " + serviceEquipmentResponse["returnMessage"];
  }

  // THIRD - Provide service number to the service from the available service numbers

  var serviceUpdateResponse = "";

  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    appRequest: "serviceUpdate",
    subscriberId: subscriberId,
    serviceId: completeSubscriberResponse["LNDserviceId"],
    sessionId: sessionId,
    LNDphoneNumber: products[0]["Telephone Number"], //service_numbers[0]["SERVICE_NUMBER"],
    LNDpilotPhoneNumber: products[0]["Telephone Number"], //service_numbers[0]["SERVICE_NUMBER"],
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  serviceUpdateResponse = await makeAPIRequest(data);

  // console.log("Service Update - Number Response:-", serviceUpdateResponse);

  if (serviceUpdateResponse["returnCode"] === "BATCHCOMPLETE") {
    log_data = log_data + "\n\nService number (Telephone No.): " + products[0]["Telephone Number"] + " has been added to the service with Id: " + completeSubscriberResponse["LNDserviceId"];
  }
  else {
    log_data = log_data + "\nERROR: " + serviceUpdateResponse["returnMessage"];
  }

  // FOURTH - Attach the site service to the service
  // check if site service is already attached to some other service
  // if not, then simply attach the site service to the new service
  // if yes, then attach it as a shared equipment to the new service

  var serviceEquipmentResponse = '';

  var site_index = site_services_added.findIndex(object => {
    return object["site"] === products[0]["Site"];
  });

  // Link a Service and an Equipment(Site Service)
  // serviceAddEquipment - to link equipment to service
  var data = '';

  if (site_services_added[site_index]["status"] === "new") {
    // console.log("Site service being added is new");
    site_services_added[site_index]["attached_service"] = completeSubscriberResponse["LNDserviceId"];
    site_services_added[site_index]["status"] = "attached";
    data = qs.stringify({
      'companyId': apiSetting.companyId,
      'requestUserId': apiSetting.requestUserId,
      'webServiceKey': process.env.WEB_SERVICE_KEY,
      'appRequest': 'serviceAddEquipment',
      'subscriberId': subscriberId,
      'serviceId': completeSubscriberResponse["LNDserviceId"],
      'equipmentId': site_services_added[site_index]["equipmentId"],
      'comment': '',
      'sessionId': sessionId,
      'apiReturnFormat': apiSetting.apiReturnFormat,
    });
  }
  else {
    // console.log("Site service being added is not new");
    // Adding an equipment share - site service. 
    var data = qs.stringify({
      'companyId': apiSetting.companyId,
      'requestUserId': apiSetting.requestUserId,
      'webServiceKey': process.env.WEB_SERVICE_KEY,
      'appRequest': 'serviceAddEqpShare',
      'subscriberId': subscriberId,
      'sessionId': sessionId,
      'serviceId': completeSubscriberResponse["LNDserviceId"], // serviceId, to which the service needs to be attached as a shared equipment
      'eqpSubscriberId': subscriberId,
      'eqpSrvId': site_services_added[site_index]["attached_service"], // serviceId, to which the site is already attached
      'eqpShareId': 1,
      'apiReturnFormat': apiSetting.apiReturnFormat,
    });
  }

  serviceEquipmentResponse = await makeAPIRequest(data);

  console.log("Site Service Attach Response:-", serviceEquipmentResponse);

  if (serviceEquipmentResponse["returnCode"] === "BATCHCOMPLETE" && site_services_added[site_index]["returnCode"] !== "BATCHERROR") {
    if (site_services_added[site_index]["status"] === "new") {
      log_data = log_data + "\n\nSite service with Id: " + site_services_added[site_index]["equipmentId"] + " has been attached with the service with Id: " + completeSubscriberResponse["LNDserviceId"];
    }
    else {
      log_data = log_data + "\n\nSite service with Id: " + site_services_added[site_index]["equipmentId"] + " has been shared with the service with Id: " + completeSubscriberResponse["LNDserviceId"];
    }
  }
  else {
    log_data = log_data + "\nERROR: " + serviceEquipmentResponse["returnMessage"];
  }

  for (var i = 0; i < cdf_fields.length; i++) {
    var current_product_screen_label = "" + cdf_fields[i]["SCREEN_LABEL"].replaceAll(/\s+/g, ' ').trim();
    current_product_screen_label = current_product_screen_label.replace("No", "Number");
    if (products[0][current_product_screen_label] != undefined && products[0][current_product_screen_label] != null && products[0][current_product_screen_label] != "" && !current_product_screen_label.includes("Line Key")) {
      var subscriberCDFResponse = "";
      // subscriberUpdateCDF - to update company information fields of a service
      var data = qs.stringify({
        companyId: apiSetting.companyId,
        requestUserId: apiSetting.requestUserId,
        webServiceKey: process.env.WEB_SERVICE_KEY,
        appRequest: "subscriberUpdateCDF",
        subscriberId: subscriberId,
        cdfDomain: "AC_SRV_LND_CDF",
        cdfFieldId: cdf_fields[i]["CDF_FIELD_ID"],
        cdfFieldValue: products[0][current_product_screen_label],
        accountId: accountId,
        serviceId: completeSubscriberResponse["LNDserviceId"],
        sessionId: sessionId,
        completeSession: "N",
        apiReturnFormat: apiSetting.apiReturnFormat,
      });

      subscriberCDFResponse = await makeAPIRequest(data);

      // if (subscriberCDFResponse["returnCode"] === "BATCHCOMPLETE") {
      //   log_data = log_data + "\n\nUpdating Company-Defined Field - Updated the value of Field: " + current_product_screen_label + " for service id: " + completeSubscriberResponse["LNDserviceId"];
      // }
      // else {
      //   log_data = log_data + "\nERROR: " + subscriberCDFResponse["returnMessage"];
      // }
    }
  }

  // update line key fields
  for (var i = 1; i < 21; i++) {
    if (products[0] && products[0]["Line Key " + i + " Type"]) {
      var subscriberCDFLineKeyResponse = "";
      // subscriberUpdateCDF - to update company information fields of a service
      var data = qs.stringify({
        companyId: apiSetting.companyId,
        requestUserId: apiSetting.requestUserId,
        webServiceKey: process.env.WEB_SERVICE_KEY,
        appRequest: "subscriberUpdateCDFLineKey",
        subscriberId: subscriberId,
        cdfDomain: "AC_SRV_LND_CDF",
        cdfLineKeyNumber: (products[0]["Line Key " + i + " Line"] ? products[0]["Line Key " + i + " Line"] : ""),
        lineKeyType: products[0]["Line Key " + i + " Type"],
        lineKeyValue: (products[0]["Line Key " + i + " Value"] ? products[0]["Line Key " + i + " Value"] : ""),
        lineKeyLabel: (products[0]["Line Key " + i + " Label"] ? products[0]["Line Key " + i + " Label"] : ""),
        lineKeyLine: (products[0]["Line Key " + i + " Line"] ? products[0]["Line Key " + i + " Line"] : ""),
        accountId: accountId,
        serviceId: completeSubscriberResponse["LNDserviceId"],
        sessionId: sessionId,
        completeSession: "N",
        apiReturnFormat: apiSetting.apiReturnFormat,
      });

      subscriberCDFLineKeyResponse = await makeAPIRequest(data);

      // if (subscriberCDFLineKeyResponse["returnCode"] === "BATCHCOMPLETE") {
      //   log_data = log_data + "\n\nUpdated Line Key " + i + " Data";
      // }
      // else {
      //   log_data = log_data + "\nERROR: " + subscriberCDFLineKeyResponse["returnMessage"];
      // }

      // console.log("Line Key Field Update Response: ", subscriberCDFLineKeyResponse)
    }
  }
}

async function addProduct(products) {
  let dataString = "";
  var eqpIndex = 1;

  for (var i = 1; i < products.length; i++) {
    var productResponse = "";
    if (
      products[i]["Product Code"] == "" ||
      products[i]["Product Code"] == 0 ||
      products[i]["Product Code"] == undefined
    ) {
      var code = product_codes.filter(
        (element) => element["DESCRIPTION"] === products[i]["Product"]
      );
      products[i]["Product Code"] = code[0]["PRODUCT_CODE"];
    }
    // ADDING A NEW PRODUCT

    var data = qs.stringify({
      companyId: apiSetting.companyId,
      requestUserId: apiSetting.requestUserId,
      webServiceKey: process.env.WEB_SERVICE_KEY,
      appRequest: "productAdd",
      subscriberId: subscriberId,
      accountId: accountId,
      sessionId: sessionId,
      productCode: products[i]["Product Code"],
      serviceAddressId: serviceAddressId,
      apiReturnFormat: apiSetting.apiReturnFormat,
    });
    productResponse = await makeAPIRequest(data);

    if (productResponse["returnCode"] === "BATCHCOMPLETE") {
      log_data = log_data + "\nAdded a Product with code: " + products[i]["Product Code"] + " & generated service Id: " + productResponse["LNDserviceId"];
    }
    else {
      log_data = log_data + "\nERROR: " + productResponse["returnMessage"];
    }

    var serviceUpdateResponse = "";

    // PROVDING SERVICE NUMBER TO THE SERVICE
    var data = qs.stringify({
      companyId: apiSetting.companyId,
      requestUserId: apiSetting.requestUserId,
      webServiceKey: process.env.WEB_SERVICE_KEY,
      appRequest: "serviceUpdate",
      subscriberId: subscriberId,
      serviceId: productResponse["LNDserviceId"],
      sessionId: sessionId,
      LNDphoneNumber: products[i]["Telephone Number"], //service_numbers[i]["SERVICE_NUMBER"],
      LNDpilotPhoneNumber: products[i]["Telephone Number"], //service_numbers[i]["SERVICE_NUMBER"],
      apiReturnFormat: apiSetting.apiReturnFormat,
    });

    serviceUpdateResponse = await makeAPIRequest(data);

    if (serviceUpdateResponse["returnCode"] === "BATCHCOMPLETE") {
      log_data = log_data + "\n\nService number (Telephone No.): " + products[i]["Telephone Number"] + " has been added to the service with Id: " + productResponse["LNDserviceId"];
    }
    else {
      log_data = log_data + "\nERROR: " + serviceUpdateResponse["returnMessage"];
    }

    var serviceEquipmentResponse = '';

    var site_index = site_services_added.findIndex(object => {
      return object["site"] === products[i]["Site"];
    });

    // LINKING SITE SERVICE WITH THE SERVICE

    // IF NOT ATTACHED WITH ANY SERVICE, THEN LINK AS A SEPERATE EQUIPMENT
    if (site_services_added[site_index]["status"] === "new") {
      site_services_added[site_index]["attached_service"] = productResponse["LNDserviceId"];
      site_services_added[site_index]["status"] = "attached";
      var data = qs.stringify({
        'companyId': apiSetting.companyId,
        'requestUserId': apiSetting.requestUserId,
        'webServiceKey': process.env.WEB_SERVICE_KEY,
        'appRequest': 'serviceAddEquipment',
        'subscriberId': subscriberId,
        'serviceId': productResponse["LNDserviceId"],
        'equipmentId': site_services_added[site_index]["equipmentId"],
        'comment': '',
        'sessionId': sessionId,
        'apiReturnFormat': apiSetting.apiReturnFormat,
      });

      serviceEquipmentResponse = await makeAPIRequest(data);
    }
    else { // IF ATTACHED, THEN LINK AS A SHARED EQUIPMENT 
      // Adding an equipment share - site service
      var data = qs.stringify({
        'companyId': apiSetting.companyId,
        'requestUserId': apiSetting.requestUserId,
        'webServiceKey': process.env.WEB_SERVICE_KEY,
        'appRequest': 'serviceAddEqpShare',
        'subscriberId': subscriberId,
        'sessionId': sessionId,
        'serviceId': productResponse["LNDserviceId"], // serviceId, to which the service needs to be attached as a shared equipment
        'eqpSubscriberId': subscriberId,
        'eqpSrvId': site_services_added[site_index]["attached_service"], // serviceId, to which the site is already attached
        'eqpShareId': `${i+1}`,
        'completeSession': 'N',
        'processSamRequest': 'N',
        'ignoreNonProvisioned': 'N',
        'apiReturnFormat': apiSetting.apiReturnFormat,
      });

      serviceEquipmentResponse = await makeAPIRequest(data);
    }

    if (serviceEquipmentResponse["returnCode"] === "BATCHCOMPLETE" && site_services_added[site_index]["returnCode"] !== "BATCHERROR") {
      if (site_services_added[site_index]["status"] === "new") {
        log_data = log_data + "\n\nSite service with Id: " + site_services_added[site_index]["equipmentId"] + " has been attached with the service with Id: " + productResponse["LNDserviceId"];
      }
      else {
        log_data = log_data + "\n\nSite service with Id: " + site_services_added[site_index]["equipmentId"] + " has been shared with the service with Id: " + productResponse["LNDserviceId"];
      }
    }
    else {
      log_data = log_data + "\nERROR: " + serviceEquipmentResponse["returnMessage"];
    }

    // UPDATING ALL THE COMPANY-DEFINED FIELDS OF A SERVICE

    for (var j = 0; j < cdf_fields.length; j++) {
      var current_product_screen_label = "" + cdf_fields[i]["SCREEN_LABEL"].replaceAll(/\s+/g, ' ').trim();
      current_product_screen_label = current_product_screen_label.replace("No", "Number");
      if (products[i][current_product_screen_label] != undefined && products[i][current_product_screen_label] != null && products[i][current_product_screen_label] != "" && !current_product_screen_label.includes("Line Key")) {
        var subscriberCDFResponse = "";
        // subscriberUpdateCDF - to update company information fields of a service
        var data = qs.stringify({
          companyId: apiSetting.companyId,
          requestUserId: apiSetting.requestUserId,
          webServiceKey: process.env.WEB_SERVICE_KEY,
          appRequest: "subscriberUpdateCDF",
          subscriberId: subscriberId,
          cdfDomain: "AC_SRV_LND_CDF",
          cdfFieldId: cdf_fields[j]["CDF_FIELD_ID"],
          cdfFieldValue: products[i][current_product_screen_label],
          accountId: accountId,
          serviceId: productResponse["LNDserviceId"],
          sessionId: sessionId,
          completeSession: "N",
          apiReturnFormat: apiSetting.apiReturnFormat,
        });

        subscriberCDFResponse = await makeAPIRequest(data);

        // if (subscriberCDFResponse["returnCode"] === "BATCHCOMPLETE") {
        //   log_data = log_data + "\n\nUpdating Company-Defined Field - Updated the value of Field: " + current_product_screen_label + " for service id: " + productResponse["LNDserviceId"];
        // }
        // else {
        //   log_data = log_data + "\nERROR: " + subscriberCDFResponse["returnMessage"];
        // }
      }
    }

    for (var k = 1; k < 21; k++) {
      if (products[i] && products[i]["Line Key " + k + " Type"]) {
        var subscriberCDFLineKeyResponse = "";
        // subscriberUpdateCDF - to update company information fields of a service
        var data = qs.stringify({
          companyId: apiSetting.companyId,
          requestUserId: apiSetting.requestUserId,
          webServiceKey: process.env.WEB_SERVICE_KEY,
          appRequest: "subscriberUpdateCDFLineKey",
          subscriberId: subscriberId,
          cdfDomain: "AC_SRV_LND_CDF",
          cdfLineKeyNumber: (products[i]["Line Key " + k + " Line"] ? products[i]["Line Key " + k + " Line"] : ""),
          lineKeyType: products[i]["Line Key " + k + " Type"],
          lineKeyValue: (products[i]["Line Key " + k + " Value"] ? products[i]["Line Key " + k + " Value"] : ""),
          lineKeyLabel: (products[i]["Line Key " + k + " Label"] ? products[i]["Line Key " + k + " Label"] : ""),
          lineKeyLine: (products[i]["Line Key " + k + " Line"] ? products[i]["Line Key " + k + " Line"] : ""),
          accountId: accountId,
          serviceId: productResponse["LNDserviceId"],
          sessionId: sessionId,
          completeSession: "N",
          apiReturnFormat: apiSetting.apiReturnFormat,
        });

        subscriberCDFLineKeyResponse = await makeAPIRequest(data);

        // if (subscriberCDFLineKeyResponse["returnCode"] === "BATCHCOMPLETE") {
        //   log_data = log_data + "\n\nUpdated Line Key " + i + " Data";
        // }
        // else {
        //   log_data = log_data + "\nERROR: " + subscriberCDFLineKeyResponse["returnMessage"];
        // }
        // console.log("Line Key Field Update Response: ", subscriberCDFLineKeyResponse)
      }
    }

    var serviceEquipmentResponse = '';

    if (products[i]["MAC Address"] != null && products[i]["MAC Address"] != undefined && products[i]["MAC Address"] != "") {
      // LINKING AN EQUIPMENT WITH THE SERVICE
      var data = qs.stringify({
        'companyId': apiSetting.companyId,
        'requestUserId': apiSetting.requestUserId,
        'webServiceKey': process.env.WEB_SERVICE_KEY,
        'appRequest': 'serviceAddEquipment',
        'subscriberId': subscriberId,
        'serviceId': productResponse["LNDserviceId"], //serviceId,
        'equipmentId': equipments_added[eqpIndex]["equipmentId"], //equipmentId,
        'comment': '',
        'sessionId': sessionId,
        'apiReturnFormat': apiSetting.apiReturnFormat,
      });
      eqpIndex++;

      serviceEquipmentResponse = await makeAPIRequest(data);

      if (serviceEquipmentResponse["returnCode"] === "BATCHCOMPLETE") {
        log_data = log_data + "\n\nEquipment with Id: " + equipments_added[0]["equipmentId"] + " has been attached with the service with Id: " + productResponse["LNDserviceId"];
      }
      else {
        log_data = log_data + "\nERROR: " + serviceEquipmentResponse["returnMessage"];
      }

    }
  }
}

async function addServiceAddress(xl_data) {
  // Create a Service Address
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    appRequest: "companyAddServiceAddressByMatch",
    addressLine1: xl_data[0]["Street"],
    postalCode: xl_data[0]["Code"],
    cityId: xl_data[0]["City"],
    stateProvinceId: xl_data[0]["State"],
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeAPIRequest(data);

  if (response["returnCode"] === "BATCHCOMPLETE") {
    log_data = log_data + "\n\nService address created/fetched having Id: " + response["serviceAddressId"];
  }
  else {
    log_data = log_data + "\nERROR: " + response["returnMessage"];
  }

  serviceAddressId = response.serviceAddressId;

  return response;
}


async function querySubscriber(q_subscriberId) {
  var querySubscriberResponse = "";

  // serviceUpdate - to add a service charges to a service
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    appRequest: "subscriberQuery",
    subscriberId: q_subscriberId,
    includeCharges: "Y",
    includeTasksAndTickets: "N",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeAPIRequest(data);
  return response;
}

async function querySubscriberByName(name) {
  console.log("Subscriber to check:",name);
  var querySubscriberResponse = "";

  // serviceUpdate - to add a service charges to a service
  var data = qs.stringify({
    companyId: apiSetting.companyId,
    requestUserId: apiSetting.requestUserId,
    webServiceKey: process.env.WEB_SERVICE_KEY,
    appRequest: "subscriberQuery",
    // subscriberId: "87690000490",
    customerName: name,
    includeCharges: "Y",
    includeEquipment: "Y",
    includeDocuments: "Y",
    includeAttachments: "Y",
    includeContacts: "Y",
    includeTasksAndTickets: "Y",
    apiReturnFormat: apiSetting.apiReturnFormat,
  });

  var response = await makeAPIRequest(data);
  console.log("Subscriber Query Response:",response);
  return response;
}

async function addOneTimeCharges(nrc_charges) {

  console.log("SUBSCRIBER ID:-", subscriberId)

  var response = await querySubscriber(subscriberId);
  var accountServiceId = response["subscribers"][0]["services"][0]["accountServiceId"];

  for (var i = 0; i < nrc_charges.length; i++) {
    var chargeDetails = await getServiceChargeData(nrc_charges[i]["Charge Code"]);

    // serviceUpdate - to add a service charges to a service
    var data = qs.stringify({
      companyId: apiSetting.companyId,
      requestUserId: apiSetting.requestUserId,
      webServiceKey: process.env.WEB_SERVICE_KEY,
      appRequest: "serviceAddCharge",
      subscriberId: subscriberId,
      sessionId: sessionId,
      serviceId: accountServiceId,
      serviceProviderId: chargeDetails["QRT66"][0]["SP_ID"],
      serviceProviderType: chargeDetails["QRT66"][0]["SP_TYPE"],
      chargeQuantity: nrc_charges[i]["Quantity"],
      chargePrice: nrc_charges[i]["Price"],
      chargeCode: nrc_charges[i]["Charge Code"],
      apiReturnFormat: apiSetting.apiReturnFormat,
    });

    var response = await makeAPIRequest(data);

    if (response["returnCode"] === "BATCHCOMPLETE") {
      log_data = log_data + "\n\nOne-time charges added to account having Id: " + accountId;
    }
    else {
      log_data = log_data + "\nERROR: " + response["returnMessage"];
    }
  }
}

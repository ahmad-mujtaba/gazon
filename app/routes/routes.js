const express = require("express"),
  request = require("request"),
  cheerio = require("cheerio"),
  config = require("../../config/config");

const router = express.Router();


let hiddenFields = ["__EVENTTARGET", "__EVENTARGUMENT", "__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION"];



let getErrorObj = (errMsg) => {
  return {
    error: true,
    errorMsg: errMsg
  };
};

router.get("/", function(req, res, next){
  console.log(req.method +" : "+req.url);
  next();

});

router.get("/internet_usage", (apiRequest, apiResponse) => {
  
  apiResponse.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  });

  if (apiRequest.query["test"]) {
    let dummyResponse = JSON.parse('{"error":false,"used":"113.70","remain":"-13.70","allotted":"100","usedTime":"472:4","remainTime":"247:55","allottedTime":"720: 00","packageExpiry":"9/9/2018 8:34:07 PM","packageLastRenewal":"10-08-2018","packageName":"799_50Mbps_100GB_6Mbps_1Month","login":"john_doe43","accountStatus":"Status : Active - FUP","totalDays":"30","usedDays":"22","remainingDays":"8","registrationDate":"9/17/2016 2:48:48 PM","timestamp":1535638496696,"timeTaken":3619}');
    dummyResponse["timestamp"] = (new Date()).getTime();
    let randomQuota = 100 + Math.ceil(Math.random() * 400);
    dummyResponse["allotted"] = (randomQuota.toFixed(2)).toString();
    let randomUsed = Math.random();
    dummyResponse["used"] = (randomUsed * randomQuota).toFixed(2).toString();
    dummyResponse["remain"] = ((1 - randomUsed) * randomQuota).toFixed(2).toString();
    apiResponse.json(dummyResponse);
    console.log('Test response sent');
    return;
  }

  let beginTime = (new Date()).getTime();
  console.log("Scraping started...");

  let cookieJar = request.jar();

  let optionsStep1 = {
    url: config.LOGIN_URL,
    jar: cookieJar
  };
  request(optionsStep1, function(err, res, body) {


    if (err) {
      apiResponse.status(500).json(getErrorObj("Error in Step 1: " + err));
      console.log(err);
      return;
    }

    let $ = cheerio.load(body);

    let loginFormData = {};
    for (field in hiddenFields) {
      loginFormData[hiddenFields[field]] = $("input[name=" + hiddenFields[field] + "]").val();
    }



    loginFormData["txtUserName"] = apiRequest.query["user"];
    loginFormData["txtlogPassword"] = apiRequest.query["pass"];
    loginFormData["btnSubmit"] = "Submit";

    let optionsStep2 = {
      method: 'POST',
      url: config.LOGIN_URL,
      form: loginFormData,
      jar: cookieJar
    };

    request(optionsStep2, function(err, res, body) {
      if (err) {
        apiResponse.status(500).json(getErrorObj("Error in Step 2: " + err));
        console.log(err);
        return;
      }

      let $ = cheerio.load(body);
      var loginFailMsg = $("#lblLoginmsg").text();

      if (loginFailMsg.length > 0) {
        apiResponse.status(403).json(getErrorObj("Incorrect Username or Password"));
        return;
      }

      let optionsStep3 = {
        url: config.USAGE_URL,
        jar: cookieJar
      };

      request(optionsStep3, function(err, res, body) {
        if (err) {
          apiResponse.status(500).json(getErrorObj("Error in Step 3: " + err));
          console.log(err);
          return;
        }

        let $ = cheerio.load(body);
        let result = {};

        result["error"] = false;

        let fieldsToExtract = {
          "#ctl00_ContentPlaceHolder1_lblUsedTotal": "used",
          "#ctl00_ContentPlaceHolder1_lblRemainTotal": "remain",
          "#ctl00_ContentPlaceHolder1_lblAllotedTotal": "allotted",
          "#ctl00_ContentPlaceHolder1_lblUsedTime": "usedTime",
          "#ctl00_ContentPlaceHolder1_lblRemailTime": "remainTime",
          "#ctl00_ContentPlaceHolder1_lblallotedTime": "allottedTime",
          "#ctl00_ContentPlaceHolder1_lblPkgExp": "packageExpiry",
          "#ctl00_ContentPlaceHolder1_lblRenewdt": "packageLastRenewal",
          "#ctl00_ContentPlaceHolder1_lblPkg": "packageName",
          "#ctl00_ContentPlaceHolder1_lblLoginId": "login",
          "#ctl00_lblActiveStatus": "accountStatus",
          "#ctl00_ContentPlaceHolder1_lbltotaldays": "totalDays",
          "#ctl00_ContentPlaceHolder1_lbluseddays": "usedDays",
          "#ctl00_ContentPlaceHolder1_lblremainingdays": "remainingDays",
          "#ctl00_ContentPlaceHolder1_lblRegdt": "registrationDate"
        };
        for (field in fieldsToExtract) {
          result[fieldsToExtract[field]] = $(field).text();
        }

        let endTime = (new Date()).getTime();
        result["timestamp"] = endTime;
        result["timeTaken"] = endTime - beginTime;
        apiResponse.json(result);

        console.log("Scraping completed in " + (endTime - beginTime) + "ms");

      });


    });


  });




});

router.get("/", (req, res) => {
  res.send("Hello");
});

module.exports = router;


const config = require("../../config/config"),
    request = require("request"),
    User = require("../models/user.model"),
    UsageHistory = require("../models/usage_history.model"),
    cheerio = require("cheerio");

let hiddenFields = ["__EVENTTARGET", "__EVENTARGUMENT", "__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION"];

let getErrorObj = (errMsg) => {
    return {
        error: true,
        errorMsg: errMsg
    };
};

exports.login = (apiRequest, apiResponse) => {

    let $user = apiRequest.body["user"];
    let $pass = apiRequest.body["pass"];
    
    
    
    apiResponse.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    });
  
  
  
    let cookieJar = request.jar();
  
    let optionsStep1 = {
      url: config.LOGIN_URL,
      jar: cookieJar
    };
    request(optionsStep1, function(err, res, body) {
  
  
      if (err) {
        apiResponse.status(500).json(getErrorObj("Trouble logging you in: (1) " + err));
        console.log(err);
        return;
      }
  
      let $ = cheerio.load(body);
  
      let loginFormData = {};
      for (field in hiddenFields) {
        loginFormData[hiddenFields[field]] = $("input[name=" + hiddenFields[field] + "]").val();
      }
  
  
  
      loginFormData["txtUserName"] = $user;
      loginFormData["txtlogPassword"] = $pass;
      loginFormData["btnSubmit"] = "Submit";
  
      let optionsStep2 = {
        method: 'POST',
        url: config.LOGIN_URL,
        form: loginFormData,
        jar: cookieJar
      };
  
      request(optionsStep2, function(err, res, body) {
        if (err) {
          apiResponse.status(500).json(getErrorObj("Trouble logging you in: (2) " + err));
          console.log(err);
          return;
        }
  
        let $ = cheerio.load(body);
        var loginFailMsg = $("#lblLoginmsg").text();
  
        if (loginFailMsg.length > 0) {
          apiResponse.status(403).json(getErrorObj("Incorrect Username or Password"));
          return;
        } else {
            User.find({}).exec(function(err, users){
                if(err === null) {
                    if(users.length === 0) {
                        let user = new User({
                            user : $user,
                            pass: $pass
                        });
                        
                        user.save(function(err, user){
                            if(err === null) {
                                console.log("User "+$user+" saved");
                            } else {
                                console.log("Error while saving users : "+err);
                            }
                        });
                    }
                } else {
                    console.log("Error while querying for users : "+err);
                }
          
              });
          apiResponse.status(200).json({error:false,status:"OK"});
          return;
        }
      });
    });
  
  
  };

let _getUsage = function(apiRequest, apiResponse, onSuccess, onError) {
    onSuccess = onSuccess || function(){};
    onError = onError || function(){};

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
          onError();
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
            onError();
            console.log(err);
            return;
          }
    
          let $ = cheerio.load(body);
          var loginFailMsg = $("#lblLoginmsg").text();
    
          if (loginFailMsg.length > 0) {
            apiResponse.status(403).json(getErrorObj("Incorrect Username or Password"));
            onError();
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
              onError();
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
            onSuccess(result);
    
          });
    
    
        });
    
    
      });
};


exports.getUsage = (apiRequest, apiResponse) => {
    _getUsage(apiRequest, apiResponse, null, null);

};

exports.logUsage = () => {
    User.find({}).exec(function(err, users){
        for(var i in users) {
            let _u = users[i];
            if(_u["enableHistory"] && _u["user"] != null && _u["pass"] != null) {
                console.log("logging for "+_u["user"]);

                let apiRequest = {
                    query : {
                        user : _u['user'],
                        pass : _u['pass']
                    }
                };

                let apiResponse = {
                    status : function(){return this},
                    send : function(){},
                    json : function(){},
                    set : function(){},
                };
                _getUsage(apiRequest, apiResponse, function(usageResult){
                    let usageHistory = new UsageHistory({user:_u._id, result:usageResult});
                    usageHistory.save(function(err, data){
                        if(err) {
                            console.log("Error while saving history : "+err);
                        }
                    });
                }, null);



            }
        }
    });
};

exports.getHistory = (apiRequest, apiResponse) => {

    let $user = apiRequest.body["user"];
    let $pass = apiRequest.body["pass"];
    let lt = apiRequest.body["lt"];
    let gt = apiRequest.body["gt"];
    
    
    
    apiResponse.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    });

    User.findOne({
        user : $user,
        pass: $pass
    }).exec(function(err, user){
        if(err === null) {
            if(user && user["user"] === $user) {
                let historyCriteria =  {
                    user : user._id,
                    creationTime: {
                        $gte : new Date(gt)
                    }
                }

                if(lt != null) {
                    historyCriteria.creationTime.$lt = new Date(lt);
                }

                UsageHistory.find(historyCriteria).exec(function(err, history){
                    if(err === null) {
                        apiResponse.status(200).json(history);
                    } else {
                        console.log("Error : "+err);
                        apiResponse.status(500).json(getErrorObj("Error "+err));
                    }
                });
            } else {
                apiResponse.status(400).json(getErrorObj("Invalid user"));
            }
            
        } else {
            console.log("Error : "+err);
            apiResponse.status(500).json(getErrorObj("Error "+err));
        }
    });
};
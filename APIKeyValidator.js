function Validate(settings, connection, callback){
  return function (req, res) {
    // Check if the api key provided in Authorized header is there and isn't empty
    let providedAPIKey  = req.get("Authorization")
    if (providedAPIKey == undefined || providedAPIKey == ""){
      unauthorizedError(req, res);
      return;
    }

    res.setHeader('X-Powered-By', 'Rest-SQL');
    res.setHeader('X-Author', 'Samuel Prevost');
    res.setHeader('X-Version'   , settings.version);


    // Try to grab the API key provided in the table, if it isn't in it, it's unauthorized, otherwise OK
    connection.query("SELECT * FROM " + settings.apiKeyTableName + " WHERE apiKey = ?", providedAPIKey , function(errApiValidate, resultApiValidate){
      // if(err) or if(resultApiValidate.lenght > 0) don't works
      // Don't use the var name "result" 'cause it's used later and thus create bugs
      if(resultApiValidate[0] !== undefined){
        console.log("\n\n######## Authorized ########")
        callback(req, res)
        // Don't return/destroy req.connection here otherwise the callback's res would be ignored
      }
      else{
        console.log("\n\n######## Unauthorized ########")
        unauthorizedError(req, res)
        req.connection.destroy();
        return
      }
    });
  }
}

function unauthorizedError(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.status(401).send("Unauthorized");
  req.connection.destroy();
}

exports.Validate = Validate;


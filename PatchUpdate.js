function UpdateData(connection){
  return function (req, res) {
    let tableName 	  = req.params.table;
    let id            = req.params.id;
    let data 		      = req.body;
    // Will always return text/plain content
    res.setHeader('Content-Type', 'text/plain');

    console.log("PATCH request received with id = " + id);

    // Should match this regex
    if (!tableName.match(/^[\-\_\s0-9A-Za-z]+$/)){
      console.log("Error: Invalid table name provided : " + tableName);
    	badRequestError(req, res);
    	return;
    }
    // If we've got no data, do nothin
    if (data.lenght == 0){
      console.log("Error: No content provided");
      res.status(204).send("No Content");
      req.connection.destroy();
      return;
    }
    // Check if id is provided and is only numerical
    // If we've got an none or an invalid id, then read id directly from datas
    if (typeof id == 'undefined' || !id.match(/^[0-9]+$/)){
      // This function chain the SQL insert request recursively
      recursiveSQLUpdate(tableName, connection, data, 0, true, function(idempotentRespected){
        if(!idempotentRespected){
          console.log("Warning: Request didn't updated the contact, PATCH isn't idempotent");
          res.status(304).send("Not Modified");
          req.connection.destroy();
          return;
        }
        console.log("Request executed successfully !");
        res.status(200).send("OK");
        req.connection.destroy();
        return;
      });

    // If we've got an ID, it means that we've got to update only ONE contact, thus no need for recursive action
    }else{
      // Should be unnecessary and totally overkilled but just in case...
      if (data[0] == undefined){
        badRequestError(req, res);
        return;
      }
      // Get the only contact in data (data can't be empty, it was checked, so it got to have at least one element)
      var varsToUpdate = data[0];
      // Delete the id, we could just let it and update it but it may fuck up our DB so let's delete it anyway
      delete varsToUpdate['id'];
      connection.query("UPDATE " + tableName + " SET ? WHERE ?", [varsToUpdate, {'id': id}], function(err, result){
        if (err){
          badRequestError(req, res);
          return;
        }
        // PATCH isn't idempotent, thus we should notify the user about it
        if (result.affectedRows == 0){
          console.log("Warning: Request didn't updated the contact, PATCH isn't idempotent");
          res.status(304).send("Not Modified");
          req.connection.destroy();
          return;
        }
        // If we're here, it means it's ALLLRRRIIGHT
        console.log("Request executed successfully !");
        res.status(200).send("OK");
        req.connection.destroy();
        return;
      });
    }
  }
}

function recursiveSQLUpdate(tableName, connection, bodyArray, nextIndex, idempotentRespected, callback){
  if (bodyArray[nextIndex] !== undefined) {
    var varsToUpdate = bodyArray[nextIndex];
    // Do not use let, it's recursive, scope fucked up
    var currentID = varsToUpdate['id'];
    delete varsToUpdate['id'];
    connection.query("UPDATE " + tableName + " SET ? WHERE ?", [varsToUpdate, {'id': currentID}], function(err, result){
      if (err){
        console.log(err);
        badRequestError(req, res);
        return
      }
      // PATCH isn't idempotent, thus we should notify the user about it
      if (result.changedRows == 0 && idempotentRespected){
        idempotentRespected = false;
      }
      recursiveSQLUpdate(tableName, connection, bodyArray, nextIndex+1, idempotentRespected, callback);
    });
  }else{
    callback(idempotentRespected);
  }
}

function badRequestError(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.status(400).send("Bad Request");
  req.connection.destroy();
}

exports.UpdateData = UpdateData;
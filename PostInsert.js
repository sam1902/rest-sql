function InsertData(connection){
 return function (req, res) {
    let tableName 	 = req.params.table;
    let data 		     = req.body;

    console.log("POST request received with tableName = " + tableName);

    // Should match this regex
    if (!tableName.match(/^[\-\_\s0-9A-Za-z]+$/)){
      console.log("Error: Invalid table name provided : " + tableName);
    	badRequestError(req, res);
    	return;
    }
    
    // This function chain the SQL insert request recursively
  	recursiveSQLInsert(tableName, connection, data, 0, [], function(idArray){
  		res.setHeader('Content-Type', 'application/json');
      console.log("Request executed successfully !");
  		res.status(200).send(JSON.stringify(idArray));
  		req.connection.destroy();
  		return;
  	});
  }
}

function recursiveSQLInsert(tableName, connection, bodyArray, nextIndex, idArray, callback){
  if (bodyArray[nextIndex] !== undefined) {
    connection.query("INSERT INTO " + tableName + " SET ?", bodyArray[nextIndex], function(err, result){
      if (err){
        console.log(err);
        badRequestError(req, res);
      }
      var id = result.insertId
      idArray.push({"id": + id , "url" : "/" + tableName + "/" + id})
      recursiveSQLInsert(tableName, connection, bodyArray, nextIndex+1, idArray, callback);
    });
  }else{
    callback(idArray);
  }
}

function badRequestError(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.status(400).send("Bad Request");
  req.connection.destroy();
}

exports.InsertData = InsertData;
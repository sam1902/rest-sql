function DeleteData(connection){
 return function (req, res) {
    let tableName 	 = req.params.table;
    let id           = req.params.id;
    // Should match this regex
    if (!tableName.match(/^[\-\_\s0-9A-Za-z]+$/)){
    	badRequestError(req, res);
    	return;
    }
    // Check if id is provided and is only numerical
    if (typeof id == 'undefined' || !id.match(/^[0-9]+$/)){
      badRequestError(req, res);
      return;
    }
    // Execute the deletion query
    connection.query("DELETE FROM " + tableName + " WHERE id = ?", id, function(err, result){
      res.setHeader('Content-Type', 'text/plain');
      // Success
      if (result.affectedRows > 0){
        res.status(200).send('OK');
      // Failure
      }else{
        badRequestError(req, res);
        return;
      }

      req.connection.destroy();
      return;
    });
  }
}

function badRequestError(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.status(400).send("Bad Request");
  req.connection.destroy();
}

exports.DeleteData = DeleteData;
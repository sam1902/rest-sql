function SelectData(connection){
	return function (req, res) {
		let tableName = req.params.table;
		let id = req.params.id;

		console.log("GET request received with tableName = " + tableName + " and id = " + id);

		// Should match this regex
		if (!tableName.match(/^[\-\_\s0-9A-Za-z]+$/)){
			console.log("Error: Invalid table name provided : " + tableName);
			badRequestError(req, res);
			return;
		}
		if (id !== undefined){
			if (!id.match(/^[0-9]+$/)){
				console.log("Error: Invalid id provided : " + id + " (table name was valid : " + tableName + ")");
				badRequestError(req, res);
				return;
			}
		}
		// if id is empty, then don't use any condition, else, add SQL condition
		idPart = (id === undefined) ? "" : (" WHERE id='" + id + "'");
		// TODO: try to replace " + var + " by question marks and bind params, find a way to do it w/ id
		connection.query("SELECT * FROM " + tableName + idPart + ";", function(err, result){
			res.setHeader('Content-Type', 'application/json');
			console.log("Request executed successfully !");
			// console.log(result.length + ", should be around 1209±1");
			// console.log(JSON.parse(JSON.stringify(result)).length + ", should be around 1209±1 too");
			// res.status(200).write(JSON.stringify(result)).end();
			res.status(200).send(JSON.stringify(result));
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

exports.SelectData = SelectData;

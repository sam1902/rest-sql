function GetSettings(){
	return {
		version : '1.0',
		mysql : {
			host		: 'localhost',
			port 		: '3306',
			user     	: 'root',
			password 	: '',
			database 	: 'testing'
		},
		apiKeyTableName : 'apiKeys'
	};
}

exports.GetSettings = GetSettings;


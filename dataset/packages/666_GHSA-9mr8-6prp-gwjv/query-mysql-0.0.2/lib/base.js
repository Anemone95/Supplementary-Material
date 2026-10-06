var mysql      = require('mysql');
module.exports = function () {
	var connection = null;

	function connect(callback) {
		connection.connect(function (err){
			if(!err) {
			    callback(true)   
			} else {
			    callback(false);    
			}
		});
	}

	function configure (options) {
		connection = mysql.createConnection(options);		
	}

	function getType (obj) {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
	}

	function isEmpty (object) {
		if (object == undefined ) return true;
		if (object == null) return true;
		if (object.length === 0)  return true;
		if (typeof object === 'string' && object === "") return true;
		if (Object.getOwnPropertyNames(object).length <= 0) return true;
		return false;
	}
	return {
		configure: function (options) {
			configure(options)
		},

		base: {

			create : function (table, object, callback) {
				connect(function (connected) {					
					if (connected) {
						connection.query('INSERT INTO ' + table + ' SET ?', object, function (err, result) {
							connection.end();
							console.log("create");
							console.log(result);
							//console.log("fin de la conexion");
						  	//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{
								object["id"] = result.insertId;	
								callback("success", object);
							};
						});

					}else{
						callback("error_connection", null);
					};
					
				})
			},

			update: function(table, object, id, name_id, callback) {
				connect(function (connected) {
					if (connected) {

						connection.query('UPDATE ' + table + ' SET ? WHERE '+name_id+'='+id, object, function (err, result) {
							connection.end();
							console.log("update...");
							console.log(result);
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{
								if(result.affectedRows == 1){
									callback("success", result.affectedRows);
								}else{
									callback("not_found", result.affectedRows);
								}								
							};				  
						})
					
					}else{
						callback("error_connection", null);
					};
				})
			},

			deleteStatus: function(table, id, name_id, status_name, status_val,  callback) {
				connect(function (connected) {
					if (connected) {

						connection.query('UPDATE ' + table + ' SET '+status_name+'='+status_val+' WHERE '+name_id+'='+id, function (err, result) {
							connection.end();
							console.log("update");
							console.log(result);
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{
								//result.changedRows
								callback("success", result.affectedRows);
							};				  
						})
					
					}else{
						callback("error_connection", null);
					};
				})
			},

			delete: function(table, id, name_id, callback) {
				connect(function (connected) {
					if (connected) {

						connection.query('DELETE FROM ' + table + ' WHERE '+name_id+'=' + id, function (err, result) {
							connection.end();
							console.log("delete");
							console.log(result);
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{						
								callback("success", result.affectedRows);
							};
						})

					}else{
						callback("error_connection", null);
					};
				})
			},

			fetchAll: function (table, callback) {
				connect(function (connected) {
					if (connected) {
						connection.query('SELECT * FROM ' + table, function (err, rows, fields) {
							connection.end();
							console.log("fetchAll");
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{						
								callback("success", {data: rows});
							};
						})

					}else{
						callback("error_connection", null);
					};
				})
			},

			fetchAllStatus: function(table, status_name, status_val, callback){
				connect(function(connected){
					if(connected){
						connection.query('SELECT * FROM ' + table + ' WHERE '+ status_name +'='+ status_val, function (err, rows, fields) {
							connection.end();
							console.log("fetchAllStatus");
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{						
								callback("success", {data: rows});
							};
						});
					}else{
						callback("error_connection", null);
					}
				});		
			},

			fetchById: function (table, id, name_id, callback) {
				connect(function (connected) {
					if (connected) {

						connection.query("SELECT * FROM " + table + " WHERE " +name_id+"='"+ id+"'", function (err, rows, fields) {
							connection.end();
							console.log("fetchById");
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{						
								callback("success", rows);
							};
						})

					}else{
						callback("error_connection", null);
					};
				})
			},

			loginUser: function (table, id, name_id, callback) {
				connect(function (connected) {
					if (connected) {

						connection.query("SELECT * FROM " + table + " WHERE " +name_id+"='"+id+"'", function (err, rows, fields) {
							connection.end();
							console.log("fetchById");
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{						
								callback("success", rows);
							};
						})

					}else{
						callback("error_connection", null);
					};
				})
			},

			fetchByTwoParametersAnd: function (table, parameters, callback) {
				if(!isEmpty(parameters)){
					//parametros que se le pasan en la url en json
						var params = parameters;
						console.log(params); // { road_id: '1' }
						//obtenemos los nombres del objeto json y se convierten en un array
						var names_ids = Object.keys(params); //[ 'road_id' ]
						console.log(names_ids);
						if(names_ids.length == 2){
								//Obtenemos el valor del array 
							var param_name_1 = names_ids[0]; // road_id
							var param_name_2 = names_ids[1];
							//obtenemos el valor para pasarlo como identificar
							var param_id_1 = params[param_name_1];
							var param_id_2 = params[param_name_2];
							connect(function (connected) {
								if (connected) {
										connection.query("SELECT * FROM " + table + " WHERE " +param_name_1+"='"+param_id_1+"' AND "+param_name_2+"='"+param_id_2+"'", function (err, rows, fields) {
											connection.end();
											console.log("fetchByTwoParametersAnd");
											//if (err) throw err;
											if (err) {
												callback("error", null);
											}else{						
												callback("success", rows);
											};
										})//function

									}else{
										callback("error_connection", null);
									};
							})//conect
						}else{
							callback("moreparameters", parameters);
						}
				}else{
					callback("empty", parameters);
				}
			},

			fetchByParameters: function (table, callback, parameters, pagination) {
				connect(function (connected) {
					if (connected) {
						var parametersString = "", paginationString = "";
						if (!isEmpty(parameters)) {							
							for (var key in parameters) {
								if (parametersString.length<=0) {
									parametersString = key + "=" + mysql.escape(parameters[key]);
								}else{
									parametersString = parametersString + " AND " + key + "=" + mysql.escape(parameters[key]);
								};						
							}
							parametersString = ' WHERE ' + parametersString;
						};

						if (!isEmpty(pagination)) {
							paginationString = " LIMIT " + ((pagination.page - 1) * pagination.limit) + ","+pagination.limit;							
						};

						connection.query('SELECT * FROM ' + table + parametersString + paginationString, function (err, rows, fields) {
							console.log("fetchByParameters");							
							//if (err) throw err;
							if (err) {
								callback("error", null);
							}else{
								if (!isEmpty(pagination)) {
									if (pagination.page == 1) {
										connection.query('SELECT COUNT(*) AS total_results FROM ' + table + parametersString, function (secondErr, secondRows, secondFields) {
											connection.end();											
											callback("success", {total_results: secondRows[0].total_results, data: rows});
										});
									}else{
										connection.end();
										callback("success", {data: rows});
									}
								}else{
									connection.end();
									callback("success", {data: rows});
								}		
							};
						})

					}else{
						callback("error_connection", null);
					};
				})
			},


		}	

	}
}
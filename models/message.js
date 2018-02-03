var mysql = require('mysql')

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expressjs'
});
class Message {
    list(callback) {
        
        var query = connection.query('SELECT * from messages', function (err, rows, fields) {
            if (err) {
                callback(err,null);
                
            }else{
                callback(null,rows);
                
            }
        });

       
    }

    create (callback,data){
        if (data  > 0 ) {
        var query = connection.query('INSERT INTO messages SET ?', {text : data }, function (error, results, fields) {
            if (error) {
                console.log(error)
                callback(error,null);    
            }else{
                callback(results,error);    
            }
          //  connection.end()
          });
        }
    }
    
}
module.exports = Message
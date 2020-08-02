// Loading module to delete uploads 
const fs = require('fs');

const deleteUpload = function (thumbnail){
  
  fs.stat(`${__dirname}/../../uploads/${thumbnail}`, function (error) {
    if (error) {
      console.log("error 1")
      return error;
    }
    
    fs.unlink(`${__dirname}/../../uploads/${thumbnail}`, function(error){
      if(error) {
        console.log("error 2")
        return error;
      }
      console.log("True")
      return 'Deleted';
    });
  });

}

module.exports = deleteUpload;
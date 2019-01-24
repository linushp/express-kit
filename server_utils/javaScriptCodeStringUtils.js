var fs = require("fs");
var path = require("path");


/**
 *
 * @param dirPath 可为空
 * @param htmlPathArray
 */
function toCodeString(dirPath, htmlPathArray) {
    var p = Promise.resolve();

    for (var i = 0; i < htmlPathArray.length; i++) {
        var htmlPath = (htmlPathArray[i] || '').trim();
        if (htmlPath) {
            p = p.then((function (dirPath, htmlPath,i) {
                return function (result) {
                    result = result || [];
                    return new Promise(function (resolve, reject) {
                        var filePath;
                        if(!dirPath){
                            filePath = htmlPath;
                        }else {
                            filePath = path.resolve(dirPath, htmlPath);
                        }


                        fs.readFile(filePath, "utf-8", function (err, code) {
                            if (err) {
                                console.log(err);
                                result.push("function toCodeString_read_file_error_"+i+"(){console.log('read file error :"+filePath+"')}");
                                resolve(result);
                            } else {
                                result.push(code);
                                resolve(result);
                            }
                        });
                    });
                }
            })(dirPath, htmlPath,i));
        }
    }
    return p;
}



module.exports = {
    toCodeString:toCodeString
};
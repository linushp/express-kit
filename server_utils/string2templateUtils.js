var fs = require("fs");
var path = require("path");
var string2template = require('../functions/string2template');


function htmlArray2js(dirPath, htmlPathArray) {
    var p = Promise.resolve();

    for (var i = 0; i < htmlPathArray.length; i++) {
        var htmlPath = (htmlPathArray[i] || '').trim();

        if(htmlPath[0] === '\\' || htmlPath[0] === '/'){
            htmlPath = htmlPath.substring(1);
        }


        if (htmlPath) {
            p = p.then((function (dirPath, htmlPath) {
                return function (result) {
                    result = result || {};
                    return new Promise(function (resolve, reject) {
                        var filePath = path.resolve(dirPath, htmlPath);



                        var filePathParsed = path.parse(filePath);
                        var fileName = filePathParsed.name; //没有后缀的文件名
                        fs.readFile(filePath, "utf-8", function (err, html) {
                            if (err) {
                                var errorMsg = {};
                                errorMsg["read_file_error_" + htmlPath] = "read file error";
                                result = string2template.extendObject(result, errorMsg);
                                resolve(result);
                            } else {
                                var htmlObject = string2template.parseString2Html(html,fileName);
                                result = string2template.extendObject(result, htmlObject);
                                resolve(result);
                            }
                        });
                    });
                }
            })(dirPath, htmlPath));
        }
    }
    return p;
}


/**
 * 这个文件是一个单独的入口，外界可以直接调用里面的函数
 * @type {{htmlArray2js: htmlArray2js}}
 */
module.exports = {
    htmlArray2js: function (dirPath, htmlPathArray) {
        return htmlArray2js(dirPath, htmlPathArray);
    }
};
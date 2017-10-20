var fs = require("fs");
var path = require("path");
var string2template = require('../functions/string2template');


function htmlArray2js(dirPath, htmlPathArray) {
    var result = {};
    for (var i = 0; i < htmlPathArray.length; i++) {
        var htmlPath = htmlPathArray[i];
        var filePath = path.resolve(dirPath, htmlPath);

        if (filePath.indexOf(dirPath) !== 0) {
            var errorMsg = {};
            errorMsg["read_file_error_" + htmlPath] = "illegal access";
            result = string2template.extendObject(result, errorMsg);
        } else {
            var html = fs.readFileSync(filePath, "utf-8");
            var htmlObject = string2template.parseString2Html(html);
            result = string2template.extendObject(result, htmlObject);
        }
    }
    return result;
}


function getHtml2JsContent(dirPath, htmlPathArray,varName) {
    if(htmlPathArray && htmlPathArray.length > 0){
        var js = htmlArray2js(dirPath, htmlPathArray || []);
        var jsStr = JSON.stringify(js);
        return "var "+ varName +" = " + jsStr + ";";
    }
    return '';
}



module.exports = {
    getHtml2JsContent:getHtml2JsContent
};
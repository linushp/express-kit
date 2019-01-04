var fs = require("fs");
var path = require("path");
var string2template = require('../functions/string2template');


function htmlArray2js(dirPath, htmlPathArray) {

    var result = {};
    for (var i = 0; i < htmlPathArray.length; i++) {
        var htmlPath = htmlPathArray[i];
        var filePath = htmlPath;
        if (dirPath) {
            filePath = path.resolve(dirPath, htmlPath);
        }

        var html = fs.readFileSync(filePath, "utf-8");
        var filePathParsed = path.parse(filePath);
        if(filePathParsed['ext'] !== '.shtml' && filePathParsed['ext'] !== '.html'){
            console.log('[ERROR] only shtml file can to js ', filePath);
        }else {
            var fileName = filePathParsed.name; //没有后缀的文件名
            var htmlObject = string2template.parseString2Html(html, fileName);
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
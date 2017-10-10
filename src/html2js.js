var fs = require("fs");
var path = require("path");


function propStringToMap(ss1) {
    var propsMap = {};
    var propsLength = 0;
    var firstProp = null;
    var xa = ss1.split(/["'][\s]+/);
    for (var j = 0; j < xa.length; j++) {
        var xaj = xa[j];
        var xajPair = xaj.split('=');
        if (xajPair.length === 2) {
            var key = (xajPair[0] || "").trim();
            var value = xajPair[1] || "";
            if (key) {
                var value1 = value.replace(/['"]/gm, '');
                value1 = value1.trim();
                propsMap[key] = value1;
                propsLength++;
                if (!firstProp) {
                    firstProp = key;
                }
            }
        }
    }


    return {
        propsMap: propsMap,
        propsLength: propsLength,
        firstProp: firstProp
    };
}


function parseString2Html(html) {

    var templateArray = html.split('<string2-template');

    var resultObject = {};
    for (var i = 0; i < templateArray.length; i++) {
        var str = (templateArray[i] || "").trim();
        if (str.length > 0) {
            var index = str.indexOf('>');
            var ss1 = str.substring(0, index);
            var ss2 = str.substring(index + 1, str.length);
            ss1 = ss1.replace(/\\/mg, '');
            ss1 = ss1.trim();

            var templateContent = ss2.replace(/<\/string2-template>$/i, '');
            templateContent = templateContent.trim();
            templateContent = templateContent.replace(/\s+/gm, ' ');

            var propsResult = propStringToMap(ss1);

            var propsMap = propsResult.propsMap;
            var propsLength = propsResult.propsLength;
            var firstProp = propsResult.firstProp;

            var templateKey = propsMap['id'] || propsMap[firstProp];

            if (propsLength === 1) {
                resultObject[templateKey] = templateContent;
            }

            else if (propsLength > 1) {
                resultObject[templateKey] = {
                    content: templateContent,
                    propsMap: propsMap,
                    propsLength: propsLength,
                    firstProp: firstProp
                };
            }
        }
    }


    return resultObject;

}


function extendObject(a, b) {
    for (var key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}

function htmlArray2js(dirPath, htmlPathArray) {

    var result = {};

    for (var i = 0; i < htmlPathArray.length; i++) {

        var htmlPath = htmlPathArray[i];

        var filePath = path.resolve(dirPath, htmlPath);

        if (filePath.indexOf(dirPath) !== 0) {
            var errorMsg = {};
            errorMsg["read_file_error_" + htmlPath] = "illegal access";
            result = extendObject(result, errorMsg);
        } else {
            var html = fs.readFileSync(filePath, "utf-8");
            var htmlObject = parseString2Html(html);
            result = extendObject(result, htmlObject);
        }
    }

    return result;
}


function getHtml2JsContent(dirPath, htmlPathArray,varName) {
    var js = htmlArray2js(dirPath, htmlPathArray);
    var jsStr = JSON.stringify(js);

    return "var "+ varName +" = " + jsStr + ";";
}



module.exports = {
    getHtml2JsContent:getHtml2JsContent
};
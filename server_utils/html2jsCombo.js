var fs = require("fs");
var path = require("path");
var string2template = require('../functions/string2template');
var config = require('../functions/config');







function htmlArray2js(dirPath, htmlPathArray) {
    var p = Promise.resolve();

    for (var i = 0; i < htmlPathArray.length; i++) {
        var htmlPath = (htmlPathArray[i] || '').trim();
        if (htmlPath) {
            p = p.then((function (dirPath, htmlPath) {
                return function (result) {
                    result = result || {};
                    return new Promise(function (resolve, reject) {
                        var filePath = path.resolve(dirPath, htmlPath);

                        if (filePath.indexOf(dirPath) !== 0) {
                            var errorMsg = {};
                            errorMsg["read_file_error_" + htmlPath] = "illegal access";
                            result = string2template.extendObject(result, errorMsg);
                            resolve(result);
                            return;
                        }

                        fs.readFile(filePath, "utf-8", function (err, html) {
                            if (err) {
                                var errorMsg = {};
                                errorMsg["read_file_error_" + htmlPath] = "read file error";
                                result = string2template.extendObject(result, errorMsg);
                                resolve(result);
                            } else {
                                var htmlObject = string2template.parseString2Html(html);
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


function getHtml2JsContent(dirPath, htmls) {
    var htmlPathArray = htmls.split(',');
    var jsPromise = htmlArray2js(dirPath, htmlPathArray);
    return jsPromise.then(function (js) {
        var jsStr = JSON.stringify(js);
        return jsStr;
    });
}


var JS_STR_CACHE = {};


/**
 *

 app.get('/html2js.js', html2jsCombo());

 <script src="/html2js.js?output=html_tpl&htmls=bixun/html/test.shtml"></script>


 * @returns {Function}
 */
module.exports = function html2jsCombo() {
    return function (req, res) {
        var req_query = req.query;

        var htmls = req_query.htmls;
        var cacheKey = htmls + (req_query.v || '');
        var output = req_query.output;

        var configObj = config.getConfig();
        var baseDir = configObj.html2js_comb_base;
        var isUseCache = configObj.html2js_comb_cache;

        var promise = null;
        if (isUseCache && JS_STR_CACHE[cacheKey]) {
            promise = Promise.resolve(JS_STR_CACHE[cacheKey]);
        } else {
            promise = getHtml2JsContent(baseDir, htmls);
            if (isUseCache) {
                promise = promise.then(function (jsStr) {
                    JS_STR_CACHE[cacheKey] = jsStr;
                    return jsStr;
                });
            }
        }

        promise.then(function (jsStr) {
            if (output) {
                jsStr = "var " + output + " = " + jsStr;
                res.writeHead(200, {
                    'Content-Type': 'application/javascript; charset=utf-8',
                    "Cache-Control": "public, max-age=31536000"
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
            }
            res.write(jsStr);
            res.end();
        });
    }
};
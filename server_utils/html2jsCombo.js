
var config = require('../functions/config');
var string2templateUtils = require('./string2templateUtils');



function getHtml2JsContent(dirPath, htmls) {
    var htmlPathArray = htmls.split(',');
    var jsPromise = string2templateUtils.htmlArray2js(dirPath, htmlPathArray);
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
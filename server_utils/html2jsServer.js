var DevUtils = require('./DevUtils');
var config = require('../functions/config');
var path = require('path');
var fs = require('fs');


function toScriptArray(jsArray0, baseDir, serverROOT, type, staticROOT) {
    jsArray0 = jsArray0 || [];
    var scriptArray = [];
    for (var i = 0; i < jsArray0.length; i++) {
        var js = jsArray0[i];
        var srcPath = '';
        var srcPath0 = path.join(baseDir, js);
        if (type ==='js') {
            srcPath = srcPath0.replace(serverROOT, '');
            scriptArray.push('<script src="' + srcPath + '"></script>');
        } else if(type ==='css'){
            srcPath = srcPath0.replace(serverROOT, '');
            scriptArray.push('<link type="text/css" href="' + srcPath + '" rel="stylesheet" />');
        } else if(type ==='html'){
            srcPath = srcPath0.replace(staticROOT, '');
            if(srcPath.indexOf('/')===0){
                srcPath = srcPath.substr(1,srcPath.length);
            }
            scriptArray.push(srcPath);//    /client/admin/views/aaa.shtml
        }
    }
    return scriptArray;
}


function renderPageInclude(req, res, data, jsonPath ,callback) {

    var configObj = config.getConfig();
    var html2js_tpl_name = configObj.html2js_tpl_name;

    data = data || {};
    fs.readFile(jsonPath, 'utf-8', function (err, jsonStr) {

        if(err){
            res.send(err);
            return;
        }

        var jsonConfig = JSON.parse(jsonStr);

        var config_js = jsonConfig['js'] || [];
        var config_css = jsonConfig['css'] || [];
        var config_html = jsonConfig['html'] || [];

        var config_name = jsonConfig['name'] || 'index';
        var config_out = jsonConfig['out'] || './_dist';
        var config_main = jsonConfig['main'] || './index.html';
        var baseDir = path.dirname(jsonPath);


        if (DevUtils.isProduction(req)) {
            var mainHtmlName = config_name + ".html";
            var outMainHTML = path.join(baseDir,config_out,mainHtmlName);
            res.render(outMainHTML, data, function (a, b, c) {
                callback && callback(a, b, c);
            });
        } else {

            var configObj = config.getConfig();
            var serverROOT = configObj.serverROOT;
            var staticROOT = configObj.staticROOT;

            var scriptArray = toScriptArray(config_js, baseDir, serverROOT, 'js', staticROOT);
            var styleArray = toScriptArray(config_css, baseDir, serverROOT, 'css', staticROOT);
            var htmlArray = toScriptArray(config_html, baseDir, serverROOT, 'html', staticROOT);

            var html2js_comb_name = configObj.html2js_comb_name;
            scriptArray.unshift('<script src="'+html2js_comb_name+'?output=' + html2js_tpl_name + '&htmls=' + htmlArray.join(',') + '&v=_' + new Date().getTime() + '"></script>');

            var includeStyle = styleArray.join('\n');
            var includeScript = scriptArray.join('\n');

            data['_includeStyle_'] = includeStyle;
            data['_includeScript_'] = includeScript;

            var sourceMainHTML = path.join(baseDir, config_main);
            res.render(sourceMainHTML, data ,function(a,b,c){
                callback && callback(a,b,c);
            });
        }

    });

}


module.exports = {
    renderPageInclude: renderPageInclude
};
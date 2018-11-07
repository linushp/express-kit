var DevUtils = require('./DevUtils');
var config = require('../functions/config');
var PathUtils = require('../functions/PathUtils');
var path = require('path');
var fs = require('fs');


function toScriptArray(jsArray0, baseDir, serverROOT, type, staticROOT) {
    jsArray0 = jsArray0 || [];
    var scriptArray = [];

    var version = new Date().getTime();

    for (var i = 0; i < jsArray0.length; i++) {
        var js = jsArray0[i];
        var srcPath = '';
        var srcPath0 = path.join(baseDir, js);

        if (type ==='js') {
            srcPath = srcPath0.replace(serverROOT, '');
            scriptArray.push('<script src="' + srcPath + '?_v='+version+'"></script>');
        } else if(type ==='css'){
            srcPath = srcPath0.replace(serverROOT, '');
            scriptArray.push('<link type="text/css" href="' + srcPath + '?_v='+version+'" rel="stylesheet" />');
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




function renderPageIncludeByConfig(req, res, data, jsonConfig ,page_path,callback){

    var configObj = config.getConfig();
    var html2js_tpl_name = configObj.html2js_tpl_name;

    var config_js = jsonConfig['js'] || [];
    var config_css = jsonConfig['css'] || [];
    var config_html = jsonConfig['html'] || [];

    var config_name = jsonConfig['name'] || 'index';
    var config_out = jsonConfig['out'] || './_dist';
    var config_main = jsonConfig['main'] || './index.html';



    if (DevUtils.isProduction(req)) {
        var outMainHTML = PathUtils.get_page_path(page_path,true);
        res.render(outMainHTML, data, callback);
    } else {

        var baseDir = PathUtils.get_dir_path(page_path,false);
        var configObj = config.getConfig();
        var serverROOT = configObj.serverROOT;
        var staticROOT = configObj.staticROOT;

        var scriptArray = toScriptArray(config_js, baseDir, serverROOT, 'js', staticROOT);
        var styleArray = toScriptArray(config_css, baseDir, serverROOT, 'css', staticROOT);
        var htmlArray = toScriptArray(config_html, baseDir, serverROOT, 'html', staticROOT);


        if(htmlArray.length > 0){
            var html2js_comb_name = configObj.html2js_comb_name;
            scriptArray.unshift('<script src="'+html2js_comb_name+'?output=' + html2js_tpl_name + '&htmls=' + htmlArray.join(',') + '&v=_' + new Date().getTime() + '"></script>');
        }

        var includeStyle = styleArray.join('\n');
        var includeScript = scriptArray.join('\n');

        data['_includeStyle_'] = includeStyle;
        data['_includeScript_'] = includeScript;

        var sourceMainHTML = PathUtils.get_page_path(page_path,false);
        res.render(sourceMainHTML, data ,callback);
    }

}




function renderPageInclude(req, res, data, jsonPath ,callback) {
    data = data || {};
    fs.readFile(jsonPath, 'utf-8', function (err, jsonStr) {
        if(err){
            res.send(err);
            return;
        }
        var jsonConfig = JSON.parse(jsonStr);
        var baseDir = path.dirname(jsonPath);
        renderPageIncludeByConfig(req, res, data, jsonConfig ,baseDir,false,callback);
    });
}


module.exports = {
    renderPageInclude: renderPageInclude,
    renderPageIncludeByConfig:renderPageIncludeByConfig
};
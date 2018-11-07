var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var html2js = require('./html2js');
var cssmin = require('./cssmin');


var config = require('../functions/config');


function minifyCssCode(baseDir, cssArray) {
    var cssContentArray = [];
    for (var i = 0; i < cssArray.length; i++) {
        var cssName = cssArray[i];
        var cssPath = path.join(baseDir, cssName);
        var cssContent = fs.readFileSync(cssPath, 'utf-8');
        cssContent = cssmin(cssContent);
        cssContentArray.push(cssContent);
    }
    return cssContentArray.join("\n");
}


function minifyJavaScript(baseDir, jsArray) {

    if(!jsArray || jsArray.length === 0){
        return "";
    }

    var jsContentArray = [];
    for (var i = 0; i < jsArray.length; i++) {
        var jsName = jsArray[i];
        var jsPath = path.join(baseDir, jsName);
        var jsContent = fs.readFileSync(jsPath, 'utf-8');
        var jsContent1 = UglifyJS.minify(jsContent);
        if (jsContent1.error) {
            console.error("minify error : " + jsName);
            console.log(jsContent1,jsName);
        }
        //jsContentArray.push("\n//" + jsName);
        jsContentArray.push(jsContent1.code);
    }

    return jsContentArray.join("\n");
}


function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

function toStaticPath(jsName, outDir,prod_htmlSrc) {
    var jsPath = path.join(outDir, jsName);
    var configObj = config.getConfig();
    var serverRoot = configObj.serverROOT;

    if (isFunction(prod_htmlSrc)){
        return prod_htmlSrc(jsPath.replace(serverRoot, ''));
    }
    else if (prod_htmlSrc) {
        return prod_htmlSrc + jsPath.replace(serverRoot, '');
    }
    return jsPath.replace(serverRoot, '');

}


function getMainHtmlContent(baseDir, config_main, script, style, is_minify_html) {
    var htmlPath = path.join(baseDir, config_main);

    if(!fs.existsSync(htmlPath)){
        return null;
    }

    var htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    if (is_minify_html) {
        htmlContent = htmlContent.replace(/\n/gm, '');
        htmlContent = htmlContent.replace(/\s{2,}/mg, ' ');
    }

    htmlContent = htmlContent.replace(/<%-\s{0,10}_includeStyle_\s{0,10}%>/gm, style);
    htmlContent = htmlContent.replace(/<%-\s{0,10}_includeScript_\s{0,10}%>/gm, script);
    return htmlContent;
}


function outFile(content, name, baseDir, config_out) {
    var outPath = path.join(baseDir, config_out, name);

    var outDir = path.dirname(outPath);
    var outDir1 = path.resolve(outPath,'..');
    var outDir2 = path.dirname(outPath,'../..');

    if (!fs.existsSync(outDir2)) {
        fs.mkdirSync(outDir2)
    }

    if (!fs.existsSync(outDir1)) {
        fs.mkdirSync(outDir1)
    }

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir)
    }


    fs.writeFileSync(outPath, content, {encoding: 'utf-8'});
}


function deleteFolder(dir_path) {
    var files = [];
    if (fs.existsSync(dir_path)) {
        files = fs.readdirSync(dir_path);
        files.forEach(function (file, index) {
            //var curPath = dir_path + "/" + file;
            var curPath = path.join(dir_path, file);
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir_path);
    }
}


function minifyByJSONConfig(baseDir, jsonConfig, buildConfig) {

    var config_js = jsonConfig['js'] || [];
    var config_css = jsonConfig['css'] || [];
    var config_html = jsonConfig['html'] || [];
    var config_name = jsonConfig['name'] || 'index';
    var config_out = jsonConfig['out'] || './_dist';
    var config_main = jsonConfig['main'] || './index.html';


    var is_inline_script = buildConfig.inline_script;
    var is_inline_style = buildConfig.inline_style;
    var is_minify_html = buildConfig.is_minify_html;
    var prod_htmlSrc = buildConfig.prod_htmlSrc || "";
    var prod_fileName = buildConfig.prod_fileName || function (x) {
        return "min/" + x;
    };


    //1.删除之前的目录
    deleteFolder(path.join(baseDir, config_out));

    var buildTime = new Date().getTime().toString(32).split("").reverse().join("");

    var configObj = config.getConfig();

    //2.编译HTML文件
    var htmlString = html2js.getHtml2JsContent(baseDir, config_html, configObj.html2js_tpl_name);
    //3.编译JS文件
    var jsCode = minifyJavaScript(baseDir, config_js);
    jsCode = htmlString + "\n" + jsCode;
    var jsName = prod_fileName(config_name + "." + buildTime + ".min.js");


    if (!is_inline_script) {
        outFile(jsCode, jsName, baseDir, config_out);
    }


    //4.编译CSS文件
    var cssCode = minifyCssCode(baseDir, config_css);
    var cssName = prod_fileName(config_name + "." + buildTime + ".min.css");

    if (!is_inline_style) {
        outFile(cssCode, cssName, baseDir, config_out);
    }


    //5. 输出HTML主页面
    var outDir = path.join(baseDir, config_out);
    var style, script;

    if (!is_inline_style) {
        style = '<link rel="stylesheet" href="' + toStaticPath(cssName, outDir, prod_htmlSrc) + '" />';
    } else {
        style = '<style type="text/css">\n' + cssCode + '\n</style>'
    }


    if (!is_inline_script) {
        script = '<script type="text/javascript" src="' + toStaticPath(jsName, outDir, prod_htmlSrc) + '"></script>';
    } else {
        script = '<script type="text/javascript">' + jsCode + '</script>';
    }



    if(Array.isArray(config_main)){

        for (var i = 0; i < config_main.length; i++) {
            var config_main_i = config_main[i];
            var mainHtml_i = getMainHtmlContent(baseDir, config_main_i, script, style, is_minify_html);
            if (mainHtml_i) {
                var config_main_i_parse = path.parse(config_main_i);
                var mainHtmlName_i = config_main_i_parse['name'] + ".html";
                outFile(mainHtml_i, mainHtmlName_i, baseDir, config_out);
            }
        }

    }else {

        var mainHtml = getMainHtmlContent(baseDir, config_main, script, style, is_minify_html);
        if (mainHtml) {
            var mainHtmlName = config_name + ".html";
            outFile(mainHtml, mainHtmlName, baseDir, config_out);
        }

    }



}


function minifyByJSON(jsonPath) {
    var baseDir = path.dirname(jsonPath);
    var jsonStr = fs.readFileSync(jsonPath, 'utf-8');
    var jsonConfig = JSON.parse(jsonStr);
    return minifyByJSONConfig(baseDir, jsonConfig);
}


module.exports = {
    minifyByJSON: minifyByJSON,
    minifyByJSONConfig: minifyByJSONConfig
};

//minifyALL(path.join(__dirname, '../static/client-src/admin/index.json'));
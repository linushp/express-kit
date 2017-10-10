var fs = require('fs');
var path = require('path');
var UglifyJS = require('uglify-js');
var html2js = require('./html2js');


var config = require('../functions/config');


function minifyCssCode(baseDir,cssArray){
    var cssContentArray = [];
    for (var i = 0; i < cssArray.length; i++) {
        var cssName = cssArray[i];
        var cssPath  = path.join(baseDir,cssName);
        var jsContent = fs.readFileSync(cssPath, 'utf-8');
        cssContentArray.push(jsContent);
    }
    return cssContentArray.join("\n");
}



function minifyJavaScript(baseDir,jsArray){
    var jsContentArray = [];
    for (var i = 0; i < jsArray.length; i++) {
        var jsName = jsArray[i];
        var jsPath  = path.join(baseDir,jsName);
        var jsContent = fs.readFileSync(jsPath, 'utf-8');
        var jsContent1 = UglifyJS.minify(jsContent);
        if(jsContent1.error){
            console.log(jsContent1.error);
        }
        jsContentArray.push("\n//" +  jsName);
        jsContentArray.push(jsContent1.code);
    }

    return jsContentArray.join("\n");
}



function toStaticPath(jsName,outDir){
    var jsPath = path.join(outDir,jsName);
    var configObj = config.getConfig();
    var serverRoot = configObj.serverROOT;
    return jsPath.replace(serverRoot,'');
}


function getMainHtmlContent(baseDir,config_main,jsName,cssName,config_out){

    var outDir = path.join(baseDir,config_out);

    var style = ' <link rel="stylesheet" href="'+toStaticPath(cssName,outDir)+'" />';
    var script = '<script type="text/javascript" src="'+toStaticPath(jsName,outDir)+'"></script>';

    var htmlPath = path.join(baseDir,config_main);
    var htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    htmlContent = htmlContent.replace(/<%-\s{0,10}_includeStyle_\s{0,10}%>/gm,style);
    htmlContent = htmlContent.replace(/<%-\s{0,10}_includeScript_\s{0,10}%>/gm,script );

    return htmlContent;
}

function outFile(content,name,baseDir,config_out){
    var outPath = path.join(baseDir,config_out,name);
    var outDir = path.dirname(outPath);
    if(!fs.existsSync(outDir)){
        fs.mkdirSync(outDir)
    }
    fs.writeFileSync(outPath, content ,{encoding:'utf-8'});
}


function deleteFolder(dir_path) {
    var files = [];
    if (fs.existsSync(dir_path)) {
        files = fs.readdirSync(dir_path);
        files.forEach(function (file, index) {
            var curPath = dir_path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir_path);
    }
}

function minifyByJSON(jsonPath){

    var jsonStr = fs.readFileSync(jsonPath, 'utf-8');
    var jsonConfig = JSON.parse(jsonStr);

    var config_js = jsonConfig['js'] || [];
    var config_css = jsonConfig['css'] || [];
    var config_html = jsonConfig['html'] || [];
    var config_name = jsonConfig['name'] || 'index';
    var config_out = jsonConfig['out'] || './_dist';
    var config_main = jsonConfig['main'] || './index.html';
    var baseDir = path.dirname(jsonPath);


    //1.删除之前的目录
    deleteFolder(path.join(baseDir,config_out));

    var buildTime = new Date().getTime();

    var configObj = config.getConfig();

    //2.编译HTML文件
    var htmlString = html2js.getHtml2JsContent(baseDir,config_html,configObj.html2js_tpl_name);
    //3.编译JS文件
    var jsCode = minifyJavaScript(baseDir,config_js);
    jsCode = htmlString + "\n" + jsCode;
    var jsName = config_name + "." + buildTime + ".min.js";
    outFile(jsCode, jsName, baseDir, config_out);


    //4.编译CSS文件
    var cssCode = minifyCssCode(baseDir,config_css);
    var cssName = config_name + "." + buildTime + ".min.css";
    outFile(cssCode,cssName,baseDir,config_out);


    //5. 输出HTML主页面
    var mainHtml = getMainHtmlContent(baseDir,config_main,jsName,cssName,config_out);
    var mainHtmlName = config_name + ".html";
    outFile(mainHtml,mainHtmlName,baseDir,config_out);
}


module.exports = {
    minifyByJSON:minifyByJSON
};

//minifyALL(path.join(__dirname, '../static/client-src/admin/index.json'));
var config = require('./config');
var path = require('path');
var fs = require('fs');
var util = require('util')
var fs_async_readdir = util.promisify(fs.readdir);
var fs_async_exists = function(xx){
    return new Promise(function (resolve) {
        fs.exists(xx,function (isOK) {
            resolve(isOK)
        });
    });
};

var fs_async_stat = util.promisify(fs.stat);


function isFileExclude(fileName){
    var configObj = config.getConfig();
    var exclude_prefix = configObj.exclude_prefix;
    if(exclude_prefix === undefined){
        exclude_prefix = '_';
    }

    if(Array.isArray(exclude_prefix)){
        for (var i = 0; i < exclude_prefix.length; i++) {
            var exclude_prefix_i = exclude_prefix[i];
            if(exclude_prefix_i && fileName.indexOf(exclude_prefix_i) === 0){
                return true;
            }
        }
    }else {
        if(fileName.indexOf(exclude_prefix) === 0){
            return true;
        }
    }
    return false;
}



async function getFolderFilesAsync(dir_path, resultList) {
    resultList = resultList || [];

    try {
        var isExists = await fs_async_exists(dir_path);
        if (isExists) {
            var files = await fs_async_readdir(dir_path);

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var curPath = path.join(dir_path, file);

                if(!isFileExclude(file)){
                    var f_stats = await fs_async_stat(curPath);
                    if (f_stats.isDirectory()) {
                        await getFolderFilesAsync(curPath,resultList);
                    } else {
                        resultList.push(curPath);
                    }
                }
            }

            return resultList;
        } else {
            return resultList;
        }
    }catch (e){
        console.log("exception:",e);
        return resultList;
    }
}



function getFolderFiles(dir_path,resultList) {

    resultList = resultList || [];

    var files = [];
    if (fs.existsSync(dir_path)) {
        files = fs.readdirSync(dir_path);
        files.forEach(function (file, index) {
            var curPath = path.join(dir_path, file);

            if(!isFileExclude(file)){
                if (fs.statSync(curPath).isDirectory()) {
                    getFolderFiles(curPath,resultList);
                } else {
                    resultList.push(curPath);
                }
            }

        });
    }

    return resultList;
}



function createJsonConfig_getWeight(fileOrder,lastOrder,a){
    for (var i = 0; i < fileOrder.length; i++) {
        var obj = fileOrder[i];
        if(a.indexOf(obj) === 0){
            return i;
        }
    }


    for (var i = 0; i < lastOrder.length; i++) {
        var obj = lastOrder[i];
        if(a.indexOf(obj) === 0){
            return (2000 + i);
        }
    }

    return 999;
}


function createJsonConfigByFileList(dir_path,fileList) {

    var fileOrder = ['framework','common','func','util','api','store','action','comp','view','page','src'];
    var lastOrder = ['main','index'];

   var fileListRemoveBase = fileList;


    var result_name = path.parse(dir_path)['name']||'index';

    var result = {
        "html": [],
        "js": [],
        "css": [],
        "name": result_name,
        "main": []
    };

    for (var i = 0; i < fileListRemoveBase.length; i++) {
        var fileName = fileListRemoveBase[i];
        var extname = path.extname(fileName);
        if(extname === '.css'){
            result.css.push(fileName);
        }else if(extname ==='.js'){
            result.js.push(fileName);
        }else if(extname === '.shtml'){
            result.html.push(fileName);
        }else if(extname === '.html'){
            result.main.push(fileName);
        }
    }

    return result;
}


function createJsonConfigAsync(dir_path) {
    var promise = getFolderFilesAsync(dir_path,[]);
    return promise.then(function (fileList) {
        return createJsonConfigByFileList(dir_path,fileList);
    });
}


function mergeJsonConfig(jsonConfig1,jsonConfig2) {

    jsonConfig1 = jsonConfig1 || {};
    jsonConfig2 = jsonConfig2 || {};

    var html1 = jsonConfig1['html'] || [];
    var js1 = jsonConfig1['js'] || [];
    var css1 = jsonConfig1['css'] || [];
    var name1 = jsonConfig1.name;
    var main1 = jsonConfig1['main'] || [];

    var html2 = jsonConfig2['html'] || [];
    var js2 = jsonConfig2['js'] || [];
    var css2 = jsonConfig2['css'] || [];
    var name2 = jsonConfig2.name;
    var main2 = jsonConfig2['main'] || [];


    return {
        "html": html1.concat(html2),
        "js": js1.concat(js2),
        "css": css1.concat(css2),
        "name": name2 || name1,
        "main": main1.concat(main2)
    }
}



function sortListByChar(arr) {
    return arr.sort(function (a,b) {
        var path_a = path.parse(a);
        var path_b = path.parse(b);

        if(path_a.name === 'index'){
            return 1;
        }

        if(path_b.name === 'index'){
            return -1;
        }

        var x =  a.localeCompare(b);
        return x;
    })
}

function sortJsonConfigObj(jsonConfig1) {
    jsonConfig1 = jsonConfig1 || {};

    var name1 = jsonConfig1.name;
    var html1 = sortListByChar(jsonConfig1['html'] || []);
    var js1 = sortListByChar(jsonConfig1['js'] || []);
    var css1 = sortListByChar(jsonConfig1['css'] || []);
    var main1 = sortListByChar(jsonConfig1['main'] || []);

    return {
        "html": html1,
        "js": js1,
        "css": css1,
        "name": name1,
        "main": main1
    }
}

function createJsonConfig(dir_path0,include_commons_dir_list){

    var dir_path_list = [].concat(include_commons_dir_list);
    dir_path_list.push(dir_path0);

    var jsonConfigObjResult = {};

    for (var i = 0; i < dir_path_list.length; i++) {
        var dir_path = dir_path_list[i];
        var fileList = getFolderFiles(dir_path,[]);
        var jsonConfigObj =  createJsonConfigByFileList(dir_path,fileList);
        jsonConfigObjResult = mergeJsonConfig(jsonConfigObjResult,jsonConfigObj);
    }


    jsonConfigObjResult = sortJsonConfigObj(jsonConfigObjResult);
    
    return jsonConfigObjResult;
}


module.exports = {
    createJsonConfigAsync:createJsonConfigAsync,
    createJsonConfig:createJsonConfig,
    getFolderFiles:getFolderFiles,
    getFolderFilesAsync:getFolderFilesAsync
};

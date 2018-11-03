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

    if(fileName.indexOf(exclude_prefix) === 0){
        return true;
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
                console.log(curPath);

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


function createJsonConfigByFileList(fileList) {

    var fileOrder = ['framework','common','func','util','api','store','action','comp','view','page','src'];
    var lastOrder = ['main','index'];
    var fileListRemoveBase = fileList.map(function(filePath){
        return filePath.replace(dir_path +  path.sep ,'');
    });

    fileListRemoveBase = fileListRemoveBase.sort(function(a,b){
        var weight_a = createJsonConfig_getWeight(fileOrder,lastOrder,a);
        var weight_b = createJsonConfig_getWeight(fileOrder,lastOrder,b);
        if(weight_a === weight_b){
            return a.localeCompare(b);
        }
        return weight_a - weight_b;
    });


    var result = {
        "html": [],
        "js": [],
        "css": [],
        "name": "index",
        "main": "./index.html"
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
        }
    }

    return result;
}


function createJsonConfigAsync(dir_path) {
    var promise = getFolderFilesAsync(dir_path,[]);
    return promise.then(function (fileList) {
        return createJsonConfigByFileList(fileList);
    });
}


function createJsonConfig(dir_path){
    var fileList = getFolderFiles(dir_path,[]);
    return createJsonConfigByFileList(fileList);
}


module.exports = {
    createJsonConfigAsync:createJsonConfigAsync,
    createJsonConfig:createJsonConfig,
    getFolderFiles:getFolderFiles,
    getFolderFilesAsync:getFolderFilesAsync
};

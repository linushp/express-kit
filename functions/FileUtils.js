var config = require('./config');
var path = require('path');
var fs = require('fs');



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



function createJsonConfig_getWeight(fileOrder,a){
    for (var i = 0; i < fileOrder.length; i++) {
        var obj = fileOrder[i];
        if(a.indexOf(obj) === 0){
            return i;
        }
    }
    return 999;
}

function createJsonConfig(dir_path){
    var fileList = getFolderFiles(dir_path,[]);
    var fileOrder = ['common','func','util','apis','store','action','comp','view','page','src'];
    var lastOrder = ['main','index'];
    var fileListRemoveBase = fileList.map(function(filePath){
        return filePath.replace(dir_path +  path.sep ,'');
    });

    fileListRemoveBase = fileListRemoveBase.sort(function(a,b){
        var weight_a = createJsonConfig_getWeight(fileOrder,a);
        var weight_b = createJsonConfig_getWeight(fileOrder,b);
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
    }

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


module.exports = {
    createJsonConfig:createJsonConfig,
    getFolderFiles:getFolderFiles
};

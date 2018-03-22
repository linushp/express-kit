var fs = require('fs');
var path = require('path');






function copyAndReplace(fromSrc, toDist, fileNameReplace, fileContentReplace) {

    if (!fs.existsSync(toDist)) {
        fs.mkdirSync(toDist)
    }


    var oldFileName = path.basename(fromSrc);


    if(fs.statSync(fromSrc).isDirectory()){

        //创建一个空文件夹
        var newFileName = fileNameReplace(oldFileName,true);
        var mm = path.join(toDist,newFileName);
        fs.mkdirSync(mm);

        var files = fs.readdirSync(fromSrc);
        files.forEach(function (file, index) {
            var fromSrc2 = path.join(fromSrc,file);
            var toDist2 = mm;
            copyAndReplace(fromSrc2,toDist2,fileNameReplace,fileContentReplace);
        });


    }else {
        var newFileName = fileNameReplace(oldFileName,false);
        //直接复制文件
        var fileContent = fs.readFileSync(fromSrc, 'utf-8');
        fileContent = fileContentReplace(fileContent);
        var outPath = path.join(toDist,newFileName);
        fs.writeFileSync(outPath, fileContent, {encoding: 'utf-8'});
    }



}


module.exports = copyAndReplace;

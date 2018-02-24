/**
 * Created by luanhaipeng on 2017/10/10.
 */
var path = require('path');
var DevUtils = require('./server_utils/DevUtils');
var html2jsCombo = require('./server_utils/html2jsCombo');
var html2jsServer = require('./server_utils/html2jsServer');
var languageParser = require('./server_utils/languageParser');
var FileCacheReader = require('./server_utils/FileCacheReader');
var config = require('./functions/config');
var FileUtils = require('./functions/FileUtils');
var minifyKit = require('./tools_kit/minifyKit');


module.exports = {
    doConfig: function (config0) {
        return config.doConfig(config0)
    },

    DevUtils: DevUtils,
    html2jsCombo: html2jsCombo,
    languageParser: languageParser,
    FileCacheReader: FileCacheReader,

    html2jsRender: function (req, res, data, jsonPath, callback) {
        return html2jsServer.renderPageInclude(req, res, data, jsonPath, callback);
    },

    minifyByJSON: function (jsonPath) {
        minifyKit.minifyByJSON(jsonPath);
    },

    minifyByJSONConfig:function(baseDir,jsonConfig){
        return minifyKit.minifyByJSONConfig(baseDir,jsonConfig);
    },

    getFolderFiles: function (dir_path) {
        return FileUtils.getFolderFiles(dir_path, []);
    },

    createJsonConfig: function (dir_path) {
        return FileUtils.createJsonConfig(dir_path);
    },


    /**
     * @param dir_path
     * @param buildConfig {inline_script:boolean,inline_style:boolean,is_minify_html:boolean,prod_prefix:string}
     */
    build:function(dir_path,buildConfig){
        var time1 = new Date().getTime();
        var sss = FileUtils.createJsonConfig(dir_path);
        var time2 = new Date().getTime();
        console.log(JSON.stringify(sss));
        minifyKit.minifyByJSONConfig(dir_path,sss,buildConfig || {});
        console.info("\nBuild Successfully , Cost time :" + (time2-time1));
    },

    
    render: function (req, res, dir_path, data, callback) {

        data = Object.assign({}, data || {});

        if (DevUtils.isProduction(req)) {
            var outMainHTML = path.join(dir_path, './_dist/index.html');
            res.render(outMainHTML, data, callback);
        } else {
            var jsonConfig = FileUtils.createJsonConfig(dir_path);
            return html2jsServer.renderPageIncludeByConfig(req, res, data, jsonConfig, dir_path, callback);
        }

    }
};
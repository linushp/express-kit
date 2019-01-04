/**
 * Created by luanhaipeng on 2017/10/10.
 */
var path = require('path');
var DevUtils = require('./server_utils/DevUtils');
var html2jsCombo = require('./server_utils/html2jsCombo');
var html2jsServer = require('./server_utils/html2jsServer');
var languageParser = require('./server_utils/languageParser');
var FileCacheReader = require('./server_utils/FileCacheReader');
var string2templateUtils = require('./server_utils/string2templateUtils');
var javaScriptCodeStringUtils = require('./server_utils/javaScriptCodeStringUtils');
var config = require('./functions/config');
var FileUtils = require('./functions/FileUtils');
var PathUtils = require('./functions/PathUtils');
var minifyKit = require('./tools_kit/minifyKit');
var copyAndReplace = require('./tools_kit/copyAndReplace');


module.exports = {

    doConfigBaseDir: function (base_folder) {
        return config.doConfig({
            html2js_comb_base: base_folder,
            staticROOT: base_folder
        })
    },

    doConfig: function (config0) {
        return config.doConfig(config0)
    },

    copyAndReplace: copyAndReplace,
    DevUtils: DevUtils,
    html2jsCombo: html2jsCombo,
    languageParser: languageParser,
    FileCacheReader: FileCacheReader,
    htmlArray2js: function (base_folder, htmlPathArray) {
        return string2templateUtils.htmlArray2js(base_folder, htmlPathArray);
    },


    getStringTemplateAsync: function (base_folder) {
        var jsonConfigPromise = FileUtils.createJsonConfigAsync(base_folder);
        return jsonConfigPromise.then(function (configObj) {
            var htmlPathArray = configObj.html || [];
            return string2templateUtils.htmlArray2js(base_folder, htmlPathArray);
        });
    },

    getJavaScriptContentAsync: function (base_folder) {
        var jsonConfigPromise = FileUtils.createJsonConfigAsync(base_folder);
        return jsonConfigPromise.then(function (configObj) {
            var jsPathArray = configObj.js || [];
            return javaScriptCodeStringUtils.toCodeString(base_folder, jsPathArray);
        });
    },


    html2jsRender: function (req, res, data, jsonPath, callback) {
        return html2jsServer.renderPageInclude(req, res, data, jsonPath, callback);
    },

    minifyByJSON: function (jsonPath) {
        minifyKit.minifyByJSON(jsonPath);
    },

    minifyByJSONConfig: function (baseDir, jsonConfig) {
        return minifyKit.minifyByJSONConfig(baseDir, jsonConfig);
    },

    getFolderFiles: function (dir_path) {
        return FileUtils.getFolderFiles(dir_path, []);
    },

    createJsonConfig: function (dir_path) {
        return FileUtils.createJsonConfig(dir_path);
    },


    /**
     * @param dir_path
     * @param buildConfig {inline_script:boolean,inline_style:boolean,is_minify_html:boolean,prod_prefix:string,include_commons:[]}
     */
    build: function (dir_path, buildConfig) {
        buildConfig = buildConfig || {};

        var time1 = new Date().getTime();
        var include_commons = buildConfig['include_commons'] || [];
        var sss = FileUtils.createJsonConfig(dir_path,include_commons);
        console.log(sss)
        var time2 = new Date().getTime();
        console.log(JSON.stringify(sss));
        minifyKit.minifyByJSONConfig(dir_path, sss, buildConfig);
        console.info("\nBuild Successfully , Cost time :" + (time2 - time1));
    },


    render: function (req, res, page_path, data, tempConfig, callback) {

        data = Object.assign({}, data || {});

        if (DevUtils.isProduction(req)) {
            var outMainHTML = PathUtils.get_page_path(page_path, true);
            res.render(outMainHTML, data, callback);
        } else {
            var dir_path = PathUtils.get_dir_path(page_path, false);
            var include_commons_dir_list = tempConfig['include_commons'] || [] ;
            var jsonConfig = FileUtils.createJsonConfig(dir_path,include_commons_dir_list);
            return html2jsServer.renderPageIncludeByConfig(req, res, data, jsonConfig, page_path, callback);
        }

    }
};
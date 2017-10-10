/**
 * Created by luanhaipeng on 2017/10/10.
 */

var DevUtils = require('./server_utils/DevUtils');
var html2jsCombo = require('./server_utils/html2jsCombo');
var html2jsServer = require('./server_utils/html2jsServer');
var config = require('./functions/config');
var minifyKit = require('./tools_kit/minifyKit');



module.exports = {
    DevUtils:DevUtils,
    html2jsCombo:html2jsCombo,
    html2jsRender: html2jsServer.renderPageInclude,
    doConfig: function(config0){
        return config.doConfig(config0)
    },

    minifyByJSON:function(jsonPath){
        minifyKit.minifyByJSON(jsonPath);
    }

};
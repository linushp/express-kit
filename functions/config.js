var path = require('path');

function extendObject(a, b) {
    for (var key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}


var serverROOT =  path.join(__dirname, "../..");
var staticROOT =  path.join(serverROOT,"./static");

var config = {
    html2js_comb_name:'/html2js.js',
    html2js_tpl_name: "html2js_tpl",
    html2js_comb_cache: false,
    html2js_comb_base: staticROOT,
    serverROOT: serverROOT,
    staticROOT: staticROOT
};

module.exports = {
    doConfig: function (config0) {
        return extendObject(config, config0)
    },
    getConfig: function () {
        return config;
    }
};
function isHasProcessArg(argName) {
    var argvArray = process.argv;
    for (var i = 0; i < argvArray.length; i++) {
        var obj = argvArray[i];
        if (obj === argName) {
            return true;
        }
    }
    return false;
}


function isProduction(req) {

    var req_query = req.query;

    var _isProduction = (req_query['isProduction'] || "") + "";
    if (_isProduction && _isProduction.length > 0) {
        return true;
    }

    var isDev = (req_query['isDev'] || "") + "";

    if (isDev && isDev.length > 0) {
        return false;
    }

    return !isHasProcessArg('is_dev');
}


module.exports = {
    isHasProcessArg: isHasProcessArg,
    isDev: isHasProcessArg('is_dev'),
    isProduction: isProduction
};
var path = require('path');


function is_page_path(p) {
    var xxx = path.extname(p);
    return (xxx === '.html');
}

function get_dir_path(p, is_production) {
    var path_parsed = path.parse(p);
    return path_parsed['dir'];
}


function get_page_path(p, is_production) {

    var dir_path = get_dir_path(p,is_production);

    if(is_page_path(p)){

        var path_parsed = path.parse(p);
        var file_name = path_parsed['base'];

        if(is_production){
            return path.join(dir_path, './_dist/', file_name);
        }else {
            return path.join(dir_path, file_name);
        }

    }else {

        if(is_production){
            return path.join(dir_path, './_dist/index.html');
        }else {
            return path.join(dir_path, './index.html');
        }
    }
}

module.exports = {
    get_dir_path:get_dir_path,
    get_page_path:get_page_path
};
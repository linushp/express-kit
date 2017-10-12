#

## _build.js

```
require('express-kit').build(__dirname);
```

## router

```
router.get('/admin',function(req,res){
    var p = path.join(__dirname,'../../static/admin');
    ExpressKit.render(req,res,{},p);
});
```
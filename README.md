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



## HTML

```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta http-equiv="content-language" content="zh-CN" />
    <meta charset="UTF-8">
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=yes"/>
    <meta name="screen-orientation" content="portrait" />
    <%- _includeStyle_ %>
</head>
<body>

<div id="mainBody">
    <router-view/>
</div>

<script src="/static/lib/vue-2.3.0/vue.min.js"></script>
<%- _includeScript_ %>
</body>
</html>

```
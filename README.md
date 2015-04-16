#前端页面性能测试
By nodejs + phantomjs + Yslow

## 运行

```bash
$ ./phan.sh start
```

##额外接口

###接口名

```bash
/phan/getHtml  : 获取网页内容（html标签的innerHTML）
```

```bash
/phan/getA : 获取网页中A标签地址
```

###参数

```bash
url/token/filter
```

* `url` 要抓取网页的URL，包含特殊符号需要转义。（必须）
* `token` 123456（必须，可在controller/init.json中配置）
* `filter` 只有 getA 接口接受此参数。（可选）
    * filter = ''：返回的A标签地址列表只包含当前域名（默认）
    * filter = 'crs' ：返回的A标签地址列表不包含当前域名
    * filter = 'all' : 返回所有A标签地址列表

###Eg

获取www.baidu.com页面中所有A标签地址（不包含当前域）

`http://yourserver/phan/getA/www.baidu.com/123456/crs`

返回值

```js
{
    code : 200,
    data : [' http://news.baidu.com/'...],
    err : null,
    msg : ""
}
```

* `code`
    * 200：正常
    * 404：无效的URL
    * 500：加载页面失败
    * phantomjs执行错误
* `data` 抓取的数据。`getA`返回数组，`getHtml`返回字符串
* `err` 错误信息（phantomjs执行错误）
* `msg` 提示信息

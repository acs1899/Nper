var page = require('webpage'),
    login = page.create(),
    baidu = page.create();
baidu.viewportSize = { width: 1920, height: 1080 };
/*baidu.addCookie = {
    'name':'acs1899',
    'value':'1',
    'domain':'www.baidu.com',
    'path':'/',
    'expires'  : (new Date()).getTime() + (1000 * 60 * 60)
};*/

bai();

function bai(){
    baidu.onResourceRequested = function(request){
      //console.log('Request: ' + JSON.stringify(request, undefined, 4));
    }
    /*baidu.onResourceReceived = function(response) {
      console.log('Receive ' + JSON.stringify(response, undefined, 4));
    };*/
    baidu.onLoadFinished = function(){

    }
    baidu.onNavigationRequested = function(url, type, willNavigate, main){
        //console.log('Trying to navigate to: ' + url);
        /*console.log('Caused by: ' + type);
        console.log('Will actually navigate: ' + willNavigate);
        console.log('Sent from the page\'s main frame: ' + main);*/
    }
    baidu.open('http://sae.sina.com.cn',function(status){
        if(status === 'success'){
            baidu.render('assets/image/baidu.jpg');
        }
        phantom.exit();
    });
}
function log(){
    login.open('https://passport.baidu.com/v2/?login',function(status){
        if(status === 'success'){
            login.evaluate(function (){
                var uname = document.getElementById('TANGRAM__PSP_3__userName');
                var pass = document.getElementById('TANGRAM__PSP_3__password');
                var member = document.getElementById('TANGRAM__PSP_3__memberPass');
                var form = document.getElementById('TANGRAM__PSP_3__form');

                uname.value = 'acs1899';
                pass.value = 'yrn4lkvd';
                member.checked =true;

                form.submit();
            });
        }
        //setTimeout(function(){login.render('login.jpg')},5000);
        //phantom.exit();
    });

    login.onNavigationRequested = function(url,type,willNavigate,main){
        //console.log('Trying to navigate to: ' + url);
        //console.log('Caused by: ' + type);
        //console.log('Will actually navigate: ' + willNavigate);
        //console.log('Sent from the page\'s main frame: ' + main);
    }

    login.onLoadFinished = function(status){
        if(status === 'success'){
            var title = login.evaluate(function(){
               return document.title
            });
            console.log(title)
        }
    }
}

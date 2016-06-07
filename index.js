var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xmlhttp = new XMLHttpRequest();

//var bootstrap = require('bootstrap');
//var jQuery = require('jquery');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/interface', function(request, response) {

  var orgs = (typeof request.query.orgs == "undefined" ? "":request.query.orgs),
      selectedMethod = ( typeof request.query.methodSearch === "undefined"? "organization" : request.query.methodSearch);
  //if not null search input
  if(orgs!= ""){
  //init variables to pass in interface view
  var  page = (typeof request.query.page == "undefined" ? 1:request.query.page),
      per_page = (typeof request.query.per_page == "undefined" ? 10:request.query.per_page),
      sort = (typeof request.query.sort == "undefined" ? "": request.query.sort ),
      order= (typeof request.query.order == "undefined" ? "":request.query.order),
      searchLink = '/interface?orgs='+orgs+'&methodSearch='+selectedMethod+'&per_page='+per_page+'&sort='+sort+'&order='+order,
      sortLink = '/interface?orgs='+orgs+'&methodSearch='+selectedMethod+'&per_page='+per_page+'&page='+page,
      ApiLink= 'https://api.github.com/search/repositories?q='+orgs+'&t=repositories&per_page='+per_page+'&';

//when search for user's repository
if(selectedMethod == "username"){
  ApiLink = 'https://api.github.com/users/'+orgs+'/repos?';
}
    //get the results from the api github
    getJSON(ApiLink+'page='+page+'&sort='+sort+'&order='+order, function(data) {//&page,per_page,sort,order

  var jsonObject =  JSON.parse(data);

//init sortArray
 var sortArray = new Array();
 sortArray[""] = "Best match";
 sortArray["stars"] = "Most stars";
 sortArray["asc_stars"] = "Fewest stars";
 sortArray["forks"] = "Most forks";
 sortArray["asc_forks"] = "Fewest forks";
 sortArray["updated"] = "ecently updated";
 sortArray["asc_updated"] = "Least recently updated";


//init variables for the pagination, json resutls from api comes in different ways
  var   totalResults = (selectedMethod == "username"? jsonObject.length : jsonObject.total_count),
    pageSize =per_page,
    pageCount = totalResults/per_page,
    currentPage = page ;


///get the view and passing all the variables above
    response.render('pages/interface',{
                                        items: (selectedMethod == "username"? jsonObject : jsonObject.items) ,
                                        orgs: orgs,
                                        selectedMethod: selectedMethod,
                                        page: page,
                                        per_page: per_page,
                                        sort: sort,
                                        order: order,
                                        totalResults: totalResults,
                                        pageSize: pageSize,
                                        pageCount: pageCount,
                                        currentPage: currentPage,
                                        searchLink: searchLink,
                                        sortArray:sortArray,
                                      sortLink: sortLink
                                      });
    }, function(status) {

    	  console.log('Something went wrong.');
          response.render('pages/interface');
    });

}else{
  response.render('pages/interface',{orgs,selectedMethod});
}

});


app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

var pg = require('pg');

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var getJSON = function(url, successHandler, errorHandler) {
	var xhr = typeof XMLHttpRequest != 'undefined'
		? new XMLHttpRequest()
		: new ActiveXObject('Microsoft.XMLHTTP');
	xhr.open('get', url, true);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function() {
		var status;
		var data;
		// https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
		if (xhr.readyState == 4) { // `DONE`
			status = xhr.status;
			if (status == 200) {
				successHandler && successHandler(xhr.responseText);
			} else {
				errorHandler && errorHandler(status);
			}
		}
	};
	xhr.send();
};

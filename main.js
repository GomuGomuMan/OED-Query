var Horsemen = require('node-horseman');
var async = require('async');
var stringify = require('csv-stringify');
var fs = require('fs');


var outCSV = fs.createWriteStream('file.csv', {flags: 'r+'});


var getPageInfo = function (id) {



    return function (callback) {
        var out = [];

        var rider = new Horsemen({
            loadImages: false
        });

        rider
            .open('http://www.oed.com/view/Entry/' + id)
            .status()
            .then(function (result) {
                if (result !== 200) {
                    return rider.close() && callback(null, out);
                } else {
                    out.push(id);

                    // circa
                    rider.text('.entryBase .quotationsBlock:first .quotation:first > span:first > span:first')
                        .then(function (res) {
                            var match = res.match(/(\w?\d{3,4})/);
                            if (match) {
                                out.push(match[1].trim());
                            } else {
                                out.push(res.trim());
                            }

                            return 0;
                        });

                    // word
                    rider.text('.hw')
                        .then(function (res) {
                            out.push(res.trim());
                            return 0;
                        });

                    // type
                    rider.text('.ps:first')
                        .then(function (res) {
                            out.push(res.trim());
                            return 0;
                        });

                    // first def
                    // TODO: Get rid of the numbering one each line using regexp
                    // [^\d.\s+].+
                    rider.text('.top:first > h3:first')
                        .then(function (res) {
                            var match = res.match(/\s(\d|\w)\.\s*(.*)/);

                            if (match)
                                console.log("After regexp:" + match[2]);
                            else
                                console.log("Nothing! ");
                            //console.log("Res: " + res);
                            //console.log("After regexp: " + match[1]);


                            out.push(res);
                            return 0;
                        });

                    // etymology
                    rider.text('.etymSummary')
                        .then(function (res) {
                            out.push(res.trim());
                            //console.log(out);

                            stringify(out, function(err, output){
                                console.log([out]);
                               outCSV.write([out] + '\n');

                            });


                            return rider.close() && callback(null, out);
                        });
                }


            })
            .catch(function (err) {
                console.log(err);
                callback(err);
            })
        ;


    };
};

var funcs = [];
for (var i = 1; i <= 10; i ++) {
    funcs.push(getPageInfo(i));


}

async.parallelLimit(funcs, 10, function(err, results){
    if (err) {
        console.log(error);
        throw err;
    }


    //console.log(results);
});
;
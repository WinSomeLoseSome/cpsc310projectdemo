"use strict";
var Server_1 = require('../../cpsc310project/src/rest/Server');
var Util_1 = require("../src/Util");
var frisby = require('icedfrisby');
var Joi = require('joi');
var FormData = require('form-data');
var fs = require('fs');
var http = require('http');
var lodash = require('lodash');
var chai_1 = require('chai');
var TestUtil_1 = require("./TestUtil");
describe("Query Service", function () {
    this.timeout(5000);
    var URL = 'http://localhost:4321/query';
    var server;
    before(function () {
        return new Promise(function (fulfill, reject) {
            server = new Server_1.default(4321);
            server.start().then(function (val) {
                Util_1.default.test("QueryService::before() - started: " + val);
                var readStream = fs.createReadStream("./310courses.1.0.zip");
                var options = {
                    host: 'localhost',
                    port: 4321,
                    path: '/dataset/courses',
                    method: 'PUT'
                };
                var req = http.request(options, function (res) {
                    server.stop().then(function (val) {
                        Util_1.default.test("QueryService::before() - stopped: " + val);
                        fulfill();
                    }).catch(function (err) {
                        Util_1.default.error("QueryService::before() - ERROR: " + err);
                        reject();
                    });
                });
                readStream.pipe(req);
            }).catch(function (err) {
                Util_1.default.error("QueryService::before() - ERROR: " + err);
                reject();
            });
        });
    });
    beforeEach(function (done) {
        server = new Server_1.default(4321);
        server.start().then(function (val) {
            Util_1.default.test("QueryService::beforeEach() - started: " + val);
            done();
        }).catch(function (err) {
            Util_1.default.error("QueryService::beforeEach() - ERROR: " + err);
            done();
        });
    });
    afterEach(function (done) {
        server.stop().then(function (val) {
            Util_1.default.test("QueryService::afterEach() - closed: " + val);
            done();
        }).catch(function (err) {
            Util_1.default.error("QueryService::afterEach() - ERROR: " + err);
            done();
        });
    });
    var file = fs.readFileSync("./test/queries.json");
    var tests = JSON.parse(file);
    var _loop_1 = function(test_1) {
        var types = getJSONTypes(JSON.parse(test_1["expected-json-types"]));
        var expectedResult = generateResultJSON(test_1["expected-json"]);
        frisby.create(test_1["title"])
            .post(URL, test_1["query"], {
            json: true
        })
            .inspectRequest('Request: ')
            .inspectStatus('Response status: ')
            .inspectBody('Response body: ')
            .expectStatus(test_1["expected-status"])
            .expectJSONTypes(types)
            .afterJSON(function (json) {
            chai_1.expect(typeof json.result).not.to.equal('undefined');
            chai_1.expect(typeof json.render).not.to.equal('undefined');
            var renderSame = lodash.isEqual(json["render"], expectedResult["render"]);
            chai_1.expect(renderSame).to.be.true;
            var sortKey = null;
            if (typeof test_1["query"]["ORDER"] !== 'undefined') {
                sortKey = test_1["query"]["ORDER"];
            }
            var sameOutput = TestUtil_1.default.compareJSONArrays(json.result, expectedResult.result, sortKey);
            chai_1.expect(sameOutput).to.be.true;
        })
            .toss();
    };
    for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
        var test_1 = tests_1[_i];
        _loop_1(test_1);
    }
    function getJSONTypes(json) {
        var types = {};
        for (var key in json) {
            var t = json[key];
            types[key] = eval(t);
        }
        return types;
    }
    function generateResultJSON(query) {
        var file = fs.readFileSync("./test/results/" + query);
        return JSON.parse(file);
    }
    frisby.create('Should not be able to submit an empty query')
        .post(URL, {})
        .inspectRequest('Request: ')
        .inspectStatus('Response status: ')
        .inspectBody('Response body: ')
        .expectStatus(400)
        .toss();
    frisby.create('Should not be able to hit an endpoint that does not exist')
        .post('http://localhost:4321/post')
        .inspectRequest('Request: ')
        .inspectStatus('Response status: ')
        .inspectBody('Response body: ')
        .expectStatus(404)
        .toss();
});
//# sourceMappingURL=ServerQuerySpec.js.map
/**
 * Created by rtholmes on 17-08-2016.
 */

import Server from '../../cpsc310project/src/rest/Server';
import {QueryRequest} from "../src/controller/QueryController";

import Log from "../src/Util";

// https://www.npmjs.com/package/icedfrisby
var frisby = require('icedfrisby');
var Joi = require('joi');
var FormData = require('form-data');
var fs = require('fs');
var http = require('http');
var lodash = require('lodash');
import {expect, assert} from 'chai';
import TestUtil from "./TestUtil";

describe("Query Service", function () {
    this.timeout(5000);
    const URL = 'http://localhost:4321/query';
    var server: Server;

    before(function () {
        return new Promise(function (fulfill, reject) {
            server = new Server(4321);
            server.start().then(function (val: boolean) {
                Log.test("QueryService::before() - started: " + val);

                var readStream = fs.createReadStream("./310courses.1.0.zip");

                var options = {
                    host:   'localhost',
                    port:   4321,
                    path:   '/dataset/courses',
                    method: 'PUT'
                };

                var req = http.request(options, function (res: any) {
                    server.stop().then(function (val: boolean) {
                        Log.test("QueryService::before() - stopped: " + val);
                        fulfill();
                    }).catch(function (err) {
                        Log.error("QueryService::before() - ERROR: " + err);
                        reject();
                    });
                });
                readStream.pipe(req);
            }).catch(function (err) {
                Log.error("QueryService::before() - ERROR: " + err);
                reject();
            });
        });
    });


    beforeEach(function (done) {
        server = new Server(4321);
        server.start().then(function (val: boolean) {
            Log.test("QueryService::beforeEach() - started: " + val);
            done();
        }).catch(function (err) {
            Log.error("QueryService::beforeEach() - ERROR: " + err);
            done();
        });
    });

    afterEach(function (done) {
        server.stop().then(function (val: boolean) {
            Log.test("QueryService::afterEach() - closed: " + val);
            done();
        }).catch(function (err) {
            Log.error("QueryService::afterEach() - ERROR: " + err);
            done();
        });
    });

    var file = fs.readFileSync("./test/queries.json");
    var tests = JSON.parse(file);
    for (let test of tests) {
        let types = getJSONTypes(JSON.parse(test["expected-json-types"]));
        let expectedResult: any = generateResultJSON(test["expected-json"]);
        frisby.create(test["title"])
            .post(URL, test["query"], {
                json: true
            })
            .inspectRequest('Request: ')
            .inspectStatus('Response status: ')
            .inspectBody('Response body: ')
            .expectStatus(test["expected-status"])
            .expectJSONTypes(types)
            .afterJSON(function (json: any) {
                // make sure the right properties are in the response
                expect(typeof json.result).not.to.equal('undefined');
                expect(typeof json.render).not.to.equal('undefined');
                // make sure the render is the same
                var renderSame = lodash.isEqual(json["render"], expectedResult["render"]);
                expect(renderSame).to.be.true;

                // figure out if there's a sort
                let sortKey: any = null;
                if (typeof test["query"]["ORDER"] !== 'undefined') {
                    sortKey = test["query"]["ORDER"];
                }
                // compare the output
                var sameOutput = TestUtil.compareJSONArrays(json.result, expectedResult.result, sortKey);
                expect(sameOutput).to.be.true;
            })
            .toss()
    }

    function getJSONTypes(json: any): {} {
        let types: any = {};
        for (let key in json) {
            let t = json[key]
            types[key] = eval(t)
        }
        return types;

    }

    function generateResultJSON(query: any): {} {
        let file = fs.readFileSync("./test/results/" + query)
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

}); // describe


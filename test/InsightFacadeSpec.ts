/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {GeoResponse} from "../src/controller/DatasetController";

describe("InsightFacade", function () {

    this.timeout(5000);
    var zipFileContents: string = null;
    var zipFileHTML: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        zipFileHTML = new Buffer(fs.readFileSync('310rooms.1.1.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync('./id.json');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - id.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(201);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', 'some random bytes').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should not be able to add an invalid dataset - rooms (400)", function() {
        var that = this
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', 'some random bytes').then(function (response: InsightResponse){
            expect.fail();
        }).catch(function (response: InsightResponse) {
           expect(response.code).to.equal(400);
        });
    });

    /*
    it("Should be able to add a valid dataset - rooms (204)", function() {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', zipFileHTML).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });
*/
    // it("Should be able to get lat lon", function () {
    //    var that = this;
    //     return facade.performLatLon("6245 Agronomy Road V6T 1Z4").then(function (response: GeoResponse){
    //         expect(response.lat).to.equal(49.26125);
    //     }).catch (function (response: GeoResponse){
    //         expect.fail();
    //     });
    // });
    //
    // it("Should be able to not get lat lon of bad ask", function () {
    //    var that = this;
    //     return facade.performLatLon(" ").then(function (response: GeoResponse){
    //         expect(response.error).to.equal("Address not found");
    //     }).catch (function (response: GeoResponse){
    //         expect(response.lat).to.equal(undefined);
    //     });
    // });

    // Test query
    // it("Should return 424 if dataset is absent", function () {
    //     var that = this;
    //     Log.trace("Starting test: " + that.test.title);
    //     let query = {
    //         "GET": ["faafawefasef_dept", "courses_avg"],
    //         "WHERE": {
    //             "GT": {
    //                 "courses_avg": 90
    //             }
    //         },
    //         "ORDER": "courses_avg",
    //         "AS": "TABLE"
    //     };
    //     return facade.performQuery(query).then(function (response: InsightResponse) {
    //         expect.fail();
    //     }).catch(function (response: InsightResponse) {
    //         expect(response.code).to.equal(424);
    //     });
    // });

    it("Should return 200 if query is performed successfully", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });
    });

    it("Should return 400 if query is invalid (without underscore)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query = {
            "GET": ["courses_dept", "coursesavg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("Should return 400 if query is invalid (without underscore in Group and Apply)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        let query = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "coursesid" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    // Test detele
    it("Should return 404 if dataset if absent for delete", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('coursesssss').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);
        });
    });

    it("Should return 204 if dataset is removed successfully", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });
    });


});


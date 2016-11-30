/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";

describe("InsightFacade", function () {

    this.timeout(5000);
    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
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

    ////////////////////////////// Benton's Test's - below /////////////////////////////////////////////////////////
   it("Should return 400 if query has GROUP but no APPLY", function () {
        var that = this;

        let query = {
            "GET": ["courses_id"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
           expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });

    it("Should return 400 if query has APPLY but no GROUP", function () {
        var that = this;

        let query = {
            "GET": ["courseAverage", "maxFail"],
            "WHERE": {},
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });

    it("Should return 400 if query no GET", function () {
        var that = this;

        let query: any = {
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });

    it("Should return 400 if query no AS", function () {
        var that = this;

        let query: any = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });

    it("Should return 400 if query has keys in GET not in APPLy and GROUP", function () {
        var that = this;

        let query = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail", ],
            "WHERE": {},
            "GROUP": [ "courses_dept"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });

    it("Should return 400 if query has keys in APPLY/GROUP not in GET", function () {
        var that = this;

        let query = {
            "GET": ["courses_dept", "courseAverage", "maxFail", ],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id"],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };

        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function(response: InsightResponse){
            expect(response.code).to.equal(400);
        });
    });
    ///////////////////////////////////////////Benton - Test's Above ////////////////////////////////////////////////
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

    it("Should return 200 if dataset is removed successfully", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });
    });


});


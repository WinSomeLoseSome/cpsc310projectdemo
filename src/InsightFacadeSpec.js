"use strict";
var fs = require('fs');
var Util_1 = require("../src/Util");
var chai_1 = require('chai');
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe("InsightFacade", function () {
    this.timeout(5000);
    var zipFileContents = null;
    var facade = null;
    before(function () {
        Util_1.default.info('InsightController::before() - start');
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        try {
            fs.unlinkSync('./id.json');
        }
        catch (err) {
            Util_1.default.warn('InsightController::before() - id.json not removed (probably not present)');
        }
        Util_1.default.info('InsightController::before() - done');
    });
    beforeEach(function () {
        facade = new InsightFacade_1.default();
    });
    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (response) {
            chai_1.expect.fail('Should not happen');
        });
    });
    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response) {
            chai_1.expect(response.code).to.equal(201);
        }).catch(function (response) {
            chai_1.expect.fail('Should not happen');
        });
    });
    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', 'some random bytes').then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 200 if query is performed successfully", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Should return 400 if query is invalid (without underscore)", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        var query = {
            "GET": ["courses_dept", "coursesavg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query is invalid (without underscore in Group and Apply)", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        var query = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": { "IS": { "courses_dept": "cpsc" } },
            "GROUP": ["coursesid"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"] },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query has GROUP but no APPLY", function () {
        var that = this;
        var query = {
            "GET": ["courses_id"],
            "WHERE": { "IS": { "courses_dept": "cpsc" } },
            "GROUP": ["courses_id"],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"] },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query has APPLY but no GROUP", function () {
        var that = this;
        var query = {
            "GET": ["courseAverage", "maxFail"],
            "WHERE": {},
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }, { "maxFail": { "MAX": "courses_fail" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query no GET", function () {
        var that = this;
        var query = {
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }, { "maxFail": { "MAX": "courses_fail" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query no AS", function () {
        var that = this;
        var query = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }, { "maxFail": { "MAX": "courses_fail" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"] },
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query has keys in GET not in APPLy and GROUP", function () {
        var that = this;
        var query = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail",],
            "WHERE": {},
            "GROUP": ["courses_dept"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }, { "maxFail": { "MAX": "courses_fail" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 400 if query has keys in APPLY/GROUP not in GET", function () {
        var that = this;
        var query = {
            "GET": ["courses_dept", "courseAverage", "maxFail",],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }, { "maxFail": { "MAX": "courses_fail" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Should return 404 if dataset if absent for delete", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        return facade.removeDataset('coursesssss').then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(404);
        });
    });
    it("Should return 200 if dataset is removed successfully", function () {
        var that = this;
        Util_1.default.trace("Starting test: " + that.test.title);
        return facade.removeDataset('courses').then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=InsightFacadeSpec.js.map
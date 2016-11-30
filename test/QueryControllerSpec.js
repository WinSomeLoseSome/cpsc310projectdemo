"use strict";
var QueryController_1 = require("../src/controller/QueryController");
var Util_1 = require("../src/Util");
var chai_1 = require('chai');
describe("QueryController", function () {
    beforeEach(function () {
    });
    afterEach(function () {
    });
    it("Should be able to validate a valid query", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": { "GT": { "courses_avg": 90 } },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var dataset = {};
        var controller = new QueryController_1.default(dataset);
        var isValid = controller.isValid(query);
        chai_1.expect(isValid).to.equal(true);
    });
    it("Should be able to invalidate an invalid query", function () {
        var query = null;
        var dataset = {};
        var controller = new QueryController_1.default(dataset);
        var isValid = controller.isValid(query);
        chai_1.expect(isValid).to.equal(false);
    });
    it("Should be able to query, although the answer will be empty", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": { "GT": { "courses_avg": 200 } },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var dataset = {};
        var controller = new QueryController_1.default(dataset);
        var ret = controller.query(query);
        Util_1.default.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        chai_1.expect(ret).not.to.be.equal(null);
    });
});
//# sourceMappingURL=QueryControllerSpec.js.map
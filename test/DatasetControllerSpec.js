"use strict";
var DatasetController_1 = require("../src/controller/DatasetController");
var Util_1 = require("../src/Util");
var JSZip = require('jszip');
var chai_1 = require('chai');
describe("DatasetController", function () {
    beforeEach(function () {
    });
    afterEach(function () {
    });
    it("Should be able to reject an invalid Dataset", function () {
        Util_1.default.test('Creating dataset');
        var content = { key: 'value' };
        var zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        var opts = {
            compression: 'deflate', compressionOptions: { level: 2 }, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Util_1.default.test('Dataset created');
            var controller = new DatasetController_1.default();
            controller.process('setA', data).then(function (isOldDataset) {
                throw new Error('should not be resolved');
            }).catch(function (err) {
                chai_1.expect(err.message).to.not.equal('should not be resolved');
            });
        });
    });
});
//# sourceMappingURL=DatasetControllerSpec.js.map
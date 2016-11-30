/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import {InsightResponse} from "../src/controller/IInsightFacade";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';

describe("DatasetController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to reject an invalid Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };

        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            controller.process('setA', data).then(function (isOldDataset) {
                throw new Error('should not be resolved');
            }).catch(function (err) {
                expect(err.message).to.not.equal('should not be resolved');
            });

        });

    });

});

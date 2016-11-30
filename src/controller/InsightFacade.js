"use strict";
var DatasetController_1 = require('../controller/DatasetController');
var QueryController_1 = require('../controller/QueryController');
var ScheduleController_1 = require('../controller/ScheduleController');
var Util_1 = require('../Util');
var fs = require('fs');
var InsightFacade = (function () {
    function InsightFacade() {
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        return new Promise(function (fulfill, reject) {
            var controller = InsightFacade.datasetController;
            controller.process(id, content).then(function (result) {
                Util_1.default.trace('InsightFacade::addDataset(..) - processed');
                console.log(result);
                if (!result) {
                    fulfill({ code: 204, body: {} });
                }
                else {
                    fulfill({ code: 201, body: {} });
                }
            }).catch(function (err) {
                Util_1.default.trace('InsightFacade::addDataset(..) - ERROR_A: ' + err.message);
                reject({ code: 400, body: { error: err.message } });
            });
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        InsightFacade.datasetController.deleleDataset(id);
        return new Promise(function (fulfill, reject) {
            fs.unlink("./data/" + id, function (err) {
                if (err) {
                    reject({ code: 404, body: { error: err.message } });
                    Util_1.default.info("data no found!");
                }
                else {
                    fulfill({ code: 204, body: {} });
                    Util_1.default.info("data has been deleted");
                }
            });
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        return new Promise(function (fulfill, reject) {
            try {
                var isValid = InsightFacade.queryController.isValid(query);
                if (isValid === true) {
                    InsightFacade.queryController.query(query).then(function (result) {
                        fulfill({ code: 200, body: result });
                    }).catch(function (err) {
                        console.log('in InsightFacade: ');
                        if (err) {
                            console.log(err);
                        }
                        if ('missing' in err) {
                            reject({ code: 424, body: { error: err } });
                        }
                        else {
                            reject({ code: 400, body: { error: 'invalid query' } });
                        }
                    });
                }
                else {
                    reject({ code: 400, body: { error: 'invalid query' } });
                }
            }
            catch (err) {
                Util_1.default.error('RouteHandler::postQuery(..) - ERROR: ' + err);
                reject({ code: 403, body: { error: err.message } });
            }
        });
    };
    InsightFacade.prototype.schedule = function (query) {
        try {
            var timetable = InsightFacade.scheduleController.schedule(query);
            return { code: 200, body: timetable };
        }
        catch (err) {
            return { code: 400, body: { error: err.message } };
        }
    };
    InsightFacade.datasetController = new DatasetController_1.default();
    InsightFacade.queryController = new QueryController_1.default(InsightFacade.datasetController.getDatasets());
    InsightFacade.scheduleController = new ScheduleController_1.default(InsightFacade.datasetController.getDatasets());
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map
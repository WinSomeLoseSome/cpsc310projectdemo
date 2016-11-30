/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
//for d2
import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';
import {QueryRequest} from "../controller/QueryController";
import ScheduleController from '../controller/ScheduleController';
import Log from '../Util';
import fs = require('fs');


export default class InsightFacade implements IInsightFacade {

    // TODO: need to implement this
    private static datasetController = new DatasetController();
    private static queryController = new QueryController(InsightFacade.datasetController.getDatasets());
    private static scheduleController  = new ScheduleController(InsightFacade.datasetController.getDatasets());


    /**
     * Add a dataset to UBCInsight.
     *
     * @param id  The id of the dataset being added. This is the same as the PUT id.
     * @param content  The base64 content of the dataset. This is the same as the PUT body.
     *
     * The promise should return an InsightResponse for both fullfill and reject.
     * fulfill should be for 2XX codes and reject for everything else.
     */
    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {

            let controller = InsightFacade.datasetController;

            controller.process(id, content).then(function (result) {
                Log.trace('InsightFacade::addDataset(..) - processed');
                //console.log('sddsfsd');

                console.log(result);
                if (!result) {
                    fulfill({code:204, body:{}})
                } else {
                    fulfill({code:201, body:{}})
                }

            }).catch(function (err: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR_A: ' + err.message);
                reject({code:400, body:{error: err.message}});
            });

        });
    }

    /**
     * Remove a dataset from UBCInsight.
     *
     * @param id  The id of the dataset to remove. This is the same as the DELETE id.
     *
     * The promise should return an InsightResponse for both fullfill and reject.
     * fulfill should be for 2XX codes and reject for everything else.
     */
    removeDataset(id: string): Promise<InsightResponse> {

        //delete on memory
        InsightFacade.datasetController.deleleDataset(id);

        return new Promise(function (fulfill, reject) {
            fs.unlink("./data/" + id, (err) => { //should remove data with id from disk
                if (err) {
                    reject({code: 404, body: {error: err.message}});
                    Log.info("data no found!");
                } else {
                    fulfill({code: 204, body: {}});
                    Log.info ("data has been deleted");
                }
            });
        });
    }

    /**
     * Perform a query on UBCInsight.
     *
     * @param query  The query to be performed. This is the same as the body of the POST message.
     * @return Promise <InsightResponse>
     * The promise should return an InsightResponse for both fullfill and reject.
     * fulfill should be for 2XX codes and reject for everything else.
     */
    performQuery(query: QueryRequest): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            try {
                let isValid = InsightFacade.queryController.isValid(query);

                if (isValid === true) {
                    InsightFacade.queryController.query(query).then(function(result) {
                        fulfill({code:200, body:result});
                    }).catch(function (err)  {
                        console.log('in InsightFacade: ');
                        if (err) {console.log(err);}
                        if ('missing' in err) {
                            reject({code:424, body:{error: err}});
                        } else {
                            reject({code: 400, body: {error: 'invalid query'}});
                        }
                    });

                } else {
                    reject({code:400, body:{error: 'invalid query'}});
                }
            } catch (err) {
                Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
                reject({code:403, body:{error: err.message}});
            }
        });
    }

    schedule(query: any): InsightResponse {

        try {
            let timetable = InsightFacade.scheduleController.schedule(query);
            return {code: 200, body: timetable};


        } catch (err) {
            return {code: 400, body: {error: err.message}};

    }
    }
}
/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import fs = require('fs');


export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER?: any;
    GROUP?: string[];
    APPLY?: any[];
    AS: string;
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;
    private nameMapping: any = {};
    private nameChangeBack: any = {};
    private buildingName: any = {};

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    //compares the arrays
    public check_get_keys(query: QueryRequest): boolean {
        let groupApply: any = {};
        let groupApplyArr: any = [];

        // For private test: Revolution
        let x = query['GET'][0];
        let id = x.slice(0, x.indexOf("_")); //obtain the "course" in "course_dept"
        for (let key of query['GET']) {
            if (key.indexOf("_") != -1 && key.slice(0, key.indexOf("_")) != id) {
                return false;
            }
        }

        if ('GROUP' in query && 'APPLY' in query) {
            let group: any[] = query['GROUP'];
            let apply: any[] = query['APPLY'];
            let get: any = [];

            //add keys in group to groupApply
            for (let i = 0; i < group.length; i++) {
                groupApply[group[i]] = true;
            }

            //add keys in apply to groupApply
            for (let i = 0; i < apply.length; i++) {
                for (let key in apply[i]) {
                    groupApply[key] = true
                }
            }

            for (var entry in groupApply) {
                if (groupApply.hasOwnProperty(entry)) {
                    groupApplyArr.push(entry);
                }

            }

            for (let i = 0; i < query['GET'].length; i++) {
                get.push(query['GET'][i]);
            }

            groupApplyArr.sort();
            get.sort();

            //console.log("GROUPAPPLYARR: " + groupApplyArr);
            //console.log("GET: " + get);

            //compare arrays
            if (get.length != groupApplyArr.length) {
                return false;
            } else {
                for (let i = 0; i < get.length; i++) {
                    if (get[i] != groupApplyArr[i]) {
                        return false;
                    }
                }
            }

            return true;
        }
        return true;
    }

    // check for underscore in valid keys.
    private checkValidKey(query: QueryRequest): boolean {
        let keys : any = {};
        let kWithoutUnderscore : any = {};
        for (let k of query['GET']) {
            keys[k] = true;
        }
        if ('GROUP' in query) {
            for (let k of query['GROUP']) {
                keys[k] = true;
            }
        }
        if ('APPLY' in query) {
            for (let appl of query['APPLY']) {
                for (let k in appl) {
                    kWithoutUnderscore[k] = true;
                    for (let c in appl[k]) {
                        keys[appl[k][c]] = true;
                        break;
                    }
                    break;
                }
            }
        }
        if ('ORDER' in query) {
            let order = query['ORDER'];
            //old order
            if (typeof order !== 'object') {
                keys[order] = true;
            }
            //new order
            else {
                for (let k of query['ORDER']['keys']) {
                    keys[k] = true;
                }
            }
        }
        for (let k in keys) {
            if (k.indexOf('_') == -1 && ! (k in kWithoutUnderscore)) {
                return false;
            }
        }
        return true;
    }

    public isValid(query: QueryRequest): boolean {
            if (typeof query == 'undefined' || query == null || Object.keys(query).length < 0) {
                return false;
            }
            //check query has GET and AS
            if (!('GET' in query) || !('AS' in query)){
                return false;
            }

            //check if query has both group and apply (if only one present return false) - Kanga/Kodiak
            if ('APPLY' in query && !('GROUP' in query)){
                return false;
            }
            if ('GROUP' in query && !('APPLY' in query)){
                return false;
            }

            //check if GROUP is empty, if so return false - Jonah
            if ('GROUP' in query && query['GROUP'].length ==0) {
                return false;
            }

            //check if keys in GET are in GROUP and APPLy and vice versa - Kwyjibo
            if (!this.check_get_keys(query)){
                return false;
            }

            // check for valid keys with underscore -- Liberation:
            if(!this.checkValidKey(query)) {
                return false;
            }
            return true;
    }

    // public getDataset(id: string): Promise<any> {
    //     // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.
    //     let that = this;
    //     return new Promise(function (fulfill, reject) {
    //         if (that.datasets.hasOwnProperty(id)) { //get file from memory
    //             fulfill(that.datasets[id]);
    //         }
    //         else {
    //             fs.readFile('./data/' + id, 'utf8', function (err, data) { //get file from disk
    //                 if (err) {
    //                     console.log('DId not find dataset ' + id);
    //                     reject(err);
    //                 }
    //                 data = JSON.parse(data);
    //                 that.datasets[id] = data;
    //                 console.log("getting datasets");
    //                 fulfill(that.datasets[id]);
    //             });
    //         }
    //     });
    // }
    public getDataset(id: string): any {
        // Build index for building name to entry
        if (id == 'rooms' && id in this.datasets) {
            this.buildingName = {};
            let e:any;
            for (e of this.datasets[id]) {
                this.buildingName[e['rooms_fullname']] = e;
            }
        }
        return id in this.datasets? this.datasets[id] : null;
    }


    public deleleDataset(id: string): boolean {
        if (this.datasets.hasOwnProperty(id)) {
            delete this.datasets[id];
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): Promise<any> {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        let that = this;
        // //isVaild added!
        // if (!that.isValid(query)) {
        //     throw "Query invalid";
        // }
        // Get the dataset first before the for loop.

        let x = query['GET'][0];
        let id = x.slice(0, x.indexOf("_")); //obtain the "course" in "course_dept"
        //console.log(id); //Good!
        //let that = this;

        return new Promise(function(fulfill, reject) {

            let dataset = that.getDataset(id);
            if (!dataset) {
                reject({missing: [id]});
            }

            console.log('Got dataset');

            // Change the 'GET' array into a dictionary
            let filterKeys: any = {};

            for (let key of query['GET']) {
                console.log('the key is: ' + key);
                filterKeys[key] = true; //change array into a key in dictionary. speed up filter.
            }
            if ("APPLY" in query) {
                for (let appl of query['APPLY']) {
                    for (let k in appl) {
                        for (let c in appl[k]) {
                            filterKeys[appl[k][c]] = true;
                            break;
                        }
                        break;
                    }
                }
            }
            console.log("Filter keys are: ", filterKeys);  // print out the actual key for comparing

            let result: any = [];
            //console.log(dataset);
            for (let entry of dataset){
                //console.log('enter loop');
                //console.log(entry);
                if (that.check_condition(entry, query['WHERE'])){
                    result.push(that.filter(entry, filterKeys)) //get/filter keys/entries
                };

            };
            // console.log(result); //Print out the actual result when comparing

            // FOR D2: Part of: Order
            let orderIsString = {[id + "_dept"]: 1, [id + "_id"]: 1, [id + "_instructor"]: 1, [id + "_title"]: 1};
            //let orderIsNumber = {[id + "_avg"]: 1, [id + "_pass"]: 1, [id + "_fail"]: 1, [id + "_audit"]: 1, [id + "_uuid"]: 1, [id + "_year"]: 1};
            // For D3: when id is rooms.
            if (id == "rooms") {
                orderIsString = {[id + "_fullname"]:1, [id + "_shortname"]:1, [id + "_number"]:1, [id + "_name"]:1, [id + "_address"]:1,
                    [id + "_type"]:1, [id + "_furniture"]:1, [id + "_href"]:1};
            }

            //helper functions
            let epsilon = 0.001;
            function make_sort_function (sortKey: string[], upOrDown: number) {
                return function(a: any, b: any) {
                    for (let i of sortKey) {
                        let x: any, y: any;
                        if (i in orderIsString) {
                            x = a[i];
                            y = b[i];
                        } else { // order is Number case
                            x = Number(a[i]);
                            y = Number(b[i]);
                            if (Math.abs(x - y) < epsilon) {
                                continue;
                            }
                        }
                        if (x < y) {return -1 * upOrDown;}
                        if (x > y) {return upOrDown;}
                    }
                    return 0;
                };
            }


            //Group helper function
            function compare (a: any, b: any, groupKeys: string[]) {
                for (let key of groupKeys) {
                    if (a[key] != b[key]) {
                        return false;
                    }
                }
                return true;
            }
            //Helper function ends //

            let groups:any = [];
            //let needRoundingKeys: any = {};

            //GROUP
            if ("GROUP" in query && result.length > 0 && "APPLY" in query) {
                console.log(query['GROUP']);
                let grpKeys = query["GROUP"];
                let applies = query['APPLY'];
                result.sort(make_sort_function(grpKeys, 1));

                let comp: any = {};
                let count = 0;

                //initialize a new group
                function start_new_group(startEntry: any) {
                    groups.push({});

                    for (let i of grpKeys) {
                        groups[groups.length - 1][i] = startEntry[i];
                    }
                    comp = {};
                    for (let appl of applies) {
                        for (let k in appl) {
                            comp[k] = 0;
                            if ('MIN' in appl[k]) {
                                comp[k] = 99999999;
                            }
                            break;
                        }
                    }
                    count = 0;
                }

                start_new_group(result[0]);

                for (let i = 0; i < result.length; i += 1) {
                    let entry = result[i];
                    if (i > 0 && !compare(result[i - 1], entry, grpKeys)) {
                        // Store the computation result to current group
                        for (let appl of applies) {
                            for (let k in appl) {
                                if ('AVG' in appl[k]) {
                                    groups[groups.length - 1][k] = Number((comp[k] * 1.0 / count).toFixed(2));
                                } else if ('MIN' in appl[k]) {
                                    groups[groups.length - 1][k] = comp[k];
                                } else if ('MAX' in appl[k]) {
                                    groups[groups.length - 1][k] = comp[k];
                                } else {
                                    groups[groups.length - 1][k] = count;
                                }
                                break;
                            }
                        }

                        start_new_group(entry);
                    }

                    // computations for APPLY
                    for (let appl of applies) {
                        for (let k in appl) {
                            if ('AVG' in appl[k]) {
                                comp[k] += entry[appl[k]['AVG']];
                            } else if ('MIN' in appl[k]) {
                                comp[k] = Math.min(comp[k], entry[appl[k]['MIN']])
                            } else if ('MAX' in appl[k]) {
                                comp[k] = Math.max(comp[k], entry[appl[k]['MAX']])
                            }
                            break;
                        }
                    }
                    count += 1;

                }
                // Store the computation result to last group
                for (let appl of applies) {
                    for (let k in appl) {
                        if ('AVG' in appl[k]) {
                            groups[groups.length - 1][k] = Number((comp[k] * 1.0 / count).toFixed(2));
                        } else if ('MIN' in appl[k]) {
                            groups[groups.length - 1][k] = comp[k];
                        } else if ('MAX' in appl[k]) {
                            groups[groups.length - 1][k] = comp[k];
                        } else {
                            groups[groups.length - 1][k] = count;
                        }
                        break;
                    }
                }
                //groups.splice(-1, 1);
                //console.log(groups); // print out the table
            } else {
                groups = result;
            }

            // Part of: ORDERING AS
            // string or number?
            console.log("b4 ordering");
            if ("ORDER" in query) { //number or string?
                let order: any = query["ORDER"];

                //The old order method should also work - Jade
                if (typeof order !== 'object') {
                    groups.sort(make_sort_function([order], 1 ));
                } else {
                    // For d2 Order
                    let upOrDown: number = -1;
                    let sortKey = order.keys;

                    if (order.dir == "UP") {
                        upOrDown = 1;
                    }
                    groups.sort(make_sort_function(sortKey, upOrDown));
                }
            }

            console.log('Number of entries returned: ' + groups.length);
            fulfill({render: 'TABLE', result: groups}) ;

        });

    }
    // For D4 calculate the distance by building's lat/lon
    private getDistance(entry: any, buildingName: string): number {
        let source = this.buildingName[buildingName];

        // convert degrees to radians
        function deg2rad(deg:number):number {
            let rad = deg * Math.PI/180; // radians = degrees * pi/180
            return rad;
        }

        let dlon = deg2rad(source["rooms_lon"]) - deg2rad(entry["rooms_lon"]);
        let dlat = deg2rad(source["rooms_lat"]) - deg2rad(entry["rooms_lat"]);
        let a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(deg2rad(entry["rooms_lat"])) * Math.cos(deg2rad(source["rooms_lat"])) * Math.pow((Math.sin(dlon/2)), 2);
        let c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );
        const R = 6373.0;
        let d = R * c;
        //console.log(source["rooms_fullname"] + " to " + entry["rooms_fullname"] +"is: " + d);
        return d;
    }
    // For the Where part in Query
    private check_condition(entry: any, cond: any): boolean {
        // console.log('check condition');
        // console.log(cond);
        // Negation
        if ('NOT' in cond) {
            //console.log("doing NOT");
            return !this.check_condition(entry, cond['NOT']);
        }

        // Scomparison
        if ('IS' in cond) {
            let comp: any = cond['IS'];
            //console.log("doing IS");
            for (let key in comp) {
                if (comp[key].indexOf('*') != -1) {
                    //console.log(comp[key]);
                    let newComp = '^' + comp[key].split('*').join('.*') + '$';
                    let re = new RegExp(newComp);
                    if (!re.test(entry[key])) {
                        return false;
                    }
                } else {
                    if (entry[key] != comp[key]) { return false; }

                }
            }
            return true;
        }

        // LOGIC COMPARISON
        if ('AND' in cond) {
            let comp: any = cond['AND'];
            //console.log('Doing AND');
            for (let sub_cond of comp) {
                //console.log(sub_cond);
                if (!this.check_condition(entry, sub_cond)) { return false; }
            }
            return true;
        }
        if ('OR' in cond) {
            let comp: any = cond['OR'];
            for (let sub_cond of comp) {
                // console.log(JSON.stringify(sub_cond));
                // console.log(entry);
                // console.log(this.check_condition(entry, sub_cond));
                if (this.check_condition(entry, sub_cond)) { return true; }
            }
            return false;
        }
        // With-in for D4 (obtain the distance)
        if ('WITHIN' in cond) {
            let comp: any = cond['WITHIN'];
            let building = comp.building;
            let distance = Number(comp.distance);

            return distance > this.getDistance(entry, building);
        }

        // MCOMPARISON
        if ('LT' in cond){
            let comp: any = cond['LT'];
            for (let key in comp) {
                return Number(entry[key]) < Number(comp[key]);
            }
        }
        if ('GT' in cond){
            let comp: any = cond['GT'];
            //console.log('doing GT');
            for (let key in comp) {
                // console.log(this.getKey(key));
                // console.log(key);
                // console.log(entry[this.getKey(key)]);
                // console.log(comp[key]);
                return Number(entry[key]) > Number(comp[key]);
            }
        }
        if ('EQ' in cond){
            let comp: any = cond['EQ'];
            for (let key in comp) {
                return Number(entry[key]) == Number(comp[key]);
            }
        }
        return true;
    }

    // For the GET part in Query, filter with the keys.
    private filter(entry: any, content: Object): Object { //content is the filterkeys
        let result: any = {};
        for (let i in entry) {
            if (content.hasOwnProperty(i)) {
                result[i] = entry[i];
            }
        }
        return result;
    }

    // // get the key in the string after the "_".
    // private getKey (name: string): string {
    //     let keyName = name.slice(name.indexOf('_')+1);
    //     return  this.nameMapping[keyName];
    //
    // }
    //
    // private makeKey (name: string, id: string): string {
    //     return id + '_' + this.nameChangeBack[name];
    // }
}
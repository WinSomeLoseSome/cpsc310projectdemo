/**
 * Created by careyl on 2016-11-22.
 */

import {Datasets} from "./DatasetController";


export default class ScheduleController {
    private datasets: Datasets;
    private rooms: any = {};
    private courses: any = {};
    private hasInitialized = false;

    constructor(datasets: Datasets) {
      this.datasets = datasets;
    }

    public schedule(query: any): any {
        if (!this.hasInitialized) {
            for(let e of this.datasets["rooms"]){
                this.rooms[e["rooms_name"]] = e;
            }
            for(let e of this.datasets["courses"]){
                this.courses[e["courses_uuid"]] = e;
            }
            this.hasInitialized = true;
        }

        let that = this;
        //get entry list
        let roomList = query.rooms.map(function(roomId:string):any {
            return that.rooms[roomId];
        });
        let courseList = query.courses.map(function(courseId:string): any{
            return that.courses[courseId];
        });

        let timetable = this.greedySchedule(roomList, courseList);

        return timetable;
    }

    private greedySchedule (rooms: any[], courses: any[]): any {
        let slots: any = {};

        // make MWF size 9 and T/Th size 6
        function getArray(n: number): any[] {
            let x: any[] = [];
            for (let i = 0; i < n; i++) {
                x.push(null);
            }
            return x;
        }
        // create a slot
        for (let r of rooms) {
            slots[r.rooms_name] = {mon: getArray(9), tue: getArray(6), wed: getArray(9), thu: getArray(6), fri: getArray(9)};
        }

        for (let c of courses) {
            let roomOK = rooms.filter(r => r.rooms_seats >= c.courses_fail + c.courses_pass);
            let flag = false;
            // random assign MWF or T/Th
            let rand = Math.random();
            if (rand < 0.5) {
                for (let r of roomOK) {
                    let  s = slots[r.rooms_name];
                    let monIndex = this.findSlot(s.mon);
                    let wedIndex = this.findSlot(s.wed);
                    let friIndex = this.findSlot(s.fri);

                    if (monIndex != -1 && wedIndex != -1 && friIndex != -1) {
                        s.mon[monIndex] = c.courses_dept + c.courses_id;
                        s.wed[wedIndex] = c.courses_dept + c.courses_id;
                        s.fri[friIndex] = c.courses_dept + c.courses_id;
                        flag = true;
                        break;
                    }
                }
            }
            if(!flag || rand >= 0.5) {
                for (let r of roomOK) {
                    let  s = slots[r.rooms_name];
                    let tueIndex = this.findSlot(s.tue);
                    let thuIndex = this.findSlot(s.thu);

                    if (tueIndex != -1 && thuIndex != -1) {
                        s.tue[tueIndex] = c.courses_dept + c.courses_id;
                        s.thu[thuIndex] = c.courses_dept + c.courses_id;
                        flag = true;
                        break;
                    }
                }

            }
            if (!flag) {
                console.log("Can't find available room for: " + c.courses_dept + c.courses_id);
            }
        }
        return slots;
    }

    private findSlot(daySlot: any[]): number {
        for (let i = 0; i < daySlot.length; i++) {
            if (daySlot[i] == null) {
                return i;
            }
        }
        return -1;
    }


}
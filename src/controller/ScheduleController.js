"use strict";
var ScheduleController = (function () {
    function ScheduleController(datasets) {
        this.rooms = {};
        this.courses = {};
        this.hasInitialized = false;
        this.datasets = datasets;
    }
    ScheduleController.prototype.schedule = function (query) {
        if (!this.hasInitialized) {
            for (var _i = 0, _a = this.datasets["rooms"]; _i < _a.length; _i++) {
                var e = _a[_i];
                this.rooms[e["rooms_name"]] = e;
            }
            for (var _b = 0, _c = this.datasets["courses"]; _b < _c.length; _b++) {
                var e = _c[_b];
                this.courses[e["courses_uuid"]] = e;
            }
            this.hasInitialized = true;
        }
        var that = this;
        var roomList = query.rooms.map(function (roomId) {
            return that.rooms[roomId];
        });
        var courseList = query.courses.map(function (courseId) {
            return that.courses[courseId];
        });
        var timetable = this.greedySchedule(roomList, courseList);
        return timetable;
    };
    ScheduleController.prototype.greedySchedule = function (rooms, courses) {
        var slots = {};
        function getArray(n) {
            var x = [];
            for (var i = 0; i < n; i++) {
                x.push(null);
            }
            return x;
        }
        for (var _i = 0, rooms_1 = rooms; _i < rooms_1.length; _i++) {
            var r = rooms_1[_i];
            slots[r.rooms_name] = { mon: getArray(9), tue: getArray(6), wed: getArray(9), thu: getArray(6), fri: getArray(9) };
        }
        var _loop_1 = function(c) {
            var roomOK = rooms.filter(function (r) { return r.rooms_seats >= c.courses_fail + c.courses_pass; });
            var flag = false;
            var rand = Math.random();
            if (rand < 0.5) {
                for (var _a = 0, roomOK_1 = roomOK; _a < roomOK_1.length; _a++) {
                    var r = roomOK_1[_a];
                    var s = slots[r.rooms_name];
                    var monIndex = this_1.findSlot(s.mon);
                    var wedIndex = this_1.findSlot(s.wed);
                    var friIndex = this_1.findSlot(s.fri);
                    if (monIndex != -1 && wedIndex != -1 && friIndex != -1) {
                        s.mon[monIndex] = c.courses_dept + c.courses_id;
                        s.wed[wedIndex] = c.courses_dept + c.courses_id;
                        s.fri[friIndex] = c.courses_dept + c.courses_id;
                        flag = true;
                        break;
                    }
                }
            }
            if (!flag || rand >= 0.5) {
                for (var _b = 0, roomOK_2 = roomOK; _b < roomOK_2.length; _b++) {
                    var r = roomOK_2[_b];
                    var s = slots[r.rooms_name];
                    var tueIndex = this_1.findSlot(s.tue);
                    var thuIndex = this_1.findSlot(s.thu);
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
        };
        var this_1 = this;
        for (var _c = 0, courses_1 = courses; _c < courses_1.length; _c++) {
            var c = courses_1[_c];
            _loop_1(c);
        }
        return slots;
    };
    ScheduleController.prototype.findSlot = function (daySlot) {
        for (var i = 0; i < daySlot.length; i++) {
            if (daySlot[i] == null) {
                return i;
            }
        }
        return -1;
    };
    return ScheduleController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScheduleController;
//# sourceMappingURL=ScheduleController.js.map
/**
 * Created by careyl on 2016-11-18.
 */

$(document).ready(function() {

    var courses = [];
    var rooms = [];
    $('#search-room').click(function() {
        console.log('CLICKED');

        // Get buildingname, and/or, and distance
        var buildingName = $('#building-name').val()
        console.log(buildingName);

        var opt1  =$('input[name=room-opt1]').is(':checked');
        var opt2  =$('input[name=room-opt2]').is(':checked');
        console.log(opt1 + " " + opt2);

        var fromBuilding = $("#from-building").val();

        var distance = $("#distance").val();
        console.log(distance);

        // Submit query
        if (opt1 && !opt2) {
            var query = {
                GET: ['rooms_name', "rooms_fullname"],
                WHERE: { IS: {'rooms_fullname': buildingName}},
                AS: 'TABLE'
            }
        }
        else if (!opt1 && opt2) {
            var query = {
                GET: ['rooms_name', "rooms_fullname"],
                WHERE: { WITHIN: {building: fromBuilding, distance: distance}},
                AS: 'TABLE'
            }
        }
        else {
            var query = {
                GET: ['rooms_name', "rooms_fullname"],
                WHERE: { OR:[ {WITHIN: {building: fromBuilding, distance: distance}}, {IS: {'rooms_fullname': buildingName}} ]},
                AS: 'TABLE'
            }
        }
        $.post('http://localhost:4321/query', query, function(response) {
            console.log(response);

            $('#rooms').html('');
            // show room
            rooms = response.result;
            for (i = 0; i < response.result.length; i++) {

                var item = $('<span>').text(response.result[i]["rooms_name"] + ", ");
                $('#rooms').append(item);
            }
        })
    })

    // For selecting courses
    $('#search-course').click(function() {
        console.log('CLICKED');

        // Get deparment and course number
        var department = $('#department').val()

        var opt = $("input[name=course-opt]:checked").val();

        var courseNumber = $("#course-number").val();

        // Submit query
        if (opt == "opt1") {
            var query = {
                GET: ['courses_uuid', 'courses_dept', "courses_id", "courses_year"],
                WHERE: { IS: {'courses_dept': department}},
                AS: 'TABLE'
            }
        }
        else if (opt == 'opt2') {
            var query = {
                GET: ['courses_uuid', 'courses_dept', "courses_id", "courses_year"],
                WHERE: { IS: {"courses_id": courseNumber}},
                AS: 'TABLE'
            }
        }
        else {
            var dept = $('#department2').val();
            var num = $('#course-number2').val();
            var query = {
                GET: ['courses_uuid', 'courses_dept', "courses_id","courses_year"],
                WHERE: { AND: [{IS: {"courses_id": num}}, {IS: {"courses_dept": dept}}]
                },
                AS: 'TABLE'
            }
        }
        $.post('http://localhost:4321/query', query, function(response) {
            console.log(response);

            $('#courses').html('');
            // show room
            var course_dict = {};
            for (i = 0; i < response.result.length; i++) {
                var name = response.result[i]['courses_dept'] + response.result[i]['courses_id'];
                if (!(name in course_dict) || parseInt(course_dict[name]['courses_year']) < parseInt(response.result[i]['courses_year'])) {
                    course_dict[name] = response.result[i];
                }
            }

            courses = [];
            for (var k in course_dict) {

                var item = $('<span>').text(course_dict[k]["courses_dept"] + " " + course_dict[k]["courses_id"] + ", ");
                $('#courses').append(item);
                courses.push(course_dict[k]);
            }


        })
    });

    //Create schedule
    $('#schedule').click(function() {
        console.log('CLICKED');

        var query = {
            rooms: rooms.map(function(d) {return d['rooms_name']}),
            courses: courses.map(function(d) {return d['courses_uuid']})
        }
        console.log("QUERY:" + JSON.stringify(query));

        $.post('http://localhost:4321/schedule', query, function(response) {
            console.log(response);
            $('#timetable').show();
            var $tbody = $('#timetable tbody');
            //console.log($tbody);
            $tbody.html('');
            for (var courseName in response.timetable) {
                var $tr = $('<tr>');
                $('<td>').appendTo($tr).text(courseName);
                $('<td>').appendTo($tr).text(response.timetable[courseName].room);
                $('<td>').appendTo($tr).text(response.timetable[courseName].time.join(', '));
                $tbody.append($tr);
                //console.log($tr.html());
            }

            $('#evaluation').show();
            var uns = response.evaluation.unscheduled;
            $('#unscheduled').text(uns.length? uns.join(', '): 'None');
            $('#avg').text(response.evaluation.avg);
        })
    })

})

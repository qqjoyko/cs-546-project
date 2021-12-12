let title = $('#title');
let employmentType = $('#employmentType');
let companyName =  $('#companyName');
let startDateEx =  $('#startDateEx');
let endDateEx =  $('#endDate');
let userId = $('#dumb');
let exConfig = {
    method: 'Get',
    url: `/users/ex/`
}

let school = $('#school');
let major = $('#major');
let degree = $('#degree');
let startDateEdu = $('#startDateEdu');
let endDateEdu = $('#endDateEdu');
let eduConfig = {
    method: 'Get',
    url: `/users/edu/`
}

let skill = $('#skills')
let skConfig = {
    method: 'Get',
    url: `/users/sk/`
}

let languages = $('#languages')
let laConfig = {
    method: 'Get',
    url: `/users/la/`
}

let gender = $('#userGender')
let city =  $('#userCity')
let state =  $('#state')
$(document).ready(function(){
    $.ajax(exConfig).then(responseMessage =>{
        //$('#error').hide();
        $('#preEx').children().remove();
        responseMessage.forEach(ele => {
            let li = `<li>CompanyName:&nbsp ${ele.companyName}, 
            Title:&nbsp${ele.title},
            EmploymentType:&nbsp ${ele.employmentType},
            StartDate:&nbsp${ele.startDate},
            EndDate:&nbsp${ele.endDate}
            &nbsp&nbsp&nbsp&nbsp<a href = ${encodeURIComponent(ele.companyName)}>remove</a>
            </li>`
            $('#preEx').append(li);
        });
        $('#preEx').children().each(function(index,element){
            exToremove($(element));
        });
    });
    $.ajax(eduConfig).then(responseMessage =>{
        //$('#error').hide();
        $('#preEdu').children().remove();
        responseMessage.forEach(ele => {
            let li = `<li>school:&nbsp ${ele.school}, 
            major:&nbsp${ele.major},
            degree:&nbsp ${ele.degree},
            StartDate:&nbsp${ele.startDate},
            EndDate:&nbsp${ele.endDate}
            &nbsp&nbsp&nbsp&nbsp<a href = ${encodeURIComponent(ele.school)}>remove</a>
            </li>`
            $('#preEdu').append(li);
        });
        $('#preEdu').children().each(function(index,element){
            eduToremove($(element));
        });
    });
    $.ajax(skConfig).then(responseMessage =>{
        //$('#error').hide();
        $('#preSk').children().remove();
        for(let i = 0; i < responseMessage.length; i++) {
            let li = `<li>${responseMessage[i]}
            &nbsp&nbsp&nbsp&nbsp<a href = ${encodeURIComponent(responseMessage[i])}>remove</a>
            </li>`
            $('#preSk').append(li);
        }
        $('#preSk').children().each(function(index,element){
            skToremove($(element));
        });
    });
    $.ajax(laConfig).then(responseMessage =>{
        //$('#error').hide();
        $('#preLa').children().remove();
        for(let i = 0; i < responseMessage.length; i++) {
            let li = `<li>${responseMessage[i]}
            &nbsp&nbsp&nbsp&nbsp<a href = ${encodeURIComponent(responseMessage[i])}>remove</a>
            </li>`
            $('#preLa').append(li);
        }
        $('#preLa').children().each(function(index,element){
            laToremove($(element));
        });
    });
});

$('#userBase').submit((event) => {
    event.preventDefault();
    if(city.val().trim().length !== 0 && state.val().trim().length !== 0){
        $('#baError').hide();
        let tmp = {
            gender:gender.val(),
            city:city.val(),
            state:state.val()
        }
        $.post(`/users/editProfile/`, {tmp}, 
        function(returnedData){
            if (returnedData){
            alert("your basic information has successfully updated!");
            location.reload(true);
            }
        }
        );
    } else {
        $('#baError').show();
        $('#baError').html('input can\'t be empty or just spaces');
        // $('#formLabel').addClass('error');
    }
})

$('#userEx').submit((event) => {
    event.preventDefault();
    if (new Date(startDateEx.val())>new Date(endDateEx.val())) {
        $('#exError').show();
        $('#exError').html('endDate can\'t be earlier than startDate');
        // $('#formLabel').addClass('error');
        return;
    }
    if(title.val().trim().length && companyName.val().trim().length !== 0){
        $('#exError').hide();
        let tmp = {
            title:title.val(),
            employmentType:employmentType.val(),
            companyName:companyName.val(),
            startDate:startDateEx.val(),
            endDate:endDateEx.val()
        }
        $.post(`/users/ex/`, {tmp}, 
        function(returnedData){
            if (returnedData){
            alert("your experience has successfully add!");
            location.reload(true);
            }
        }
        );
    } else {
        $('#exError').show();
        $('#exError').html('title and  companyName can\'t be empty or just spaces');
        // $('#formLabel').addClass('error');
    }
})

$('#userEdu').submit((event) => {
    event.preventDefault();
    if (new Date(startDateEdu.val())>new Date(endDateEdu.val())) {
        $('#eduError').show();
        $('#eduError').html('endDate can\'t be earlier than startDate');
        // $('#formLabel').addClass('error');
        return;
    }
    if(school.val().trim().length && major.val().trim().length !== 0 && degree.val().trim().length !== 0){
        $('#eduError').hide();
        let tmp = {
            school:school.val(),
            major:major.val(),
            degree:degree.val(),
            startDate:startDateEdu.val(),
            endDate:endDateEdu.val()
        }
        $.post(`/users/edu/`, {tmp}, 
        function(returnedData){
            if (returnedData){
            alert("your education has successfully add!");
            location.reload(true);
            }
        }
        );
    } else {
        $('#eduError').show();
        $('#eduError').html('school, major and degree can\'t be empty or just spaces');
        // $('#formLabel').addClass('error');
    }
})

$('#userSk').submit((event) => {
    event.preventDefault();
    if(skill.val().trim().length !== 0){
        $('#skError').hide();
        let tmp = {
            skills:skill.val()
        }
        $.post(`/users/sk/`, {tmp}, 
        function(returnedData){
            if (returnedData){
            alert("your skills has successfully add!");
            location.reload(true);
            }
        }
        );
    } else {
        $('#skError').show();
        $('#skError').html('skill can\'t be empty or just spaces');
        // $('#formLabel').addClass('error');
    }
})

$('#userLa').submit((event) => {
    event.preventDefault();
    if(languages.val().trim().length !== 0){
        $('#laError').hide();
        let tmp = {
            languages:languages.val()
        }
        $.post(`/users/la/`, {tmp}, 
        function(returnedData){
            if (returnedData){
            alert("your languages has successfully add!");
            location.reload(true);
            }
        }
        );
    } else {
        $('#laError').show();
        $('#laError').html('language can\'t be empty or just spaces');
        // $('#formLabel').addClass('error');
    }
})

const exToremove = (remove) => {
    remove.on('click', event => {
        event.preventDefault();
        let obj = remove.find('a').attr('href');
        $.ajax({
            url: "/users/ex",
            type: "DELETE",
            data: {
                    "companyName": decodeURIComponent(obj)
                  },
            success: function() {
            location.reload(true);                         
            }
         })

    })
}

const eduToremove = (remove) => {
    remove.on('click', event => {
        event.preventDefault();
        let obj = remove.find('a').attr('href');
        $.ajax({
            url: "/users/edu",
            type: "DELETE",
            data: {
                    "school": decodeURIComponent(obj)
                  },
            success: function() {
            location.reload(true);                         
            }
         })

    })
}

const skToremove = (remove) => {
    remove.on('click', event => {
        event.preventDefault();
        let obj = remove.find('a').attr('href');
        $.ajax({
            url: "/users/sk",
            type: "DELETE",
            data: {
                    "skill": decodeURIComponent(obj)
                  },
            success: function() {
            location.reload(true);                         
            }
         })

    })
}

const laToremove = (remove) => {
    remove.on('click', event => {
        event.preventDefault();
        let obj = remove.find('a').attr('href');
        $.ajax({
            url: "/users/la",
            type: "DELETE",
            data: {
                    "language": decodeURIComponent(obj)
                  },
            success: function() {
            location.reload(true);                         
            }
         })

    })
}
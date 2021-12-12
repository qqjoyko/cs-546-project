$(document).ready(function() {
    $.ajax ({
        type :'GET',
        url : '/getsession',
        success: function(data){
            console.log(data);
            if(data.status == 'inactive'){
                console.log("hello");
                $("#logout").hide();
                $('#sessionactive').show();
            }
            else{
                
                $('#sessionactive').hide();
                $('#logout').show();
            }

            if(data.type == 'recruiter') {
                $("#recProfile").show();
                $("#userProfile").hide();
            } else {
                $("#recProfile").hide();
                $("#userProfile").show();
            }


        }
    });
});

// $(document).on('click','.acceptDec',function(event) {
//     event.preventDefault();
//     let body = $(this).parent().attr("value");
//     body = body.split('+').toArray();
//     let jobId = body[0];
//     let applicantId = body[1];
//     $.post('/recruiters/accept',{data: {jobId, applicantId}}).done(function(res) {
//         alert("Success");
//     })
// });

$(document).on('shown.bs.modal', '.modal', function () {
$('.modal-backdrop').before($(this));
});

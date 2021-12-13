$(document).ready(function() {
    $.ajax ({
        type :'GET',
        url : '/getsession',
        success: function(data){
            console.log(data);
            if(data.status == 'inactive'){
                console.log("hello");
                $("#dashList").hide();
                $('#sessionactive').show();
            }
            else{
                
                $('#sessionactive').hide();
                $('#dashList').show();
            

            if(data.type == 'recruiter') {
                $("#userProfile").hide();
                $(".userExtra").hide();
                $("#recProfile").show();
            } else {
                $("#recProfile").hide();
                $("#userProfile").show();
                $(".userExtra").show();
            }
        }

        }
    });
});

$(function () {
    $("#recloginform").on("submit", function(event) {
        event.preventDefault();
        let email = $('#recAuthEmail').val().trim();
        let pwd = $('#recAuthPwd').val().trim();

        let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
        if(!email || !re.test(email) || email.length < 6) {
            $.toast({
                heading: 'Email Error',
                text: 'Please check your email',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re2 = /\s/i;
        if(!pwd || re2.test(pwd) || pwd.length < 6) {
            $.toast({
                heading: 'Password Error',
                text: 'Password must not contain spaces',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }
        var recloginData = {
            email: email,
            password: pwd
        }

        $.ajax({
            type: 'POST',
            url: $("#recloginform").attr("action"),
            data: recloginData,
            statusCode: {
                400: function(data) {
                    
                    let {message} = JSON.parse(data.responseText);
                    $.toast({
                        heading: 'Invalid Credentials',
                        text: message,
                        position: 'top-center',
                        bgColor: '#FF1356',
                        textColor: 'white',
                        stack: false
                    })
                },
                200: function (data){
                    $("#recruiterLogin").modal('hide');
                    location.reload();
                    $(document).on('hidden.bs.modal','#recloginform', function () {
                        window.location.replace('/recruiters/');
                        });
                }
            }
        })
    })


    $("#applicantLogin").on("submit", function(event) {
        event.preventDefault();
        let apemail = $('#appAuthEmail').val().trim();
        let appwd = $('#appAuthPwd').val().trim();

        let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
        if(!apemail || !re.test(apemail) || apemail.length < 6) {
            $.toast({
                heading: 'Email Error',
                text: 'Please check your email',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re2 = /\s/i;
        if(!appwd || re2.test(appwd) || appwd.length < 6) {
            $.toast({
                heading: 'Password Error',
                text: 'Password should not contain any spaces',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }
        var apploginData = {
            email: apemail,
            password: appwd
        }

        $.ajax({
            type: 'POST',
            url: $("#apploginform").attr("action"),
            data: apploginData,
            statusCode: {
                400: function(data) {
                    
                    let {message} = JSON.parse(data.responseText);
                    $.toast({
                        heading: 'Invalid Credentials',
                        text: message,
                        position: 'top-center',
                        bgColor: '#FF1356',
                        textColor: 'white',
                        stack: false
                    })
                }, 200: function (data){
                    $("#applicantLogin").modal('hide');
                    location.reload();
                    $(document).on('hidden.bs.modal','#applicantLogin', function () {
                        window.location.replace('/users/');
                        });
                }
            }
        })
    })


    $("#appSignup").on("submit", function(event) {
        event.preventDefault();
        let apFName = $('#appFName').val().trim();
        let apLName = $('#appLName').val().trim();
        let apemail = $('#apEmail').val().trim();
        let appwd = $('#apPwd').val().trim();
        let apPhone = $('#apPhone').val();
    
        let re = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
        if(!apemail || !re.test(apemail) || apemail.length < 6) {
            $.toast({
                heading: 'Email Error',
                text: 'Please check your email',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re2 = /\s/i;
        if(!appwd || re2.test(appwd) || appwd.length < 6) {
            $.toast({
                heading: 'Password Error',
                text: 'Password must not contain any spaces',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re3 = /[A-Z]/i;
        if(!apFName || !re3.test(apFName) || !apLName || !re3.test(apLName)) {
            $.toast({
                heading: 'Name Error',
                text: 'Please check your name',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re4 = /[0-9]{10}/;
        if(!apPhone || !re4.test(apPhone) || apPhone.length != 10) {
            $.toast({
                heading: 'Phone Error',
                text: 'Phone number is of an invalid format',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        var appSignupData = {
            email: apemail,
            password: appwd,
            firstName: apFName,
            lastName: apLName,
            phone: apPhone
        }
        console.log($("#applicantSignupform").attr("action"));
        $.ajax({
            type: 'POST',
            url: $("#applicantSignupform").attr("action"),
            data: appSignupData,
            statusCode: {
                400: function(data) {
                    
                    let {message} = JSON.parse(data.responseText);
                    $.toast({
                        heading: 'Invalid Credentials',
                        text: message,
                        position: 'top-center',
                        bgColor: '#FF1356',
                        textColor: 'white',
                        stack: false
                    })
                }, 200: function (data){
                    $("#appSignup").modal('hide');
                    location.reload();
                    $(document).on('hidden.bs.modal','#appSignup', function () {
                        window.location.replace('/users/');
                        });
                }
            }
        })
    })
});

    $("#recruiterSignup").on("submit", function(event) {
        event.preventDefault();
        let rfName = $('#recFirstName').val().trim();
        let rlName = $('#recLastName').val().trim();
        let remail = $('#recEmail').val();
        let rpwd = $('#recPwd').val().trim();
        let rphone = $('#recPhone').val();
        
        let re = /[A-Z]/i;
        if(!rfName || !rlName || !re.test(rfName) || !re.test(rlName)) {
            $.toast({
                heading: 'Name Error',
                text: 'Please check your name',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re2 = /[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,}/im;
        if(!remail || !re2.test(remail) || remail.length < 6) {
            $.toast({
                heading: 'Email Error',
                text: 'Please check your email',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re3 = /\s/i;
        if(!rpwd || re3.test(rpwd) || rpwd.length < 6) {
            $.toast({
                heading: 'Password Error',
                text: 'Passwords must not contain spaces',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        let re4 = /[0-9]{10}/;
        if(!rphone || !re4.test(rphone) || rphone.length != 10) {
            $.toast({
                heading: 'Phone Error',
                text: 'Recheck your phone number',
                position: 'top-center',
                bgColor: '#990000',
                textColor: 'white',
                stack: false
            })
        }

        var recSignupData = {
            firstName: rfName,
            lastName: rlName,
            email: remail,
            password: rpwd,
            phone: rphone
        }

        $.ajax({
            type: 'POST',
            url: $("#recruiterSignupform").attr("action"),
            data: recSignupData,
            statusCode: {
                400: function(data) {
                    
                    let {message} = JSON.parse(data.responseText);
                    $.toast({
                        heading: 'Database Error',
                        text: message,
                        position: 'top-center',
                        bgColor: '#FF1356',
                        textColor: 'white',
                        stack: false
                    })
                }, 200: function (data){
                    $("#recruiterSignup").modal('hide');
                    location.reload();
                    $(document).on('hidden.bs.modal','#recruiterSignup', function () {
                        window.location.replace('/recruiters/');
                        });
                }
            }
        })
    })



$(document).on('shown.bs.modal', '.modal', function () {
$('.modal-backdrop').before($(this));
});

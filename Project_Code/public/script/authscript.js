// $(document).ready(function() {
//     $('#recloginform').bootstrapValidator({
//         message: 'This value is not valid',
//         feedbackIcons: {
//             valid: 'glyphicon glyphicon-ok',
//             invalid: 'glyphicon glyphicon-remove',
//             validating: 'glyphicon glyphicon-refresh'
//         },
//         fields: {
//             recAuthPwd: {
//                 message: 'The password is not valid',
//                 validators: {
//                     notEmpty: {
//                         message: 'The password is required and cannot be empty'
//                     },
//                     stringLength: {
//                         min: 6,
//                         max: 30,
//                         message: 'The password must be more than 6 and less than 30 characters long'
//                     },
//                     regexp: {
//                         regexp: /\s/i,
//                         message: 'The password must not contain spaces.'
//                     }
//                 }
//             },
//             recAuthEmail: {
//                 validators: {
//                     notEmpty: {
//                         message: 'The email is required and cannot be empty'
//                     },
//                     emailAddress: {
//                         message: 'The input is not a valid email address'
//                     }
//                 }
//             }
//         }
//     });
// });


$(function() {

    $("#recloginform").validate({
      rules: {
        recAuthEmail: {
          required: true,
          minlength: 8
        },
        recAuthPwd: {
            required: true,
            minlength: 8
          },
        action: "required"
      },
      messages: {
        recAuthEmail: {
          required: "Please enter some data",
          minlength: "Your data must be at least 8 characters"
        },
        recAuthPwd: {
            required: "Please enter some data",
            minlength: "Your data must be at least 8 characters"
          },
        action: "Please provide some data"
      }
    });
  });
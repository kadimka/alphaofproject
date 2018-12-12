$(function () {

    var flag = true


// toggle
    $('.switch-button').on('click', function (e) {
        e.preventDefault()


        $('input').val('')

        if (flag) {
            flag = false
            $('.login').hide()
            $('.register').show('slow')
        } else {
            flag = true
            $('.login').show('slow')
            $('.register').hide()
        }
    })


// register
    $('.register-button').on('click', function (e) {
        e.preventDefault()
        var data = {
            login: $('#register-login').val(),
            password: $('#register-password').val(),
            passwordConfirm: $('#register-password-confirm').val()
        }

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/api/auth/register'
        }).done(function (data) {
            if (!data.ok) {
                $('.register h2').after('<p class="error">' + data.error + '</p>')
                if (data.field) {
                    data.field.forEach((item) => {
                        $('input[name=' + item + ']').addClass('error')
                    })
                }
            } else {/*
            $('.register h2').after('<p class="success">Ok!</p>')*/
                $(location).attr('href', '/')
            }
        })
    })


// login
    $('.login-button').on('click', function (e) {
        e.preventDefault()
        var data = {
            login: $('#login-login').val(),
            password: $('#login-password').val()
        }

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/api/auth/login'
        }).done(function (data) {
            if (!data.ok) {
                $('.login h2').after('<p class="error">' + data.error + '</p>')
                if (data.field) {
                    data.field.forEach((item) => {
                        $('input[name=' + item + ']').addClass('error')
                    })
                }
            } else {
                $(location).attr('href', '/')
            }
        })
    })


// post
    $('.publish-button, .save-button').on('click', function(e) {
        e.preventDefault();

        var isDraft =
            $(this)
                .attr('class')
                .split(' ')[0] === 'save-button';

        var data = {
            title: $('#post-title').val(),
            body: $('#post-body').val(),
            isDraft: isDraft,
            postId: $('#post-id').val()
        };

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/post/add'
        }).done(function(data) {
            console.log(data);
            if (!data.ok) {
                $('.post-form h2').after('<p class="error">' + data.error + '</p>');
                if (data.fields) {
                    data.fields.forEach(function(item) {
                        $('#post-' + item).addClass('error');
                    });
                }
            } else {
                // $('.register h2').after('<p class="success">Отлично!</p>');
                // $(location).attr('href', '/');
                if (isDraft) {
                    $(location).attr('href', '/post/edit/' + data.post.id);
                } else {
                    $(location).attr('href', '/posts/' + data.post.url);
                }
            }
        });
    });
// upload

    $('#file').on('change', function (e) {
        // e.preventDefault()

        var formData = new FormData()
        formData.append('postId', $('#post-id').val())
        formData.append('file', $('#file')[0].files[0])

        $.ajax({
            type: 'POST',
            url: '/upload/image',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                console.log(data)
                $('#fileinfo').prepend('<div class="img-container"><img src="/uploads'+ data.filePath +'" alt=""></div>')
            },
            error: function (e) {
                console.log(e)
            }
        })

    })

    $('.img-container').on('click', function() {
        var imageId = $(this).attr('id');
        var txt = $('#post-body');
        var caretPos = txt[0].selectionStart;
        var textAreaTxt = txt.val();
        var txtToAdd = '![a.1.0.1](image' + imageId + ')';
        txt.val(
            textAreaTxt.substring(0, caretPos) +
            txtToAdd +
            textAreaTxt.substring(caretPos)
        )
    })

// comments
    $(function() {
        var commentForm;
        var parentId;

        // add form
        $('#new, #reply').on('click', function() {
            if (commentForm) {
                commentForm.remove();
            }
            parentId = null;

            commentForm = $('.comment').clone(true, true);

            if ($(this).attr('id') === 'new') {
                commentForm.appendTo('.comment-list');
            } else {
                var parentComment = $(this).parent();
                parentId = parentComment.attr('id');
                $(this).after(commentForm);
            }

            commentForm.css({ display: 'flex' });
        });

        // add form
        $('form.comment .cancel').on('click', function(e) {
            e.preventDefault();
            commentForm.remove();
        });

        // publish
        $('form.comment .send').on('click', function(e) {
            e.preventDefault();
            // removeErrors();

            var data = {
                post: $('.comments').attr('id'),
                body: commentForm.find('textarea').val(),
                parent: parentId
            };

            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: '/comment/add'
            }).done(function(data) {
                console.log(data);
                if (!data.ok) {
                    $('.post-form h2').after('<p class="error">' + data.error + '</p>');
                    if (data.fields) {
                        data.fields.forEach(function(item) {
                            $('#post-' + item).addClass('error');
                        });
                    }
                } else {
                    // $('.register h2').after('<p class="success">Отлично!</p>');
                    $(location).attr('href', '/');
                }
            });
        });
    });


})
(function ($){
    $.fn.findInputByName = function (name) {
        if(name.indexOf('.') == -1)
            return $(this).find(":input[name='"+ name +"']");
        else
        {
            var index = name.split('.')[1];
            var name = name.split('.')[0];
            return $(this).find(":input[name='"+ name +"[]']").eq(index);
        }
    }
})(jQuery);

(function ($){
    $.fn.ajaxeasy = function (config = {}) {
        config.get = function(property) {
            return property in this ? this[property] : null
        }
        if(!$(this).is('form')){
            throw 'element is not a form';
        }
        var this_form = $(this);
        this_form.submit(function(event){
            event.preventDefault();
            this_form.find('div.text-danger').remove();
            disableSubmitButton(this_form, config.get('loading_txt'));
            $.ajax({
                url : this_form.prop('action'),
                method : this_form.prop('method'),
                data : this_form.serialize(),
                success : function (response) {
                    console.log(response);
                },
                error : function(response) {
                    setTimeout(() => {
                        enableSubmitButton(this_form);
                    }, 2000);
                    var count = 0;
                    $.each(response.responseJSON, function(key, value) {
                        if (value.constructor === Array) {
                            for (x in value) {
                                this_form.findInputByName(key).parent('div').append('<div class="text-danger">' + value[x] + '</div>');
                                if (count == 0) {
                                    this_form.findInputByName(key).focus();
                                    count++;
                                }
                            }
                        } else {
                            this_form.findInputByName(key).parent('div').append('<div class="text-danger">' + value + '</div>');
                            if (count == 0) {
                                this_form.findInputByName(key).focus();
                                count++;
                            }
                        }
                    });
                }
            });
        });

        return this;
    }
})(jQuery);
function enableSubmitButton(form_obj) {
    var submit_button = form_obj.find('button[type="submit"]');
    var submit_input  = form_obj.find('input[type="submit"]');
    if(submit_button.length == 1) {
        submit_button.attr('disabled', false)
                     .prop('disabled', false)
                     .text(submit_button.data('innertxt'));
    } else if(submit_input.length == 1) {
        submit_input.attr('disabled', false)
                    .prop('disabled', false)
                    .val(submit_input.data('innertxt'));
    } else {
        console.error('submit button not found.');
    }
}
function disableSubmitButton(form_obj, innertxt) {
    innertxt = innertxt === null ? 'Loading...' : innertxt;
    var submit_button = form_obj.find('button[type="submit"]');
    var submit_input  = form_obj.find('input[type="submit"]');
    if(submit_button.length == 1) {
        submit_button.attr('data-innertxt', submit_button.text());
        submit_button.attr('disabled', true)
                     .prop('disabled', true)
                     .text(innertxt);
    } else if(submit_input.length == 1) {
        submit_button.attr('data-innertxt', submit_button.val());
        submit_input.attr('disabled', true)
                    .prop('disabled', true)
                    .val(innertxt);
    } else {
        console.error('submit button not found.');
    }
}
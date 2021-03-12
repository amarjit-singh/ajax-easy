(function ($){
    $.fn.ajaxeasy = function (config) {
        if(typeof config === "undefined")
            config = {};
        config.get = function(property) {
            return property in this ? this[property] : null;
        };
        if($(this).length!=1){
            throw new Error("please select exactly one element");
        }
        if(!$(this).is("form")){
            throw new Error("element is not a form");
        }
        var this_form = $(this);
        this_form.submit(function(event){
            event.preventDefault();
            this_form.find("div.ajaxeasy-validationerrors").remove();
            disableSubmitButton(this_form, config.get("loading_txt"));
            var ajax_obj = {
                url : config.get('ajax_url') ? config.get('ajax_url') : this_form.prop("action"),
                method : this_form.prop("method"),
                dataType : 'JSON',
                data : this_form.serialize(),
                success : function (response) {
                    enableSubmitButton(this_form);
                    if(config.get('success_message')){
                        $('<div/>', {
                            'id': 'ajaxeasy-success-message'
                        }).css({
                                'background-color': 'green',
                                'position': 'fixed',
                                'bottom': '10%',
                                'left': '50%',
                                'transform': 'translateX(-50%)',
                                'padding': '9px',
                                'color': 'white',
                                'border-radius': '3px',
                                'display': 'block',
                                'z-index': '9999',
                        }).appendTo($('body')).text(config.get('success_message'));
                        setTimeout(function(){
                            $('#ajaxeasy-success-message').fadeOut('slow', 'linear', function(){
                                $(this).remove();
                            });
                        },3000);
                    }
                    if(config.get('ajax_success'))
                        config.get('ajax_success')(response);
                    else
                        this_form.trigger("reset");
                },
                error : function(response) {
                    enableSubmitButton(this_form);
                    if(typeof(response.responseJSON.errors)!='undefined') {
                        var errors = response.responseJSON.errors;
                    } else {
                        var errors = response.responseJSON;
                    }
                    var count = 0;
                    $.each(errors, function(key, value) {
                        if(key.includes("."))
                        {
                            key = key.split('.');
                            var arrayPath = key[0];
                            for(var i = 1; i < key.length; i++) {
                                arrayPath += '['+key[i]+']';
                            }
                            key = arrayPath;
                        }
                        if (value.constructor === Array) value = value[0];
                        var errorArea = this_form.find('div.ae-error[data-for="'+key+'"]');
                        if(errorArea.length == 0) {
                            this_form.find(':input[name="'+ key +'"]').first().after("<div class='ajaxeasy-validationerrors' style='color:#d00606;'>" + value + "</div>");
                        } else {
                            errorArea.append("<div class='ajaxeasy-validationerrors' style='color:#d00606;'>" + value + "</div>");
                        }
                        if (count == 0) {
                            this_form.find(':input[name="'+ key +'"]').first().focus();
                            count++;
                        }
                    });
                }
            };
            if(this_form.attr('enctype')=='multipart/form-data' || this_form.find('input[type="file"]').length!=0) {
                ajax_obj.enctype = "multipart/form-data";
                ajax_obj.processData = false;
                ajax_obj.contentType = false;
                ajax_obj.data = new FormData(this);
                ajax_obj.headers = {
                          'X-CSRF-Token': this_form.find('input[name="_token"]').val()
                       };
            }
            $.ajax(ajax_obj);
        });

        return this;
    }
})(jQuery);
function enableSubmitButton(form_obj) {
    var submit_button = form_obj.find("button[type='submit']");
    var submit_input  = form_obj.find("input[type='submit']");
    if(submit_button.length == 1) {
        submit_button.attr("disabled", false)
                     .prop("disabled", false)
                     .text(submit_button.data("innertxt"));
    } else if(submit_input.length == 1) {
        submit_input.attr("disabled", false)
                    .prop("disabled", false)
                    .val(submit_input.data("innertxt"));
    } else {
        console.error("submit button not found.");
    }
}
function disableSubmitButton(form_obj, innertxt) {
    innertxt = innertxt === null ? "Loading..." : innertxt;
    var submit_button = form_obj.find("button[type='submit']");
    var submit_input  = form_obj.find("input[type='submit']");
    if(submit_button.length == 1) {
        submit_button.attr("data-innertxt", submit_button.text());
        submit_button.attr("disabled", true)
                     .prop("disabled", true)
                     .text(innertxt);
    } else if(submit_input.length == 1) {
        submit_input.attr("data-innertxt", submit_input.val());
        submit_input.attr("disabled", true)
                    .prop("disabled", true)
                    .val(innertxt);
    } else {
        console.error("submit button not found.");
    }
}

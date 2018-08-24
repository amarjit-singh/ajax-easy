
(function ($){
    $.fn.findInputByName = function (name) {
        if(name.indexOf(".") == -1)
            return $(this).find(':input[name="'+ name +'"]');
        else
        {
            var index = name.split(".")[1];
            var name = name.split(".")[0];
            return $(this).find(':input[name="'+ name +'[]"]').eq(index);
        }
    }
})(jQuery);

(function ($){
    $.fn.ajaxeasy = function (config) {
        if(typeof config === "undefined")
            config = {};
        config.get = function(property) {
            return property in this ? this[property] : null;
        };
        if($(this).length!=1){
            throw "please select exactly one element";
        }
        if(!$(this).is("form")){
            throw "element is not a form";
        }
        var this_form = $(this);
        this_form.submit(function(event){

            event.preventDefault();
            this_form.find("div.ajaxeasy-validationerrors").remove();
            disableSubmitButton(this_form, config.get("loading_txt"));
            var ajax_obj = {
                url : this_form.prop("action"),
                method : this_form.prop("method"),
                dataType : 'JSON',
                data : this_form.serialize(),
                success : function (response) {
                    this_form.trigger("reset");
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
                },
                error : function(response) {
                    enableSubmitButton(this_form);
                    if(response.errors!='undefined') {
                        response = response.errors;
                    }
                    var count = 0;
                    $.each(response.responseJSON, function(key, value) {
                        if (value.constructor === Array) {
                            for (x in value) {
                                this_form.findInputByName(key).parent("div").append("<div class='ajaxeasy-validationerrors' style='color:#d00606;'>" + value[x] + "</div>");
                                if (count == 0) {
                                    this_form.findInputByName(key).focus();
                                    count++;
                                }
                            }
                        } else {
                            this_form.findInputByName(key).parent("div").append("<div class='ajaxeasy-validationerrors' style='color:#d00606;'>" + value + "</div>");
                            if (count == 0) {
                                this_form.findInputByName(key).focus();
                                count++;
                            }
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
function disableSubmitButton(form_obj, innertxt) {dddd = form_obj;
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
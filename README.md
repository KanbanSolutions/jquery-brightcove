jquery-brightcove
=================

Brightcove MAPI (http://docs.brightcove.com/en/media/) wrapper for jQuery

    $.brightcove.find_all_videos().done(function(data) {
        //Do something with the API
    }).fail(function(data) {
        //handle the error
    });

Mapping commands directly on the DOM

    <div class="bc-video" data-brightcove-command="find_video_by_reference_id" data-brightcove-arg-name="reference_id" data-brightcove-arg-value="hcnrej2i"></div>
    $('.bc-video').brightcove().done(function(element, data) {
        //This passes back the elements along with the data so you can continue processing without having to re-select the elements
        //Do something with the API
    }).fail(function(element, data) {
        //handle the error
    });


Example Code

    var bc_test = function(){
        //Uses jQuery-tmpl (https://github.com/KanbanSolutions/jquery-tmpl)
        var player_template = $.template([
            '<figure class="video">',
            '<object id="bc-{%= id %}" class="BrightcoveExperience">',
            '<param name="bgcolor" value="#000000" />',
            '<param name="width" value="{%= videoFullLength.frameWidth %}" />',
            '<param name="height" value="{%= videoFullLength.frameHeight %}" />',
            '<param name="playerID" value="{%= player_id %}" />',
            '<param name="videoID" value="{%= id %}" />',
            '<param name="playerKey" value="{%= token %}}" />',
            '<param name="isVid" value="true" />',
            '<param name="isUI" value="true" />',
            '<param name="dynamicStreaming" value="true" />',
            '<param name="@videoPlayer" value="{%= player_id %}" />',
            '<param name="templateLoadHandler" value="{%= load %}" />',
            '<param name="templateReadyHandler" value="{% rdy %}" />',
            '<param name="includeAPI" value="true" />',
            '</object>',
            '<figcaption class="exif-data"></figcaption>',
            '</figure>'
        ].join(''));

        $('#test-bc').brightcove().done(function(els, data, player_id){
            console.log('BC: ', data);
            var max_h = parseInt(els.attr('data-max-height'), 10) || 0;
            var max_w = parseInt(els.attr('data-max-width'), 10) || 0;
            if(data.items) {
                //We got multiple videos back
                //Not handling this case in the example
            } else {
                //Only 1 video so lets inject it

                if(max_h || max_w) {
                    els.attr('data-orig-height', data.videoFullLength.frameHeight);
                    els.attr('data-orig-width', data.videoFullLength.frameWidth);
                    //This is an internal utility that will return a scaled Height and Width back that maintains aspect ratio
                    var scaled = $.utils.image.scale_to_fit([data.videoFullLength.frameWidth, data.videoFullLength.frameHeight], [max_w, max_h]);
                    data.videoFullLength.frameHeight = scaled[1];
                    data.videoFullLength.frameWidth = scaled[0];
                }
                console.log('Only 1 item');
                data.player_id = player_id;

                //This is how jQuery creates the dynamic method names for jsonp requests
                var nonce = $.now();
                data.rdy = ( $.expando + "_" + ( nonce++ ));
                data.load = ( $.expando + "_" + ( nonce++ ));

                //Lets create some dynamic methods to handle the Brightcove player ready and loaded events
                window[data.rdy] = function() {
                    console.log('RDY: ', arguments);
                    setTimeout(function(){delete window[data.rdy];},55);
                };

                window[data.load] = function(exp_id) {
                    var experience = brightcove.api.getExperience(exp_id);
                    var APIModules = brightcove.api.modules.APIModules;
                    var videoPlayer = experience.getModule(APIModules.VIDEO_PLAYER);
                    els.data('bc-video', videoPlayer);

                    console.log(videoPlayer);
                    setTimeout(function(){videoPlayer.play(); delete window[data.load];},55);
                };

                //Uses jQuery-tmpl (https://github.com/KanbanSolutions/jquery-tmpl)
                $.tmpl(player_template, data).appendTo(els);
                brightcove.createExperiences(null, 'bc-' + data.id);
            }
        });
    };
/* global window: true, navigator: false, document: true, importScripts: false, jQuery: true */
/*!
 * $ Brightcove Plugin 1.1
 * https://github.com/KanbanSolutions/jquery-brightcove
 * Requires $ 1.7.2
 *
 * Copyright (c) 2012, Kanban Solutions
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function($){
    "use strict"

    var _private = {};
    var _public = {};
    _private.token = '';

    _private.bc_api_map = [
   		{ "command" : "find_all_videos", "required" : null },
   		{ "command" : "find_video_by_id", "required" : "video_id" },
   		{ "command" : "find_video_by_id_unfiltered", "required" : "video_id" },
   		{ "command" : "find_videos_by_ids", "required" : "video_ids" },
   		{ "command" : "find_videos_by_ids_unfiltered", "required" : "video_ids" },
   		{ "command" : "find_video_by_reference_id", "required" : "reference_id" },
   		{ "command" : "find_video_by_reference_id_unfiltered", "required" : "reference_id" },
   		{ "command" : "find_videos_by_reference_ids", "required" : "reference_ids" },
   		{ "command" : "find_videos_by_reference_ids_unfiltered", "required" : "reference_ids" },
   		{ "command" : "find_videos_by_campaign_id", "required" : "campaign_id" },
   		{ "command" : "find_videos_by_tags", "required" : "or_tags" },
   		{ "command" : "find_videos_by_text", "required" : "text" },
   		{ "command" : "find_videos_by_user_id", "required" : "user_id" },
   		{ "command" : "find_modified_videos", "required" : "from_date" },
   		{ "command" : "find_related_videos", "required" : "video_id" },
   		{ "command" : "find_all_playlists", "required" : false },
   		{ "command" : "find_playlist_by_id", "required" : "playlist_id" },
   		{ "command" : "find_playlists_by_ids", "required" : "playlist_ids" },
   		{ "command" : "find_playlist_by_reference_id", "required" : "reference_id" },
   		{ "command" : "find_playlists_by_reference_ids", "required" : "reference_ids" },
   		{ "command" : "find_playlists_for_player_id", "required" : "player_id" },
   		{ "command" : "search_videos", "required" : "all" }
   	];
    //<div id="test-bc" data-brightcove-command="find_video_by_reference_id" data-brightcove-arg-name="reference_id" data-brightcove-arg-value="hcnrej2i"></div>


    _public.execute = function execute(params) {
        if(!params || !$.isPlainObject(params) || (params && !params.command)) {
            return $.Deferred().reject({error:'Missing Arguments!', code:100});
        }

        params.token = _private.token;

        if(!params.media_delivery) {
            params.media_delivery = 'http';
        }

        return $.ajax({
            url:'http://api.brightcove.com/services/library',
            dataType:'jsonp',
            data:params
        });
    };

    _public.set_token = function set_token(token) {
        _private.token = token;
    };

    $.each(_private.calls, function(idx, cmd) {
        _public[cmd.command] = (function(c) {
            return function() {
                var params = {
                    command:c.command
                };
                if(c.def) {
                    if(arguments.length == 2) {
                        $.extend(true, params, arguments[1]);
                    }
                    params[c.required] = arguments[0];
                } else if(arguments.length == 1) {
                    $.extend(true, params, arguments[0]);
                }

                return _public.execute(params);
            };
        }(cmd));
    });

    $.fn.brightcove = function(config) {
        var els = this;

        config = $.extend(true, {params:els.attr('data-brightcove-params') || {} }, config);

        config.params.command = config.params.command || els.attr('data-brightcove-command') || 'find_all_videos';

        if(this.attr('data-brightcove-arg-name')) {
            config.params[els.attr('data-brightcove-arg-name')] = els.attr('data-brightcove-arg-value');
        }

        var deferred = $.Deferred();

        _public.execute(config.params)
            .done(function(data) {
                deferred.resolve(els, data, _private.player_id);
            })
            .fail(function() {
                deferred.reject(els, {error:'Failed to load Video', code:0});
            });

        return deferred;
    };

    $(function(){
        _private.token = $('body').attr('data-brightcove-token') || '';
        _private.player_id = $('body').attr('data-brightcove-player-id') || '';
    });

    $.brightcove = _public;
}(jQuery));

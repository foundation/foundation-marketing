// $(document).foundation();

// var _gaq = _gaq || [];
// _gaq.push(
//   ['_setAccount', 'UA-2195009-2'],
//   ['_trackPageview'],
//   ['b._setAccount', 'UA-2195009-27'],
//   ['b._trackPageview']
// );

// (function() {
//   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//   ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
//   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// })();


//Kissmetrics

var _kmq = _kmq || [];
var _kmk = _kmk || "d945f04ff5e68057c85f5323b46f185efb3826b3";
function _kms(u){
  setTimeout(function(){
    var d = document, f = d.getElementsByTagName('script')[0],
    s = d.createElement('script');
    s.type = 'text/javascript'; s.async = true; s.src = u;
    f.parentNode.insertBefore(s, f);
  }, 1);
}
_kms('//i.kissmetrics.com/i.js');
_kms('//doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');



$(document).foundation();

var doc = document.documentElement;
doc.setAttribute('data-useragent', navigator.userAgent);

function r(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var case_studies = $('.case-study'),
    study_length =  case_studies.length,
    study_arr = case_studies.map(function () {
      return $(this);
    });

$(study_arr[r(0, study_length - 1)]).addClass('active');

// Fetch forum posts
if ($('[data-forum-posts]').length > 0) {
  var cb = function(data) {
    var html = '';
    $.each(data, function(idx, el) {
      html += JST['src/templates/forum_post.html'](el);
    });
    $('[data-forum-posts]').each(function() {
      $(this).html(html);
    });
  };
  $.ajax({
    url:'https://foundation.discourse.group',
    dataType:'json',
    success: cb
  });
}

// Fetch Delicious links
if ($('[data-delicious-links]').length > 0) {
  var cb = function(data) {
    var html = '';
    $.each(data, function(idx, el) {
      var date = moment(el.dt)
      el.formattedDate = date.format('MMMM Do YYYY');
      html += JST['src/templates/delicious_posts.html'](el);
    });
    $('[data-delicious-links]').each(function() {
      $(this).html(html);
    });
  };
  $.ajax({
    url:'https://feeds.del.icio.us/v2/json/zurb/foundation?count=15',
    dataType:'jsonp',
    success: cb
  });
}

// Fetch Foundation Blog Posts
if ($('[data-foundation-blog]').length > 0) {
  var cb = function(data) {
    var html = '';
    $.each(data, function(idx, el) {
      var date = moment(el.dt)
      el.formattedDate = date.format('MMMM Do YYYY');
      html += JST['src/templates/foundation_posts.html'](el);
    });
    $('[data-foundation-blog]').each(function() {
      $(this).html(html);
    });
  };
  $.ajax({
    url:'https://zurb.com/blog/rss/foundation/json?count=10&topic=foundation',
    dataType:'jsonp',
    crossDomain: 'true',
    success: cb
  });
}


// Fetch BuildingBlocks
if ($('[data-building-blocks]').length > 0) {
  var cb = function(data) {
    var html = '';
    $.each(data, function(idx, el) {
      html += JST['src/templates/building_block.html'](el);
    });
    $('[data-building-blocks]').each(function() {
      $(this).html(html);
    });
    if ($('.building-block-item').length === 0) {
      $('.building-blocks-section').hide();
    };
  };
  $.ajax({
    url:'https://zurb.com/library/api/building_blocks/type/all?count=12',
    dataType:'jsonp',
    success: cb
  });
}

// Fetch Lessons
if ($('[data-lessons]').length > 0) {
  var cb = function(data) {
    var html = '';
    $.each(data, function(idx, el) {
      html += JST['src/templates/lesson.html'](el);
    });
    $('[data-lessons]').each(function() {
      $(this).html(html);
    });
    if ($('.lesson-item').length === 0) {
      $('.lessons-section').hide();
    };
  };
  $.ajax({
    url:'https://zurb.com/university/api/v1/lessons?count=3',
    dataType:'jsonp',
    success: cb
  });
}


// Handle Hosted demo drag-drop area
var dragDropArea = $("div[data-dragdroparea]");

dragDropArea.on('dragenter', function(e) {
  e.stopPropagation();
  e.preventDefault();
  $(this).addClass("is-dragged");
});

dragDropArea.on('dragleave', function(e) {
  e.stopPropagation();
  e.preventDefault();
  $(this).removeClass("is-dragged");
});

dragDropArea.on('dragover', function(e) {
  e.stopPropagation();
  e.preventDefault();
  $(this).addClass("is-dragged");
});

dragDropArea.on('drop', function(e) {
  e.preventDefault();
  $(this).css('border', '2px dashed #008CBA');
  var files = e.originalEvent.dataTransfer.files
  if (files.length > 1 || files[0].type !== 'application/zip') {
    return false;
  }
  var file = files[0];

  // TODO: send exception with more descriptive context object; rewrite to use Honeybadger.wrap()
  try {
    uploadNotableCode(file);
  } catch(e) {
    Honeybadger.notify(e, 'ZipUploadError');
  };
});

$('input#code-demo-file-input').on('change', function(e) {
  e.preventDefault();
  var files = this.files;
  if (files.length > 1 || files[0].type !== 'application/zip') {
    return false;
  }
  var file = files[0];

  try {
    uploadNotableCode(file);
  } catch(e) {
    Honeybadger.notify(e, 'ZipUploadError');
  };
})

// Prevent drop events on document, to avoid opening file if dropped outside dragdrop area
$(document).on('dragenter dragover drop', function(e) {
  e.stopPropagation();
  e.preventDefault();
});

// Handle uploading of Notable Code demo
function uploadNotableCode(file) {
  var formData = new FormData();
  formData.append('site[upload]', file);

  _kmq.push(['record', 'Attempted Upload From Foundation Upload Page']);
  $.ajax({
    url: 'https://code.zurb.com/api/sites',
    type: 'POST',
    crossDomain: true,
    xhr: function() {
      var demoXhr = $.ajaxSettings.xhr();
      if (demoXhr.upload) {
        demoXhr.upload.addEventListener('progress', uploadProgressHandling, false);
      }
      return demoXhr;
    },
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function() {
      $('#upload-progress').fadeIn();
    },
    success: function(response) {
      _kmq.push(['record', 'Successful Upload From Foundation Upload Page']);
      window.location = 'https://code.zurb.com/dashboard/sites/' + response.id;
    },
    error: function(error) {
      console.log(error);
    },
    data: formData,
    // Don't process data or worry about content-type.
    cache: false,
    contentType: false,
    processData: false
  });
};

// Handle display of file upload progress
function uploadProgressHandling(e) {
  if (e.lengthComputable) {
    // $('#upload-progress').attr({value:e.loaded, max:e.total});
    $('div#upload-progress-details').text("Uploading: " + Math.round(((e.loaded/e.total)*100)) + "%");
  }
};

function addIntercom(appId) {
  window.intercomSettings = {
    app_id: appId
  };
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/'+appId;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()
}

// If we're on upload page
if ($('#upload-progress-details').is('*')) {
  _kmq.push(['record', 'Viewed Foundation Upload Page']);

  addIntercom("kqake8un");
}

// If we're on yeti-launch page
if ($('.yeti-launch-download').is('*')) {
  _kmq.push(['record', 'Viewed Yeti Launch Page']);
  $('.yeti-launch-download').click(function() {
    _kmq.push(['record', 'Started Yeti Launch Download']);
  });
}

// If we're on premium support page
if ($('#premium-support-page').is('*')) {
  // Temporarily disabled
  //addIntercom("hrdngkdu");
}

// ---------------------------------------
// ---------- ** INK INLINER ** ----------
// ---------------------------------------
$('#appendQuery').on('click', function(){
  $('#linkAppend').toggleClass('inactive', !$(this).is(':checked'));
});

// $(document).on('click', '#previewModal .close-btn', function(e) {
//   e.preventDefault();
//   $('#previewModal').delay(100).removeClass('active');
//   $('html, body').css('max-height', 'none').css('overflow', 'scroll');
//   $('#skateForm textarea').show();
// });

$(document).on('click', '#showPreview', function(e) {
  e.preventDefault();
  $('html, body').animate({
    scrollTop : 0
  }, 700);
  // $('#previewModal').delay(100).addClass('active');
  $('#skateForm textarea').hide();
  $('html, body').css('max-height', $(window).height()).css('overflow', 'hidden');
  $('#previewModal iframe').height($(window).height() - 47);
});

$(document).on('click', '#inlinerReset', function(e) {
  e.preventDefault();
  $('.show-on-submit').fadeOut(700);
  $('.hide-on-submit').fadeIn(700);
  $('#emailSource').removeClass('result').val(original);
  $('#skateForm textarea').attr('readonly', false);
});

$('#skateForm').on('submit', function(e){
  e.preventDefault();
  original = $('#emailSource').val();
  var data = {
    source: original,
  };

  $('#skateForm textarea').attr('readonly', true);
  $('#emailSource').val('Loading...');
  $('html, body').animate({
    scrollTop : $('.top-headlines').offset().top
  }, 700);
  $('#emailSource').addClass('result');
  $('.hide-on-submit').fadeOut(700);

  if ($('#linkAppend').val() && $('#appendQuery').is(':checked')) {
    data.linkAppend = $('#linkAppend').val();
  }


  $.post("https://inky-direct.zurb.com/ink/skate-proxy.php", data, function(resp){
    $('.show-on-submit').fadeIn(700);
    $('#previewModal').foundation('open');
    $('#emailSource').val(resp.html);
    $('#previewModal').css('z-index', '99999').find('iframe').contents().find('html').html(resp.html);
  }, "json");

  var email = $('#inlinerEmailSignup').val();
  if (email) {
    $('#emailBox input').attr("disabled", "disabled");
    var data = {
      email: email
    };
    $.post("https://zurb.com/ink/newsletter.php", data, function(resp){$('#emailBox').html('<div data-alert class="alert-box">Congratulations, '+email+' is signed up for the list!<a href="#" class="close">&times;</a></div>');});
  }
});


// ----------------------------------------
// -------- ** GITHUB STARGAZER ** --------
// ----------------------------------------

var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function app_commit_check(){
  if ($('#github').hasClass('apps')){
    app_commit_check.button_link = "https://github.com/zurb/foundation-apps/issues";
    app_commit_check.stars_count_url = "https://api.github.com/repos/zurb/foundation-apps?callback=foundationGithub&access_token=77fc5b560afc85a498dcbbb8e3de52abfacc0fbe";
    app_commit_check.stars_url = "https://api.github.com/repos/zurb/foundation-apps/stargazers";
    return "https://api.github.com/repos/zurb/foundation-apps/commits?access_token=77fc5b560afc85a498dcbbb8e3de52abfacc0fbe";
  } else if ($('#github').hasClass('ink')){
    app_commit_check.button_link = "https://github.com/zurb/ink/issues";
    return "https://api.github.com/repos/zurb/ink/commits?access_token=df62fea6b2bfa73e9bcc43154cb593d224dc5c7b";
  } else {
    app_commit_check.button_link = "https://github.com/zurb/foundation/issues";
    return "https://api.github.com/repos/zurb/foundation/commits?access_token=8e0dfc559d22265208b2924266c8b15b60fd9b85";
  }
}

$.ajax({
  url: app_commit_check(),
  dataType: 'jsonp',
  success: function (json) {
    var latest = json.data[0];
    if (!latest) return;
    var stamp = new Date(latest.commit.committer.date),
        stampString = month[stamp.getMonth()] + ' ' + stamp.getDate() + ', ' + stamp.getFullYear();
    var shortText = jQuery.trim(latest.commit.message).substring(0, 77) + ' ...';

    $('#github .description').html(shortText + ' &raquo;');
    $('#github .description').attr('href', latest.html_url);
    $('#github .date').text(stampString);
    $('#github .commit-name').html('Commit ' + latest.sha + ' &raquo;');
    $('#github .commit-name').attr('href', latest.html_url);
    $('#github .button.app').attr('href', app_commit_check.button_link);
  }
});

// FETCH STARGAZERS FROM GITHUB
function app_stargazers_check(){
  if ($('a#stars').hasClass('apps')){
    app_stargazers_check.stars_url = "https://github.com/zurb/foundation-apps/stargazers";
    return "https://api.github.com/repos/zurb/foundation-apps?callback=foundationGithub&access_token=77fc5b560afc85a498dcbbb8e3de52abfacc0fbe";
  } else if ($('a#stars').hasClass('emails')){
    app_stargazers_check.stars_url = "https://github.com/zurb/ink/stargazers";
    return "https://api.github.com/repos/zurb/ink?callback=foundationGithub&access_token=df62fea6b2bfa73e9bcc43154cb593d224dc5c7b";
  } else {
    app_stargazers_check.stars_url = "https://github.com/zurb/foundation/stargazers";
    return "https://api.github.com/repositories/2573058?callback=foundationGithub&access_token=77fc5b560afc85a498dcbbb8e3de52abfacc0fbe";
  }
}
$.ajax({
  url: app_stargazers_check(),
  dataType: 'jsonp',
  success: function (response) {
    if (response && response.data.watchers) {
      var watchers = (Math.round((response.data.watchers / 100), 10) / 10).toFixed(1);

      $('#stars').html(watchers + 'k GitHub stars');
      $('#stars').attr('href', app_stargazers_check.stars_url);
    }
  }
});

// twenty-twenty
///////////////////////////////////

// jquery.event.move
//
// 1.3.6
//
// Stephen Band
//
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Move events are throttled to animation frames. Move event objects
// have the properties:
//
// pageX:
// pageY:   Page coordinates of pointer.
// startX:
// startY:  Page coordinates of pointer at movestart.
// distX:
// distY:  Distance the pointer has moved since movestart.
// deltaX:
// deltaY:  Distance the finger has moved since last event.
// velocityX:
// velocityY:  Average velocity over last few events.


(function (module) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], module);
  } else {
    // Browser globals
    module(jQuery);
  }
})(function(jQuery, undefined){

  var // Number of pixels a pressed pointer travels before movestart
      // event is fired.
      threshold = 6,

      add = jQuery.event.add,

      remove = jQuery.event.remove,

      // Just sugar, so we can have arguments in the same order as
      // add and remove.
      trigger = function(node, type, data) {
        jQuery.event.trigger(type, data, node);
      },

      // Shim for requestAnimationFrame, falling back to timer. See:
      // see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      requestFrame = (function(){
        return (
          window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(fn, element){
            return window.setTimeout(function(){
              fn();
            }, 25);
          }
        );
      })(),

      ignoreTags = {
        textarea: true,
        input: true,
        select: true,
        button: true
      },

      mouseevents = {
        move: 'mousemove',
        cancel: 'mouseup dragstart',
        end: 'mouseup'
      },

      touchevents = {
        move: 'touchmove',
        cancel: 'touchend',
        end: 'touchend'
      };


  // Constructors

  function Timer(fn){
    var callback = fn,
        active = false,
        running = false;

    function trigger(time) {
      if (active){
        callback();
        requestFrame(trigger);
        running = true;
        active = false;
      }
      else {
        running = false;
      }
    }

    this.kick = function(fn) {
      active = true;
      if (!running) { trigger(); }
    };

    this.end = function(fn) {
      var cb = callback;

      if (!fn) { return; }

      // If the timer is not running, simply call the end callback.
      if (!running) {
        fn();
      }
      // If the timer is running, and has been kicked lately, then
      // queue up the current callback and the end callback, otherwise
      // just the end callback.
      else {
        callback = active ?
          function(){ cb(); fn(); } :
          fn ;

        active = true;
      }
    };
  }


  // Functions

  function returnTrue() {
    return true;
  }

  function returnFalse() {
    return false;
  }

  function preventDefault(e) {
    e.preventDefault();
  }

  function preventIgnoreTags(e) {
    // Don't prevent interaction with form elements.
    if (ignoreTags[ e.target.tagName.toLowerCase() ]) { return; }

    e.preventDefault();
  }

  function isLeftButton(e) {
    // Ignore mousedowns on any button other than the left (or primary)
    // mouse button, or when a modifier key is pressed.
    return (e.which === 1 && !e.ctrlKey && !e.altKey);
  }

  function identifiedTouch(touchList, id) {
    var i, l;

    if (touchList.identifiedTouch) {
      return touchList.identifiedTouch(id);
    }

    // touchList.identifiedTouch() does not exist in
    // webkit yet' we must do the search ourselves...

    i = -1;
    l = touchList.length;

    while (++i < l) {
      if (touchList[i].identifier === id) {
        return touchList[i];
      }
    }
  }

  function changedTouch(e, event) {
    var touch = identifiedTouch(e.changedTouches, event.identifier);

    // This isn't the touch you're looking for.
    if (!touch) { return; }

    // Chrome Android (at least) includes touches that have not
    // changed in e.changedTouches. That's a bit annoying. Check
    // that this touch has changed.
    if (touch.pageX === event.pageX && touch.pageY === event.pageY) { return; }

    return touch;
  }


  // Handlers that decide when the first movestart is triggered

  function mousedown(e){
    var data;

    if (!isLeftButton(e)) { return; }

    data = {
      target: e.target,
      startX: e.pageX,
      startY: e.pageY,
      timeStamp: e.timeStamp
    };

    add(document, mouseevents.move, mousemove, data);
    add(document, mouseevents.cancel, mouseend, data);
  }

  function mousemove(e){
    var data = e.data;

    checkThreshold(e, data, e, removeMouse);
  }

  function mouseend(e) {
    removeMouse();
  }

  function removeMouse() {
    remove(document, mouseevents.move, mousemove);
    remove(document, mouseevents.cancel, mouseend);
  }

  function touchstart(e) {
    var touch, template;

    // Don't get in the way of interaction with form elements.
    if (ignoreTags[ e.target.tagName.toLowerCase() ]) { return; }

    touch = e.changedTouches[0];

    // iOS live updates the touch objects whereas Android gives us copies.
    // That means we can't trust the touchstart object to stay the same,
    // so we must copy the data. This object acts as a template for
    // movestart, move and moveend event objects.
    template = {
      target: touch.target,
      startX: touch.pageX,
      startY: touch.pageY,
      timeStamp: e.timeStamp,
      identifier: touch.identifier
    };

    // Use the touch identifier as a namespace, so that we can later
    // remove handlers pertaining only to this touch.
    add(document, touchevents.move + '.' + touch.identifier, touchmove, template);
    add(document, touchevents.cancel + '.' + touch.identifier, touchend, template);
  }

  function touchmove(e){
    var data = e.data,
        touch = changedTouch(e, data);

    if (!touch) { return; }

    checkThreshold(e, data, touch, removeTouch);
  }

  function touchend(e) {
    var template = e.data,
        touch = identifiedTouch(e.changedTouches, template.identifier);

    if (!touch) { return; }

    removeTouch(template.identifier);
  }

  function removeTouch(identifier) {
    remove(document, '.' + identifier, touchmove);
    remove(document, '.' + identifier, touchend);
  }


  // Logic for deciding when to trigger a movestart.

  function checkThreshold(e, template, touch, fn) {
    var distX = touch.pageX - template.startX,
        distY = touch.pageY - template.startY;

    // Do nothing if the threshold has not been crossed.
    if ((distX * distX) + (distY * distY) < (threshold * threshold)) { return; }

    triggerStart(e, template, touch, distX, distY, fn);
  }

  function handled() {
    // this._handled should return false once, and after return true.
    this._handled = returnTrue;
    return false;
  }

  function flagAsHandled(e) {
    e._handled();
  }

  function triggerStart(e, template, touch, distX, distY, fn) {
    var node = template.target,
        touches, time;

    touches = e.targetTouches;
    time = e.timeStamp - template.timeStamp;

    // Create a movestart object with some special properties that
    // are passed only to the movestart handlers.
    template.type = 'movestart';
    template.distX = distX;
    template.distY = distY;
    template.deltaX = distX;
    template.deltaY = distY;
    template.pageX = touch.pageX;
    template.pageY = touch.pageY;
    template.velocityX = distX / time;
    template.velocityY = distY / time;
    template.targetTouches = touches;
    template.finger = touches ?
      touches.length :
      1 ;

    // The _handled method is fired to tell the default movestart
    // handler that one of the move events is bound.
    template._handled = handled;

    // Pass the touchmove event so it can be prevented if or when
    // movestart is handled.
    template._preventTouchmoveDefault = function() {
      e.preventDefault();
    };

    // Trigger the movestart event.
    trigger(template.target, template);

    // Unbind handlers that tracked the touch or mouse up till now.
    fn(template.identifier);
  }


  // Handlers that control what happens following a movestart

  function activeMousemove(e) {
    var timer = e.data.timer;

    e.data.touch = e;
    e.data.timeStamp = e.timeStamp;
    timer.kick();
  }

  function activeMouseend(e) {
    var event = e.data.event,
        timer = e.data.timer;

    removeActiveMouse();

    endEvent(event, timer, function() {
      // Unbind the click suppressor, waiting until after mouseup
      // has been handled.
      setTimeout(function(){
        remove(event.target, 'click', returnFalse);
      }, 0);
    });
  }

  function removeActiveMouse(event) {
    remove(document, mouseevents.move, activeMousemove);
    remove(document, mouseevents.end, activeMouseend);
  }

  function activeTouchmove(e) {
    var event = e.data.event,
        timer = e.data.timer,
        touch = changedTouch(e, event);

    if (!touch) { return; }

    // Stop the interface from gesturing
    e.preventDefault();

    event.targetTouches = e.targetTouches;
    e.data.touch = touch;
    e.data.timeStamp = e.timeStamp;
    timer.kick();
  }

  function activeTouchend(e) {
    var event = e.data.event,
        timer = e.data.timer,
        touch = identifiedTouch(e.changedTouches, event.identifier);

    // This isn't the touch you're looking for.
    if (!touch) { return; }

    removeActiveTouch(event);
    endEvent(event, timer);
  }

  function removeActiveTouch(event) {
    remove(document, '.' + event.identifier, activeTouchmove);
    remove(document, '.' + event.identifier, activeTouchend);
  }


  // Logic for triggering move and moveend events

  function updateEvent(event, touch, timeStamp, timer) {
    var time = timeStamp - event.timeStamp;

    event.type = 'move';
    event.distX =  touch.pageX - event.startX;
    event.distY =  touch.pageY - event.startY;
    event.deltaX = touch.pageX - event.pageX;
    event.deltaY = touch.pageY - event.pageY;

    // Average the velocity of the last few events using a decay
    // curve to even out spurious jumps in values.
    event.velocityX = 0.3 * event.velocityX + 0.7 * event.deltaX / time;
    event.velocityY = 0.3 * event.velocityY + 0.7 * event.deltaY / time;
    event.pageX =  touch.pageX;
    event.pageY =  touch.pageY;
  }

  function endEvent(event, timer, fn) {
    timer.end(function(){
      event.type = 'moveend';

      trigger(event.target, event);

      return fn && fn();
    });
  }


  // jQuery special event definition

  function setup(data, namespaces, eventHandle) {
    // Stop the node from being dragged
    //add(this, 'dragstart.move drag.move', preventDefault);

    // Prevent text selection and touch interface scrolling
    //add(this, 'mousedown.move', preventIgnoreTags);

    // Tell movestart default handler that we've handled this
    add(this, 'movestart.move', flagAsHandled);

    // Don't bind to the DOM. For speed.
    return true;
  }

  function teardown(namespaces) {
    remove(this, 'dragstart drag', preventDefault);
    remove(this, 'mousedown touchstart', preventIgnoreTags);
    remove(this, 'movestart', flagAsHandled);

    // Don't bind to the DOM. For speed.
    return true;
  }

  function addMethod(handleObj) {
    // We're not interested in preventing defaults for handlers that
    // come from internal move or moveend bindings
    if (handleObj.namespace === "move" || handleObj.namespace === "moveend") {
      return;
    }

    // Stop the node from being dragged
    add(this, 'dragstart.' + handleObj.guid + ' drag.' + handleObj.guid, preventDefault, undefined, handleObj.selector);

    // Prevent text selection and touch interface scrolling
    add(this, 'mousedown.' + handleObj.guid, preventIgnoreTags, undefined, handleObj.selector);
  }

  function removeMethod(handleObj) {
    if (handleObj.namespace === "move" || handleObj.namespace === "moveend") {
      return;
    }

    remove(this, 'dragstart.' + handleObj.guid + ' drag.' + handleObj.guid);
    remove(this, 'mousedown.' + handleObj.guid);
  }

  jQuery.event.special.movestart = {
    setup: setup,
    teardown: teardown,
    add: addMethod,
    remove: removeMethod,

    _default: function(e) {
      var event, data;

      // If no move events were bound to any ancestors of this
      // target, high tail it out of here.
      if (!e._handled()) { return; }

      function update(time) {
        updateEvent(event, data.touch, data.timeStamp);
        trigger(e.target, event);
      }

      event = {
        target: e.target,
        startX: e.startX,
        startY: e.startY,
        pageX: e.pageX,
        pageY: e.pageY,
        distX: e.distX,
        distY: e.distY,
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        velocityX: e.velocityX,
        velocityY: e.velocityY,
        timeStamp: e.timeStamp,
        identifier: e.identifier,
        targetTouches: e.targetTouches,
        finger: e.finger
      };

      data = {
        event: event,
        timer: new Timer(update),
        touch: undefined,
        timeStamp: undefined
      };

      if (e.identifier === undefined) {
        // We're dealing with a mouse
        // Stop clicks from propagating during a move
        add(e.target, 'click', returnFalse);
        add(document, mouseevents.move, activeMousemove, data);
        add(document, mouseevents.end, activeMouseend, data);
      }
      else {
        // We're dealing with a touch. Stop touchmove doing
        // anything defaulty.
        e._preventTouchmoveDefault();
        add(document, touchevents.move + '.' + e.identifier, activeTouchmove, data);
        add(document, touchevents.end + '.' + e.identifier, activeTouchend, data);
      }
    }
  };

  jQuery.event.special.move = {
    setup: function() {
      // Bind a noop to movestart. Why? It's the movestart
      // setup that decides whether other move events are fired.
      add(this, 'movestart.move', jQuery.noop);
    },

    teardown: function() {
      remove(this, 'movestart.move', jQuery.noop);
    }
  };

  jQuery.event.special.moveend = {
    setup: function() {
      // Bind a noop to movestart. Why? It's the movestart
      // setup that decides whether other move events are fired.
      add(this, 'movestart.moveend', jQuery.noop);
    },

    teardown: function() {
      remove(this, 'movestart.moveend', jQuery.noop);
    }
  };

  add(document, 'mousedown.move', mousedown);
  add(document, 'touchstart.move', touchstart);

  // Make jQuery copy touch event properties over to the jQuery event
  // object, if they are not already listed. But only do the ones we
  // really need. IE7/8 do not have Array#indexOf(), but nor do they
  // have touch events, so let's assume we can ignore them.
  if (typeof Array.prototype.indexOf === 'function') {
    (function(jQuery, undefined){
      var props = ["changedTouches", "targetTouches"],
          l = props.length;

      while (l--) {
        if (jQuery.event.props.indexOf(props[l]) === -1) {
          jQuery.event.props.push(props[l]);
        }
      }
    })(jQuery);
  };
});


(function($){

  $.fn.twentytwenty = function(options) {
    var options = $.extend({default_offset_pct: 0.5, orientation: 'horizontal'}, options);
    return this.each(function() {

      var sliderPct = options.default_offset_pct;
      var container = $(this);
      var sliderOrientation = options.orientation;
      var beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
      var afterDirection = (sliderOrientation === 'vertical') ? 'up' : 'right';


      container.wrap("<div class='twentytwenty-wrapper twentytwenty-" + sliderOrientation + "'></div>");
      container.append("<div class='twentytwenty-overlay'></div>");
      var beforeImg = container.find("img:first");
      var afterImg = container.find("img:last");
      container.append("<div class='twentytwenty-handle'></div>");
      var slider = container.find(".twentytwenty-handle");
      slider.append("<span class='twentytwenty-" + beforeDirection + "-arrow'></span>");
      slider.append("<span class='twentytwenty-" + afterDirection + "-arrow'></span>");
      container.addClass("twentytwenty-container");
      beforeImg.addClass("twentytwenty-before");
      afterImg.addClass("twentytwenty-after");

      var overlay = container.find(".twentytwenty-overlay");
      overlay.append("<div class='twentytwenty-before-label'></div>");
      overlay.append("<div class='twentytwenty-after-label'></div>");

      var calcOffset = function(dimensionPct) {
        var w = beforeImg.width();
        var h = beforeImg.height();
        return {
          w: w+"px",
          h: h+"px",
          cw: (dimensionPct*w)+"px",
          ch: (dimensionPct*h)+"px"
        };
      };

      var adjustContainer = function(offset) {
        if (sliderOrientation === 'vertical') {
          beforeImg.css("clip", "rect(0,"+offset.w+","+offset.ch+",0)");
        }
        else {
          beforeImg.css("clip", "rect(0,"+offset.cw+","+offset.h+",0)");
      }
        container.css("height", offset.h);
      };

      var adjustSlider = function(pct) {
        var offset = calcOffset(pct);
        slider.css((sliderOrientation==="vertical") ? "top" : "left", (sliderOrientation==="vertical") ? offset.ch : offset.cw);
        adjustContainer(offset);
      }

      $(window).on("resize.twentytwenty", function(e) {
        adjustSlider(sliderPct);
      });

      var offsetX = 0;
      var imgWidth = 0;

      slider.on("movestart", function(e) {
        if (((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) && sliderOrientation !== 'vertical') {
          e.preventDefault();
        }
        else if (((e.distX < e.distY && e.distX < -e.distY) || (e.distX > e.distY && e.distX > -e.distY)) && sliderOrientation === 'vertical') {
          e.preventDefault();
        }
        container.addClass("active");
        offsetX = container.offset().left;
        offsetY = container.offset().top;
        imgWidth = beforeImg.width();
        imgHeight = beforeImg.height();
      });

      slider.on("moveend", function(e) {
        container.removeClass("active");
      });

      slider.on("move", function(e) {
        if (container.hasClass("active")) {
          sliderPct = (sliderOrientation === 'vertical') ? (e.pageY-offsetY)/imgHeight : (e.pageX-offsetX)/imgWidth;
          if (sliderPct < 0) {
            sliderPct = 0;
          }
          if (sliderPct > 1) {
            sliderPct = 1;
          }
          adjustSlider(sliderPct);
        }
      });

      container.find("img").on("mousedown", function(event) {
        event.preventDefault();
      });

      $(window).trigger("resize.twentytwenty");
    });
  };

})(jQuery);


$(window).load(function(){
  if ($.fn.twentytwenty) {
    $(".twentytwenty-container[data-orientation!='vertical']").twentytwenty({default_offset_pct: 0.5});
    $(".twentytwenty-container[data-orientation='vertical']").twentytwenty({default_offset_pct: 0.3, orientation: 'vertical'});
  }
});

if ($('[data-terminal-window]').length) {
  var code = [
    '<row>',
    '  <columns large="6">',
    '    {{> header}}',
    '  </columns>',
    '  <columns large="6">',
    '    <p>No more tables!</p>',
    '  </columns>',
    '</row>'
  ].join('\n');

  var waypoints = $('#inky-panini-section').waypoint({
    handler: function(direction) {
      if (direction === 'down') {
        var wp = document.getElementById('inky-panini-section');

        $("[data-terminal-window]").typed({
          strings: [code],
          contentType: 'text'
        });

        Waypoint.destroyAll();
      }
    }
  });
}

$(function() {
  $('#hosting-list a').click(function() {
    _kmq.push(['record', 'Clicked on a host referal link']);
  });
  $('#all-emails-download').click(function() {
    _kmq.push(['record', 'Foundation Emails:  Downloaded all templates']);
  });
  $('#all-email-templates a[download]').click(function(e) {
    _kmq.push(['record', 'Foundation Emails:  Downloaded a template', {templateUrl: this.href}]);
  });
  $('#inliner-compile-cta').click(function() {
    _kmq.push(['record', 'Foundation Emails:  Inlined An Email']);
  });
  $('#old-ink a').click(function() {
    _kmq.push(['record', 'Foundation Emails:  Clicked to old ink']);
  });
});

$(function () {
  $('#emailForm').submit(function(e) {
    e.preventDefault();
    $.getJSON(
    this.action + "?callback=?",
    $(this).serialize(),
    function (data) {
      if (data.Status === 400) {

      } else { // 200
        $('.inliner-message').fadeIn(500).delay(3000).fadeOut(500);
      }
    });
  });
});


$(function () {
  $('.reveal #subForm').submit(function (e) {
    e.preventDefault();
    $.getJSON(
    this.action + "?callback=?",
    $(this).serialize(),
    function (data) {
      if (data.Status === 400) {
        alert("Error: " + data.Message);
      } else { // 200
        window.location = 'https://get.foundation/sites/insider-thanks.html';
      }
    });
  });
});

$('.brand--list li').each(function() {
  var left = Math.floor(Math.random() * 159) + 1;
  var top = Math.floor(Math.random() * 159) + 1;
  $(this).addClass('for-left-' + left);
  $(this).addClass('for-top-' + top);
});

$("[data-count]").each(function() {
  var id=$(this).data().count;
  var count = $('#' + id).children().length;
  $(this).text(count);
})


// COUNTDOWN TIMER for Events banner
// function getTimeRemaining(endtime){
//  var t = Date.parse(endtime) - Date.parse(new Date());
//  var minutes = Math.floor( (t/1000/60) % 60 );
//  var days = Math.floor( (t/(1000*60*60)/24) );
//  var hours = Math.floor( (t/(1000*60*60)) % 24 );
//  var seconds = Math.floor( (t/1000) % 60 );
//
//  return {
//    'total': t,
//    'hours': hours,
//    'days': days,
//    'minutes': minutes,
//    'seconds': seconds
//  };
// }
//
// function initializeClock(id, endtime){
//  var clock = document.getElementById(id);
//  var daysSpan = clock.querySelector('.days');
//  var hoursSpan = clock.querySelector('.hours');
//  var minutesSpan = clock.querySelector('.minutes');
//  var secondsSpan = clock.querySelector('.seconds');
//
//  function updateClock(){
//    var t = getTimeRemaining(endtime);
//
//    daysSpan.innerHTML = ('0' + t.days).slice(-2);
//    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
//    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
//    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
//
//    if(t.total<=0){
//      clearInterval(timeinterval);
//    }
//  }
//
//  updateClock();
//  var timeinterval = setInterval(updateClock,1000);
// }
//
// var deadline = 'Thurs, 25 Aug 2016 8:00:00 PDT';
// initializeClock('clockdiv', deadline);
//

if($('#email-sponsorship-main-button').length) {
  var position = $('#email-sponsorship-main-button').offset().top;

  var emailSponsorshipVisibility = function(elem) {
    var offset = $(elem).offset().top;
    if(offset > position) {
      $('#email-sponsorship-footer-container').css('opacity', 0);
    } else {
      $('#email-sponsorship-footer-container').css('opacity', 1);
    }
  }
  $('#email-sponsorship-footer-container').on('scrollme.zf.trigger', function(e, elem) {
    emailSponsorshipVisibility(elem);
  });
  emailSponsorshipVisibility($('#email-sponsorship-footer-container'));
}

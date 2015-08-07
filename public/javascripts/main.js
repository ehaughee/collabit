var usernames = [];

$(function() {
  // Cache element selectors
  // =========================================================
  var $chat = $("#chat");
  var $img_load = $("#img-load").remove();
  var $btn_submit = $("#btn_submit");
  var $messages = $("#messages");
  var $overlay = $("#overlay");
  var $selectMode = $("select#mode");
  var $selectTheme = $("select#theme");

  blockui($img_load);

  // ACE Editor
  // =========================================================
  var editor = ace.edit("editor");
  var session = editor.getSession();
  session.setUseWorker(false);
  editor.setTheme("ace/theme/monokai");
  session.setMode("ace/mode/javascript");

  var modeList = ace.require("ace/ext/modelist");
  var themeList = ace.require("ace/ext/themelist");

  // Chosen
  // =========================================================
  // Fill mode select with available modes
  var modes = document.createDocumentFragment();
  _.each(modeList.modes, function(mode) {
    var opt = document.createElement("option");
    opt.setAttribute("value", mode.mode);
    opt.innerText = mode.caption;
    modes.appendChild(opt);
  });

  // Populate select
  $selectMode.html(modes);

  // Default to JavaScript
  $selectMode.val(modeList.modesByName.javascript.mode);

  // Set up chosen
  $selectMode.chosen({
    width: "180px",
    search_contains: true,
    placeholder_text_single: "Choose a language",
    inherit_select_classes: true
  })
  .on('change', function () {
    editor.getSession().setMode(this.value);
    socket.emit('changelang', this.value, this.options[this.selectedIndex].text);
    editor.focus();
  });

  // Fill theme select with available themes
  var darkThemes = document.createElement("optgroup");
  darkThemes.setAttribute("label", "Dark");
  var lightThemes = document.createElement("optgroup");
  lightThemes.setAttribute("label", "Light");

  _.each(themeList.themes, function(theme) {
    var opt = document.createElement("option");
    opt.setAttribute("value", theme.theme);
    opt.innerHTML = theme.caption;

    if (theme.isDark) {
      darkThemes.appendChild(opt);
    } else {
      lightThemes.appendChild(opt);
    }
  });

  // Populate select
  $selectTheme.html(darkThemes);
  $selectTheme.append(lightThemes);

  // Default to monokai
  $selectTheme.val(themeList.themesByName.monokai.theme);

  // Set up chosen
  $selectTheme.chosen({
    width: "180px",
    search_contains: true,
    placeholder_text_single: "Choose a theme",
    inherit_select_classes: true
  })
  .on('change', function () {
    editor.setTheme(this.value);
    editor.focus();
  });

  // Socket.IO
  // ========================================================
  var socket = io.connect("http://" + document.domain + "/chat");

  // [SOCKET] CONNECT
  socket.on("connect", function() {
    console.log("SOCKET: Connection detected.");

    blockui($overlay);

    $btn_submit.click(function () {
      var name = validate_name($("#input_uname").val().trim());

      if (name !== false) {
        socket.emit("adduser", name, document.URL.substr(-6));
        blockui($img_load);
      }
      else {
        $.gritter.add({
          title: "Error",
          text: "Empty, duplicate, or invalid username.  Please try again.",
          time: 6000,
          sticky: false
        });
      }
      return false;
    });

    $("#btn_cancel").click(function () {
      $messages.prop("disabled", "true");
      socket.disconnect();
      $.unblockUI();
      $.gritter.add({
        title: "Collaboration Disabled",
        text: "To enable collaboration refresh the page and enter your name.",
        sticky: true

      });
    });
  });

  // [SOCKET] UPDATE CHAT
  socket.on("updatechat", function(username, message) {
    console.log("SOCKET: 'updatechat' emission detected.");
    write_chat_message(username, tokenize(message));
  });

  // [SOCKET] UPDATE CHAT SERVER
  socket.on("updatechatserver", function(message) {
    console.log("SOCKET: 'updatechatserver' emission detected.");
    write_server_chat_message(tokenize(message));
  });

  // [SOCKET] UPDATE USERS
  socket.on("updateusers", function(new_usernames) {
    var usersList = new_usernames.join(", ");

    // Update users list
    $chat.find("#user-list #users").text(usersList);

    // Logging
    console.log("SOCKET: updateusers [" + usersList + "]");
    usernames = new_usernames;
  });

  // [SOCKET] UPDATE LANG
  socket.on("updatelang", function(value, caption, username) {
    console.log("SOCKET: updatelang detected. Language changed to " + caption + " by " + username);
    // TODO: Should probably do some validation on this
    $selectMode.val(value).trigger("chosen:updated");
    write_server_chat_message(username + " changed the language to " + caption);
  });

  // [SOCKET] ADD USER SUCCESS
  socket.on("addusersuccess", function (room) {
    console.log("SOCKET: 'addusersuccess' emission detected.");
    $.unblockUI();

    // Share.JS
    // ========================================================
    sharejs.open(room, 'text', function(error, doc) {
      doc.attach_ace(editor);
    });

    // Focus on the editor so the user can start typing as soon as they join.
    editor.focus();
  });

  // [SOCKET] ADD USER FAIL
  socket.on("adduserfail", function (message) {
    blockui($overlay);

    $.gritter.add({
      title: "Error",
      text: message,
      time: 6000,
      sticky: false
    });
  });

  // [SOCKET] EXCEPTION
  socket.on("exception", function(message) {
    console.log('ERROR: ' + message.type);

    $.gritter.add({
      title: "Error",
      text: message.type,
      sticky: true
    });
  });

  // [SOCKET] ERROR
  socket.on("error", function(message) {
    console.log('INTERNAL SOCKET ERROR: ' + message);
  });

  // Event handlers
  // ========================================================
  // Enter key to send chats
  $("#message").keypress(function (e) {
    if (e.which == 13) {
      send_chat();
      return false;
    }
  });

  // Enter key to submit name
  $("#input_uname").keypress(function (e) {
    if (e.which == 13) {
      $btn_submit.click();
      return false;
    }
  });

  // Click on line link moves cursor in Ace editor
  $("#messages").on("click", "a.linelink", function(e) {
    var line = Number(this.dataset.line.substr(1));

    if (Number.isInteger(line) && line < session.getLength()) {
      // Move to clicked line
      editor.gotoLine(line, 0, true);

      // Focus on the text editor
      editor.focus();
    }

    e.preventDefault();
    return false;
  });

  window.onbeforeunload = function () {
    console.log("SOCKET: Leaving Collabit. Emitting 'userleft'");
    socket.emit("userleft");
  };

  function write_server_chat_message(message) {
    write_chat_message("SERVER", message, true);
  }

  function write_chat_message(username, message, fServer) {
    // Build message container
    var msgElem = document.createElement('div');
    msgElem.classList.add('message');

    if (fServer) {
      msgElem.classList.add('server');
    }

    // Build username
    var unameElem = document.createElement('strong');
    unameElem.textContent = username + ": ";

    // Build message body
    var msgBody = document.createTextNode(_.unescape(message));

    // Construct message
    msgElem.appendChild(unameElem);
    msgElem.appendChild(msgBody);
    $messages.append(msgElem);

    // Scroll to the bottom of the messages container
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function send_chat() {
    var messageBox = $('textarea#message');
    var message = messageBox.val();
    if (message !== "") {
      messageBox.val('');
      console.log("SOCKET: Send chat command detected.  Emitting 'sendchat'");
      socket.emit('sendchat', message);
    }
  }

  function validate_name(name) {

    if (typeof name !== "undefined"
        && name !== ""
        && name !== null
        && !name.match(/server/i)
        && usernames.indexOf(name) === -1) {

      return name;
    }
    else {
      return false;
    }
  }

  function tokenize(message) {
    // Links
    var pat_link = /((((http(s)?|ftp):\/\/)|www\.)\S+\.\S{2,})/ig;
    var rep_link = '<a href="$1" target="_blank">$1</a>';
    message = message.replace(pat_link, rep_link);

    // Line links
    // TODO: This will cause unwanted behavior if an
    //       existing link has something that matches
    //       the pattern in pat_linelink below.
    var pat_linelink = /(^|\s)(#\d+)(\s|$)/im;
    var rep_linelink = '$1<a href="#" class="linelink" data-line="$2">$2</a>$3';
    message = message.replace(pat_linelink, rep_linelink);

    return message;
  }

  function blockui(content) {
    $.blockUI.defaults.baseZ = 1030;

    $.blockUI({
      message: content,
      css: {
        border: '',
        backgroundColor: '',
        cursor: 'default',
        textAlign: ''
      }
    });
  }
});

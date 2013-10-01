#!/usr/bin/env node
var cmd = require("child_process").exec;
cmd("cd public && bower install", 
  function (error, stdout) {
    console.log("Bower dependencies");
    if (error !== null) {
      console.log("exec error: " + error);
    }
    else {
      console.log("stdout: " + stdout);
      cmd("cd public/bower_components/ace && npm install && node Makefile.dryice.js",
        function (error, stdout) {
          console.log("Build Ace");
          if (error !== null) {
            console.log("exec error: " + error);
          }
          else {
            console.log("stdout: " + stdout);
            cmd("cd public/bower_components/socket.io-client && npm install && make", 
              function (error, stdout) {
                console.log("Build Socket.io-client");
                if (error !== null) {
                  console.log("exec error: " + error);
                }
              }
            );
          }
        }
      );
    }
  }
);
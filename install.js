var cmd = require("child_process").exec;
cmd("cd ./public && bower install && ls ./bower_components/",
  function (error, stdout, stderr) {
    console.log("Bower dependencies");
    if (error !== null) {
      console.log("exec error: " + error);
    }
    else {
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      cmd("cd ./public/bower_components/ace && npm install --production && node Makefile.dryice.js",
        function (error, stdout, stderr) {
          console.log("Build Ace");
          if (error !== null) {
            console.log("exec error: " + error);
          }
          else {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
            cmd("cd ./public/bower_components/socket.io-client && npm install --production && make", 
              function (error, stdout, stderr) {
                console.log("Build Socket.io-client");
                if (error !== null) {
                  console.log("exec error: " + error);
                }
                else {
                  console.log("stdout: " + stdout);
                  console.log("stderr: " + stderr);
                }
              }
            );
          }
        }
      );
    }
  }
);

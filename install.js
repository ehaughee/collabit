var cmd = require("child_process").exec;
cmd("cd public && pwd",//bower install", 
  function (error, stdout, stderr) {
    console.log("Bower dependencies");
    if (error !== null) {
      console.log("exec error: " + error);
    }
    else {
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      cmd("cd public/bower_components/ace && pwd",//npm install && node Makefile.dryice.js",
        function (error, stdout, stderr) {
          console.log("Build Ace");
          if (error !== null) {
            console.log("exec error: " + error);
          }
          else {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
            cmd("cd public/bower_components/socket.io-client && pwd",//npm install && make", 
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

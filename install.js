var cmd = require("child_process").exec;
cmd("cd public && bower install", 
  function (error, stdout) {
    if (error !== null) {
      console.log("exec error: " + error);
    }
    else {
      console.log("stdout: " + stdout);
      cmd("cd bower_components/ace && npm install && node Makefile.dryice.js",
        function (error, stdout) {
          if (error !== null) {
            console.log("exec error: " + error);
          }
          else {
            console.log("stdout: " + stdout);
            cmd("cd ../socket.io-client && npm install && make", 
              function (error, stdout) {
                if (error !== null) {
                  console.log("exec error: " + error);
                }
            );
          }
        }
      );
    }
  }
);
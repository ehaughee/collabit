Collabit
========

Collaborative programming page using Share.JS, the ACE editor, and Node.JS.

Demo: http://collabit.herokuapp.com

![collabit connecting screenshot](http://f.cl.ly/items/280C3U2O0b3X2h1T172v/Screen%20Shot%202013-10-16%20at%208.41.23%20PM.png)
![collabit connected screenshot](http://f.cl.ly/items/003l0S0H2e3h1r123u3K/Screen%20Shot%202013-10-16%20at%208.42.18%20PM.png)

### *nix Install

1. `brew/apt-get install node npm`
2. `git clone https://github.com/ehaughee/collabit.git`
3. `cd collabit`
4. `npm install`
5. Optionally, if you are using VSCode and want intellisense: `npm run devsetup`
7. `npm start`
8. Navigate to http://localhost:4000

### Windows Install (draft)

1. Install Node: http://nodejs.org/download/
2. Install NPM: https://npmjs.org/doc/README.html#Fancy-Windows-Install
3. Install MinGW: http://sourceforge.net/projects/mingw/files/
4. From MinGW, install the msys and mingw32-base packages
5. Add `C:\MingGW\msys\1.0\bin` and `C:\MingGW\bin` to your PATH
6. Install msysgit: https://code.google.com/p/msysgit/downloads/list?q=full+installer+official+git
   Make sure to select the following option during msysgit install (everything else can be defaults): 
   ![msysgit install instructions](http://f.cl.ly/items/2V2O3i1p3R2F1r2v0a12/mysgit.png)
7. `git clone https://github.com/ehaughee/collabit.git`
8. `cd collabit`
9. `npm install`
10. `node app.js`
11. Navigate to http://localhost:4000

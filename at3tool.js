let ROOT = "/root";
var BrowserFS = window.BrowserFS || {};
let DEFAULT_APP_DIRECTORY = ROOT + "/files/";
let Config = {
  locateRootBaseUrl: "",
  locateAppBaseUrl: "",
};
var ae = document.createElement("a");
document.body.appendChild(ae);
ae.style = "display: none";
let fetchElement = document.getElementById("run");
fetchElement.onclick = function () {
  Module["run"]();
};
let outputElement = document.getElementById("output");
outputElement.addEventListener(
  "drop",
  function (event) {
    event.preventDefault();
    uploadFile(event.dataTransfer.files[0]);
  },
  false
);
let inputFileName;
function uploadFile(file) {
  inputFileName = file.name;
  var filereader = new FileReader();
  filereader.file_name = file.name;
  filereader.onload = function () {
    readFile(this.result, inputFileName);
  };
  filereader.readAsArrayBuffer(file);
}
function readFile(data, filename) {
  createFile(Config.appDirPrefix, filename, new Uint8Array(data));
  Module["arguments"].push("-br");
  Module["arguments"].push("132");
  Module["arguments"].push("-e");
  Module["arguments"].push("D:\\" + filename);
  Module["arguments"].push("D:\\" + filename + ".oma");
  Module["removeRunDependency"]("setupBoxedWine");
}
function createFile(dir, name, buf) {
  try {
    FS.createDataFile(dir, name, buf, true, true);
    console.log("Created:" + dir + "/" + name);
  } catch (e) {
    if (e.message === "File exists" || e.message === "FS error") {
      console.log("Replacing: " + dir + name);
      try {
        FS.unlink(dir + "/" + name);
        FS.createDataFile(dir, name, buf, true, true);
        console.log("Replaced: " + dir + name);
      } catch (ee) {
        console.error("Unable to create file: " + dir + name);
        console.error(ee);
      }
    } else {
      console.error("Unable to create file: " + dir + name);
      console.error(e);
    }
  }
}
function getResult() {
  var data = FS.readFile(Config.appDirPrefix + "/" + inputFileName + ".oma", {
    encoding: "binary",
  });
  const blob = new Blob([data], { type: "octet/stream" });
  ae.href = window.URL.createObjectURL(blob);
  ae.download = inputFileName + ".oma";
  ae.click();
  Module["addRunDependency"]("setupBoxedWine");
}
let flag_r = {
  isReadable: function () {
    return true;
  },
  isWriteable: function () {
    return false;
  },
  isTruncating: function () {
    return false;
  },
  isAppendable: function () {
    return false;
  },
  isSynchronous: function () {
    return false;
  },
  isExclusive: function () {
    return false;
  },
  pathExistsAction: function () {
    return 0;
  },
  pathNotExistsAction: function () {
    return 1;
  },
};

function logAndExit(msg) {
  console.log("FATAL ERROR: " + msg);
  throw new Error(msg);
}
var initialSetup = function () {
  Module["addRunDependency"]("setupBoxedWine");

  Config.appDirPrefix = DEFAULT_APP_DIRECTORY;
  Config.rootZipFile = "boxedwine.zip";
  Config.rootOverlay = "wine.zip";
  Config.appZipFile = "at3tool.zip";
  Config.Program = "at3tool.exe";

  let writableStorage = new BrowserFS.FileSystem.InMemory();
  var Buffer = BrowserFS.BFSRequire("buffer").Buffer;
  buildAppFileSystems(function (homeAdapter) {
    var rootListingObject = {};
    rootListingObject[Config.rootZipFile] = null;
    BrowserFS.FileSystem.XmlHttpRequest.Create(
      { index: rootListingObject, baseUrl: Config.locateRootBaseUrl },
      function (e2, xmlHttpFs) {
        if (e2) {
          logAndExit(e2);
        }
        var rootMfs = new BrowserFS.FileSystem.MountableFileSystem();
        rootMfs.mount("/temp", xmlHttpFs);
        rootMfs.readFile(
          "/temp/" + Config.rootZipFile,
          null,
          flag_r,
          function callback(e, contents) {
            if (e) {
              logAndExit(e);
            }
            BrowserFS.FileSystem.ZipFS.Create(
              { zipData: new Buffer(contents) },
              function (e3, zipfs) {
                if (e3) {
                  logAndExit(e3);
                }
                buildBrowserFileSystem(writableStorage, homeAdapter, zipfs);
              }
            );
            rootMfs = null;
          }
        );
      }
    );
  });
};
function buildAppFileSystems(adapterCallback) {
  var Buffer = BrowserFS.BFSRequire("buffer").Buffer;
  var listingObject = {};
  listingObject[Config.appZipFile] = null;
  var mfs = new BrowserFS.FileSystem.MountableFileSystem();
  BrowserFS.FileSystem.XmlHttpRequest.Create(
    { index: listingObject, baseUrl: Config.locateAppBaseUrl },
    function (e2, xmlHttpFs) {
      if (e2) {
        logAndExit(e2);
      }
      mfs.mount("/temp", xmlHttpFs);
      mfs.readFile(
        "/temp/" + Config.appZipFile,
        null,
        flag_r,
        function callback(e, contents) {
          if (e) {
            logAndExit(e);
          }
          BrowserFS.FileSystem.ZipFS.Create(
            { zipData: new Buffer(contents) },
            function (e3, additionalZipfs) {
              if (e3) {
                logAndExit(e3);
              }
              let homeAdapter = new BrowserFS.FileSystem.FolderAdapter(
                "/",
                additionalZipfs
              );
              adapterCallback(homeAdapter);
              mfs = null;
            }
          );
        }
      );
    }
  );
}
function buildBrowserFileSystem(writableStorage, homeAdapter, zipfs) {
  FS.createPath(FS.root, "root", FS.createPath);
  FS.createPath("/root", "base", true, true);
  FS.createPath("/root", "files", true, true);
  BrowserFS.FileSystem.OverlayFS.Create(
    { readable: zipfs, writable: new BrowserFS.FileSystem.InMemory() },
    function (e3, rootOverlay) {
      if (e3) {
        logAndExit(e3);
      }
      deleteFile(rootOverlay, "/lib/wine/wineboot.exe.so");

      homeAdapter.initialize(function callback(e) {
        if (e) {
          logAndExit(e);
        }
        BrowserFS.FileSystem.OverlayFS.Create(
          { readable: homeAdapter, writable: writableStorage },
          function (e2, homeOverlay) {
            if (e2) {
              logAndExit(e2);
            }
            postBuildFileSystem(rootOverlay, homeOverlay);
          }
        );
      });
    }
  );
}
function postBuildFileSystem(rootFS, homeFS) {
  var mfs = new BrowserFS.FileSystem.MountableFileSystem();
  mfs.mount("/root/base", rootFS);
  mfs.mount(
    Config.appDirPrefix.substring(0, Config.appDirPrefix.length - 1),
    homeFS
  );
  var BFS = new BrowserFS.EmscriptenFS();

  BrowserFS.initialize(mfs);
  FS.mount(BFS, { root: "/root" }, "/root");

  var params = getEmulatorParams();
  for (var i = 0; i < params.length; i++) {
    Module["arguments"].push(params[i]);
  }
  //Module["removeRunDependency"]("setupBoxedWine");
}
function getEmulatorParams() {
  var params = ["-root", "/root/base"];
  params.push("-mount_drive");
  params.push(Config.appDirPrefix);
  params.push("d");
  params.push("-nozip");
  params.push("-nosound");
  var subDirectory = Config.appZipFile.substring(
    0,
    Config.appZipFile.lastIndexOf(".")
  );
  params.push("-w");
  if (isInSubDirectory(Config.appDirPrefix, subDirectory)) {
    params.push("/home/username/.wine/dosdevices/d:/" + subDirectory);
  } else {
    params.push("/home/username/.wine/dosdevices/d:");
  }
  params.push("/bin/wine");
  params.push(Config.Program);
  console.log("Emulator params:" + params);
  return params;
}
function isInSubDirectory(fullPath, programDir) {
  var fileEntry = FS.lookupPath(fullPath, { follow: true });
  if (fileEntry != null && fileEntry.node.isFolder) {
    var entries = FS.readdir(fullPath).filter(function (param) {
      return param !== "." && param !== ".." && param !== "__MACOSX";
    });
    for (var idx = 0; idx < entries.length; idx++) {
      if (entries[idx] === programDir) {
        return true;
      }
    }
  }
  return false;
}
function deleteFile(fs, pathAndFilename) {
  try {
    fs.unlinkSync(pathAndFilename);
  } catch (ef) {
    console.log("Unable to delete:" + pathAndFilename + " error:" + ef.message);
  }
}
var Module = {
  preRun: [initialSetup],
  postRun: [],
  arguments: [],
  onExit: function () {
    console.log("EXIT"); // Never called
  },
  print: (function () {
    var element = document.getElementById("output");
    if (element) element.value = "";
    return function (text) {
      if (text.startsWith("Total Encoded Bytes")) {
        getResult();
      }
      if (arguments.length > 1)
        text = Array.prototype.slice.call(arguments).join(" ");
      console.log(text);
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
    };
  })(),
  printErr: function (text) {
    if (arguments.length > 1)
      text = Array.prototype.slice.call(arguments).join(" ");
    console.error(text);
  },
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
  },
};

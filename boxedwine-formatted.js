var read_,
  readAsync,
  readBinary,
  setWindowTitle,
  fs,
  moduleOverrides = Object.assign({}, Module),
  arguments_ = [],
  thisProgram = "./this.program",
  quit_ = (status, toThrow) => {
    throw toThrow;
  },
  ENVIRONMENT_IS_WEB = "object" == typeof window,
  ENVIRONMENT_IS_WORKER = "function" == typeof importScripts,
  ENVIRONMENT_IS_NODE =
    "object" == typeof process &&
    "object" == typeof process.versions &&
    "string" == typeof process.versions.node,
  scriptDirectory = "";
function locateFile(path) {
  return Module.locateFile
    ? Module.locateFile(path, scriptDirectory)
    : scriptDirectory + path;
}
function logExceptionOnExit(e) {
  e instanceof ExitStatus || err("exiting due to exception: " + e);
}
(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
  (ENVIRONMENT_IS_WORKER
    ? (scriptDirectory = self.location.href)
    : "undefined" != typeof document &&
      document.currentScript &&
      (scriptDirectory = document.currentScript.src),
  (scriptDirectory =
    0 !== scriptDirectory.indexOf("blob:")
      ? scriptDirectory.substr(
          0,
          scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
        )
      : ""),
  (read_ = (url) => {
    var xhr = new XMLHttpRequest();
    return xhr.open("GET", url, !1), xhr.send(null), xhr.responseText;
  }),
  ENVIRONMENT_IS_WORKER &&
    (readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      return (
        xhr.open("GET", url, !1),
        (xhr.responseType = "arraybuffer"),
        xhr.send(null),
        new Uint8Array(xhr.response)
      );
    }),
  (readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, !0),
      (xhr.responseType = "arraybuffer"),
      (xhr.onload = () => {
        200 == xhr.status || (0 == xhr.status && xhr.response)
          ? onload(xhr.response)
          : onerror();
      }),
      (xhr.onerror = onerror),
      xhr.send(null);
  }),
  (setWindowTitle = (title) => (document.title = title)));
var out = Module.print || console.log.bind(console),
  err = Module.printErr || console.warn.bind(console);
function warnOnce(text) {
  warnOnce.shown || (warnOnce.shown = {}),
    warnOnce.shown[text] || ((warnOnce.shown[text] = 1), err(text));
}
Object.assign(Module, moduleOverrides),
  (moduleOverrides = null),
  Module.arguments && (arguments_ = Module.arguments),
  Module.thisProgram && (thisProgram = Module.thisProgram),
  Module.quit && (quit_ = Module.quit);
var wasmBinary,
  wasmMemory,
  tempRet0 = 0,
  setTempRet0 = (value) => {
    tempRet0 = value;
  },
  getTempRet0 = () => tempRet0,
  noExitRuntime =
    (Module.wasmBinary && (wasmBinary = Module.wasmBinary),
    Module.noExitRuntime || !0);
function setValue(ptr, value, type = "i8", noSafe) {
  switch ((type = "*" === type.charAt(type.length - 1) ? "i32" : type)) {
    case "i1":
    case "i8":
      HEAP8[ptr >> 0] = value;
      break;
    case "i16":
      HEAP16[ptr >> 1] = value;
      break;
    case "i32":
      HEAP32[ptr >> 2] = value;
      break;
    case "i64":
      (tempI64 = [
        value >>> 0,
        ((tempDouble = value),
        1 <= +Math.abs(tempDouble)
          ? 0 < tempDouble
            ? (0 |
                Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>>
              0
            : ~~+Math.ceil((tempDouble - (~~tempDouble >>> 0)) / 4294967296) >>>
              0
          : 0),
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case "float":
      HEAPF32[ptr >> 2] = value;
      break;
    case "double":
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort("invalid type for setValue: " + type);
  }
}
"object" != typeof WebAssembly && abort("no native wasm support detected");
var EXITSTATUS,
  ABORT = !1;
function assert(condition, text) {
  condition || abort(text);
}
var ALLOC_NORMAL = 0,
  ALLOC_STACK = 1;
function allocate(slab, allocator) {
  allocator = (allocator == ALLOC_STACK ? stackAlloc : _malloc)(slab.length);
  return (
    slab.subarray || slab.slice || (slab = new Uint8Array(slab)),
    HEAPU8.set(slab, allocator),
    allocator
  );
}
var buffer,
  HEAP8,
  HEAPU8,
  HEAP16,
  HEAPU16,
  HEAP32,
  HEAPU32,
  HEAPF32,
  HEAPF64,
  UTF8Decoder =
    "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  for (
    var endIdx = idx + maxBytesToRead, endPtr = idx;
    heapOrArray[endPtr] && !(endIdx <= endPtr);

  )
    ++endPtr;
  if (16 < endPtr - idx && heapOrArray.buffer && UTF8Decoder)
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  for (var str = ""; idx < endPtr; ) {
    var u2,
      u1,
      u0 = heapOrArray[idx++];
    128 & u0
      ? ((u1 = 63 & heapOrArray[idx++]),
        192 == (224 & u0)
          ? (str += String.fromCharCode(((31 & u0) << 6) | u1))
          : ((u2 = 63 & heapOrArray[idx++]),
            (u0 =
              224 == (240 & u0)
                ? ((15 & u0) << 12) | (u1 << 6) | u2
                : ((7 & u0) << 18) |
                  (u1 << 12) |
                  (u2 << 6) |
                  (63 & heapOrArray[idx++])) < 65536
              ? (str += String.fromCharCode(u0))
              : ((u1 = u0 - 65536),
                (str += String.fromCharCode(
                  55296 | (u1 >> 10),
                  56320 | (1023 & u1)
                )))))
      : (str += String.fromCharCode(u0));
  }
  return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(0 < maxBytesToWrite)) return 0;
  for (
    var startIdx = outIdx, endIdx = outIdx + maxBytesToWrite - 1, i = 0;
    i < str.length;
    ++i
  ) {
    var u = str.charCodeAt(i);
    if (
      (u =
        55296 <= u && u <= 57343
          ? (65536 + ((1023 & u) << 10)) | (1023 & str.charCodeAt(++i))
          : u) <= 127
    ) {
      if (endIdx <= outIdx) break;
      heap[outIdx++] = u;
    } else {
      if (u <= 2047) {
        if (endIdx <= outIdx + 1) break;
        heap[outIdx++] = 192 | (u >> 6);
      } else {
        if (u <= 65535) {
          if (endIdx <= outIdx + 2) break;
          heap[outIdx++] = 224 | (u >> 12);
        } else {
          if (endIdx <= outIdx + 3) break;
          (heap[outIdx++] = 240 | (u >> 18)),
            (heap[outIdx++] = 128 | ((u >> 12) & 63));
        }
        heap[outIdx++] = 128 | ((u >> 6) & 63);
      }
      heap[outIdx++] = 128 | (63 & u);
    }
  }
  return (heap[outIdx] = 0), outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
  for (var len = 0, i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    (u =
      55296 <= u && u <= 57343
        ? (65536 + ((1023 & u) << 10)) | (1023 & str.charCodeAt(++i))
        : u) <= 127
      ? ++len
      : (len += u <= 2047 ? 2 : u <= 65535 ? 3 : 4);
  }
  return len;
}
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1,
    ret = _malloc(size);
  return ret && stringToUTF8Array(str, HEAP8, ret, size), ret;
}
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1,
    ret = stackAlloc(size);
  return stringToUTF8Array(str, HEAP8, ret, size), ret;
}
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  dontAddNull || (HEAP8[buffer >> 0] = 0);
}
function updateGlobalBufferAndViews(buf) {
  (buffer = buf),
    (Module.HEAP8 = HEAP8 = new Int8Array(buf)),
    (Module.HEAP16 = HEAP16 = new Int16Array(buf)),
    (Module.HEAP32 = HEAP32 = new Int32Array(buf)),
    (Module.HEAPU8 = HEAPU8 = new Uint8Array(buf)),
    (Module.HEAPU16 = HEAPU16 = new Uint16Array(buf)),
    (Module.HEAPU32 = HEAPU32 = new Uint32Array(buf)),
    (Module.HEAPF32 = HEAPF32 = new Float32Array(buf)),
    (Module.HEAPF64 = HEAPF64 = new Float64Array(buf));
}
var wasmTable,
  INITIAL_MEMORY = Module.INITIAL_MEMORY || 536870912,
  __ATPRERUN__ = [],
  __ATINIT__ = [],
  __ATMAIN__ = [],
  __ATEXIT__ = [],
  __ATPOSTRUN__ = [],
  runtimeInitialized = !1;
function keepRuntimeAlive() {
  return noExitRuntime;
}
function preRun() {
  if (Module.preRun)
    for (
      "function" == typeof Module.preRun && (Module.preRun = [Module.preRun]);
      Module.preRun.length;

    )
      addOnPreRun(Module.preRun.shift());
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  (runtimeInitialized = !0),
    Module.noFSInit || FS.init.initialized || FS.init(),
    (FS.ignorePermissions = !1),
    TTY.init(),
    (SOCKFS.root = FS.mount(SOCKFS, {}, null)),
    callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
  if (Module.postRun)
    for (
      "function" == typeof Module.postRun &&
      (Module.postRun = [Module.postRun]);
      Module.postRun.length;

    )
      addOnPostRun(Module.postRun.shift());
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0,
  runDependencyWatcher = null,
  dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
  return id;
}
function addRunDependency(id) {
  runDependencies++,
    Module.monitorRunDependencies &&
      Module.monitorRunDependencies(runDependencies);
}
function removeRunDependency(id) {
  var callback;
  runDependencies--,
    Module.monitorRunDependencies &&
      Module.monitorRunDependencies(runDependencies),
    0 == runDependencies &&
      (null !== runDependencyWatcher &&
        (clearInterval(runDependencyWatcher), (runDependencyWatcher = null)),
      dependenciesFulfilled &&
        ((callback = dependenciesFulfilled),
        (dependenciesFulfilled = null),
        callback()));
}
function abort(what) {
  throw (
    (Module.onAbort && Module.onAbort(what),
    err((what = "Aborted(" + what + ")")),
    (ABORT = !0),
    (EXITSTATUS = 1),
    (what += ". Build with -s ASSERTIONS=1 for more info."),
    new WebAssembly.RuntimeError(what))
  );
}
(Module.preloadedImages = {}), (Module.preloadedAudios = {});
var wasmBinaryFile,
  tempDouble,
  tempI64,
  dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
  return filename.startsWith(dataURIPrefix);
}
function isFileURI(filename) {
  return filename.startsWith("file://");
}
function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) return new Uint8Array(wasmBinary);
    if (readBinary) return readBinary(file);
    throw "both async and sync fetching of the wasm failed";
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if ("function" == typeof fetch && !isFileURI(wasmBinaryFile))
      return fetch(wasmBinaryFile, { credentials: "same-origin" })
        .then(function (response) {
          if (response.ok) return response.arrayBuffer();
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        })
        .catch(function () {
          return getBinary(wasmBinaryFile);
        });
    if (readAsync)
      return new Promise(function (resolve, reject) {
        readAsync(
          wasmBinaryFile,
          function (response) {
            resolve(new Uint8Array(response));
          },
          reject
        );
      });
  }
  return Promise.resolve().then(function () {
    return getBinary(wasmBinaryFile);
  });
}
function createWasm() {
  var info = { a: asmLibraryArg };
  function receiveInstance(instance, module) {
    instance = instance.exports;
    (Module.asm = instance),
      updateGlobalBufferAndViews((wasmMemory = Module.asm.Td).buffer),
      (wasmTable = Module.asm.Vd),
      addOnInit(Module.asm.Ud),
      removeRunDependency("wasm-instantiate");
  }
  function receiveInstantiationResult(result) {
    receiveInstance(result.instance);
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(function (instance) {
        return instance;
      })
      .then(receiver, function (reason) {
        err("failed to asynchronously prepare wasm: " + reason), abort(reason);
      });
  }
  if ((addRunDependency("wasm-instantiate"), Module.instantiateWasm))
    try {
      return Module.instantiateWasm(info, receiveInstance);
    } catch (e) {
      return err("Module.instantiateWasm callback failed with error: " + e), !1;
    }
  return (
    wasmBinary ||
    "function" != typeof WebAssembly.instantiateStreaming ||
    isDataURI(wasmBinaryFile) ||
    isFileURI(wasmBinaryFile) ||
    "function" != typeof fetch
      ? instantiateArrayBuffer(receiveInstantiationResult)
      : fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function (
          response
        ) {
          return WebAssembly.instantiateStreaming(response, info).then(
            receiveInstantiationResult,
            function (reason) {
              return (
                err("wasm streaming compile failed: " + reason),
                err("falling back to ArrayBuffer instantiation"),
                instantiateArrayBuffer(receiveInstantiationResult)
              );
            }
          );
        }),
    {}
  );
}
isDataURI((wasmBinaryFile = "boxedwine.wasm")) ||
  (wasmBinaryFile = locateFile(wasmBinaryFile));
var ASM_CONSTS = {
    177528: function ($0) {
      document.title = "BoxedWine " + $0 + " MIPS";
    },
    177576: function () {},
    177577: function ($0) {
      ($0 = UTF8ToString($0) + "\n\nAbort/Retry/Ignore/AlwaysIgnore? [ariA] :"),
        ($0 = window.prompt($0, "i"));
      return allocate(
        intArrayFromString(($0 = null === $0 ? "i" : $0)),
        "i8",
        ALLOC_NORMAL
      );
    },
    177802: function () {
      return "undefined" != typeof AudioContext ||
        "undefined" != typeof webkitAudioContext
        ? 1
        : 0;
    },
    177939: function () {
      return (void 0 !== navigator.mediaDevices &&
        void 0 !== navigator.mediaDevices.getUserMedia) ||
        void 0 !== navigator.webkitGetUserMedia
        ? 1
        : 0;
    },
    178163: function ($0) {
      void 0 === Module.SDL2 && (Module.SDL2 = {});
      var SDL2 = Module.SDL2;
      return (
        $0 ? (SDL2.capture = {}) : (SDL2.audio = {}),
        SDL2.audioContext ||
          ("undefined" != typeof AudioContext
            ? (SDL2.audioContext = new AudioContext())
            : "undefined" != typeof webkitAudioContext &&
              (SDL2.audioContext = new webkitAudioContext()),
          SDL2.audioContext && autoResumeAudioContext(SDL2.audioContext)),
        void 0 === SDL2.audioContext ? -1 : 0
      );
    },
    178656: function () {
      return Module.SDL2.audioContext.sampleRate;
    },
    178724: function ($0, $1, $2, $3) {
      function have_microphone(stream) {
        void 0 !== SDL2.capture.silenceTimer &&
          (clearTimeout(SDL2.capture.silenceTimer),
          (SDL2.capture.silenceTimer = void 0)),
          (SDL2.capture.mediaStreamNode =
            SDL2.audioContext.createMediaStreamSource(stream)),
          (SDL2.capture.scriptProcessorNode =
            SDL2.audioContext.createScriptProcessor($1, $0, 1)),
          (SDL2.capture.scriptProcessorNode.onaudioprocess = function (
            audioProcessingEvent
          ) {
            void 0 !== SDL2 &&
              void 0 !== SDL2.capture &&
              (audioProcessingEvent.outputBuffer.getChannelData(0).fill(0),
              (SDL2.capture.currentCaptureBuffer =
                audioProcessingEvent.inputBuffer),
              dynCall("vi", $2, [$3]));
          }),
          SDL2.capture.mediaStreamNode.connect(
            SDL2.capture.scriptProcessorNode
          ),
          SDL2.capture.scriptProcessorNode.connect(
            SDL2.audioContext.destination
          ),
          (SDL2.capture.stream = stream);
      }
      function no_microphone(error) {}
      var SDL2 = Module.SDL2;
      (SDL2.capture.silenceBuffer = SDL2.audioContext.createBuffer(
        $0,
        $1,
        SDL2.audioContext.sampleRate
      )),
        SDL2.capture.silenceBuffer.getChannelData(0).fill(0);
      (SDL2.capture.silenceTimer = setTimeout(function () {
        (SDL2.capture.currentCaptureBuffer = SDL2.capture.silenceBuffer),
          dynCall("vi", $2, [$3]);
      }, ($1 / SDL2.audioContext.sampleRate) * 1e3)),
        void 0 !== navigator.mediaDevices &&
        void 0 !== navigator.mediaDevices.getUserMedia
          ? navigator.mediaDevices
              .getUserMedia({ audio: !0, video: !1 })
              .then(have_microphone)
              .catch(no_microphone)
          : void 0 !== navigator.webkitGetUserMedia &&
            navigator.webkitGetUserMedia(
              { audio: !0, video: !1 },
              have_microphone,
              no_microphone
            );
    },
    180376: function ($0, $1, $2, $3) {
      var SDL2 = Module.SDL2;
      (SDL2.audio.scriptProcessorNode = SDL2.audioContext.createScriptProcessor(
        $1,
        0,
        $0
      )),
        (SDL2.audio.scriptProcessorNode.onaudioprocess = function (e) {
          void 0 !== SDL2 &&
            void 0 !== SDL2.audio &&
            ((SDL2.audio.currentOutputBuffer = e.outputBuffer),
            dynCall("vi", $2, [$3]));
        }),
        SDL2.audio.scriptProcessorNode.connect(SDL2.audioContext.destination);
    },
    180786: function ($0, $1) {
      for (
        var SDL2 = Module.SDL2,
          numChannels = SDL2.capture.currentCaptureBuffer.numberOfChannels,
          c = 0;
        c < numChannels;
        ++c
      ) {
        var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(c);
        if (channelData.length != $1)
          throw (
            "Web Audio capture buffer length mismatch! Destination size: " +
            channelData.length +
            " samples vs expected " +
            $1 +
            " samples!"
          );
        if (1 == numChannels)
          for (var j = 0; j < $1; ++j)
            setValue($0 + 4 * j, channelData[j], "float");
        else
          for (j = 0; j < $1; ++j)
            setValue($0 + 4 * (j * numChannels + c), channelData[j], "float");
      }
    },
    181391: function ($0, $1) {
      for (
        var SDL2 = Module.SDL2,
          numChannels = SDL2.audio.currentOutputBuffer.numberOfChannels,
          c = 0;
        c < numChannels;
        ++c
      ) {
        var channelData = SDL2.audio.currentOutputBuffer.getChannelData(c);
        if (channelData.length != $1)
          throw (
            "Web Audio output buffer length mismatch! Destination size: " +
            channelData.length +
            " samples vs expected " +
            $1 +
            " samples!"
          );
        for (var j = 0; j < $1; ++j)
          channelData[j] = HEAPF32[($0 + ((j * numChannels + c) << 2)) >> 2];
      }
    },
    181871: function ($0) {
      var SDL2 = Module.SDL2;
      if ($0) {
        if (
          (void 0 !== SDL2.capture.silenceTimer &&
            clearTimeout(SDL2.capture.silenceTimer),
          void 0 !== SDL2.capture.stream)
        ) {
          for (
            var tracks = SDL2.capture.stream.getAudioTracks(), i = 0;
            i < tracks.length;
            i++
          )
            SDL2.capture.stream.removeTrack(tracks[i]);
          SDL2.capture.stream = void 0;
        }
        void 0 !== SDL2.capture.scriptProcessorNode &&
          ((SDL2.capture.scriptProcessorNode.onaudioprocess = function (
            audioProcessingEvent
          ) {}),
          SDL2.capture.scriptProcessorNode.disconnect(),
          (SDL2.capture.scriptProcessorNode = void 0)),
          void 0 !== SDL2.capture.mediaStreamNode &&
            (SDL2.capture.mediaStreamNode.disconnect(),
            (SDL2.capture.mediaStreamNode = void 0)),
          void 0 !== SDL2.capture.silenceBuffer &&
            (SDL2.capture.silenceBuffer = void 0),
          (SDL2.capture = void 0);
      } else
        null != SDL2.audio.scriptProcessorNode &&
          (SDL2.audio.scriptProcessorNode.disconnect(),
          (SDL2.audio.scriptProcessorNode = void 0)),
          (SDL2.audio = void 0);
      void 0 !== SDL2.audioContext &&
        void 0 === SDL2.audio &&
        void 0 === SDL2.capture &&
        (SDL2.audioContext.close(), (SDL2.audioContext = void 0));
    },
    183043: function ($0, $1, $2) {
      Module.SDL2 || (Module.SDL2 = {});
      var SDL2 = Module.SDL2,
        data =
          (SDL2.ctxCanvas !== Module.canvas &&
            ((SDL2.ctx = Module.createContext(Module.canvas, !1, !0)),
            (SDL2.ctxCanvas = Module.canvas)),
          (SDL2.w === $0 && SDL2.h === $1 && SDL2.imageCtx === SDL2.ctx) ||
            ((SDL2.image = SDL2.ctx.createImageData($0, $1)),
            (SDL2.w = $0),
            (SDL2.h = $1),
            (SDL2.imageCtx = SDL2.ctx)),
          SDL2.image.data),
        src = $2 >> 2,
        dst = 0;
      if (
        "undefined" != typeof CanvasPixelArray &&
        data instanceof CanvasPixelArray
      )
        for (num = data.length; dst < num; ) {
          var val = HEAP32[src];
          (data[dst] = 255 & val),
            (data[dst + 1] = (val >> 8) & 255),
            (data[dst + 2] = (val >> 16) & 255),
            (data[dst + 3] = 255),
            src++,
            (dst += 4);
        }
      else {
        SDL2.data32Data !== data &&
          ((SDL2.data32 = new Int32Array(data.buffer)),
          (SDL2.data8 = new Uint8Array(data.buffer)),
          (SDL2.data32Data = data));
        var $0 = SDL2.data32,
          num = $0.length,
          data8 = ($0.set(HEAP32.subarray(src, src + num)), SDL2.data8),
          i = 3,
          j = i + 4 * num;
        if (num % 8 == 0)
          for (; i < j; )
            (data8[i] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (data8[(i = (i + 4) | 0)] = 255),
              (i = (i + 4) | 0);
        else for (; i < j; ) (data8[i] = 255), (i = (i + 4) | 0);
      }
      return SDL2.ctx.putImageData(SDL2.image, 0, 0), 0;
    },
    184522: function ($0, $1, $2, $3, $4) {
      var canvas = document.createElement("canvas"),
        ctx =
          ((canvas.width = $0), (canvas.height = $1), canvas.getContext("2d")),
        $0 = ctx.createImageData($0, $1),
        data = $0.data,
        src = $4 >> 2,
        dst = 0;
      if (
        "undefined" != typeof CanvasPixelArray &&
        data instanceof CanvasPixelArray
      )
        for (num = data.length; dst < num; ) {
          var val = HEAP32[src];
          (data[dst] = 255 & val),
            (data[dst + 1] = (val >> 8) & 255),
            (data[dst + 2] = (val >> 16) & 255),
            (data[dst + 3] = (val >> 24) & 255),
            src++,
            (dst += 4);
        }
      else {
        var $1 = new Int32Array(data.buffer),
          num = $1.length;
        $1.set(HEAP32.subarray(src, src + num));
      }
      ctx.putImageData($0, 0, 0);
      ($4 =
        0 === $2 && 0 === $3
          ? "url(" + canvas.toDataURL() + "), auto"
          : "url(" + canvas.toDataURL() + ") " + $2 + " " + $3 + ", auto"),
        ($1 = _malloc($4.length + 1));
      return stringToUTF8($4, $1, $4.length + 1), $1;
    },
    185511: function ($0) {
      return (
        Module.canvas && (Module.canvas.style.cursor = UTF8ToString($0)), 0
      );
    },
    185604: function () {
      Module.canvas && (Module.canvas.style.cursor = "none");
    },
    185673: function () {
      return window.innerWidth;
    },
    185703: function () {
      return window.innerHeight;
    },
    185734: function ($0, $1) {
      alert(UTF8ToString($0) + "\n\n" + UTF8ToString($1));
    },
  },
  ERRNO_CODES = {};
function listenOnce(object, event, func) {
  object.addEventListener(event, func, { once: !0 });
}
function autoResumeAudioContext(ctx, elements) {
  (elements = elements || [document, document.getElementById("canvas")]),
    ["keydown", "mousedown", "touchstart"].forEach(function (event) {
      elements.forEach(function (element) {
        element &&
          listenOnce(element, event, function () {
            "suspended" === ctx.state && ctx.resume();
          });
      });
    });
}
function callRuntimeCallbacks(callbacks) {
  for (; 0 < callbacks.length; ) {
    var func,
      callback = callbacks.shift();
    "function" == typeof callback
      ? callback(Module)
      : "number" == typeof (func = callback.func)
      ? void 0 === callback.arg
        ? getWasmTableEntry(func)()
        : getWasmTableEntry(func)(callback.arg)
      : func(void 0 === callback.arg ? null : callback.arg);
  }
}
function withStackSave(f) {
  var stack = stackSave(),
    f = f();
  return stackRestore(stack), f;
}
function dynCallLegacy(sig, ptr, args) {
  sig = Module["dynCall_" + sig];
  return args && args.length
    ? sig.apply(null, [ptr].concat(args))
    : sig.call(null, ptr);
}
var wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
  var func = wasmTableMirror[funcPtr];
  return (
    func ||
      (funcPtr >= wasmTableMirror.length &&
        (wasmTableMirror.length = funcPtr + 1),
      (wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr))),
    func
  );
}
function dynCall(sig, ptr, args) {
  return sig.includes("j")
    ? dynCallLegacy(sig, ptr, args)
    : getWasmTableEntry(ptr).apply(null, args);
}
function handleException(e) {
  if (e instanceof ExitStatus || "unwind" == e) return EXITSTATUS;
  quit_(1, e);
}
var PATH = {
  splitPath: function (filename) {
    return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
      .exec(filename)
      .slice(1);
  },
  normalizeArray: function (parts, allowAboveRoot) {
    for (var up = 0, i = parts.length - 1; 0 <= i; i--) {
      var last = parts[i];
      "." === last
        ? parts.splice(i, 1)
        : ".." === last
        ? (parts.splice(i, 1), up++)
        : up && (parts.splice(i, 1), up--);
    }
    if (allowAboveRoot) for (; up; up--) parts.unshift("..");
    return parts;
  },
  normalize: function (path) {
    var isAbsolute = "/" === path.charAt(0),
      trailingSlash = "/" === path.substr(-1);
    return (
      (path =
        (path = PATH.normalizeArray(
          path.split("/").filter(function (p) {
            return !!p;
          }),
          !isAbsolute
        ).join("/")) || isAbsolute
          ? path
          : ".") &&
        trailingSlash &&
        (path += "/"),
      (isAbsolute ? "/" : "") + path
    );
  },
  dirname: function (path) {
    var path = PATH.splitPath(path),
      root = path[0],
      path = path[1];
    return root || path
      ? root + (path = path && path.substr(0, path.length - 1))
      : ".";
  },
  basename: function (path) {
    var lastSlash;
    return "/" === path
      ? "/"
      : -1 ===
        (lastSlash = (path = (path = PATH.normalize(path)).replace(
          /\/$/,
          ""
        )).lastIndexOf("/"))
      ? path
      : path.substr(lastSlash + 1);
  },
  extname: function (path) {
    return PATH.splitPath(path)[3];
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join("/"));
  },
  join2: function (l, r) {
    return PATH.normalize(l + "/" + r);
  },
};
function getRandomDevice() {
  var randomBuffer = new Uint8Array(1);
  return function () {
    return crypto.getRandomValues(randomBuffer), randomBuffer[0];
  };
}
var PATH_FS = {
    resolve: function () {
      for (
        var resolvedPath = "", resolvedAbsolute = !1, i = arguments.length - 1;
        -1 <= i && !resolvedAbsolute;
        i--
      ) {
        var path = 0 <= i ? arguments[i] : FS.cwd();
        if ("string" != typeof path)
          throw new TypeError("Arguments to path.resolve must be strings");
        if (!path) return "";
        (resolvedPath = path + "/" + resolvedPath),
          (resolvedAbsolute = "/" === path.charAt(0));
      }
      return (
        (resolvedAbsolute ? "/" : "") +
          (resolvedPath = PATH.normalizeArray(
            resolvedPath.split("/").filter(function (p) {
              return !!p;
            }),
            !resolvedAbsolute
          ).join("/")) || "."
      );
    },
    relative: function (from, to) {
      function trim(arr) {
        for (var start = 0; start < arr.length && "" === arr[start]; start++);
        for (var end = arr.length - 1; 0 <= end && "" === arr[end]; end--);
        return end < start ? [] : arr.slice(start, end - start + 1);
      }
      (from = PATH_FS.resolve(from).substr(1)),
        (to = PATH_FS.resolve(to).substr(1));
      for (
        var fromParts = trim(from.split("/")),
          toParts = trim(to.split("/")),
          length = Math.min(fromParts.length, toParts.length),
          samePartsLength = length,
          i = 0;
        i < length;
        i++
      )
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      for (var outputParts = [], i = samePartsLength; i < fromParts.length; i++)
        outputParts.push("..");
      return (outputParts = outputParts.concat(
        toParts.slice(samePartsLength)
      )).join("/");
    },
  },
  TTY = {
    ttys: [],
    init: function () {},
    shutdown: function () {},
    register: function (dev, ops) {
      (TTY.ttys[dev] = { input: [], output: [], ops: ops }),
        FS.registerDevice(dev, TTY.stream_ops);
    },
    stream_ops: {
      open: function (stream) {
        var tty = TTY.ttys[stream.node.rdev];
        if (!tty) throw new FS.ErrnoError(43);
        (stream.tty = tty), (stream.seekable = !1);
      },
      close: function (stream) {
        stream.tty.ops.flush(stream.tty);
      },
      flush: function (stream) {
        stream.tty.ops.flush(stream.tty);
      },
      read: function (stream, buffer, offset, length, pos) {
        if (!stream.tty || !stream.tty.ops.get_char)
          throw new FS.ErrnoError(60);
        for (var result, bytesRead = 0, i = 0; i < length; i++) {
          try {
            result = stream.tty.ops.get_char(stream.tty);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (void 0 === result && 0 === bytesRead) throw new FS.ErrnoError(6);
          if (null == result) break;
          bytesRead++, (buffer[offset + i] = result);
        }
        return bytesRead && (stream.node.timestamp = Date.now()), bytesRead;
      },
      write: function (stream, buffer, offset, length, pos) {
        if (!stream.tty || !stream.tty.ops.put_char)
          throw new FS.ErrnoError(60);
        try {
          for (var i = 0; i < length; i++)
            stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        return length && (stream.node.timestamp = Date.now()), i;
      },
    },
    default_tty_ops: {
      get_char: function (tty) {
        if (!tty.input.length) {
          var result = null;
          if (
            ("undefined" != typeof window && "function" == typeof window.prompt
              ? null !== (result = window.prompt("Input: ")) && (result += "\n")
              : "function" == typeof readline &&
                null !== (result = readline()) &&
                (result += "\n"),
            !result)
          )
            return null;
          tty.input = intArrayFromString(result, !0);
        }
        return tty.input.shift();
      },
      put_char: function (tty, val) {
        null === val || 10 === val
          ? (out(UTF8ArrayToString(tty.output, 0)), (tty.output = []))
          : 0 != val && tty.output.push(val);
      },
      flush: function (tty) {
        tty.output &&
          0 < tty.output.length &&
          (out(UTF8ArrayToString(tty.output, 0)), (tty.output = []));
      },
    },
    default_tty1_ops: {
      put_char: function (tty, val) {
        null === val || 10 === val
          ? (err(UTF8ArrayToString(tty.output, 0)), (tty.output = []))
          : 0 != val && tty.output.push(val);
      },
      flush: function (tty) {
        tty.output &&
          0 < tty.output.length &&
          (err(UTF8ArrayToString(tty.output, 0)), (tty.output = []));
      },
    },
  };
function zeroMemory(address, size) {
  HEAPU8.fill(0, address, address + size);
}
function mmapAlloc(size) {
  abort();
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, "/", 16895, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) throw new FS.ErrnoError(63);
    MEMFS.ops_table ||
      (MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: { llseek: MEMFS.stream_ops.llseek },
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink,
          },
          stream: {},
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: FS.chrdev_stream_ops,
        },
      });
    mode = FS.createNode(parent, name, mode, dev);
    return (
      FS.isDir(mode.mode)
        ? ((mode.node_ops = MEMFS.ops_table.dir.node),
          (mode.stream_ops = MEMFS.ops_table.dir.stream),
          (mode.contents = {}))
        : FS.isFile(mode.mode)
        ? ((mode.node_ops = MEMFS.ops_table.file.node),
          (mode.stream_ops = MEMFS.ops_table.file.stream),
          (mode.usedBytes = 0),
          (mode.contents = null))
        : FS.isLink(mode.mode)
        ? ((mode.node_ops = MEMFS.ops_table.link.node),
          (mode.stream_ops = MEMFS.ops_table.link.stream))
        : FS.isChrdev(mode.mode) &&
          ((mode.node_ops = MEMFS.ops_table.chrdev.node),
          (mode.stream_ops = MEMFS.ops_table.chrdev.stream)),
      (mode.timestamp = Date.now()),
      parent &&
        ((parent.contents[name] = mode), (parent.timestamp = mode.timestamp)),
      mode
    );
  },
  getFileDataAsTypedArray: function (node) {
    return node.contents
      ? node.contents.subarray
        ? node.contents.subarray(0, node.usedBytes)
        : new Uint8Array(node.contents)
      : new Uint8Array(0);
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    newCapacity <= prevCapacity ||
      ((newCapacity = Math.max(
        newCapacity,
        (prevCapacity * (prevCapacity < 1048576 ? 2 : 1.125)) >>> 0
      )),
      0 != prevCapacity && (newCapacity = Math.max(newCapacity, 256)),
      (prevCapacity = node.contents),
      (node.contents = new Uint8Array(newCapacity)),
      0 < node.usedBytes &&
        node.contents.set(prevCapacity.subarray(0, node.usedBytes), 0));
  },
  resizeFileStorage: function (node, newSize) {
    var oldContents;
    node.usedBytes != newSize &&
      (0 == newSize
        ? ((node.contents = null), (node.usedBytes = 0))
        : ((oldContents = node.contents),
          (node.contents = new Uint8Array(newSize)),
          oldContents &&
            node.contents.set(
              oldContents.subarray(0, Math.min(newSize, node.usedBytes))
            ),
          (node.usedBytes = newSize)));
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      return (
        (attr.dev = FS.isChrdev(node.mode) ? node.id : 1),
        (attr.ino = node.id),
        (attr.mode = node.mode),
        (attr.nlink = 1),
        (attr.uid = 0),
        (attr.gid = 0),
        (attr.rdev = node.rdev),
        FS.isDir(node.mode)
          ? (attr.size = 4096)
          : FS.isFile(node.mode)
          ? (attr.size = node.usedBytes)
          : FS.isLink(node.mode)
          ? (attr.size = node.link.length)
          : (attr.size = 0),
        (attr.atime = new Date(node.timestamp)),
        (attr.mtime = new Date(node.timestamp)),
        (attr.ctime = new Date(node.timestamp)),
        (attr.blksize = 4096),
        (attr.blocks = Math.ceil(attr.size / attr.blksize)),
        attr
      );
    },
    setattr: function (node, attr) {
      void 0 !== attr.mode && (node.mode = attr.mode),
        void 0 !== attr.timestamp && (node.timestamp = attr.timestamp),
        void 0 !== attr.size && MEMFS.resizeFileStorage(node, attr.size);
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node)
          for (var i in new_node.contents) throw new FS.ErrnoError(55);
      }
      delete old_node.parent.contents[old_node.name],
        (old_node.parent.timestamp = Date.now()),
        (old_node.name = new_name),
        (new_dir.contents[new_name] = old_node),
        (new_dir.timestamp = old_node.parent.timestamp),
        (old_node.parent = new_dir);
    },
    unlink: function (parent, name) {
      delete parent.contents[name], (parent.timestamp = Date.now());
    },
    rmdir: function (parent, name) {
      for (var i in FS.lookupNode(parent, name).contents)
        throw new FS.ErrnoError(55);
      delete parent.contents[name], (parent.timestamp = Date.now());
    },
    readdir: function (node) {
      var key,
        entries = [".", ".."];
      for (key in node.contents)
        node.contents.hasOwnProperty(key) && entries.push(key);
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      parent = MEMFS.createNode(parent, newname, 41471, 0);
      return (parent.link = oldpath), parent;
    },
    readlink: function (node) {
      if (FS.isLink(node.mode)) return node.link;
      throw new FS.ErrnoError(28);
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (8 < size && contents.subarray)
        buffer.set(contents.subarray(position, position + size), offset);
      else
        for (var i = 0; i < size; i++)
          buffer[offset + i] = contents[position + i];
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (!length) return 0;
      var node = stream.node;
      if (
        ((node.timestamp = Date.now()),
        buffer.subarray && (!node.contents || node.contents.subarray))
      ) {
        if (canOwn)
          return (
            (node.contents = buffer.subarray(offset, offset + length)),
            (node.usedBytes = length)
          );
        if (0 === node.usedBytes && 0 === position)
          return (
            (node.contents = buffer.slice(offset, offset + length)),
            (node.usedBytes = length)
          );
        if (position + length <= node.usedBytes)
          return (
            node.contents.set(
              buffer.subarray(offset, offset + length),
              position
            ),
            length
          );
      }
      if (
        (MEMFS.expandFileStorage(node, position + length),
        node.contents.subarray && buffer.subarray)
      )
        node.contents.set(buffer.subarray(offset, offset + length), position);
      else
        for (var i = 0; i < length; i++)
          node.contents[position + i] = buffer[offset + i];
      return (
        (node.usedBytes = Math.max(node.usedBytes, position + length)), length
      );
    },
    llseek: function (stream, offset, whence) {
      if (
        (1 === whence
          ? (offset += stream.position)
          : 2 === whence &&
            FS.isFile(stream.node.mode) &&
            (offset += stream.node.usedBytes),
        offset < 0)
      )
        throw new FS.ErrnoError(28);
      return offset;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length),
        (stream.node.usedBytes = Math.max(
          stream.node.usedBytes,
          offset + length
        ));
    },
    mmap: function (stream, address, length, position, prot, flags) {
      if (0 !== address) throw new FS.ErrnoError(28);
      if (!FS.isFile(stream.node.mode)) throw new FS.ErrnoError(43);
      var ptr,
        allocated,
        address = stream.node.contents;
      if (2 & flags || address.buffer !== buffer) {
        if (
          ((0 < position || position + length < address.length) &&
            (address = address.subarray
              ? address.subarray(position, position + length)
              : Array.prototype.slice.call(
                  address,
                  position,
                  position + length
                )),
          (allocated = !0),
          !(ptr = mmapAlloc(length)))
        )
          throw new FS.ErrnoError(48);
        HEAP8.set(address, ptr);
      } else (allocated = !1), (ptr = address.byteOffset);
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (FS.isFile(stream.node.mode))
        return (
          2 & mmapFlags ||
            MEMFS.stream_ops.write(stream, buffer, 0, length, offset, !1),
          0
        );
      throw new FS.ErrnoError(43);
    },
  },
};
function asyncLoad(url, onload, onerror, noRunDep) {
  var dep = noRunDep ? "" : getUniqueRunDependency("al " + url);
  readAsync(
    url,
    function (arrayBuffer) {
      assert(
        arrayBuffer,
        'Loading data file "' + url + '" failed (no arrayBuffer).'
      ),
        onload(new Uint8Array(arrayBuffer)),
        dep && removeRunDependency(dep);
    },
    function (event) {
      if (!onerror) throw 'Loading data file "' + url + '" failed.';
      onerror();
    }
  ),
    dep && addRunDependency(dep);
}
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: !1,
    ignorePermissions: !0,
    trackingDelegate: {},
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    lookupPath: (path, opts = {}) => {
      if (!(path = PATH_FS.resolve(FS.cwd(), path)))
        return { path: "", node: null };
      if (
        8 <
        (opts = Object.assign({ follow_mount: !0, recurse_count: 0 }, opts))
          .recurse_count
      )
        throw new FS.ErrnoError(32);
      for (
        var parts = PATH.normalizeArray(
            path.split("/").filter((p) => !!p),
            !1
          ),
          current = FS.root,
          current_path = "/",
          i = 0;
        i < parts.length;
        i++
      ) {
        var islast = i === parts.length - 1;
        if (islast && opts.parent) break;
        if (
          ((current = FS.lookupNode(current, parts[i])),
          (current_path = PATH.join2(current_path, parts[i])),
          !FS.isMountpoint(current) ||
            (islast && !opts.follow_mount) ||
            (current = current.mounted.root),
          !islast || opts.follow)
        )
          for (var count = 0; FS.isLink(current.mode); ) {
            var link = FS.readlink(current_path),
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link),
              current = FS.lookupPath(current_path, {
                recurse_count: opts.recurse_count + 1,
              }).node;
            if (40 < count++) throw new FS.ErrnoError(32);
          }
      }
      return { path: current_path, node: current };
    },
    getPath: (node) => {
      for (var path, mount; ; ) {
        if (FS.isRoot(node))
          return (
            (mount = node.mount.mountpoint),
            path
              ? "/" !== mount[mount.length - 1]
                ? mount + "/" + path
                : mount + path
              : mount
          );
        (path = path ? node.name + "/" + path : node.name),
          (node = node.parent);
      }
    },
    hashName: (parentid, name) => {
      for (var hash = 0, i = 0; i < name.length; i++)
        hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
      return ((parentid + hash) >>> 0) % FS.nameTable.length;
    },
    hashAddNode: (node) => {
      var hash = FS.hashName(node.parent.id, node.name);
      (node.name_next = FS.nameTable[hash]), (FS.nameTable[hash] = node);
    },
    hashRemoveNode: (node) => {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) FS.nameTable[hash] = node.name_next;
      else
        for (var current = FS.nameTable[hash]; current; ) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
    },
    lookupNode: (parent, name) => {
      var errCode = FS.mayLookup(parent);
      if (errCode) throw new FS.ErrnoError(errCode, parent);
      for (
        var errCode = FS.hashName(parent.id, name),
          node = FS.nameTable[errCode];
        node;
        node = node.name_next
      ) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) return node;
      }
      return FS.lookup(parent, name);
    },
    createNode: (parent, name, mode, rdev) => {
      parent = new FS.FSNode(parent, name, mode, rdev);
      return FS.hashAddNode(parent), parent;
    },
    destroyNode: (node) => {
      FS.hashRemoveNode(node);
    },
    isRoot: (node) => node === node.parent,
    isMountpoint: (node) => !!node.mounted,
    isFile: (mode) => 32768 == (61440 & mode),
    isDir: (mode) => 16384 == (61440 & mode),
    isLink: (mode) => 40960 == (61440 & mode),
    isChrdev: (mode) => 8192 == (61440 & mode),
    isBlkdev: (mode) => 24576 == (61440 & mode),
    isFIFO: (mode) => 4096 == (61440 & mode),
    isSocket: (mode) => 49152 == (49152 & mode),
    flagModes: { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 },
    modeStringToFlags: (str) => {
      var flags = FS.flagModes[str];
      if (void 0 === flags) throw new Error("Unknown file open mode: " + str);
      return flags;
    },
    flagsToPermissionString: (flag) => {
      var perms = ["r", "w", "rw"][3 & flag];
      return 512 & flag && (perms += "w"), perms;
    },
    nodePermissions: (node, perms) =>
      FS.ignorePermissions ||
      ((!perms.includes("r") || 292 & node.mode) &&
        (!perms.includes("w") || 146 & node.mode) &&
        (!perms.includes("x") || 73 & node.mode))
        ? 0
        : 2,
    mayLookup: (dir) => {
      var errCode = FS.nodePermissions(dir, "x");
      return errCode || (dir.node_ops.lookup ? 0 : 2);
    },
    mayCreate: (dir, name) => {
      try {
        FS.lookupNode(dir, name);
        return 20;
      } catch (e) {}
      return FS.nodePermissions(dir, "wx");
    },
    mayDelete: (dir, name, isdir) => {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      name = FS.nodePermissions(dir, "wx");
      if (name) return name;
      if (isdir) {
        if (!FS.isDir(node.mode)) return 54;
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) return 10;
      } else if (FS.isDir(node.mode)) return 31;
      return 0;
    },
    mayOpen: (node, flags) =>
      node
        ? FS.isLink(node.mode)
          ? 32
          : FS.isDir(node.mode) &&
            ("r" !== FS.flagsToPermissionString(flags) || 512 & flags)
          ? 31
          : FS.nodePermissions(node, FS.flagsToPermissionString(flags))
        : 44,
    MAX_OPEN_FDS: 4096,
    nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
      for (var fd = fd_start; fd <= fd_end; fd++)
        if (!FS.streams[fd]) return fd;
      throw new FS.ErrnoError(33);
    },
    getStream: (fd) => FS.streams[fd],
    createStream: (stream, fd_start, fd_end) => {
      FS.FSStream ||
        ((FS.FSStream = function () {}),
        (FS.FSStream.prototype = {
          object: {
            get: function () {
              return this.node;
            },
            set: function (val) {
              this.node = val;
            },
          },
          isRead: {
            get: function () {
              return 1 != (2097155 & this.flags);
            },
          },
          isWrite: {
            get: function () {
              return 0 != (2097155 & this.flags);
            },
          },
          isAppend: {
            get: function () {
              return 1024 & this.flags;
            },
          },
        })),
        (stream = Object.assign(new FS.FSStream(), stream));
      fd_start = FS.nextfd(fd_start, fd_end);
      return (stream.fd = fd_start), (FS.streams[fd_start] = stream);
    },
    closeStream: (fd) => {
      FS.streams[fd] = null;
    },
    chrdev_stream_ops: {
      open: (stream) => {
        var device = FS.getDevice(stream.node.rdev);
        (stream.stream_ops = device.stream_ops),
          stream.stream_ops.open && stream.stream_ops.open(stream);
      },
      llseek: () => {
        throw new FS.ErrnoError(70);
      },
    },
    major: (dev) => dev >> 8,
    minor: (dev) => 255 & dev,
    makedev: (ma, mi) => (ma << 8) | mi,
    registerDevice: (dev, ops) => {
      FS.devices[dev] = { stream_ops: ops };
    },
    getDevice: (dev) => FS.devices[dev],
    getMounts: (mount) => {
      for (var mounts = [], check = [mount]; check.length; ) {
        var m = check.pop();
        mounts.push(m), check.push.apply(check, m.mounts);
      }
      return mounts;
    },
    syncfs: (populate, callback) => {
      "function" == typeof populate && ((callback = populate), (populate = !1)),
        FS.syncFSRequests++,
        1 < FS.syncFSRequests &&
          err(
            "warning: " +
              FS.syncFSRequests +
              " FS.syncfs operations in flight at once, probably just doing extra work"
          );
      var mounts = FS.getMounts(FS.root.mount),
        completed = 0;
      function doCallback(errCode) {
        return FS.syncFSRequests--, callback(errCode);
      }
      function done(errCode) {
        if (errCode)
          return done.errored
            ? void 0
            : ((done.errored = !0), doCallback(errCode));
        ++completed >= mounts.length && doCallback(null);
      }
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) return done(null);
        mount.type.syncfs(mount, populate, done);
      });
    },
    mount: (type, opts, mountpoint) => {
      var node,
        root = "/" === mountpoint,
        pseudo = !mountpoint;
      if (root && FS.root) throw new FS.ErrnoError(10);
      if (!root && !pseudo) {
        pseudo = FS.lookupPath(mountpoint, { follow_mount: !1 });
        if (
          ((mountpoint = pseudo.path),
          (node = pseudo.node),
          FS.isMountpoint(node))
        )
          throw new FS.ErrnoError(10);
        if (!FS.isDir(node.mode)) throw new FS.ErrnoError(54);
      }
      (pseudo = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] }),
        (opts = type.mount(pseudo));
      return (
        ((opts.mount = pseudo).root = opts),
        root
          ? (FS.root = opts)
          : node &&
            ((node.mounted = pseudo),
            node.mount && node.mount.mounts.push(pseudo)),
        opts
      );
    },
    unmount: (mountpoint) => {
      mountpoint = FS.lookupPath(mountpoint, { follow_mount: !1 });
      if (!FS.isMountpoint(mountpoint.node)) throw new FS.ErrnoError(28);
      var mountpoint = mountpoint.node,
        mount = mountpoint.mounted,
        mounts = FS.getMounts(mount),
        mount =
          (Object.keys(FS.nameTable).forEach((hash) => {
            for (var current = FS.nameTable[hash]; current; ) {
              var next = current.name_next;
              mounts.includes(current.mount) && FS.destroyNode(current),
                (current = next);
            }
          }),
          (mountpoint.mounted = null),
          mountpoint.mount.mounts.indexOf(mount));
      mountpoint.mount.mounts.splice(mount, 1);
    },
    lookup: (parent, name) => parent.node_ops.lookup(parent, name),
    mknod: (path, mode, dev) => {
      var parent = FS.lookupPath(path, { parent: !0 }).node,
        path = PATH.basename(path);
      if (!path || "." === path || ".." === path) throw new FS.ErrnoError(28);
      var errCode = FS.mayCreate(parent, path);
      if (errCode) throw new FS.ErrnoError(errCode);
      if (parent.node_ops.mknod)
        return parent.node_ops.mknod(parent, path, mode, dev);
      throw new FS.ErrnoError(63);
    },
    create: (path, mode) =>
      FS.mknod(
        path,
        (mode = ((mode = void 0 !== mode ? mode : 438) & 4095) | 32768),
        0
      ),
    mkdir: (path, mode) => (
      (mode = (1023 & (void 0 !== mode ? mode : 511)) | 16384),
      FS.trackingDelegate.onMakeDirectory &&
        FS.trackingDelegate.onMakeDirectory(path, mode),
      FS.mknod(path, mode, 0)
    ),
    mkdirTree: (path, mode) => {
      for (var dirs = path.split("/"), d = "", i = 0; i < dirs.length; ++i)
        if (dirs[i]) {
          d += "/" + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch (e) {
            if (20 != e.errno) throw e;
          }
        }
    },
    mkdev: (path, mode, dev) => (
      void 0 === dev && ((dev = mode), (mode = 438)),
      FS.mknod(path, (mode |= 8192), dev)
    ),
    symlink: (oldpath, newpath) => {
      if (!PATH_FS.resolve(oldpath)) throw new FS.ErrnoError(44);
      var parent = FS.lookupPath(newpath, { parent: !0 }).node;
      if (!parent) throw new FS.ErrnoError(44);
      var newname = PATH.basename(newpath),
        errCode = FS.mayCreate(parent, newname);
      if (errCode) throw new FS.ErrnoError(errCode);
      if (parent.node_ops.symlink)
        return (
          FS.trackingDelegate.onMakeSymlink &&
            FS.trackingDelegate.onMakeSymlink(oldpath, newpath),
          parent.node_ops.symlink(parent, newname, oldpath)
        );
      throw new FS.ErrnoError(63);
    },
    rename: (old_path, new_path) => {
      var old_dirname = PATH.dirname(old_path),
        new_dirname = PATH.dirname(new_path),
        old_name = PATH.basename(old_path),
        new_name = PATH.basename(new_path),
        lookup = FS.lookupPath(old_path, { parent: !0 }),
        lookup = lookup.node,
        new_dir = FS.lookupPath(new_path, { parent: !0 }).node;
      if (!lookup || !new_dir) throw new FS.ErrnoError(44);
      if (lookup.mount !== new_dir.mount) throw new FS.ErrnoError(75);
      var new_node,
        old_node = FS.lookupNode(lookup, old_name),
        new_dirname = PATH_FS.relative(old_path, new_dirname);
      if ("." !== new_dirname.charAt(0)) throw new FS.ErrnoError(28);
      if (
        "." !==
        (new_dirname = PATH_FS.relative(new_path, old_dirname)).charAt(0)
      )
        throw new FS.ErrnoError(55);
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {}
      if (old_node !== new_node) {
        (old_dirname = FS.isDir(old_node.mode)),
          (new_dirname = FS.mayDelete(lookup, old_name, old_dirname));
        if (new_dirname) throw new FS.ErrnoError(new_dirname);
        if (
          (new_dirname = new_node
            ? FS.mayDelete(new_dir, new_name, old_dirname)
            : FS.mayCreate(new_dir, new_name))
        )
          throw new FS.ErrnoError(new_dirname);
        if (!lookup.node_ops.rename) throw new FS.ErrnoError(63);
        if (
          FS.isMountpoint(old_node) ||
          (new_node && FS.isMountpoint(new_node))
        )
          throw new FS.ErrnoError(10);
        if (
          new_dir !== lookup &&
          (new_dirname = FS.nodePermissions(lookup, "w"))
        )
          throw new FS.ErrnoError(new_dirname);
        FS.trackingDelegate.willMovePath &&
          FS.trackingDelegate.willMovePath(old_path, new_path),
          FS.hashRemoveNode(old_node);
        try {
          lookup.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          FS.hashAddNode(old_node);
        }
        FS.trackingDelegate.onMovePath &&
          FS.trackingDelegate.onMovePath(old_path, new_path);
      }
    },
    rmdir: (path) => {
      var parent = FS.lookupPath(path, { parent: !0 }).node,
        name = PATH.basename(path),
        node = FS.lookupNode(parent, name),
        errCode = FS.mayDelete(parent, name, !0);
      if (errCode) throw new FS.ErrnoError(errCode);
      if (!parent.node_ops.rmdir) throw new FS.ErrnoError(63);
      if (FS.isMountpoint(node)) throw new FS.ErrnoError(10);
      FS.trackingDelegate.willDeletePath &&
        FS.trackingDelegate.willDeletePath(path),
        parent.node_ops.rmdir(parent, name),
        FS.destroyNode(node),
        FS.trackingDelegate.onDeletePath &&
          FS.trackingDelegate.onDeletePath(path);
    },
    readdir: (path) => {
      path = FS.lookupPath(path, { follow: !0 }).node;
      if (path.node_ops.readdir) return path.node_ops.readdir(path);
      throw new FS.ErrnoError(54);
    },
    unlink: (path) => {
      var parent = FS.lookupPath(path, { parent: !0 }).node;
      if (!parent) throw new FS.ErrnoError(44);
      var name = PATH.basename(path),
        node = FS.lookupNode(parent, name),
        errCode = FS.mayDelete(parent, name, !1);
      if (errCode) throw new FS.ErrnoError(errCode);
      if (!parent.node_ops.unlink) throw new FS.ErrnoError(63);
      if (FS.isMountpoint(node)) throw new FS.ErrnoError(10);
      FS.trackingDelegate.willDeletePath &&
        FS.trackingDelegate.willDeletePath(path),
        parent.node_ops.unlink(parent, name),
        FS.destroyNode(node),
        FS.trackingDelegate.onDeletePath &&
          FS.trackingDelegate.onDeletePath(path);
    },
    readlink: (path) => {
      path = FS.lookupPath(path).node;
      if (!path) throw new FS.ErrnoError(44);
      if (path.node_ops.readlink)
        return PATH_FS.resolve(
          FS.getPath(path.parent),
          path.node_ops.readlink(path)
        );
      throw new FS.ErrnoError(28);
    },
    stat: (path, dontFollow) => {
      path = FS.lookupPath(path, { follow: !dontFollow }).node;
      if (!path) throw new FS.ErrnoError(44);
      if (path.node_ops.getattr) return path.node_ops.getattr(path);
      throw new FS.ErrnoError(63);
    },
    lstat: (path) => FS.stat(path, !0),
    chmod: (path, mode, dontFollow) => {
      if (
        !(dontFollow =
          "string" == typeof path
            ? FS.lookupPath(path, { follow: !dontFollow }).node
            : path).node_ops.setattr
      )
        throw new FS.ErrnoError(63);
      dontFollow.node_ops.setattr(dontFollow, {
        mode: (4095 & mode) | (-4096 & dontFollow.mode),
        timestamp: Date.now(),
      });
    },
    lchmod: (path, mode) => {
      FS.chmod(path, mode, !0);
    },
    fchmod: (fd, mode) => {
      fd = FS.getStream(fd);
      if (!fd) throw new FS.ErrnoError(8);
      FS.chmod(fd.node, mode);
    },
    chown: (path, uid, gid, dontFollow) => {
      if (
        !(dontFollow =
          "string" == typeof path
            ? FS.lookupPath(path, { follow: !dontFollow }).node
            : path).node_ops.setattr
      )
        throw new FS.ErrnoError(63);
      dontFollow.node_ops.setattr(dontFollow, { timestamp: Date.now() });
    },
    lchown: (path, uid, gid) => {
      FS.chown(path, uid, gid, !0);
    },
    fchown: (fd, uid, gid) => {
      fd = FS.getStream(fd);
      if (!fd) throw new FS.ErrnoError(8);
      FS.chown(fd.node, uid, gid);
    },
    truncate: (path, len) => {
      if (len < 0) throw new FS.ErrnoError(28);
      if (
        !(path =
          "string" == typeof path
            ? FS.lookupPath(path, { follow: !0 }).node
            : path).node_ops.setattr
      )
        throw new FS.ErrnoError(63);
      if (FS.isDir(path.mode)) throw new FS.ErrnoError(31);
      if (!FS.isFile(path.mode)) throw new FS.ErrnoError(28);
      var errCode = FS.nodePermissions(path, "w");
      if (errCode) throw new FS.ErrnoError(errCode);
      path.node_ops.setattr(path, { size: len, timestamp: Date.now() });
    },
    ftruncate: (fd, len) => {
      fd = FS.getStream(fd);
      if (!fd) throw new FS.ErrnoError(8);
      if (0 == (2097155 & fd.flags)) throw new FS.ErrnoError(28);
      FS.truncate(fd.node, len);
    },
    utime: (path, atime, mtime) => {
      path = FS.lookupPath(path, { follow: !0 }).node;
      path.node_ops.setattr(path, { timestamp: Math.max(atime, mtime) });
    },
    open: (path, flags, mode, fd_start, fd_end) => {
      if ("" === path) throw new FS.ErrnoError(44);
      if (
        ((mode = void 0 === mode ? 438 : mode),
        (mode =
          64 &
          (flags =
            "string" == typeof flags ? FS.modeStringToFlags(flags) : flags)
            ? (4095 & mode) | 32768
            : 0),
        "object" == typeof path)
      )
        node = path;
      else {
        path = PATH.normalize(path);
        try {
          var node = FS.lookupPath(path, { follow: !(131072 & flags) }).node;
        } catch (e) {}
      }
      var created = !1;
      if (64 & flags)
        if (node) {
          if (128 & flags) throw new FS.ErrnoError(20);
        } else (node = FS.mknod(path, mode, 0)), (created = !0);
      if (!node) throw new FS.ErrnoError(44);
      if (
        (FS.isChrdev(node.mode) && (flags &= -513),
        65536 & flags && !FS.isDir(node.mode))
      )
        throw new FS.ErrnoError(54);
      if (!created) {
        mode = FS.mayOpen(node, flags);
        if (mode) throw new FS.ErrnoError(mode);
      }
      512 & flags && FS.truncate(node, 0);
      (created = flags),
        (flags &= -131713),
        (mode = FS.createStream(
          {
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: !0,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: !1,
          },
          fd_start,
          fd_end
        ));
      return (
        mode.stream_ops.open && mode.stream_ops.open(mode),
        !Module.logReadFiles ||
          1 & flags ||
          (FS.readFiles || (FS.readFiles = {}),
          path in FS.readFiles ||
            ((FS.readFiles[path] = 1),
            err("FS.trackingDelegate error on read file: " + path))),
        FS.trackingDelegate.onOpenFile &&
          FS.trackingDelegate.onOpenFile(path, created),
        mode
      );
    },
    close: (stream) => {
      if (FS.isClosed(stream)) throw new FS.ErrnoError(8);
      stream.getdents && (stream.getdents = null);
      try {
        stream.stream_ops.close && stream.stream_ops.close(stream);
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      (stream.fd = null),
        stream.path &&
          FS.trackingDelegate.onCloseFile &&
          FS.trackingDelegate.onCloseFile(stream.path);
    },
    isClosed: (stream) => null === stream.fd,
    llseek: (stream, offset, whence) => {
      if (FS.isClosed(stream)) throw new FS.ErrnoError(8);
      if (!stream.seekable || !stream.stream_ops.llseek)
        throw new FS.ErrnoError(70);
      if (0 != whence && 1 != whence && 2 != whence)
        throw new FS.ErrnoError(28);
      return (
        (stream.position = stream.stream_ops.llseek(stream, offset, whence)),
        (stream.ungotten = []),
        stream.path &&
          FS.trackingDelegate.onSeekFile &&
          FS.trackingDelegate.onSeekFile(stream.path, stream.position, whence),
        stream.position
      );
    },
    read: (stream, buffer, offset, length, position) => {
      if (length < 0 || position < 0) throw new FS.ErrnoError(28);
      if (FS.isClosed(stream)) throw new FS.ErrnoError(8);
      if (1 == (2097155 & stream.flags)) throw new FS.ErrnoError(8);
      if (FS.isDir(stream.node.mode)) throw new FS.ErrnoError(31);
      if (!stream.stream_ops.read) throw new FS.ErrnoError(28);
      var seeking = void 0 !== position;
      if (seeking) {
        if (!stream.seekable) throw new FS.ErrnoError(70);
      } else position = stream.position;
      buffer = stream.stream_ops.read(stream, buffer, offset, length, position);
      return (
        seeking || (stream.position += buffer),
        stream.path &&
          FS.trackingDelegate.onReadFile &&
          FS.trackingDelegate.onReadFile(stream.path, buffer),
        buffer
      );
    },
    write: (stream, buffer, offset, length, position, canOwn) => {
      if (length < 0 || position < 0) throw new FS.ErrnoError(28);
      if (FS.isClosed(stream)) throw new FS.ErrnoError(8);
      if (0 == (2097155 & stream.flags)) throw new FS.ErrnoError(8);
      if (FS.isDir(stream.node.mode)) throw new FS.ErrnoError(31);
      if (!stream.stream_ops.write) throw new FS.ErrnoError(28);
      stream.seekable && 1024 & stream.flags && FS.llseek(stream, 0, 2);
      var seeking = void 0 !== position;
      if (seeking) {
        if (!stream.seekable) throw new FS.ErrnoError(70);
      } else position = stream.position;
      buffer = stream.stream_ops.write(
        stream,
        buffer,
        offset,
        length,
        position,
        canOwn
      );
      return (
        seeking || (stream.position += buffer),
        stream.path &&
          FS.trackingDelegate.onWriteToFile &&
          FS.trackingDelegate.onWriteToFile(stream.path, buffer),
        buffer
      );
    },
    allocate: (stream, offset, length) => {
      if (FS.isClosed(stream)) throw new FS.ErrnoError(8);
      if (offset < 0 || length <= 0) throw new FS.ErrnoError(28);
      if (0 == (2097155 & stream.flags)) throw new FS.ErrnoError(8);
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode))
        throw new FS.ErrnoError(43);
      if (!stream.stream_ops.allocate) throw new FS.ErrnoError(138);
      stream.stream_ops.allocate(stream, offset, length);
    },
    mmap: (stream, address, length, position, prot, flags) => {
      if (0 != (2 & prot) && 0 == (2 & flags) && 2 != (2097155 & stream.flags))
        throw new FS.ErrnoError(2);
      if (1 == (2097155 & stream.flags)) throw new FS.ErrnoError(2);
      if (stream.stream_ops.mmap)
        return stream.stream_ops.mmap(
          stream,
          address,
          length,
          position,
          prot,
          flags
        );
      throw new FS.ErrnoError(43);
    },
    msync: (stream, buffer, offset, length, mmapFlags) =>
      stream && stream.stream_ops.msync
        ? stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
        : 0,
    munmap: (stream) => 0,
    ioctl: (stream, cmd, arg) => {
      if (stream.stream_ops.ioctl)
        return stream.stream_ops.ioctl(stream, cmd, arg);
      throw new FS.ErrnoError(59);
    },
    readFile: (path, opts = {}) => {
      if (
        ((opts.flags = opts.flags || 0),
        (opts.encoding = opts.encoding || "binary"),
        "utf8" !== opts.encoding && "binary" !== opts.encoding)
      )
        throw new Error('Invalid encoding type "' + opts.encoding + '"');
      var ret,
        stream = FS.open(path, opts.flags),
        path = FS.stat(path).size,
        buf = new Uint8Array(path);
      return (
        FS.read(stream, buf, 0, path, 0),
        "utf8" === opts.encoding
          ? (ret = UTF8ArrayToString(buf, 0))
          : "binary" === opts.encoding && (ret = buf),
        FS.close(stream),
        ret
      );
    },
    writeFile: (path, data, opts = {}) => {
      opts.flags = opts.flags || 577;
      path = FS.open(path, opts.flags, opts.mode);
      if ("string" == typeof data) {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1),
          actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(path, buf, 0, actualNumBytes, void 0, opts.canOwn);
      } else {
        if (!ArrayBuffer.isView(data)) throw new Error("Unsupported data type");
        FS.write(path, data, 0, data.byteLength, void 0, opts.canOwn);
      }
      FS.close(path);
    },
    cwd: () => FS.currentPath,
    chdir: (path) => {
      path = FS.lookupPath(path, { follow: !0 });
      if (null === path.node) throw new FS.ErrnoError(44);
      if (!FS.isDir(path.node.mode)) throw new FS.ErrnoError(54);
      var errCode = FS.nodePermissions(path.node, "x");
      if (errCode) throw new FS.ErrnoError(errCode);
      FS.currentPath = path.path;
    },
    createDefaultDirectories: () => {
      FS.mkdir("/tmp"), FS.mkdir("/home"), FS.mkdir("/home/web_user");
    },
    createDefaultDevices: () => {
      FS.mkdir("/dev"),
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        }),
        FS.mkdev("/dev/null", FS.makedev(1, 3)),
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
        FS.mkdev("/dev/tty", FS.makedev(5, 0)),
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var random_device = getRandomDevice();
      FS.createDevice("/dev", "random", random_device),
        FS.createDevice("/dev", "urandom", random_device),
        FS.mkdir("/dev/shm"),
        FS.mkdir("/dev/shm/tmp");
    },
    createSpecialDirectories: () => {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd"),
        FS.mount(
          {
            mount: () => {
              var node = FS.createNode(proc_self, "fd", 16895, 73);
              return (
                (node.node_ops = {
                  lookup: (parent, name) => {
                    var stream = FS.getStream(+name);
                    if (stream)
                      return ((name = {
                        parent: null,
                        mount: { mountpoint: "fake" },
                        node_ops: { readlink: () => stream.path },
                      }).parent = name);
                    throw new FS.ErrnoError(8);
                  },
                }),
                node
              );
            },
          },
          {},
          "/proc/self/fd"
        );
    },
    createStandardStreams: () => {
      Module.stdin
        ? FS.createDevice("/dev", "stdin", Module.stdin)
        : FS.symlink("/dev/tty", "/dev/stdin"),
        Module.stdout
          ? FS.createDevice("/dev", "stdout", null, Module.stdout)
          : FS.symlink("/dev/tty", "/dev/stdout"),
        Module.stderr
          ? FS.createDevice("/dev", "stderr", null, Module.stderr)
          : FS.symlink("/dev/tty1", "/dev/stderr");
      FS.open("/dev/stdin", 0),
        FS.open("/dev/stdout", 1),
        FS.open("/dev/stderr", 1);
    },
    ensureErrnoError: () => {
      FS.ErrnoError ||
        ((FS.ErrnoError = function (errno, node) {
          (this.node = node),
            (this.setErrno = function (errno) {
              this.errno = errno;
            }),
            this.setErrno(errno),
            (this.message = "FS error");
        }),
        (FS.ErrnoError.prototype = new Error()),
        (FS.ErrnoError.prototype.constructor = FS.ErrnoError),
        [44].forEach((code) => {
          (FS.genericErrors[code] = new FS.ErrnoError(code)),
            (FS.genericErrors[code].stack = "<generic error, no stack>");
        }));
    },
    staticInit: () => {
      FS.ensureErrnoError(),
        (FS.nameTable = new Array(4096)),
        FS.mount(MEMFS, {}, "/"),
        FS.createDefaultDirectories(),
        FS.createDefaultDevices(),
        FS.createSpecialDirectories(),
        (FS.filesystems = { MEMFS: MEMFS });
    },
    init: (input, output, error) => {
      (FS.init.initialized = !0),
        FS.ensureErrnoError(),
        (Module.stdin = input || Module.stdin),
        (Module.stdout = output || Module.stdout),
        (Module.stderr = error || Module.stderr),
        FS.createStandardStreams();
    },
    quit: () => {
      FS.init.initialized = !1;
      for (var i = 0; i < FS.streams.length; i++) {
        var stream = FS.streams[i];
        stream && FS.close(stream);
      }
    },
    getMode: (canRead, canWrite) => {
      var mode = 0;
      return canRead && (mode |= 365), canWrite && (mode |= 146), mode;
    },
    findObject: (path, dontResolveLastLink) => {
      path = FS.analyzePath(path, dontResolveLastLink);
      return path.exists ? path.object : null;
    },
    analyzePath: (path, dontResolveLastLink) => {
      try {
        path = (lookup = FS.lookupPath(path, { follow: !dontResolveLastLink }))
          .path;
      } catch (e) {}
      var ret = {
        isRoot: !1,
        exists: !1,
        error: 0,
        name: null,
        path: null,
        object: null,
        parentExists: !1,
        parentPath: null,
        parentObject: null,
      };
      try {
        var lookup = FS.lookupPath(path, { parent: !0 });
        (ret.parentExists = !0),
          (ret.parentPath = lookup.path),
          (ret.parentObject = lookup.node),
          (ret.name = PATH.basename(path)),
          (lookup = FS.lookupPath(path, { follow: !dontResolveLastLink })),
          (ret.exists = !0),
          (ret.path = lookup.path),
          (ret.object = lookup.node),
          (ret.name = lookup.node.name),
          (ret.isRoot = "/" === lookup.path);
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    },
    createPath: (parent, path, canRead, canWrite) => {
      parent = "string" == typeof parent ? parent : FS.getPath(parent);
      for (var parts = path.split("/").reverse(); parts.length; ) {
        var part = parts.pop();
        if (part) {
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {}
          parent = current;
        }
      }
      return current;
    },
    createFile: (parent, name, properties, canRead, canWrite) => {
      (parent = PATH.join2(
        "string" == typeof parent ? parent : FS.getPath(parent),
        name
      )),
        (name = FS.getMode(canRead, canWrite));
      return FS.create(parent, name);
    },
    createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
      var path = name,
        name =
          (parent &&
            ((parent = "string" == typeof parent ? parent : FS.getPath(parent)),
            (path = name ? PATH.join2(parent, name) : parent)),
          FS.getMode(canRead, canWrite)),
        parent = FS.create(path, name);
      if (data) {
        if ("string" == typeof data) {
          for (
            var arr = new Array(data.length), i = 0, len = data.length;
            i < len;
            ++i
          )
            arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(parent, 146 | name);
        canRead = FS.open(parent, 577);
        FS.write(canRead, data, 0, data.length, 0, canOwn),
          FS.close(canRead),
          FS.chmod(parent, name);
      }
      return parent;
    },
    createDevice: (parent, name, input, output) => {
      var parent = PATH.join2(
          "string" == typeof parent ? parent : FS.getPath(parent),
          name
        ),
        name = FS.getMode(!!input, !!output),
        dev =
          (FS.createDevice.major || (FS.createDevice.major = 64),
          FS.makedev(FS.createDevice.major++, 0));
      return (
        FS.registerDevice(dev, {
          open: (stream) => {
            stream.seekable = !1;
          },
          close: (stream) => {
            output && output.buffer && output.buffer.length && output(10);
          },
          read: (stream, buffer, offset, length, pos) => {
            for (var result, bytesRead = 0, i = 0; i < length; i++) {
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (void 0 === result && 0 === bytesRead)
                throw new FS.ErrnoError(6);
              if (null == result) break;
              bytesRead++, (buffer[offset + i] = result);
            }
            return bytesRead && (stream.node.timestamp = Date.now()), bytesRead;
          },
          write: (stream, buffer, offset, length, pos) => {
            for (var i = 0; i < length; i++)
              try {
                output(buffer[offset + i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            return length && (stream.node.timestamp = Date.now()), i;
          },
        }),
        FS.mkdev(parent, name, dev)
      );
    },
    forceLoadFile: (obj) => {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return !0;
      if ("undefined" != typeof XMLHttpRequest)
        throw new Error(
          "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
        );
      if (!read_)
        throw new Error("Cannot load without read() or XMLHttpRequest.");
      try {
        (obj.contents = intArrayFromString(read_(obj.url), !0)),
          (obj.usedBytes = obj.contents.length);
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    },
    createLazyFile: (parent, name, url, canRead, canWrite) => {
      function LazyUint8Array() {
        (this.lengthKnown = !1), (this.chunks = []);
      }
      if (
        ((LazyUint8Array.prototype.get = function (idx) {
          var chunkOffset;
          if (!(idx > this.length - 1 || idx < 0))
            return (
              (chunkOffset = idx % this.chunkSize),
              (idx = (idx / this.chunkSize) | 0),
              this.getter(idx)[chunkOffset]
            );
        }),
        (LazyUint8Array.prototype.setDataGetter = function (getter) {
          this.getter = getter;
        }),
        (LazyUint8Array.prototype.cacheLength = function () {
          var xhr = new XMLHttpRequest();
          if (
            (xhr.open("HEAD", url, !1),
            xhr.send(null),
            !((200 <= xhr.status && xhr.status < 300) || 304 === xhr.status))
          )
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var header,
            datalength = Number(xhr.getResponseHeader("Content-length")),
            hasByteServing =
              (header = xhr.getResponseHeader("Accept-Ranges")) &&
              "bytes" === header,
            xhr =
              (header = xhr.getResponseHeader("Content-Encoding")) &&
              "gzip" === header,
            chunkSize = 1048576,
            lazyArray = (hasByteServing || (chunkSize = datalength), this);
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize,
              end = (chunkNum + 1) * chunkSize - 1,
              end = Math.min(end, datalength - 1);
            if (
              (void 0 === lazyArray.chunks[chunkNum] &&
                (lazyArray.chunks[chunkNum] = ((from, to) => {
                  if (to < from)
                    throw new Error(
                      "invalid range (" +
                        from +
                        ", " +
                        to +
                        ") or no bytes requested!"
                    );
                  if (datalength - 1 < to)
                    throw new Error(
                      "only " +
                        datalength +
                        " bytes available! programmer error!"
                    );
                  var xhr = new XMLHttpRequest();
                  if (
                    (xhr.open("GET", url, !1),
                    datalength !== chunkSize &&
                      xhr.setRequestHeader("Range", "bytes=" + from + "-" + to),
                    (xhr.responseType = "arraybuffer"),
                    xhr.overrideMimeType &&
                      xhr.overrideMimeType(
                        "text/plain; charset=x-user-defined"
                      ),
                    xhr.send(null),
                    (200 <= xhr.status && xhr.status < 300) ||
                      304 === xhr.status)
                  )
                    return void 0 !== xhr.response
                      ? new Uint8Array(xhr.response || [])
                      : intArrayFromString(xhr.responseText || "", !0);
                  throw new Error(
                    "Couldn't load " + url + ". Status: " + xhr.status
                  );
                })(start, end)),
              void 0 === lazyArray.chunks[chunkNum])
            )
              throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          }),
            (!xhr && datalength) ||
              ((chunkSize = datalength = 1),
              (datalength = this.getter(0).length),
              (chunkSize = datalength),
              out(
                "LazyFiles on gzip forces download of the whole file when length is accessed"
              )),
            (this._length = datalength),
            (this._chunkSize = chunkSize),
            (this.lengthKnown = !0);
        }),
        "undefined" != typeof XMLHttpRequest)
      ) {
        if (!ENVIRONMENT_IS_WORKER)
          throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array(),
          lazyArray =
            (Object.defineProperties(lazyArray, {
              length: {
                get: function () {
                  return this.lengthKnown || this.cacheLength(), this._length;
                },
              },
              chunkSize: {
                get: function () {
                  return (
                    this.lengthKnown || this.cacheLength(), this._chunkSize
                  );
                },
              },
            }),
            { isDevice: !1, contents: lazyArray });
      } else lazyArray = { isDevice: !1, url: url };
      var node = FS.createFile(parent, name, lazyArray, canRead, canWrite),
        stream_ops =
          (lazyArray.contents
            ? (node.contents = lazyArray.contents)
            : lazyArray.url &&
              ((node.contents = null), (node.url = lazyArray.url)),
          Object.defineProperties(node, {
            usedBytes: {
              get: function () {
                return this.contents.length;
              },
            },
          }),
          {});
      return (
        Object.keys(node.stream_ops).forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function () {
            return FS.forceLoadFile(node), fn.apply(null, arguments);
          };
        }),
        (stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          var contents = stream.node.contents;
          if (position >= contents.length) return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice)
            for (var i = 0; i < size; i++)
              buffer[offset + i] = contents[position + i];
          else
            for (i = 0; i < size; i++)
              buffer[offset + i] = contents.get(position + i);
          return size;
        }),
        (node.stream_ops = stream_ops),
        node
      );
    },
    createPreloadedFile: (
      parent,
      name,
      url,
      canRead,
      canWrite,
      onload,
      onerror,
      dontCreateFile,
      canOwn,
      preFinish
    ) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent,
        dep = getUniqueRunDependency("cp " + fullname);
      function processData(byteArray) {
        function finish(byteArray) {
          preFinish && preFinish(),
            dontCreateFile ||
              FS.createDataFile(
                parent,
                name,
                byteArray,
                canRead,
                canWrite,
                canOwn
              ),
            onload && onload(),
            removeRunDependency(dep);
        }
        Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror && onerror(), removeRunDependency(dep);
        }) || finish(byteArray);
      }
      addRunDependency(dep),
        "string" == typeof url
          ? asyncLoad(url, (byteArray) => processData(byteArray), onerror)
          : processData(url);
    },
    indexedDB: () =>
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB,
    DB_NAME: () => "EM_FS_" + window.location.pathname,
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: (paths, onload, onerror) => {
      (onload = onload || (() => {})), (onerror = onerror || (() => {}));
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      (openRequest.onupgradeneeded = () => {
        out("creating db"),
          openRequest.result.createObjectStore(FS.DB_STORE_NAME);
      }),
        (openRequest.onsuccess = () => {
          var transaction = openRequest.result.transaction(
              [FS.DB_STORE_NAME],
              "readwrite"
            ),
            files = transaction.objectStore(FS.DB_STORE_NAME),
            ok = 0,
            fail = 0,
            total = paths.length;
          function finish() {
            (0 == fail ? onload : onerror)();
          }
          paths.forEach((path) => {
            path = files.put(FS.analyzePath(path).object.contents, path);
            (path.onsuccess = () => {
              ++ok + fail == total && finish();
            }),
              (path.onerror = () => {
                ok + ++fail == total && finish();
              });
          }),
            (transaction.onerror = onerror);
        }),
        (openRequest.onerror = onerror);
    },
    loadFilesFromDB: (paths, onload, onerror) => {
      (onload = onload || (() => {})), (onerror = onerror || (() => {}));
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      (openRequest.onupgradeneeded = onerror),
        (openRequest.onsuccess = () => {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
          } catch (e) {
            return void onerror(e);
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME),
            ok = 0,
            fail = 0,
            total = paths.length;
          function finish() {
            (0 == fail ? onload : onerror)();
          }
          paths.forEach((path) => {
            var getRequest = files.get(path);
            (getRequest.onsuccess = () => {
              FS.analyzePath(path).exists && FS.unlink(path),
                FS.createDataFile(
                  PATH.dirname(path),
                  PATH.basename(path),
                  getRequest.result,
                  !0,
                  !0,
                  !0
                ),
                ++ok + fail == total && finish();
            }),
              (getRequest.onerror = () => {
                ok + ++fail == total && finish();
              });
          }),
            (transaction.onerror = onerror);
        }),
        (openRequest.onerror = onerror);
    },
  },
  SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    calculateAt: function (dirfd, path, allowEmpty) {
      if ("/" === path[0]) return path;
      var dir;
      if (-100 === dirfd) dir = FS.cwd();
      else {
        dirfd = FS.getStream(dirfd);
        if (!dirfd) throw new FS.ErrnoError(8);
        dir = dirfd.path;
      }
      if (0 != path.length) return PATH.join2(dir, path);
      if (allowEmpty) return dir;
      throw new FS.ErrnoError(44);
    },
    doStat: function (func, path, buf) {
      try {
        var stat = func(path);
      } catch (e) {
        if (
          e &&
          e.node &&
          PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
        )
          return -54;
        throw e;
      }
      return (
        (HEAP32[buf >> 2] = stat.dev),
        (HEAP32[(buf + 4) >> 2] = 0),
        (HEAP32[(buf + 8) >> 2] = stat.ino),
        (HEAP32[(buf + 12) >> 2] = stat.mode),
        (HEAP32[(buf + 16) >> 2] = stat.nlink),
        (HEAP32[(buf + 20) >> 2] = stat.uid),
        (HEAP32[(buf + 24) >> 2] = stat.gid),
        (HEAP32[(buf + 28) >> 2] = stat.rdev),
        (HEAP32[(buf + 32) >> 2] = 0),
        (tempI64 = [
          stat.size >>> 0,
          ((tempDouble = stat.size),
          1 <= +Math.abs(tempDouble)
            ? 0 < tempDouble
              ? (0 |
                  Math.min(
                    +Math.floor(tempDouble / 4294967296),
                    4294967295
                  )) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - (~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
        (HEAP32[(buf + 40) >> 2] = tempI64[0]),
        (HEAP32[(buf + 44) >> 2] = tempI64[1]),
        (HEAP32[(buf + 48) >> 2] = 4096),
        (HEAP32[(buf + 52) >> 2] = stat.blocks),
        (HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0),
        (HEAP32[(buf + 60) >> 2] = 0),
        (HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0),
        (HEAP32[(buf + 68) >> 2] = 0),
        (HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0),
        (HEAP32[(buf + 76) >> 2] = 0),
        (tempI64 = [
          stat.ino >>> 0,
          ((tempDouble = stat.ino),
          1 <= +Math.abs(tempDouble)
            ? 0 < tempDouble
              ? (0 |
                  Math.min(
                    +Math.floor(tempDouble / 4294967296),
                    4294967295
                  )) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - (~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
        (HEAP32[(buf + 80) >> 2] = tempI64[0]),
        (HEAP32[(buf + 84) >> 2] = tempI64[1]),
        0
      );
    },
    doMsync: function (addr, stream, len, flags, offset) {
      addr = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, addr, offset, len, flags);
    },
    doMkdir: function (path, mode) {
      return (
        "/" === (path = PATH.normalize(path))[path.length - 1] &&
          (path = path.substr(0, path.length - 1)),
        FS.mkdir(path, mode, 0),
        0
      );
    },
    doMknod: function (path, mode, dev) {
      switch (61440 & mode) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break;
        default:
          return -28;
      }
      return FS.mknod(path, mode, dev), 0;
    },
    doReadlink: function (path, buf, bufsize) {
      var len, endChar;
      return bufsize <= 0
        ? -28
        : ((path = FS.readlink(path)),
          (len = Math.min(bufsize, lengthBytesUTF8(path))),
          (endChar = HEAP8[buf + len]),
          stringToUTF8(path, buf, bufsize + 1),
          (HEAP8[buf + len] = endChar),
          len);
    },
    doAccess: function (path, amode) {
      var perms;
      return -8 & amode
        ? -28
        : (path = FS.lookupPath(path, { follow: !0 }).node)
        ? ((perms = ""),
          4 & amode && (perms += "r"),
          2 & amode && (perms += "w"),
          1 & amode && (perms += "x"),
          perms && FS.nodePermissions(path, perms) ? -2 : 0)
        : -44;
    },
    doReadv: function (stream, iov, iovcnt, offset) {
      for (var ret = 0, i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(iov + 8 * i) >> 2],
          len = HEAP32[(iov + (8 * i + 4)) >> 2],
          ptr = FS.read(stream, HEAP8, ptr, len, offset);
        if (ptr < 0) return -1;
        if (((ret += ptr), ptr < len)) break;
      }
      return ret;
    },
    doWritev: function (stream, iov, iovcnt, offset) {
      for (var ret = 0, i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(iov + 8 * i) >> 2],
          len = HEAP32[(iov + (8 * i + 4)) >> 2],
          ptr = FS.write(stream, HEAP8, ptr, len, offset);
        if (ptr < 0) return -1;
        ret += ptr;
      }
      return ret;
    },
    varargs: void 0,
    get: function () {
      return (SYSCALLS.varargs += 4), HEAP32[(SYSCALLS.varargs - 4) >> 2];
    },
    getStr: function (ptr) {
      return UTF8ToString(ptr);
    },
    getStreamFromFD: function (fd) {
      fd = FS.getStream(fd);
      if (fd) return fd;
      throw new FS.ErrnoError(8);
    },
    get64: function (low, high) {
      return low;
    },
  };
function ___syscall__newselect(nfds, readfds, writefds, exceptfds, timeout) {
  try {
    function check(fd, low, high, val) {
      return fd < 32 ? low & val : high & val;
    }
    for (
      var total = 0,
        srcReadLow = readfds ? HEAP32[readfds >> 2] : 0,
        srcReadHigh = readfds ? HEAP32[(readfds + 4) >> 2] : 0,
        srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0,
        srcWriteHigh = writefds ? HEAP32[(writefds + 4) >> 2] : 0,
        srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0,
        srcExceptHigh = exceptfds ? HEAP32[(exceptfds + 4) >> 2] : 0,
        dstReadLow = 0,
        dstReadHigh = 0,
        dstWriteLow = 0,
        dstWriteHigh = 0,
        dstExceptLow = 0,
        dstExceptHigh = 0,
        allLow =
          (readfds ? HEAP32[readfds >> 2] : 0) |
          (writefds ? HEAP32[writefds >> 2] : 0) |
          (exceptfds ? HEAP32[exceptfds >> 2] : 0),
        allHigh =
          (readfds ? HEAP32[(readfds + 4) >> 2] : 0) |
          (writefds ? HEAP32[(writefds + 4) >> 2] : 0) |
          (exceptfds ? HEAP32[(exceptfds + 4) >> 2] : 0),
        fd = 0;
      fd < nfds;
      fd++
    ) {
      var mask = 1 << fd % 32;
      if (check(fd, allLow, allHigh, mask)) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        var flags = SYSCALLS.DEFAULT_POLLMASK;
        1 &
          (flags = stream.stream_ops.poll
            ? stream.stream_ops.poll(stream)
            : flags) &&
          check(fd, srcReadLow, srcReadHigh, mask) &&
          (fd < 32 ? (dstReadLow |= mask) : (dstReadHigh |= mask), total++),
          4 & flags &&
            check(fd, srcWriteLow, srcWriteHigh, mask) &&
            (fd < 32 ? (dstWriteLow |= mask) : (dstWriteHigh |= mask), total++),
          2 & flags &&
            check(fd, srcExceptLow, srcExceptHigh, mask) &&
            (fd < 32 ? (dstExceptLow |= mask) : (dstExceptHigh |= mask),
            total++);
      }
    }
    return (
      readfds &&
        ((HEAP32[readfds >> 2] = dstReadLow),
        (HEAP32[(readfds + 4) >> 2] = dstReadHigh)),
      writefds &&
        ((HEAP32[writefds >> 2] = dstWriteLow),
        (HEAP32[(writefds + 4) >> 2] = dstWriteHigh)),
      exceptfds &&
        ((HEAP32[exceptfds >> 2] = dstExceptLow),
        (HEAP32[(exceptfds + 4) >> 2] = dstExceptHigh)),
      total
    );
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
var SOCKFS = {
  mount: function (mount) {
    return (
      (Module.websocket =
        Module.websocket && "object" == typeof Module.websocket
          ? Module.websocket
          : {}),
      (Module.websocket._callbacks = {}),
      (Module.websocket.on = function (event, callback) {
        return (
          "function" == typeof callback && (this._callbacks[event] = callback),
          this
        );
      }),
      (Module.websocket.emit = function (event, param) {
        "function" == typeof this._callbacks[event] &&
          this._callbacks[event].call(this, param);
      }),
      FS.createNode(null, "/", 16895, 0)
    );
  },
  createSocket: function (family, type, protocol) {
    if (1 == (type &= -526337) && protocol && 6 != protocol)
      throw new FS.ErrnoError(66);
    (family = {
      family: family,
      type: type,
      protocol: protocol,
      server: null,
      error: null,
      peers: {},
      pending: [],
      recv_queue: [],
      sock_ops: SOCKFS.websocket_sock_ops,
    }),
      (type = SOCKFS.nextname()),
      (protocol = FS.createNode(SOCKFS.root, type, 49152, 0)),
      (protocol.sock = family),
      (type = FS.createStream({
        path: type,
        node: protocol,
        flags: 2,
        seekable: !1,
        stream_ops: SOCKFS.stream_ops,
      }));
    return (family.stream = type), family;
  },
  getSocket: function (fd) {
    fd = FS.getStream(fd);
    return fd && FS.isSocket(fd.node.mode) ? fd.node.sock : null;
  },
  stream_ops: {
    poll: function (stream) {
      stream = stream.node.sock;
      return stream.sock_ops.poll(stream);
    },
    ioctl: function (stream, request, varargs) {
      stream = stream.node.sock;
      return stream.sock_ops.ioctl(stream, request, varargs);
    },
    read: function (stream, buffer, offset, length, position) {
      (stream = stream.node.sock),
        (stream = stream.sock_ops.recvmsg(stream, length));
      return stream
        ? (buffer.set(stream.buffer, offset), stream.buffer.length)
        : 0;
    },
    write: function (stream, buffer, offset, length, position) {
      stream = stream.node.sock;
      return stream.sock_ops.sendmsg(stream, buffer, offset, length);
    },
    close: function (stream) {
      stream = stream.node.sock;
      stream.sock_ops.close(stream);
    },
  },
  nextname: function () {
    return (
      SOCKFS.nextname.current || (SOCKFS.nextname.current = 0),
      "socket[" + SOCKFS.nextname.current++ + "]"
    );
  },
  websocket_sock_ops: {
    createPeer: function (sock, addr, port) {
      if (("object" == typeof addr && ((ws = addr), (port = addr = null)), ws))
        if (ws._socket)
          (addr = ws._socket.remoteAddress), (port = ws._socket.remotePort);
        else {
          var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
          if (!result)
            throw new Error(
              "WebSocket URL must be in the format ws(s)://address:port"
            );
          (addr = result[1]), (port = parseInt(result[2], 10));
        }
      else
        try {
          var parts,
            ws,
            runtimeConfig =
              Module.websocket && "object" == typeof Module.websocket,
            url = "ws:#".replace("#", "//"),
            subProtocols =
              (("ws://" !==
                (url =
                  runtimeConfig && "string" == typeof Module.websocket.url
                    ? Module.websocket.url
                    : url) &&
                "wss://" !== url) ||
                (url =
                  url +
                  (parts = addr.split("/"))[0] +
                  ":" +
                  port +
                  "/" +
                  parts.slice(1).join("/")),
              "binary"),
            opts =
              (runtimeConfig &&
                "string" == typeof Module.websocket.subprotocol &&
                (subProtocols = Module.websocket.subprotocol),
              void 0);
          "null" !== subProtocols &&
            ((subProtocols = subProtocols
              .replace(/^ +| +$/g, "")
              .split(/ *, */)),
            (opts = ENVIRONMENT_IS_NODE
              ? { protocol: subProtocols.toString() }
              : subProtocols)),
            runtimeConfig &&
              null === Module.websocket.subprotocol &&
              ((subProtocols = "null"), (opts = void 0)),
            ((ws = new WebSocket(url, opts)).binaryType = "arraybuffer");
        } catch (e) {
          throw new FS.ErrnoError(23);
        }
      result = { addr: addr, port: port, socket: ws, dgram_send_queue: [] };
      return (
        SOCKFS.websocket_sock_ops.addPeer(sock, result),
        SOCKFS.websocket_sock_ops.handlePeerEvents(sock, result),
        2 === sock.type &&
          void 0 !== sock.sport &&
          result.dgram_send_queue.push(
            new Uint8Array([
              255,
              255,
              255,
              255,
              "p".charCodeAt(0),
              "o".charCodeAt(0),
              "r".charCodeAt(0),
              "t".charCodeAt(0),
              (65280 & sock.sport) >> 8,
              255 & sock.sport,
            ])
          ),
        result
      );
    },
    getPeer: function (sock, addr, port) {
      return sock.peers[addr + ":" + port];
    },
    addPeer: function (sock, peer) {
      sock.peers[peer.addr + ":" + peer.port] = peer;
    },
    removePeer: function (sock, peer) {
      delete sock.peers[peer.addr + ":" + peer.port];
    },
    handlePeerEvents: function (sock, peer) {
      function handleOpen() {
        Module.websocket.emit("open", sock.stream.fd);
        try {
          for (var queued = peer.dgram_send_queue.shift(); queued; )
            peer.socket.send(queued), (queued = peer.dgram_send_queue.shift());
        } catch (e) {
          peer.socket.close();
        }
      }
      var first = !0;
      function handleMessage(data) {
        if ("string" == typeof data) data = new TextEncoder().encode(data);
        else {
          if ((assert(void 0 !== data.byteLength), 0 == data.byteLength))
            return;
          data = new Uint8Array(data);
        }
        var wasfirst = first;
        (first = !1),
          wasfirst &&
          10 === data.length &&
          255 === data[0] &&
          255 === data[1] &&
          255 === data[2] &&
          255 === data[3] &&
          data[4] === "p".charCodeAt(0) &&
          data[5] === "o".charCodeAt(0) &&
          data[6] === "r".charCodeAt(0) &&
          data[7] === "t".charCodeAt(0)
            ? ((wasfirst = (data[8] << 8) | data[9]),
              SOCKFS.websocket_sock_ops.removePeer(sock, peer),
              (peer.port = wasfirst),
              SOCKFS.websocket_sock_ops.addPeer(sock, peer))
            : (sock.recv_queue.push({
                addr: peer.addr,
                port: peer.port,
                data: data,
              }),
              Module.websocket.emit("message", sock.stream.fd));
      }
      ENVIRONMENT_IS_NODE
        ? (peer.socket.on("open", handleOpen),
          peer.socket.on("message", function (data, flags) {
            flags.binary && handleMessage(new Uint8Array(data).buffer);
          }),
          peer.socket.on("close", function () {
            Module.websocket.emit("close", sock.stream.fd);
          }),
          peer.socket.on("error", function (error) {
            (sock.error = 14),
              Module.websocket.emit("error", [
                sock.stream.fd,
                sock.error,
                "ECONNREFUSED: Connection refused",
              ]);
          }))
        : ((peer.socket.onopen = handleOpen),
          (peer.socket.onclose = function () {
            Module.websocket.emit("close", sock.stream.fd);
          }),
          (peer.socket.onmessage = function (event) {
            handleMessage(event.data);
          }),
          (peer.socket.onerror = function (error) {
            (sock.error = 14),
              Module.websocket.emit("error", [
                sock.stream.fd,
                sock.error,
                "ECONNREFUSED: Connection refused",
              ]);
          }));
    },
    poll: function (sock) {
      var mask, dest;
      return 1 === sock.type && sock.server
        ? sock.pending.length
          ? 65
          : 0
        : ((mask = 0),
          (dest =
            1 === sock.type
              ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport)
              : null),
          (sock.recv_queue.length ||
            !dest ||
            (dest && dest.socket.readyState === dest.socket.CLOSING) ||
            (dest && dest.socket.readyState === dest.socket.CLOSED)) &&
            (mask |= 65),
          (dest && dest.socket.readyState !== dest.socket.OPEN) || (mask |= 4),
          ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
            (dest && dest.socket.readyState === dest.socket.CLOSED)) &&
            (mask |= 16),
          mask);
    },
    ioctl: function (sock, request, arg) {
      return 21531 !== request
        ? 28
        : ((request = 0),
          sock.recv_queue.length && (request = sock.recv_queue[0].data.length),
          (HEAP32[arg >> 2] = request),
          0);
    },
    close: function (sock) {
      if (sock.server) {
        try {
          sock.server.close();
        } catch (e) {}
        sock.server = null;
      }
      for (var peers = Object.keys(sock.peers), i = 0; i < peers.length; i++) {
        var peer = sock.peers[peers[i]];
        try {
          peer.socket.close();
        } catch (e) {}
        SOCKFS.websocket_sock_ops.removePeer(sock, peer);
      }
      return 0;
    },
    bind: function (sock, addr, port) {
      if (void 0 !== sock.saddr || void 0 !== sock.sport)
        throw new FS.ErrnoError(28);
      if (((sock.saddr = addr), (sock.sport = port), 2 === sock.type)) {
        sock.server && (sock.server.close(), (sock.server = null));
        try {
          sock.sock_ops.listen(sock, 0);
        } catch (e) {
          if (!(e instanceof FS.ErrnoError)) throw e;
          if (138 !== e.errno) throw e;
        }
      }
    },
    connect: function (sock, addr, port) {
      if (sock.server) throw new FS.ErrnoError(138);
      if (void 0 !== sock.daddr && void 0 !== sock.dport) {
        var dest = SOCKFS.websocket_sock_ops.getPeer(
          sock,
          sock.daddr,
          sock.dport
        );
        if (dest)
          throw dest.socket.readyState === dest.socket.CONNECTING
            ? new FS.ErrnoError(7)
            : new FS.ErrnoError(30);
      }
      dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
      throw (
        ((sock.daddr = dest.addr),
        (sock.dport = dest.port),
        new FS.ErrnoError(26))
      );
    },
    listen: function (sock, backlog) {
      if (!ENVIRONMENT_IS_NODE) throw new FS.ErrnoError(138);
    },
  },
};
function getSocketFromFD(fd) {
  fd = SOCKFS.getSocket(fd);
  if (fd) return fd;
  throw new FS.ErrnoError(8);
}
function setErrNo(value) {
  return (HEAP32[___errno_location() >> 2] = value);
}
function inetPton4(str) {
  for (var b = str.split("."), i = 0; i < 4; i++) {
    var tmp = Number(b[i]);
    if (isNaN(tmp)) return null;
    b[i] = tmp;
  }
  return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
}
function jstoi_q(str) {
  return parseInt(str);
}
function inetPton6(str) {
  var words,
    w,
    offset,
    z,
    parts = [];
  if (
    !/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i.test(
      str
    )
  )
    return null;
  if ("::" === str) return [0, 0, 0, 0, 0, 0, 0, 0];
  for (
    words =
      0 <
      (str = str.startsWith("::")
        ? str.replace("::", "Z:")
        : str.replace("::", ":Z:")).indexOf(".")
        ? (((words = (str = str.replace(new RegExp("[.]", "g"), ":")).split(
            ":"
          ))[words.length - 4] =
            jstoi_q(words[words.length - 4]) +
            256 * jstoi_q(words[words.length - 3])),
          (words[words.length - 3] =
            jstoi_q(words[words.length - 2]) +
            256 * jstoi_q(words[words.length - 1])),
          words.slice(0, words.length - 2))
        : str.split(":"),
      w = z = offset = 0;
    w < words.length;
    w++
  )
    if ("string" == typeof words[w])
      if ("Z" === words[w]) {
        for (z = 0; z < 8 - words.length + 1; z++) parts[w + z] = 0;
        offset = z - 1;
      } else parts[w + offset] = _htons(parseInt(words[w], 16));
    else parts[w + offset] = words[w];
  return [
    (parts[1] << 16) | parts[0],
    (parts[3] << 16) | parts[2],
    (parts[5] << 16) | parts[4],
    (parts[7] << 16) | parts[6],
  ];
}
function writeSockaddr(sa, family, addr, port, addrlen) {
  switch (family) {
    case 2:
      (addr = inetPton4(addr)),
        zeroMemory(sa, 16),
        addrlen && (HEAP32[addrlen >> 2] = 16),
        (HEAP16[sa >> 1] = family),
        (HEAP32[(sa + 4) >> 2] = addr),
        (HEAP16[(sa + 2) >> 1] = _htons(port));
      break;
    case 10:
      (addr = inetPton6(addr)),
        zeroMemory(sa, 28),
        addrlen && (HEAP32[addrlen >> 2] = 28),
        (HEAP32[sa >> 2] = family),
        (HEAP32[(sa + 8) >> 2] = addr[0]),
        (HEAP32[(sa + 12) >> 2] = addr[1]),
        (HEAP32[(sa + 16) >> 2] = addr[2]),
        (HEAP32[(sa + 20) >> 2] = addr[3]),
        (HEAP16[(sa + 2) >> 1] = _htons(port));
      break;
    default:
      return 5;
  }
  return 0;
}
var DNS = {
  address_map: { id: 1, addrs: {}, names: {} },
  lookup_name: function (name) {
    var addr, id;
    return null !== inetPton4(name) || null !== inetPton6(name)
      ? name
      : (DNS.address_map.addrs[name]
          ? (addr = DNS.address_map.addrs[name])
          : (assert(
              (id = DNS.address_map.id++) < 65535,
              "exceeded max address mappings of 65535"
            ),
            (DNS.address_map.names[
              (addr = "172.29." + (255 & id) + "." + (65280 & id))
            ] = name),
            (DNS.address_map.addrs[name] = addr)),
        addr);
  },
  lookup_addr: function (addr) {
    return DNS.address_map.names[addr] || null;
  },
};
function ___syscall_accept4(fd, addr, addrlen, flags) {
  try {
    var sock = getSocketFromFD(fd),
      newsock = sock.sock_ops.accept(sock);
    return (
      addr &&
        writeSockaddr(
          addr,
          newsock.family,
          DNS.lookup_name(newsock.daddr),
          newsock.dport,
          addrlen
        ),
      newsock.stream.fd
    );
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function inetNtop4(addr) {
  return (
    (255 & addr) +
    "." +
    ((addr >> 8) & 255) +
    "." +
    ((addr >> 16) & 255) +
    "." +
    ((addr >> 24) & 255)
  );
}
function inetNtop6(ints) {
  for (
    var str = "",
      word = 0,
      longest = 0,
      lastzero = 0,
      zstart = 0,
      len = 0,
      i = 0,
      parts = [
        65535 & ints[0],
        ints[0] >> 16,
        65535 & ints[1],
        ints[1] >> 16,
        65535 & ints[2],
        ints[2] >> 16,
        65535 & ints[3],
        ints[3] >> 16,
      ],
      hasipv4 = !0,
      ints = "",
      i = 0;
    i < 5;
    i++
  )
    if (0 !== parts[i]) {
      hasipv4 = !1;
      break;
    }
  if (hasipv4) {
    if (((ints = inetNtop4(parts[6] | (parts[7] << 16))), -1 === parts[5]))
      return (str = "::ffff:"), (str += ints);
    if (0 === parts[5])
      return (
        (str = "::"),
        (str += ints =
          "0.0.0.1" === (ints = "0.0.0.0" === ints ? "" : ints) ? "1" : ints)
      );
  }
  for (word = 0; word < 8; word++)
    0 === parts[word] &&
      (1 < word - lastzero && (len = 0), (lastzero = word), len++),
      longest < len && (zstart = word - (longest = len) + 1);
  for (word = 0; word < 8; word++)
    1 < longest &&
    0 === parts[word] &&
    zstart <= word &&
    word < zstart + longest
      ? word === zstart && ((str += ":"), 0 === zstart && (str += ":"))
      : (str =
          str +
          Number(_ntohs(65535 & parts[word])).toString(16) +
          (word < 7 ? ":" : ""));
  return str;
}
function readSockaddr(sa, salen) {
  var addr,
    family = HEAP16[sa >> 1],
    port = _ntohs(HEAPU16[(sa + 2) >> 1]);
  switch (family) {
    case 2:
      if (16 !== salen) return { errno: 28 };
      addr = inetNtop4((addr = HEAP32[(sa + 4) >> 2]));
      break;
    case 10:
      if (28 !== salen) return { errno: 28 };
      addr = inetNtop6(
        (addr = [
          HEAP32[(sa + 8) >> 2],
          HEAP32[(sa + 12) >> 2],
          HEAP32[(sa + 16) >> 2],
          HEAP32[(sa + 20) >> 2],
        ])
      );
      break;
    default:
      return { errno: 5 };
  }
  return { family: family, addr: addr, port: port };
}
function getSocketAddress(addrp, addrlen, allowNull) {
  if (allowNull && 0 === addrp) return null;
  allowNull = readSockaddr(addrp, addrlen);
  if (allowNull.errno) throw new FS.ErrnoError(allowNull.errno);
  return (
    (allowNull.addr = DNS.lookup_addr(allowNull.addr) || allowNull.addr),
    allowNull
  );
}
function ___syscall_bind(fd, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd),
      info = getSocketAddress(addr, addrlen);
    return sock.sock_ops.bind(sock, info.addr, info.port), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_connect(fd, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd),
      info = getSocketAddress(addr, addrlen);
    return sock.sock_ops.connect(sock, info.addr, info.port), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_faccessat(dirfd, path, amode, flags) {
  try {
    return (
      (path = SYSCALLS.getStr(path)),
      (path = SYSCALLS.calculateAt(dirfd, path)),
      SYSCALLS.doAccess(path, amode)
    );
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
      case 0:
        return (arg = SYSCALLS.get()) < 0
          ? -28
          : FS.open(stream.path, stream.flags, 0, arg).fd;
      case 1:
      case 2:
        return 0;
      case 3:
        return stream.flags;
      case 4:
        var arg = SYSCALLS.get();
        return (stream.flags |= arg), 0;
      case 5:
        arg = SYSCALLS.get();
        return (HEAP16[(arg + 0) >> 1] = 2), 0;
      case 6:
      case 7:
        return 0;
      case 16:
      case 8:
        return -28;
      case 9:
        return setErrNo(28), -1;
      default:
        return -28;
    }
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_ftruncate64(fd, low, high) {
  try {
    var length = SYSCALLS.get64(low, high);
    return FS.ftruncate(fd, length), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_getcwd(buf, size) {
  try {
    var cwd;
    return 0 === size
      ? -28
      : size < lengthBytesUTF8((cwd = FS.cwd())) + 1
      ? -68
      : (stringToUTF8(cwd, buf, size), buf);
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_getdents64(fd, dirp, count) {
  try {
    for (
      var stream = SYSCALLS.getStreamFromFD(fd),
        pos =
          (stream.getdents || (stream.getdents = FS.readdir(stream.path)), 0),
        off = FS.llseek(stream, 0, 1),
        idx = Math.floor(off / 280);
      idx < stream.getdents.length && pos + 280 <= count;

    ) {
      var id,
        type,
        child,
        name = stream.getdents[idx];
      (type =
        "." === name
          ? ((id = stream.node.id), 4)
          : ".." === name
          ? ((id = FS.lookupPath(stream.path, { parent: !0 }).node.id), 4)
          : ((id = (child = FS.lookupNode(stream.node, name)).id),
            FS.isChrdev(child.mode)
              ? 2
              : FS.isDir(child.mode)
              ? 4
              : FS.isLink(child.mode)
              ? 10
              : 8)),
        (tempI64 = [
          id >>> 0,
          ((tempDouble = id),
          1 <= +Math.abs(tempDouble)
            ? 0 < tempDouble
              ? (0 |
                  Math.min(
                    +Math.floor(tempDouble / 4294967296),
                    4294967295
                  )) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - (~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
        (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]),
        (tempI64 = [
          (280 * (idx + 1)) >>> 0,
          ((tempDouble = 280 * (idx + 1)),
          1 <= +Math.abs(tempDouble)
            ? 0 < tempDouble
              ? (0 |
                  Math.min(
                    +Math.floor(tempDouble / 4294967296),
                    4294967295
                  )) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - (~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
        (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]),
        (HEAP16[(dirp + pos + 16) >> 1] = 280),
        (HEAP8[(dirp + pos + 18) >> 0] = type),
        stringToUTF8(name, dirp + pos + 19, 256),
        (pos += 280),
        (idx += 1);
    }
    return FS.llseek(stream, 280 * idx, 0), pos;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_getpeername(fd, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd);
    return sock.daddr
      ? (writeSockaddr(
          addr,
          sock.family,
          DNS.lookup_name(sock.daddr),
          sock.dport,
          addrlen
        ),
        0)
      : -53;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_getsockname(fd, addr, addrlen) {
  try {
    err("__syscall_getsockname " + fd);
    var sock = getSocketFromFD(fd);
    writeSockaddr(
      addr,
      sock.family,
      DNS.lookup_name(sock.saddr || "0.0.0.0"),
      sock.sport,
      addrlen
    );
    return 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_getsockopt(fd, level, optname, optval, optlen) {
  try {
    var sock = getSocketFromFD(fd);
    return 1 === level && 4 === optname
      ? ((HEAP32[optval >> 2] = sock.error),
        (HEAP32[optlen >> 2] = 4),
        (sock.error = null),
        0)
      : -50;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
      case 21509:
      case 21505:
        return stream.tty ? 0 : -59;
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508:
        return stream.tty ? 0 : -59;
      case 21519:
        return stream.tty
          ? ((argp = SYSCALLS.get()), (HEAP32[argp >> 2] = 0))
          : -59;
      case 21520:
        return stream.tty ? -28 : -59;
      case 21531:
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      case 21523:
      case 21524:
        return stream.tty ? 0 : -59;
      default:
        abort("bad ioctl syscall " + op);
    }
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_listen(fd, backlog) {
  try {
    var sock = getSocketFromFD(fd);
    return sock.sock_ops.listen(sock, backlog), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_mkdir(path, mode) {
  try {
    return (path = SYSCALLS.getStr(path)), SYSCALLS.doMkdir(path, mode);
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    (path = SYSCALLS.getStr(path)), (path = SYSCALLS.calculateAt(dirfd, path));
    var mode = varargs ? SYSCALLS.get() : 0;
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd),
      msg = sock.sock_ops.recvmsg(sock, len);
    return msg
      ? (addr &&
          writeSockaddr(
            addr,
            sock.family,
            DNS.lookup_name(msg.addr),
            msg.port,
            addrlen
          ),
        HEAPU8.set(msg.buffer, buf),
        msg.buffer.byteLength)
      : 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
  try {
    return (
      (oldpath = SYSCALLS.getStr(oldpath)),
      (newpath = SYSCALLS.getStr(newpath)),
      (oldpath = SYSCALLS.calculateAt(olddirfd, oldpath)),
      (newpath = SYSCALLS.calculateAt(newdirfd, newpath)),
      FS.rename(oldpath, newpath),
      0
    );
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_rmdir(path) {
  try {
    return (path = SYSCALLS.getStr(path)), FS.rmdir(path), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
  try {
    var sock = getSocketFromFD(fd),
      dest = getSocketAddress(addr, addr_len, !0);
    return dest
      ? sock.sock_ops.sendmsg(
          sock,
          HEAP8,
          message,
          length,
          dest.addr,
          dest.port
        )
      : FS.write(sock.stream, HEAP8, message, length);
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_socket(domain, type, protocol) {
  try {
    return SOCKFS.createSocket(domain, type, protocol).stream.fd;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_stat64(path, buf) {
  try {
    return (path = SYSCALLS.getStr(path)), SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_unlinkat(dirfd, path, flags) {
  try {
    return (
      (path = SYSCALLS.getStr(path)),
      (path = SYSCALLS.calculateAt(dirfd, path)),
      0 === flags
        ? FS.unlink(path)
        : 512 === flags
        ? FS.rmdir(path)
        : abort("Invalid flags passed to unlinkat"),
      0
    );
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function ___syscall_utimensat(dirfd, path, times, flags) {
  try {
    var atime, mtime;
    return (
      (path = SYSCALLS.getStr(path)),
      (path = SYSCALLS.calculateAt(dirfd, path, !0)),
      (mtime = times
        ? ((atime = 1e3 * HEAP32[times >> 2] + HEAP32[(times + 4) >> 2] / 1e6),
          1e3 * HEAP32[(times += 8) >> 2] + HEAP32[(times + 4) >> 2] / 1e6)
        : (atime = Date.now())),
      FS.utime(path, atime, mtime),
      0
    );
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return -e.errno;
    throw e;
  }
}
function __emscripten_noop() {}
function __emscripten_exit_or_abort() {}
function __emscripten_date_now() {
  return Date.now();
}
var nowIsMonotonic = !0;
function __emscripten_get_now_is_monotonic() {
  return nowIsMonotonic;
}
function __emscripten_throw_longjmp() {
  throw 1 / 0;
}
function _abort() {
  abort("");
}
function _emscripten_set_main_loop_timing(mode, value) {
  return (
    (Browser.mainLoop.timingMode = mode),
    (Browser.mainLoop.timingValue = value),
    Browser.mainLoop.func
      ? (Browser.mainLoop.running || (Browser.mainLoop.running = !0),
        0 == mode
          ? ((Browser.mainLoop.scheduler = function () {
              var timeUntilNextTick =
                0 |
                Math.max(
                  0,
                  Browser.mainLoop.tickStartTime + value - _emscripten_get_now()
                );
              setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
            }),
            (Browser.mainLoop.method = "timeout"))
          : 1 == mode
          ? ((Browser.mainLoop.scheduler = function () {
              Browser.requestAnimationFrame(Browser.mainLoop.runner);
            }),
            (Browser.mainLoop.method = "rAF"))
          : 2 == mode &&
            ((Browser.mainLoop.scheduler = function () {
              setImmediate(Browser.mainLoop.runner);
            }),
            (Browser.mainLoop.method = "immediate")),
        0)
      : 1
  );
}
function maybeExit() {}
function setMainLoop(
  browserIterationFunc,
  fps,
  simulateInfiniteLoop,
  arg,
  noSetTiming
) {
  assert(
    !Browser.mainLoop.func,
    "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters."
  ),
    (Browser.mainLoop.func = browserIterationFunc),
    (Browser.mainLoop.arg = arg);
  var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  function checkIsRunning() {
    if (!(thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)) return 1;
    maybeExit();
  }
  if (
    ((Browser.mainLoop.running = !1),
    (Browser.mainLoop.runner = function () {
      var start, blocker, remaining, next;
      if (!ABORT)
        return 0 < Browser.mainLoop.queue.length
          ? ((start = Date.now()),
            (blocker = Browser.mainLoop.queue.shift()).func(blocker.arg),
            Browser.mainLoop.remainingBlockers &&
              ((next =
                (remaining = Browser.mainLoop.remainingBlockers) % 1 == 0
                  ? remaining - 1
                  : Math.floor(remaining)),
              blocker.counted
                ? (Browser.mainLoop.remainingBlockers = next)
                : (Browser.mainLoop.remainingBlockers =
                    (8 * remaining + (next += 0.5)) / 9)),
            out(
              'main loop blocker "' +
                blocker.name +
                '" took ' +
                (Date.now() - start) +
                " ms"
            ),
            Browser.mainLoop.updateStatus(),
            checkIsRunning()
              ? void setTimeout(Browser.mainLoop.runner, 0)
              : void 0)
          : void (
              checkIsRunning() &&
              ((Browser.mainLoop.currentFrameNumber =
                (Browser.mainLoop.currentFrameNumber + 1) | 0),
              1 == Browser.mainLoop.timingMode &&
              1 < Browser.mainLoop.timingValue &&
              Browser.mainLoop.currentFrameNumber %
                Browser.mainLoop.timingValue !=
                0
                ? Browser.mainLoop.scheduler()
                : (0 == Browser.mainLoop.timingMode &&
                    (Browser.mainLoop.tickStartTime = _emscripten_get_now()),
                  Browser.mainLoop.runIter(browserIterationFunc),
                  checkIsRunning() &&
                    ("object" == typeof SDL &&
                      SDL.audio &&
                      SDL.audio.queueNewAudioData &&
                      SDL.audio.queueNewAudioData(),
                    Browser.mainLoop.scheduler())))
            );
    }),
    noSetTiming ||
      (fps && 0 < fps
        ? _emscripten_set_main_loop_timing(0, 1e3 / fps)
        : _emscripten_set_main_loop_timing(1, 1),
      Browser.mainLoop.scheduler()),
    simulateInfiniteLoop)
  )
    throw "unwind";
}
function callUserCallback(func, synchronous) {
  ABORT || func();
}
function safeSetTimeout(func, timeout) {
  return setTimeout(function () {
    callUserCallback(func);
  }, timeout);
}
var _emscripten_get_now = ENVIRONMENT_IS_NODE
    ? () => {
        var t = process.hrtime();
        return 1e3 * t[0] + t[1] / 1e6;
      }
    : () => performance.now(),
  Browser = {
    mainLoop: {
      running: !1,
      scheduler: null,
      method: "",
      currentlyRunningMainloop: 0,
      func: null,
      arg: 0,
      timingMode: 0,
      timingValue: 0,
      currentFrameNumber: 0,
      queue: [],
      pause: function () {
        (Browser.mainLoop.scheduler = null),
          Browser.mainLoop.currentlyRunningMainloop++;
      },
      resume: function () {
        Browser.mainLoop.currentlyRunningMainloop++;
        var timingMode = Browser.mainLoop.timingMode,
          timingValue = Browser.mainLoop.timingValue,
          func = Browser.mainLoop.func;
        (Browser.mainLoop.func = null),
          setMainLoop(func, 0, !1, Browser.mainLoop.arg, !0),
          _emscripten_set_main_loop_timing(timingMode, timingValue),
          Browser.mainLoop.scheduler();
      },
      updateStatus: function () {
        var message, remaining, expected;
        Module.setStatus &&
          ((message = Module.statusMessage || "Please wait..."),
          (remaining = Browser.mainLoop.remainingBlockers),
          (expected = Browser.mainLoop.expectedBlockers),
          remaining
            ? remaining < expected
              ? Module.setStatus(
                  message + " (" + (expected - remaining) + "/" + expected + ")"
                )
              : Module.setStatus(message)
            : Module.setStatus(""));
      },
      runIter: function (func) {
        if (!ABORT) {
          if (Module.preMainLoop) if (!1 === Module.preMainLoop()) return;
          func(), Module.postMainLoop && Module.postMainLoop();
        }
      },
    },
    isFullscreen: !1,
    pointerLock: !1,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function () {
      if (
        (Module.preloadPlugins || (Module.preloadPlugins = []),
        !Browser.initted)
      ) {
        Browser.initted = !0;
        try {
          new Blob(), (Browser.hasBlobConstructor = !0);
        } catch (e) {
          (Browser.hasBlobConstructor = !1),
            out(
              "warning: no blob constructor, cannot create blobs with mimetypes"
            );
        }
        (Browser.BlobBuilder =
          "undefined" != typeof MozBlobBuilder
            ? MozBlobBuilder
            : "undefined" != typeof WebKitBlobBuilder
            ? WebKitBlobBuilder
            : Browser.hasBlobConstructor
            ? null
            : out("warning: no BlobBuilder")),
          (Browser.URLObject =
            "undefined" != typeof window
              ? window.URL || window.webkitURL
              : void 0),
          Module.noImageDecoding ||
            void 0 !== Browser.URLObject ||
            (out(
              "warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."
            ),
            (Module.noImageDecoding = !0));
        var imagePlugin = {
            canHandle: function (name) {
              return (
                !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
              );
            },
            handle: function (byteArray, name, onload, onerror) {
              var bb,
                b = null;
              if (Browser.hasBlobConstructor)
                try {
                  (b = new Blob([byteArray], {
                    type: Browser.getMimetype(name),
                  })).size !== byteArray.length &&
                    (b = new Blob([new Uint8Array(byteArray).buffer], {
                      type: Browser.getMimetype(name),
                    }));
                } catch (e) {
                  warnOnce(
                    "Blob constructor present but fails: " +
                      e +
                      "; falling back to blob builder"
                  );
                }
              b ||
                ((bb = new Browser.BlobBuilder()).append(
                  new Uint8Array(byteArray).buffer
                ),
                (b = bb.getBlob()));
              var url = Browser.URLObject.createObjectURL(b),
                img = new Image();
              (img.onload = () => {
                assert(img.complete, "Image " + name + " could not be decoded");
                var canvas = document.createElement("canvas");
                (canvas.width = img.width),
                  (canvas.height = img.height),
                  canvas.getContext("2d").drawImage(img, 0, 0),
                  (Module.preloadedImages[name] = canvas),
                  Browser.URLObject.revokeObjectURL(url),
                  onload && onload(byteArray);
              }),
                (img.onerror = (event) => {
                  out("Image " + url + " could not be decoded"),
                    onerror && onerror();
                }),
                (img.src = url);
            },
          },
          imagePlugin =
            (Module.preloadPlugins.push(imagePlugin),
            {
              canHandle: function (name) {
                return (
                  !Module.noAudioDecoding &&
                  name.substr(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 }
                );
              },
            }),
          imagePlugin =
            ((imagePlugin.handle = function (byteArray, name, onload, onerror) {
              var done = !1;
              function finish(audio) {
                done ||
                  ((done = !0),
                  (Module.preloadedAudios[name] = audio),
                  onload && onload(byteArray));
              }
              function fail() {
                done ||
                  ((done = !0),
                  (Module.preloadedAudios[name] = new Audio()),
                  onerror && onerror());
              }
              if (!Browser.hasBlobConstructor) return fail();
              try {
                var b = new Blob([byteArray], {
                  type: Browser.getMimetype(name),
                });
              } catch (e) {
                return fail();
              }
              var b = Browser.URLObject.createObjectURL(b),
                audio = new Audio();
              audio.addEventListener(
                "canplaythrough",
                function () {
                  finish(audio);
                },
                !1
              ),
                (audio.onerror = function (event) {
                  done ||
                    (out(
                      "warning: browser could not fully decode audio " +
                        name +
                        ", trying slower base64 approach"
                    ),
                    (audio.src =
                      "data:audio/x-" +
                      name.substr(-3) +
                      ";base64," +
                      (function (data) {
                        for (
                          var BASE =
                              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                            ret = "",
                            leftchar = 0,
                            leftbits = 0,
                            i = 0;
                          i < data.length;
                          i++
                        )
                          for (
                            leftchar = (leftchar << 8) | data[i], leftbits += 8;
                            6 <= leftbits;

                          ) {
                            var curr = (leftchar >> (leftbits - 6)) & 63;
                            (leftbits -= 6), (ret += BASE[curr]);
                          }
                        return (
                          2 == leftbits
                            ? (ret = ret + BASE[(3 & leftchar) << 4] + "==")
                            : 4 == leftbits &&
                              (ret = ret + BASE[(15 & leftchar) << 2] + "="),
                          ret
                        );
                      })(byteArray)),
                    finish(audio));
                }),
                (audio.src = b),
                safeSetTimeout(function () {
                  finish(audio);
                }, 1e4);
            }),
            Module.preloadPlugins.push(imagePlugin),
            Module.canvas);
        imagePlugin &&
          ((imagePlugin.requestPointerLock =
            imagePlugin.requestPointerLock ||
            imagePlugin.mozRequestPointerLock ||
            imagePlugin.webkitRequestPointerLock ||
            imagePlugin.msRequestPointerLock ||
            function () {}),
          (imagePlugin.exitPointerLock =
            document.exitPointerLock ||
            document.mozExitPointerLock ||
            document.webkitExitPointerLock ||
            document.msExitPointerLock ||
            function () {}),
          (imagePlugin.exitPointerLock =
            imagePlugin.exitPointerLock.bind(document)),
          document.addEventListener("pointerlockchange", pointerLockChange, !1),
          document.addEventListener(
            "mozpointerlockchange",
            pointerLockChange,
            !1
          ),
          document.addEventListener(
            "webkitpointerlockchange",
            pointerLockChange,
            !1
          ),
          document.addEventListener(
            "mspointerlockchange",
            pointerLockChange,
            !1
          ),
          Module.elementPointerLock &&
            imagePlugin.addEventListener(
              "click",
              function (ev) {
                !Browser.pointerLock &&
                  Module.canvas.requestPointerLock &&
                  (Module.canvas.requestPointerLock(), ev.preventDefault());
              },
              !1
            ));
      }
      function pointerLockChange() {
        Browser.pointerLock =
          document.pointerLockElement === Module.canvas ||
          document.mozPointerLockElement === Module.canvas ||
          document.webkitPointerLockElement === Module.canvas ||
          document.msPointerLockElement === Module.canvas;
      }
    },
    handledByPreloadPlugin: function (byteArray, fullname, finish, onerror) {
      Browser.init();
      var handled = !1;
      return (
        Module.preloadPlugins.forEach(function (plugin) {
          handled ||
            (plugin.canHandle(fullname) &&
              (plugin.handle(byteArray, fullname, finish, onerror),
              (handled = !0)));
        }),
        handled
      );
    },
    createContext: function (
      canvas,
      useWebGL,
      setInModule,
      webGLContextAttributes
    ) {
      if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
      var ctx, contextHandle;
      if (useWebGL) {
        var contextAttributes = { antialias: !1, alpha: !1, majorVersion: 1 };
        if (webGLContextAttributes)
          for (var attribute in webGLContextAttributes)
            contextAttributes[attribute] = webGLContextAttributes[attribute];
        void 0 !== GL &&
          (contextHandle = GL.createContext(canvas, contextAttributes)) &&
          (ctx = GL.getContext(contextHandle).GLctx);
      } else ctx = canvas.getContext("2d");
      return ctx
        ? (setInModule &&
            (useWebGL ||
              assert(
                void 0 === GLctx,
                "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"
              ),
            (Module.ctx = ctx),
            useWebGL && GL.makeContextCurrent(contextHandle),
            (Module.useWebGL = useWebGL),
            Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
              callback();
            }),
            Browser.init()),
          ctx)
        : null;
    },
    destroyContext: function (canvas, useWebGL, setInModule) {},
    fullscreenHandlersInstalled: !1,
    lockPointer: void 0,
    resizeCanvas: void 0,
    requestFullscreen: function (lockPointer, resizeCanvas) {
      (Browser.lockPointer = lockPointer),
        (Browser.resizeCanvas = resizeCanvas),
        void 0 === Browser.lockPointer && (Browser.lockPointer = !0),
        void 0 === Browser.resizeCanvas && (Browser.resizeCanvas = !1);
      var canvas = Module.canvas;
      function fullscreenChange() {
        Browser.isFullscreen = !1;
        var canvasContainer = canvas.parentNode;
        (document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement ||
          document.webkitFullscreenElement ||
          document.webkitCurrentFullScreenElement) === canvasContainer
          ? ((canvas.exitFullscreen = Browser.exitFullscreen),
            Browser.lockPointer && canvas.requestPointerLock(),
            (Browser.isFullscreen = !0),
            Browser.resizeCanvas
              ? Browser.setFullscreenCanvasSize()
              : Browser.updateCanvasDimensions(canvas))
          : (canvasContainer.parentNode.insertBefore(canvas, canvasContainer),
            canvasContainer.parentNode.removeChild(canvasContainer),
            Browser.resizeCanvas
              ? Browser.setWindowedCanvasSize()
              : Browser.updateCanvasDimensions(canvas)),
          Module.onFullScreen && Module.onFullScreen(Browser.isFullscreen),
          Module.onFullscreen && Module.onFullscreen(Browser.isFullscreen);
      }
      Browser.fullscreenHandlersInstalled ||
        ((Browser.fullscreenHandlersInstalled = !0),
        document.addEventListener("fullscreenchange", fullscreenChange, !1),
        document.addEventListener("mozfullscreenchange", fullscreenChange, !1),
        document.addEventListener(
          "webkitfullscreenchange",
          fullscreenChange,
          !1
        ),
        document.addEventListener("MSFullscreenChange", fullscreenChange, !1));
      var canvasContainer = document.createElement("div");
      canvas.parentNode.insertBefore(canvasContainer, canvas),
        canvasContainer.appendChild(canvas),
        (canvasContainer.requestFullscreen =
          canvasContainer.requestFullscreen ||
          canvasContainer.mozRequestFullScreen ||
          canvasContainer.msRequestFullscreen ||
          (canvasContainer.webkitRequestFullscreen
            ? function () {
                canvasContainer.webkitRequestFullscreen(
                  Element.ALLOW_KEYBOARD_INPUT
                );
              }
            : null) ||
          (canvasContainer.webkitRequestFullScreen
            ? function () {
                canvasContainer.webkitRequestFullScreen(
                  Element.ALLOW_KEYBOARD_INPUT
                );
              }
            : null)),
        canvasContainer.requestFullscreen();
    },
    exitFullscreen: function () {
      return (
        !!Browser.isFullscreen &&
        ((
          document.exitFullscreen ||
          document.cancelFullScreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen ||
          document.webkitCancelFullScreen ||
          function () {}
        ).apply(document, []),
        !0)
      );
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function (func) {
      var now = Date.now();
      if (0 === Browser.nextRAF) Browser.nextRAF = now + 1e3 / 60;
      else for (; now + 2 >= Browser.nextRAF; ) Browser.nextRAF += 1e3 / 60;
      var delay = Math.max(Browser.nextRAF - now, 0);
      setTimeout(func, delay);
    },
    requestAnimationFrame: function (func) {
      ("function" == typeof requestAnimationFrame
        ? requestAnimationFrame
        : Browser.fakeRequestAnimationFrame)(func);
    },
    safeSetTimeout: function (func) {
      return safeSetTimeout(func);
    },
    safeRequestAnimationFrame: function (func) {
      return Browser.requestAnimationFrame(function () {
        callUserCallback(func);
      });
    },
    getMimetype: function (name) {
      return {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        bmp: "image/bmp",
        ogg: "audio/ogg",
        wav: "audio/wav",
        mp3: "audio/mpeg",
      }[name.substr(name.lastIndexOf(".") + 1)];
    },
    getUserMedia: function (func) {
      window.getUserMedia ||
        (window.getUserMedia =
          navigator.getUserMedia || navigator.mozGetUserMedia),
        window.getUserMedia(func);
    },
    getMovementX: function (event) {
      return (
        event.movementX || event.mozMovementX || event.webkitMovementX || 0
      );
    },
    getMovementY: function (event) {
      return (
        event.movementY || event.mozMovementY || event.webkitMovementY || 0
      );
    },
    getMouseWheelDelta: function (event) {
      var delta = 0;
      switch (event.type) {
        case "DOMMouseScroll":
          delta = event.detail / 3;
          break;
        case "mousewheel":
          delta = event.wheelDelta / 120;
          break;
        case "wheel":
          switch (((delta = event.deltaY), event.deltaMode)) {
            case 0:
              delta /= 100;
              break;
            case 1:
              delta /= 3;
              break;
            case 2:
              delta *= 80;
              break;
            default:
              throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
          }
          break;
        default:
          throw "unrecognized mouse wheel event: " + event.type;
      }
      return delta;
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function (event) {
      if (Browser.pointerLock)
        "mousemove" != event.type && "mozMovementX" in event
          ? (Browser.mouseMovementX = Browser.mouseMovementY = 0)
          : ((Browser.mouseMovementX = Browser.getMovementX(event)),
            (Browser.mouseMovementY = Browser.getMovementY(event))),
          "undefined" != typeof SDL
            ? ((Browser.mouseX = SDL.mouseX + Browser.mouseMovementX),
              (Browser.mouseY = SDL.mouseY + Browser.mouseMovementY))
            : ((Browser.mouseX += Browser.mouseMovementX),
              (Browser.mouseY += Browser.mouseMovementY));
      else {
        var adjustedX,
          rect = Module.canvas.getBoundingClientRect(),
          cw = Module.canvas.width,
          ch = Module.canvas.height,
          scrollX =
            void 0 !== window.scrollX ? window.scrollX : window.pageXOffset,
          scrollY =
            void 0 !== window.scrollY ? window.scrollY : window.pageYOffset;
        if (
          "touchstart" === event.type ||
          "touchend" === event.type ||
          "touchmove" === event.type
        )
          return void 0 === (touch = event.touch)
            ? void 0
            : ((adjustedX = touch.pageX - (scrollX + rect.left)),
              (adjustedY = touch.pageY - (scrollY + rect.top)),
              (adjustedX = {
                x: (adjustedX *= cw / rect.width),
                y: (adjustedY *= ch / rect.height),
              }),
              void ("touchstart" === event.type
                ? ((Browser.lastTouches[touch.identifier] = adjustedX),
                  (Browser.touches[touch.identifier] = adjustedX))
                : ("touchend" !== event.type &&
                    "touchmove" !== window.event.type) ||
                  ((adjustedY =
                    (adjustedY = Browser.touches[touch.identifier]) ||
                    adjustedX),
                  (Browser.lastTouches[touch.identifier] = adjustedY),
                  (Browser.touches[touch.identifier] = adjustedX))));
        var adjustedY = event.pageX - (scrollX + rect.left),
          touch = event.pageY - (scrollY + rect.top);
        (adjustedY *= cw / rect.width),
          (touch *= ch / rect.height),
          (Browser.mouseMovementX = adjustedY - Browser.mouseX),
          (Browser.mouseMovementY = touch - Browser.mouseY),
          (Browser.mouseX = adjustedY),
          (Browser.mouseY = touch);
      }
    },
    resizeListeners: [],
    updateResizeListeners: function () {
      var canvas = Module.canvas;
      Browser.resizeListeners.forEach(function (listener) {
        listener(canvas.width, canvas.height);
      });
    },
    setCanvasSize: function (width, height, noUpdates) {
      var canvas = Module.canvas;
      Browser.updateCanvasDimensions(canvas, width, height),
        noUpdates || Browser.updateResizeListeners();
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: function () {
      var flags;
      "undefined" != typeof SDL &&
        ((flags = HEAPU32[SDL.screen >> 2]),
        (HEAP32[SDL.screen >> 2] = flags |= 8388608)),
        Browser.updateCanvasDimensions(Module.canvas),
        Browser.updateResizeListeners();
    },
    setWindowedCanvasSize: function () {
      var flags;
      "undefined" != typeof SDL &&
        ((flags = HEAPU32[SDL.screen >> 2]),
        (HEAP32[SDL.screen >> 2] = flags &= -8388609)),
        Browser.updateCanvasDimensions(Module.canvas),
        Browser.updateResizeListeners();
    },
    updateCanvasDimensions: function (canvas, wNative, hNative) {
      wNative && hNative
        ? ((canvas.widthNative = wNative), (canvas.heightNative = hNative))
        : ((wNative = canvas.widthNative), (hNative = canvas.heightNative));
      var factor,
        w = wNative,
        h = hNative;
      Module.forcedAspectRatio &&
        0 < Module.forcedAspectRatio &&
        (w / h < Module.forcedAspectRatio
          ? (w = Math.round(h * Module.forcedAspectRatio))
          : (h = Math.round(w / Module.forcedAspectRatio))),
        (document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement ||
          document.webkitFullscreenElement ||
          document.webkitCurrentFullScreenElement) === canvas.parentNode &&
          "undefined" != typeof screen &&
          ((factor = Math.min(screen.width / w, screen.height / h)),
          (w = Math.round(w * factor)),
          (h = Math.round(h * factor))),
        Browser.resizeCanvas
          ? (canvas.width != w && (canvas.width = w),
            canvas.height != h && (canvas.height = h),
            void 0 !== canvas.style &&
              (canvas.style.removeProperty("width"),
              canvas.style.removeProperty("height")))
          : (canvas.width != wNative && (canvas.width = wNative),
            canvas.height != hNative && (canvas.height = hNative),
            void 0 !== canvas.style &&
              (w != wNative || h != hNative
                ? (canvas.style.setProperty("width", w + "px", "important"),
                  canvas.style.setProperty("height", h + "px", "important"))
                : (canvas.style.removeProperty("width"),
                  canvas.style.removeProperty("height"))));
    },
  },
  EGL = {
    errorCode: 12288,
    defaultDisplayInitialized: !1,
    currentContext: 0,
    currentReadSurface: 0,
    currentDrawSurface: 0,
    contextAttributes: { alpha: !1, depth: !1, stencil: !1, antialias: !1 },
    stringCache: {},
    setErrorCode: function (code) {
      EGL.errorCode = code;
    },
    chooseConfig: function (
      display,
      attribList,
      config,
      config_size,
      numConfigs
    ) {
      if (62e3 != display) return EGL.setErrorCode(12296), 0;
      if (attribList)
        for (;;) {
          var param = HEAP32[attribList >> 2];
          if (12321 == param) {
            var alphaSize = HEAP32[(attribList + 4) >> 2];
            EGL.contextAttributes.alpha = 0 < alphaSize;
          } else if (12325 == param) {
            alphaSize = HEAP32[(attribList + 4) >> 2];
            EGL.contextAttributes.depth = 0 < alphaSize;
          } else if (12326 == param) {
            var stencilSize = HEAP32[(attribList + 4) >> 2];
            EGL.contextAttributes.stencil = 0 < stencilSize;
          } else if (12337 == param) {
            var samples = HEAP32[(attribList + 4) >> 2];
            EGL.contextAttributes.antialias = 0 < samples;
          } else if (12338 == param) {
            samples = HEAP32[(attribList + 4) >> 2];
            EGL.contextAttributes.antialias = 1 == samples;
          } else if (12544 == param) {
            stencilSize = HEAP32[(attribList + 4) >> 2];
            EGL.contextAttributes.lowLatency = 12547 != stencilSize;
          } else if (12344 == param) break;
          attribList += 8;
        }
      return (config && config_size) || numConfigs
        ? (numConfigs && (HEAP32[numConfigs >> 2] = 1),
          config && 0 < config_size && (HEAP32[config >> 2] = 62002),
          EGL.setErrorCode(12288),
          1)
        : (EGL.setErrorCode(12300), 0);
    },
  };
function _eglBindAPI(api) {
  return 12448 == api
    ? (EGL.setErrorCode(12288), 1)
    : (EGL.setErrorCode(12300), 0);
}
function _eglChooseConfig(
  display,
  attrib_list,
  configs,
  config_size,
  numConfigs
) {
  return EGL.chooseConfig(
    display,
    attrib_list,
    configs,
    config_size,
    numConfigs
  );
}
function __webgl_enable_ANGLE_instanced_arrays(ctx) {
  var ext = ctx.getExtension("ANGLE_instanced_arrays");
  if (ext)
    return (
      (ctx.vertexAttribDivisor = function (index, divisor) {
        ext.vertexAttribDivisorANGLE(index, divisor);
      }),
      (ctx.drawArraysInstanced = function (mode, first, count, primcount) {
        ext.drawArraysInstancedANGLE(mode, first, count, primcount);
      }),
      (ctx.drawElementsInstanced = function (
        mode,
        count,
        type,
        indices,
        primcount
      ) {
        ext.drawElementsInstancedANGLE(mode, count, type, indices, primcount);
      }),
      1
    );
}
function __webgl_enable_OES_vertex_array_object(ctx) {
  var ext = ctx.getExtension("OES_vertex_array_object");
  if (ext)
    return (
      (ctx.createVertexArray = function () {
        return ext.createVertexArrayOES();
      }),
      (ctx.deleteVertexArray = function (vao) {
        ext.deleteVertexArrayOES(vao);
      }),
      (ctx.bindVertexArray = function (vao) {
        ext.bindVertexArrayOES(vao);
      }),
      (ctx.isVertexArray = function (vao) {
        return ext.isVertexArrayOES(vao);
      }),
      1
    );
}
function __webgl_enable_WEBGL_draw_buffers(ctx) {
  var ext = ctx.getExtension("WEBGL_draw_buffers");
  if (ext)
    return (
      (ctx.drawBuffers = function (n, bufs) {
        ext.drawBuffersWEBGL(n, bufs);
      }),
      1
    );
}
function __webgl_enable_WEBGL_multi_draw(ctx) {
  return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
}
var GL = {
  counter: 1,
  buffers: [],
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  shaders: [],
  vaos: [],
  contexts: [],
  offscreenCanvases: {},
  queries: [],
  stringCache: {},
  unpackAlignment: 4,
  recordError: function (errorCode) {
    GL.lastError || (GL.lastError = errorCode);
  },
  getNewId: function (table) {
    for (var ret = GL.counter++, i = table.length; i < ret; i++)
      table[i] = null;
    return ret;
  },
  getSource: function (shader, count, string, length) {
    for (var source = "", i = 0; i < count; ++i) {
      var len = length ? HEAP32[(length + 4 * i) >> 2] : -1;
      source += UTF8ToString(
        HEAP32[(string + 4 * i) >> 2],
        len < 0 ? void 0 : len
      );
    }
    return source;
  },
  createContext: function (canvas, webGLContextAttributes) {
    canvas.getContextSafariWebGL2Fixed ||
      ((canvas.getContextSafariWebGL2Fixed = canvas.getContext),
      (canvas.getContext = function (ver, attrs) {
        return (
          (attrs = canvas.getContextSafariWebGL2Fixed(ver, attrs)),
          ("webgl" == ver) == attrs instanceof WebGLRenderingContext
            ? attrs
            : null
        );
      }));
    var ctx = canvas.getContext("webgl", webGLContextAttributes);
    return ctx ? GL.registerContext(ctx, webGLContextAttributes) : 0;
  },
  registerContext: function (ctx, webGLContextAttributes) {
    var handle = GL.getNewId(GL.contexts),
      context = {
        handle: handle,
        attributes: webGLContextAttributes,
        version: webGLContextAttributes.majorVersion,
        GLctx: ctx,
      };
    return (
      ctx.canvas && (ctx.canvas.GLctxObject = context),
      (GL.contexts[handle] = context),
      (void 0 !== webGLContextAttributes.enableExtensionsByDefault &&
        !webGLContextAttributes.enableExtensionsByDefault) ||
        GL.initExtensions(context),
      handle
    );
  },
  makeContextCurrent: function (contextHandle) {
    return (
      (GL.currentContext = GL.contexts[contextHandle]),
      (Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx),
      !(contextHandle && !GLctx)
    );
  },
  getContext: function (contextHandle) {
    return GL.contexts[contextHandle];
  },
  deleteContext: function (contextHandle) {
    GL.currentContext === GL.contexts[contextHandle] &&
      (GL.currentContext = null),
      "object" == typeof JSEvents &&
        JSEvents.removeAllHandlersOnTarget(
          GL.contexts[contextHandle].GLctx.canvas
        ),
      GL.contexts[contextHandle] &&
        GL.contexts[contextHandle].GLctx.canvas &&
        (GL.contexts[contextHandle].GLctx.canvas.GLctxObject = void 0),
      (GL.contexts[contextHandle] = null);
  },
  initExtensions: function (context) {
    var GLctx;
    (context = context || GL.currentContext).initExtensionsDone ||
      ((context.initExtensionsDone = !0),
      __webgl_enable_ANGLE_instanced_arrays((GLctx = context.GLctx)),
      __webgl_enable_OES_vertex_array_object(GLctx),
      __webgl_enable_WEBGL_draw_buffers(GLctx),
      (GLctx.disjointTimerQueryExt = GLctx.getExtension(
        "EXT_disjoint_timer_query"
      )),
      __webgl_enable_WEBGL_multi_draw(GLctx),
      (GLctx.getSupportedExtensions() || []).forEach(function (ext) {
        ext.includes("lose_context") ||
          ext.includes("debug") ||
          GLctx.getExtension(ext);
      }));
  },
};
function _eglCreateContext(display, config, hmm, contextAttribs) {
  if (62e3 != display) return EGL.setErrorCode(12296), 0;
  for (var glesContextVersion = 1; ; ) {
    var param = HEAP32[contextAttribs >> 2];
    if (12440 != param) {
      if (12344 == param) break;
      return EGL.setErrorCode(12292), 0;
    }
    (glesContextVersion = HEAP32[(contextAttribs + 4) >> 2]),
      (contextAttribs += 8);
  }
  return 2 != glesContextVersion
    ? (EGL.setErrorCode(12293), 0)
    : ((EGL.contextAttributes.majorVersion = glesContextVersion - 1),
      (EGL.contextAttributes.minorVersion = 0),
      (EGL.context = GL.createContext(Module.canvas, EGL.contextAttributes)),
      0 != EGL.context
        ? (EGL.setErrorCode(12288),
          GL.makeContextCurrent(EGL.context),
          (Module.useWebGL = !0),
          Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
            callback();
          }),
          GL.makeContextCurrent(null),
          62004)
        : (EGL.setErrorCode(12297), 0));
}
function _eglCreateWindowSurface(display, config, win, attrib_list) {
  return 62e3 != display
    ? (EGL.setErrorCode(12296), 0)
    : 62002 != config
    ? (EGL.setErrorCode(12293), 0)
    : (EGL.setErrorCode(12288), 62006);
}
function _eglDestroyContext(display, context) {
  return 62e3 != display
    ? (EGL.setErrorCode(12296), 0)
    : 62004 != context
    ? (EGL.setErrorCode(12294), 0)
    : (GL.deleteContext(EGL.context),
      EGL.setErrorCode(12288),
      EGL.currentContext == context && (EGL.currentContext = 0),
      1);
}
function _eglDestroySurface(display, surface) {
  return 62e3 != display
    ? (EGL.setErrorCode(12296), 0)
    : (62006 != surface
        ? EGL.setErrorCode(12301)
        : (EGL.currentReadSurface == surface && (EGL.currentReadSurface = 0),
          EGL.currentDrawSurface == surface && (EGL.currentDrawSurface = 0),
          EGL.setErrorCode(12288)),
      1);
}
function _eglGetConfigAttrib(display, config, attribute, value) {
  if (62e3 != display) return EGL.setErrorCode(12296), 0;
  if (62002 != config) return EGL.setErrorCode(12293), 0;
  if (!value) return EGL.setErrorCode(12300), 0;
  switch ((EGL.setErrorCode(12288), attribute)) {
    case 12320:
      return (HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 32 : 24), 1;
    case 12321:
      return (HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 8 : 0), 1;
    case 12322:
    case 12323:
    case 12324:
      return (HEAP32[value >> 2] = 8), 1;
    case 12325:
      return (HEAP32[value >> 2] = EGL.contextAttributes.depth ? 24 : 0), 1;
    case 12326:
      return (HEAP32[value >> 2] = EGL.contextAttributes.stencil ? 8 : 0), 1;
    case 12327:
      return (HEAP32[value >> 2] = 12344), 1;
    case 12328:
      return (HEAP32[value >> 2] = 62002), 1;
    case 12329:
      return (HEAP32[value >> 2] = 0), 1;
    case 12330:
      return (HEAP32[value >> 2] = 4096), 1;
    case 12331:
      return (HEAP32[value >> 2] = 16777216), 1;
    case 12332:
      return (HEAP32[value >> 2] = 4096), 1;
    case 12333:
    case 12334:
      return (HEAP32[value >> 2] = 0), 1;
    case 12335:
      return (HEAP32[value >> 2] = 12344), 1;
    case 12337:
      return (HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 4 : 0), 1;
    case 12338:
      return (HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 1 : 0), 1;
    case 12339:
      return (HEAP32[value >> 2] = 4), 1;
    case 12340:
      return (HEAP32[value >> 2] = 12344), 1;
    case 12341:
    case 12342:
    case 12343:
      return (HEAP32[value >> 2] = -1), 1;
    case 12345:
    case 12346:
    case 12347:
      return (HEAP32[value >> 2] = 0), 1;
    case 12348:
      return (HEAP32[value >> 2] = 1);
    case 12349:
    case 12350:
      return (HEAP32[value >> 2] = 0), 1;
    case 12351:
      return (HEAP32[value >> 2] = 12430), 1;
    case 12352:
      return (HEAP32[value >> 2] = 4), 1;
    case 12354:
      return (HEAP32[value >> 2] = 0), 1;
    default:
      return EGL.setErrorCode(12292), 0;
  }
}
function _eglGetDisplay(nativeDisplayType) {
  return EGL.setErrorCode(12288), 62e3;
}
function _eglGetError() {
  return EGL.errorCode;
}
function _eglInitialize(display, majorVersion, minorVersion) {
  return 62e3 == display
    ? (majorVersion && (HEAP32[majorVersion >> 2] = 1),
      minorVersion && (HEAP32[minorVersion >> 2] = 4),
      (EGL.defaultDisplayInitialized = !0),
      EGL.setErrorCode(12288),
      1)
    : (EGL.setErrorCode(12296), 0);
}
function _eglMakeCurrent(display, draw, read, context) {
  return 62e3 != display
    ? (EGL.setErrorCode(12296), 0)
    : 0 != context && 62004 != context
    ? (EGL.setErrorCode(12294), 0)
    : (0 != read && 62006 != read) || (0 != draw && 62006 != draw)
    ? (EGL.setErrorCode(12301), 0)
    : (GL.makeContextCurrent(context ? EGL.context : null),
      (EGL.currentContext = context),
      (EGL.currentDrawSurface = draw),
      (EGL.currentReadSurface = read),
      EGL.setErrorCode(12288),
      1);
}
function _eglQueryString(display, name) {
  if (62e3 != display) return EGL.setErrorCode(12296), 0;
  if ((EGL.setErrorCode(12288), EGL.stringCache[name]))
    return EGL.stringCache[name];
  var ret;
  switch (name) {
    case 12371:
      ret = allocateUTF8("Emscripten");
      break;
    case 12372:
      ret = allocateUTF8("1.4 Emscripten EGL");
      break;
    case 12373:
      ret = allocateUTF8("");
      break;
    case 12429:
      ret = allocateUTF8("OpenGL_ES");
      break;
    default:
      return EGL.setErrorCode(12300), 0;
  }
  return (EGL.stringCache[name] = ret);
}
function _eglSwapBuffers() {
  if (EGL.defaultDisplayInitialized)
    if (Module.ctx) {
      if (!Module.ctx.isContextLost()) return EGL.setErrorCode(12288), 1;
      EGL.setErrorCode(12302);
    } else EGL.setErrorCode(12290);
  else EGL.setErrorCode(12289);
  return 0;
}
function _eglSwapInterval(display, interval) {
  return 62e3 != display
    ? (EGL.setErrorCode(12296), 0)
    : (0 == interval
        ? _emscripten_set_main_loop_timing(0, 0)
        : _emscripten_set_main_loop_timing(1, interval),
      EGL.setErrorCode(12288),
      1);
}
function _eglTerminate(display) {
  return 62e3 != display
    ? (EGL.setErrorCode(12296), 0)
    : ((EGL.currentContext = 0),
      (EGL.currentReadSurface = 0),
      (EGL.currentDrawSurface = 0),
      (EGL.defaultDisplayInitialized = !1),
      EGL.setErrorCode(12288),
      1);
}
function _eglWaitClient() {
  return EGL.setErrorCode(12288), 1;
}
function _eglWaitGL() {
  return _eglWaitClient();
}
function _eglWaitNative(nativeEngineId) {
  return EGL.setErrorCode(12288), 1;
}
var readAsmConstArgsArray = [];
function readAsmConstArgs(sigPtr, buf) {
  for (readAsmConstArgsArray.length = 0, buf >>= 2; (ch = HEAPU8[sigPtr++]); ) {
    var ch = ch < 105;
    ch && 1 & buf && buf++,
      readAsmConstArgsArray.push(ch ? HEAPF64[buf++ >> 1] : HEAP32[buf]),
      ++buf;
  }
  return readAsmConstArgsArray;
}
function _emscripten_asm_const_int(code, sigPtr, argbuf) {
  sigPtr = readAsmConstArgs(sigPtr, argbuf);
  return ASM_CONSTS[code].apply(null, sigPtr);
}
var JSEvents = {
    inEventHandler: 0,
    removeAllEventListeners: function () {
      for (var i = JSEvents.eventHandlers.length - 1; 0 <= i; --i)
        JSEvents._removeHandler(i);
      (JSEvents.eventHandlers = []), (JSEvents.deferredCalls = []);
    },
    registerRemoveEventListeners: function () {
      JSEvents.removeEventListenersRegistered ||
        (__ATEXIT__.push(JSEvents.removeAllEventListeners),
        (JSEvents.removeEventListenersRegistered = !0));
    },
    deferredCalls: [],
    deferCall: function (targetFunction, precedence, argsList) {
      for (var i in JSEvents.deferredCalls) {
        i = JSEvents.deferredCalls[i];
        if (
          i.targetFunction == targetFunction &&
          (function (arrA, arrB) {
            if (arrA.length == arrB.length) {
              for (var i in arrA) if (arrA[i] != arrB[i]) return;
              return 1;
            }
          })(i.argsList, argsList)
        )
          return;
      }
      JSEvents.deferredCalls.push({
        targetFunction: targetFunction,
        precedence: precedence,
        argsList: argsList,
      }),
        JSEvents.deferredCalls.sort(function (x, y) {
          return x.precedence < y.precedence;
        });
    },
    removeDeferredCalls: function (targetFunction) {
      for (var i = 0; i < JSEvents.deferredCalls.length; ++i)
        JSEvents.deferredCalls[i].targetFunction == targetFunction &&
          (JSEvents.deferredCalls.splice(i, 1), --i);
    },
    canPerformEventHandlerRequests: function () {
      return (
        JSEvents.inEventHandler &&
        JSEvents.currentEventHandler.allowsDeferredCalls
      );
    },
    runDeferredCalls: function () {
      if (JSEvents.canPerformEventHandlerRequests())
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          var call = JSEvents.deferredCalls[i];
          JSEvents.deferredCalls.splice(i, 1),
            --i,
            call.targetFunction.apply(null, call.argsList);
        }
    },
    eventHandlers: [],
    removeAllHandlersOnTarget: function (target, eventTypeString) {
      for (var i = 0; i < JSEvents.eventHandlers.length; ++i)
        JSEvents.eventHandlers[i].target != target ||
          (eventTypeString &&
            eventTypeString != JSEvents.eventHandlers[i].eventTypeString) ||
          JSEvents._removeHandler(i--);
    },
    _removeHandler: function (i) {
      var h = JSEvents.eventHandlers[i];
      h.target.removeEventListener(
        h.eventTypeString,
        h.eventListenerFunc,
        h.useCapture
      ),
        JSEvents.eventHandlers.splice(i, 1);
    },
    registerOrRemoveHandler: function (eventHandler) {
      function jsEventHandler(event) {
        ++JSEvents.inEventHandler,
          (JSEvents.currentEventHandler = eventHandler),
          JSEvents.runDeferredCalls(),
          eventHandler.handlerFunc(event),
          JSEvents.runDeferredCalls(),
          --JSEvents.inEventHandler;
      }
      if (eventHandler.callbackfunc)
        (eventHandler.eventListenerFunc = jsEventHandler),
          eventHandler.target.addEventListener(
            eventHandler.eventTypeString,
            jsEventHandler,
            eventHandler.useCapture
          ),
          JSEvents.eventHandlers.push(eventHandler),
          JSEvents.registerRemoveEventListeners();
      else
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i)
          JSEvents.eventHandlers[i].target == eventHandler.target &&
            JSEvents.eventHandlers[i].eventTypeString ==
              eventHandler.eventTypeString &&
            JSEvents._removeHandler(i--);
    },
    getNodeNameForTarget: function (target) {
      return target
        ? target == window
          ? "#window"
          : target == screen
          ? "#screen"
          : target && target.nodeName
          ? target.nodeName
          : ""
        : "";
    },
    fullscreenEnabled: function () {
      return document.fullscreenEnabled || document.webkitFullscreenEnabled;
    },
  },
  currentFullscreenStrategy = {};
function maybeCStringToJsString(cString) {
  return 2 < cString ? UTF8ToString(cString) : cString;
}
var specialHTMLTargets = [
  0,
  "undefined" != typeof document ? document : 0,
  "undefined" != typeof window ? window : 0,
];
function findEventTarget(target) {
  return (
    (target = maybeCStringToJsString(target)),
    specialHTMLTargets[target] ||
      ("undefined" != typeof document ? document.querySelector(target) : void 0)
  );
}
function findCanvasEventTarget(target) {
  return findEventTarget(target);
}
function _emscripten_get_canvas_element_size(target, width, height) {
  target = findCanvasEventTarget(target);
  if (!target) return -4;
  (HEAP32[width >> 2] = target.width), (HEAP32[height >> 2] = target.height);
}
function getCanvasElementSize(target) {
  return withStackSave(function () {
    var w = stackAlloc(8),
      h = w + 4,
      targetInt = stackAlloc(target.id.length + 1);
    stringToUTF8(target.id, targetInt, target.id.length + 1),
      _emscripten_get_canvas_element_size(targetInt, w, h);
    return [HEAP32[w >> 2], HEAP32[h >> 2]];
  });
}
function _emscripten_set_canvas_element_size(target, width, height) {
  target = findCanvasEventTarget(target);
  return target ? ((target.width = width), (target.height = height), 0) : -4;
}
function setCanvasElementSize(target, width, height) {
  target.controlTransferredOffscreen
    ? withStackSave(function () {
        var targetInt = stackAlloc(target.id.length + 1);
        stringToUTF8(target.id, targetInt, target.id.length + 1),
          _emscripten_set_canvas_element_size(targetInt, width, height);
      })
    : ((target.width = width), (target.height = height));
}
function registerRestoreOldStyle(canvas) {
  var canvasSize = getCanvasElementSize(canvas),
    oldWidth = canvasSize[0],
    oldHeight = canvasSize[1],
    oldCssWidth = canvas.style.width,
    oldCssHeight = canvas.style.height,
    oldBackgroundColor = canvas.style.backgroundColor,
    oldDocumentBackgroundColor = document.body.style.backgroundColor,
    oldPaddingLeft = canvas.style.paddingLeft,
    oldPaddingRight = canvas.style.paddingRight,
    oldPaddingTop = canvas.style.paddingTop,
    oldPaddingBottom = canvas.style.paddingBottom,
    oldMarginLeft = canvas.style.marginLeft,
    oldMarginRight = canvas.style.marginRight,
    oldMarginTop = canvas.style.marginTop,
    oldMarginBottom = canvas.style.marginBottom,
    oldDocumentBodyMargin = document.body.style.margin,
    oldDocumentOverflow = document.documentElement.style.overflow,
    oldDocumentScroll = document.body.scroll,
    oldImageRendering = canvas.style.imageRendering;
  function restoreOldStyle() {
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      (document.removeEventListener("fullscreenchange", restoreOldStyle),
      document.removeEventListener("webkitfullscreenchange", restoreOldStyle),
      setCanvasElementSize(canvas, oldWidth, oldHeight),
      (canvas.style.width = oldCssWidth),
      (canvas.style.height = oldCssHeight),
      (canvas.style.backgroundColor = oldBackgroundColor),
      oldDocumentBackgroundColor ||
        (document.body.style.backgroundColor = "white"),
      (document.body.style.backgroundColor = oldDocumentBackgroundColor),
      (canvas.style.paddingLeft = oldPaddingLeft),
      (canvas.style.paddingRight = oldPaddingRight),
      (canvas.style.paddingTop = oldPaddingTop),
      (canvas.style.paddingBottom = oldPaddingBottom),
      (canvas.style.marginLeft = oldMarginLeft),
      (canvas.style.marginRight = oldMarginRight),
      (canvas.style.marginTop = oldMarginTop),
      (canvas.style.marginBottom = oldMarginBottom),
      (document.body.style.margin = oldDocumentBodyMargin),
      (document.documentElement.style.overflow = oldDocumentOverflow),
      (document.body.scroll = oldDocumentScroll),
      (canvas.style.imageRendering = oldImageRendering),
      canvas.GLctxObject &&
        canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight),
      currentFullscreenStrategy.canvasResizedCallback &&
        getWasmTableEntry(currentFullscreenStrategy.canvasResizedCallback)(
          37,
          0,
          currentFullscreenStrategy.canvasResizedCallbackUserData
        ));
  }
  return (
    document.addEventListener("fullscreenchange", restoreOldStyle),
    document.addEventListener("webkitfullscreenchange", restoreOldStyle),
    restoreOldStyle
  );
}
function setLetterbox(element, topBottom, leftRight) {
  (element.style.paddingLeft = element.style.paddingRight = leftRight + "px"),
    (element.style.paddingTop = element.style.paddingBottom = topBottom + "px");
}
function getBoundingClientRect(e) {
  return specialHTMLTargets.indexOf(e) < 0
    ? e.getBoundingClientRect()
    : { left: 0, top: 0 };
}
function requestPointerLock(target) {
  if (target.requestPointerLock) target.requestPointerLock();
  else {
    if (!target.msRequestPointerLock)
      return document.body.requestPointerLock ||
        document.body.msRequestPointerLock
        ? -3
        : -1;
    target.msRequestPointerLock();
  }
  return 0;
}
function _emscripten_exit_pointerlock() {
  if (
    (JSEvents.removeDeferredCalls(requestPointerLock), document.exitPointerLock)
  )
    document.exitPointerLock();
  else {
    if (!document.msExitPointerLock) return -1;
    document.msExitPointerLock();
  }
  return 0;
}
function _emscripten_get_device_pixel_ratio() {
  return ("number" == typeof devicePixelRatio && devicePixelRatio) || 1;
}
function _emscripten_get_element_css_size(target, width, height) {
  return (target = findEventTarget(target))
    ? ((target = getBoundingClientRect(target)),
      (HEAPF64[width >> 3] = target.width),
      (HEAPF64[height >> 3] = target.height),
      0)
    : -4;
}
function fillGamepadEventData(eventStruct, e) {
  HEAPF64[eventStruct >> 3] = e.timestamp;
  for (var i = 0; i < e.axes.length; ++i)
    HEAPF64[(eventStruct + 8 * i + 16) >> 3] = e.axes[i];
  for (i = 0; i < e.buttons.length; ++i)
    "object" == typeof e.buttons[i]
      ? (HEAPF64[(eventStruct + 8 * i + 528) >> 3] = e.buttons[i].value)
      : (HEAPF64[(eventStruct + 8 * i + 528) >> 3] = e.buttons[i]);
  for (i = 0; i < e.buttons.length; ++i)
    "object" == typeof e.buttons[i]
      ? (HEAP32[(eventStruct + 4 * i + 1040) >> 2] = e.buttons[i].pressed)
      : (HEAP32[(eventStruct + 4 * i + 1040) >> 2] = 1 == e.buttons[i]);
  (HEAP32[(eventStruct + 1296) >> 2] = e.connected),
    (HEAP32[(eventStruct + 1300) >> 2] = e.index),
    (HEAP32[(eventStruct + 8) >> 2] = e.axes.length),
    (HEAP32[(eventStruct + 12) >> 2] = e.buttons.length),
    stringToUTF8(e.id, eventStruct + 1304, 64),
    stringToUTF8(e.mapping, eventStruct + 1368, 64);
}
function _emscripten_get_gamepad_status(index, gamepadState) {
  return index < 0 || index >= JSEvents.lastGamepadState.length
    ? -5
    : JSEvents.lastGamepadState[index]
    ? (fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]), 0)
    : -7;
}
function _emscripten_get_num_gamepads() {
  return JSEvents.lastGamepadState.length;
}
function _emscripten_get_screen_size(width, height) {
  (HEAP32[width >> 2] = screen.width), (HEAP32[height >> 2] = screen.height);
}
function _emscripten_glActiveTexture(x0) {
  GLctx.activeTexture(x0);
}
function _emscripten_glAttachShader(program, shader) {
  GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}
function _emscripten_glBeginQueryEXT(target, id) {
  GLctx.disjointTimerQueryExt.beginQueryEXT(target, GL.queries[id]);
}
function _emscripten_glBindAttribLocation(program, index, name) {
  GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
}
function _emscripten_glBindBuffer(target, buffer) {
  GLctx.bindBuffer(target, GL.buffers[buffer]);
}
function _emscripten_glBindFramebuffer(target, framebuffer) {
  GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
}
function _emscripten_glBindRenderbuffer(target, renderbuffer) {
  GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
}
function _emscripten_glBindTexture(target, texture) {
  GLctx.bindTexture(target, GL.textures[texture]);
}
function _emscripten_glBindVertexArrayOES(vao) {
  GLctx.bindVertexArray(GL.vaos[vao]);
}
function _emscripten_glBlendColor(x0, x1, x2, x3) {
  GLctx.blendColor(x0, x1, x2, x3);
}
function _emscripten_glBlendEquation(x0) {
  GLctx.blendEquation(x0);
}
function _emscripten_glBlendEquationSeparate(x0, x1) {
  GLctx.blendEquationSeparate(x0, x1);
}
function _emscripten_glBlendFunc(x0, x1) {
  GLctx.blendFunc(x0, x1);
}
function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
  GLctx.blendFuncSeparate(x0, x1, x2, x3);
}
function _emscripten_glBufferData(target, size, data, usage) {
  GLctx.bufferData(
    target,
    data ? HEAPU8.subarray(data, data + size) : size,
    usage
  );
}
function _emscripten_glBufferSubData(target, offset, size, data) {
  GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}
function _emscripten_glCheckFramebufferStatus(x0) {
  return GLctx.checkFramebufferStatus(x0);
}
function _emscripten_glClear(x0) {
  GLctx.clear(x0);
}
function _emscripten_glClearColor(x0, x1, x2, x3) {
  GLctx.clearColor(x0, x1, x2, x3);
}
function _emscripten_glClearDepthf(x0) {
  GLctx.clearDepth(x0);
}
function _emscripten_glClearStencil(x0) {
  GLctx.clearStencil(x0);
}
function _emscripten_glColorMask(red, green, blue, alpha) {
  GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}
function _emscripten_glCompileShader(shader) {
  GLctx.compileShader(GL.shaders[shader]);
}
function _emscripten_glCompressedTexImage2D(
  target,
  level,
  internalFormat,
  width,
  height,
  border,
  imageSize,
  data
) {
  GLctx.compressedTexImage2D(
    target,
    level,
    internalFormat,
    width,
    height,
    border,
    data ? HEAPU8.subarray(data, data + imageSize) : null
  );
}
function _emscripten_glCompressedTexSubImage2D(
  target,
  level,
  xoffset,
  yoffset,
  width,
  height,
  format,
  imageSize,
  data
) {
  GLctx.compressedTexSubImage2D(
    target,
    level,
    xoffset,
    yoffset,
    width,
    height,
    format,
    data ? HEAPU8.subarray(data, data + imageSize) : null
  );
}
function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
  GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
}
function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
  GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
}
function _emscripten_glCreateProgram() {
  var id = GL.getNewId(GL.programs),
    program = GLctx.createProgram();
  return (
    (program.name = id),
    (program.maxUniformLength =
      program.maxAttributeLength =
      program.maxUniformBlockNameLength =
        0),
    (program.uniformIdCounter = 1),
    (GL.programs[id] = program),
    id
  );
}
function _emscripten_glCreateShader(shaderType) {
  var id = GL.getNewId(GL.shaders);
  return (GL.shaders[id] = GLctx.createShader(shaderType)), id;
}
function _emscripten_glCullFace(x0) {
  GLctx.cullFace(x0);
}
function _emscripten_glDeleteBuffers(n, buffers) {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(buffers + 4 * i) >> 2],
      buffer = GL.buffers[id];
    buffer &&
      (GLctx.deleteBuffer(buffer), (buffer.name = 0), (GL.buffers[id] = null));
  }
}
function _emscripten_glDeleteFramebuffers(n, framebuffers) {
  for (var i = 0; i < n; ++i) {
    var id = HEAP32[(framebuffers + 4 * i) >> 2],
      framebuffer = GL.framebuffers[id];
    framebuffer &&
      (GLctx.deleteFramebuffer(framebuffer),
      (framebuffer.name = 0),
      (GL.framebuffers[id] = null));
  }
}
function _emscripten_glDeleteProgram(id) {
  var program;
  id &&
    ((program = GL.programs[id])
      ? (GLctx.deleteProgram(program),
        (program.name = 0),
        (GL.programs[id] = null))
      : GL.recordError(1281));
}
function _emscripten_glDeleteQueriesEXT(n, ids) {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(ids + 4 * i) >> 2],
      query = GL.queries[id];
    query &&
      (GLctx.disjointTimerQueryExt.deleteQueryEXT(query),
      (GL.queries[id] = null));
  }
}
function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(renderbuffers + 4 * i) >> 2],
      renderbuffer = GL.renderbuffers[id];
    renderbuffer &&
      (GLctx.deleteRenderbuffer(renderbuffer),
      (renderbuffer.name = 0),
      (GL.renderbuffers[id] = null));
  }
}
function _emscripten_glDeleteShader(id) {
  var shader;
  id &&
    ((shader = GL.shaders[id])
      ? (GLctx.deleteShader(shader), (GL.shaders[id] = null))
      : GL.recordError(1281));
}
function _emscripten_glDeleteTextures(n, textures) {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(textures + 4 * i) >> 2],
      texture = GL.textures[id];
    texture &&
      (GLctx.deleteTexture(texture),
      (texture.name = 0),
      (GL.textures[id] = null));
  }
}
function _emscripten_glDeleteVertexArraysOES(n, vaos) {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(vaos + 4 * i) >> 2];
    GLctx.deleteVertexArray(GL.vaos[id]), (GL.vaos[id] = null);
  }
}
function _emscripten_glDepthFunc(x0) {
  GLctx.depthFunc(x0);
}
function _emscripten_glDepthMask(flag) {
  GLctx.depthMask(!!flag);
}
function _emscripten_glDepthRangef(x0, x1) {
  GLctx.depthRange(x0, x1);
}
function _emscripten_glDetachShader(program, shader) {
  GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}
function _emscripten_glDisable(x0) {
  GLctx.disable(x0);
}
function _emscripten_glDisableVertexAttribArray(index) {
  GLctx.disableVertexAttribArray(index);
}
function _emscripten_glDrawArrays(mode, first, count) {
  GLctx.drawArrays(mode, first, count);
}
function _emscripten_glDrawArraysInstancedANGLE(mode, first, count, primcount) {
  GLctx.drawArraysInstanced(mode, first, count, primcount);
}
var tempFixedLengthArray = [];
function _emscripten_glDrawBuffersWEBGL(n, bufs) {
  for (var bufArray = tempFixedLengthArray[n], i = 0; i < n; i++)
    bufArray[i] = HEAP32[(bufs + 4 * i) >> 2];
  GLctx.drawBuffers(bufArray);
}
function _emscripten_glDrawElements(mode, count, type, indices) {
  GLctx.drawElements(mode, count, type, indices);
}
function _emscripten_glDrawElementsInstancedANGLE(
  mode,
  count,
  type,
  indices,
  primcount
) {
  GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
}
function _emscripten_glEnable(x0) {
  GLctx.enable(x0);
}
function _emscripten_glEnableVertexAttribArray(index) {
  GLctx.enableVertexAttribArray(index);
}
function _emscripten_glEndQueryEXT(target) {
  GLctx.disjointTimerQueryExt.endQueryEXT(target);
}
function _emscripten_glFinish() {
  GLctx.finish();
}
function _emscripten_glFlush() {
  GLctx.flush();
}
function _emscripten_glFramebufferRenderbuffer(
  target,
  attachment,
  renderbuffertarget,
  renderbuffer
) {
  GLctx.framebufferRenderbuffer(
    target,
    attachment,
    renderbuffertarget,
    GL.renderbuffers[renderbuffer]
  );
}
function _emscripten_glFramebufferTexture2D(
  target,
  attachment,
  textarget,
  texture,
  level
) {
  GLctx.framebufferTexture2D(
    target,
    attachment,
    textarget,
    GL.textures[texture],
    level
  );
}
function _emscripten_glFrontFace(x0) {
  GLctx.frontFace(x0);
}
function __glGenObject(n, buffers, createFunction, objectTable) {
  for (var i = 0; i < n; i++) {
    var buffer = GLctx[createFunction](),
      id = buffer && GL.getNewId(objectTable);
    buffer ? (objectTable[(buffer.name = id)] = buffer) : GL.recordError(1282),
      (HEAP32[(buffers + 4 * i) >> 2] = id);
  }
}
function _emscripten_glGenBuffers(n, buffers) {
  __glGenObject(n, buffers, "createBuffer", GL.buffers);
}
function _emscripten_glGenFramebuffers(n, ids) {
  __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
}
function _emscripten_glGenQueriesEXT(n, ids) {
  for (var i = 0; i < n; i++) {
    var query = GLctx.disjointTimerQueryExt.createQueryEXT();
    if (!query) {
      for (GL.recordError(1282); i < n; ) HEAP32[(ids + 4 * i++) >> 2] = 0;
      return;
    }
    var id = GL.getNewId(GL.queries);
    (query.name = id),
      (GL.queries[id] = query),
      (HEAP32[(ids + 4 * i) >> 2] = id);
  }
}
function _emscripten_glGenRenderbuffers(n, renderbuffers) {
  __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}
function _emscripten_glGenTextures(n, textures) {
  __glGenObject(n, textures, "createTexture", GL.textures);
}
function _emscripten_glGenVertexArraysOES(n, arrays) {
  __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}
function _emscripten_glGenerateMipmap(x0) {
  GLctx.generateMipmap(x0);
}
function __glGetActiveAttribOrUniform(
  funcName,
  program,
  index,
  bufSize,
  length,
  size,
  type,
  name
) {
  program = GL.programs[program];
  funcName = GLctx[funcName](program, index);
  funcName &&
    ((program = name && stringToUTF8(funcName.name, name, bufSize)),
    length && (HEAP32[length >> 2] = program),
    size && (HEAP32[size >> 2] = funcName.size),
    type && (HEAP32[type >> 2] = funcName.type));
}
function _emscripten_glGetActiveAttrib(
  program,
  index,
  bufSize,
  length,
  size,
  type,
  name
) {
  __glGetActiveAttribOrUniform(
    "getActiveAttrib",
    program,
    index,
    bufSize,
    length,
    size,
    type,
    name
  );
}
function _emscripten_glGetActiveUniform(
  program,
  index,
  bufSize,
  length,
  size,
  type,
  name
) {
  __glGetActiveAttribOrUniform(
    "getActiveUniform",
    program,
    index,
    bufSize,
    length,
    size,
    type,
    name
  );
}
function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
  var result = GLctx.getAttachedShaders(GL.programs[program]),
    len = result.length;
  HEAP32[count >> 2] = len = maxCount < len ? maxCount : len;
  for (var i = 0; i < len; ++i) {
    var id = GL.shaders.indexOf(result[i]);
    HEAP32[(shaders + 4 * i) >> 2] = id;
  }
}
function _emscripten_glGetAttribLocation(program, name) {
  return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}
function writeI53ToI64(ptr, num) {
  (HEAPU32[ptr >> 2] = num),
    (HEAPU32[(ptr + 4) >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296);
}
function emscriptenWebGLGet(name_, p, type) {
  if (p) {
    var ret = void 0;
    switch (name_) {
      case 36346:
        ret = 1;
        break;
      case 36344:
        return void (0 != type && 1 != type && GL.recordError(1280));
      case 36345:
        ret = 0;
        break;
      case 34466:
        var formats = GLctx.getParameter(34467),
          ret = formats ? formats.length : 0;
    }
    if (void 0 === ret) {
      var result = GLctx.getParameter(name_);
      switch (typeof result) {
        case "number":
          ret = result;
          break;
        case "boolean":
          ret = result ? 1 : 0;
          break;
        case "string":
          return void GL.recordError(1280);
        case "object":
          if (null === result)
            switch (name_) {
              case 34964:
              case 35725:
              case 34965:
              case 36006:
              case 36007:
              case 32873:
              case 34229:
              case 34068:
                ret = 0;
                break;
              default:
                return void GL.recordError(1280);
            }
          else {
            if (
              result instanceof Float32Array ||
              result instanceof Uint32Array ||
              result instanceof Int32Array ||
              result instanceof Array
            ) {
              for (var i = 0; i < result.length; ++i)
                switch (type) {
                  case 0:
                    HEAP32[(p + 4 * i) >> 2] = result[i];
                    break;
                  case 2:
                    HEAPF32[(p + 4 * i) >> 2] = result[i];
                    break;
                  case 4:
                    HEAP8[(p + i) >> 0] = result[i] ? 1 : 0;
                }
              return;
            }
            try {
              ret = 0 | result.name;
            } catch (e) {
              return (
                GL.recordError(1280),
                void err(
                  "GL_INVALID_ENUM in glGet" +
                    type +
                    "v: Unknown object returned from WebGL getParameter(" +
                    name_ +
                    ")! (error: " +
                    e +
                    ")"
                )
              );
            }
          }
          break;
        default:
          return (
            GL.recordError(1280),
            void err(
              "GL_INVALID_ENUM in glGet" +
                type +
                "v: Native code calling glGet" +
                type +
                "v(" +
                name_ +
                ") and it returns " +
                result +
                " of type " +
                typeof result +
                "!"
            )
          );
      }
    }
    switch (type) {
      case 1:
        writeI53ToI64(p, ret);
        break;
      case 0:
        HEAP32[p >> 2] = ret;
        break;
      case 2:
        HEAPF32[p >> 2] = ret;
        break;
      case 4:
        HEAP8[p >> 0] = ret ? 1 : 0;
    }
  } else GL.recordError(1281);
}
function _emscripten_glGetBooleanv(name_, p) {
  emscriptenWebGLGet(name_, p, 4);
}
function _emscripten_glGetBufferParameteriv(target, value, data) {
  data
    ? (HEAP32[data >> 2] = GLctx.getBufferParameter(target, value))
    : GL.recordError(1281);
}
function _emscripten_glGetError() {
  var error = GLctx.getError() || GL.lastError;
  return (GL.lastError = 0), error;
}
function _emscripten_glGetFloatv(name_, p) {
  emscriptenWebGLGet(name_, p, 2);
}
function _emscripten_glGetFramebufferAttachmentParameteriv(
  target,
  attachment,
  pname,
  params
) {
  target = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
  (target instanceof WebGLRenderbuffer || target instanceof WebGLTexture) &&
    (target = 0 | target.name),
    (HEAP32[params >> 2] = target);
}
function _emscripten_glGetIntegerv(name_, p) {
  emscriptenWebGLGet(name_, p, 0);
}
function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
  (program = GLctx.getProgramInfoLog(GL.programs[program])),
    null === program && (program = "(unknown error)"),
    (program =
      0 < maxLength && infoLog ? stringToUTF8(program, infoLog, maxLength) : 0);
  length && (HEAP32[length >> 2] = program);
}
function _emscripten_glGetProgramiv(program, pname, p) {
  if (p)
    if (program >= GL.counter) GL.recordError(1281);
    else if (((program = GL.programs[program]), 35716 == pname)) {
      var log = GLctx.getProgramInfoLog(program);
      HEAP32[p >> 2] =
        (log = null === log ? "(unknown error)" : log).length + 1;
    } else if (35719 == pname) {
      if (!program.maxUniformLength)
        for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i)
          program.maxUniformLength = Math.max(
            program.maxUniformLength,
            GLctx.getActiveUniform(program, i).name.length + 1
          );
      HEAP32[p >> 2] = program.maxUniformLength;
    } else if (35722 == pname) {
      if (!program.maxAttributeLength)
        for (i = 0; i < GLctx.getProgramParameter(program, 35721); ++i)
          program.maxAttributeLength = Math.max(
            program.maxAttributeLength,
            GLctx.getActiveAttrib(program, i).name.length + 1
          );
      HEAP32[p >> 2] = program.maxAttributeLength;
    } else if (35381 == pname) {
      if (!program.maxUniformBlockNameLength)
        for (i = 0; i < GLctx.getProgramParameter(program, 35382); ++i)
          program.maxUniformBlockNameLength = Math.max(
            program.maxUniformBlockNameLength,
            GLctx.getActiveUniformBlockName(program, i).length + 1
          );
      HEAP32[p >> 2] = program.maxUniformBlockNameLength;
    } else HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
  else GL.recordError(1281);
}
function _emscripten_glGetQueryObjecti64vEXT(id, pname, params) {
  params
    ? ((id = GL.queries[id]),
      writeI53ToI64(
        params,
        "boolean" ==
          typeof (params = GLctx.disjointTimerQueryExt.getQueryObjectEXT(
            id,
            pname
          ))
          ? params
            ? 1
            : 0
          : params
      ))
    : GL.recordError(1281);
}
function _emscripten_glGetQueryObjectivEXT(id, pname, params) {
  params
    ? ((id = GL.queries[id]),
      (id = GLctx.disjointTimerQueryExt.getQueryObjectEXT(id, pname)),
      (HEAP32[params >> 2] = "boolean" == typeof id ? (id ? 1 : 0) : id))
    : GL.recordError(1281);
}
function _emscripten_glGetQueryObjectui64vEXT(id, pname, params) {
  params
    ? ((id = GL.queries[id]),
      writeI53ToI64(
        params,
        "boolean" ==
          typeof (params = GLctx.disjointTimerQueryExt.getQueryObjectEXT(
            id,
            pname
          ))
          ? params
            ? 1
            : 0
          : params
      ))
    : GL.recordError(1281);
}
function _emscripten_glGetQueryObjectuivEXT(id, pname, params) {
  params
    ? ((id = GL.queries[id]),
      (id = GLctx.disjointTimerQueryExt.getQueryObjectEXT(id, pname)),
      (HEAP32[params >> 2] = "boolean" == typeof id ? (id ? 1 : 0) : id))
    : GL.recordError(1281);
}
function _emscripten_glGetQueryivEXT(target, pname, params) {
  params
    ? (HEAP32[params >> 2] = GLctx.disjointTimerQueryExt.getQueryEXT(
        target,
        pname
      ))
    : GL.recordError(1281);
}
function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
  params
    ? (HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname))
    : GL.recordError(1281);
}
function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
  (shader = GLctx.getShaderInfoLog(GL.shaders[shader])),
    null === shader && (shader = "(unknown error)"),
    (shader =
      0 < maxLength && infoLog ? stringToUTF8(shader, infoLog, maxLength) : 0);
  length && (HEAP32[length >> 2] = shader);
}
function _emscripten_glGetShaderPrecisionFormat(
  shaderType,
  precisionType,
  range,
  precision
) {
  shaderType = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
  (HEAP32[range >> 2] = shaderType.rangeMin),
    (HEAP32[(range + 4) >> 2] = shaderType.rangeMax),
    (HEAP32[precision >> 2] = shaderType.precision);
}
function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
  var shader = GLctx.getShaderSource(GL.shaders[shader]);
  shader &&
    ((shader =
      0 < bufSize && source ? stringToUTF8(shader, source, bufSize) : 0),
    length && (HEAP32[length >> 2] = shader));
}
function _emscripten_glGetShaderiv(shader, pname, p) {
  var log;
  p
    ? 35716 == pname
      ? ((log = (log =
          null === (log = GLctx.getShaderInfoLog(GL.shaders[shader]))
            ? "(unknown error)"
            : log)
          ? log.length + 1
          : 0),
        (HEAP32[p >> 2] = log))
      : 35720 == pname
      ? ((log = (log = GLctx.getShaderSource(GL.shaders[shader]))
          ? log.length + 1
          : 0),
        (HEAP32[p >> 2] = log))
      : (HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname))
    : GL.recordError(1281);
}
function stringToNewUTF8(jsString) {
  var length = lengthBytesUTF8(jsString) + 1,
    cString = _malloc(length);
  return stringToUTF8(jsString, cString, length), cString;
}
function _emscripten_glGetString(name_) {
  if (!(ret = GL.stringCache[name_])) {
    switch (name_) {
      case 7939:
        var exts = GLctx.getSupportedExtensions() || [],
          ret = stringToNewUTF8(
            (exts = exts.concat(
              exts.map(function (e) {
                return "GL_" + e;
              })
            )).join(" ")
          );
        break;
      case 7936:
      case 7937:
      case 37445:
      case 37446:
        exts = GLctx.getParameter(name_);
        exts || GL.recordError(1280), (ret = exts && stringToNewUTF8(exts));
        break;
      case 7938:
        ret = stringToNewUTF8(
          "OpenGL ES 2.0 (" + GLctx.getParameter(7938) + ")"
        );
        break;
      case 35724:
        var exts = GLctx.getParameter(35724),
          ver_num = exts.match(/^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/);
        null !== ver_num &&
          (3 == ver_num[1].length && (ver_num[1] = ver_num[1] + "0"),
          (exts = "OpenGL ES GLSL ES " + ver_num[1] + " (" + exts + ")")),
          (ret = stringToNewUTF8(exts));
        break;
      default:
        GL.recordError(1280);
    }
    GL.stringCache[name_] = ret;
  }
  return ret;
}
function _emscripten_glGetTexParameterfv(target, pname, params) {
  params
    ? (HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname))
    : GL.recordError(1281);
}
function _emscripten_glGetTexParameteriv(target, pname, params) {
  params
    ? (HEAP32[params >> 2] = GLctx.getTexParameter(target, pname))
    : GL.recordError(1281);
}
function webglGetLeftBracePos(name) {
  return "]" == name.slice(-1) && name.lastIndexOf("[");
}
function webglPrepareUniformLocationsBeforeFirstUse(program) {
  var i,
    j,
    uniformLocsById = program.uniformLocsById,
    uniformSizeAndIdsByName = program.uniformSizeAndIdsByName;
  if (!uniformLocsById)
    for (
      program.uniformLocsById = uniformLocsById = {},
        program.uniformArrayNamesById = {},
        i = 0;
      i < GLctx.getProgramParameter(program, 35718);
      ++i
    ) {
      var u = GLctx.getActiveUniform(program, i),
        nm = u.name,
        sz = u.size,
        u = webglGetLeftBracePos(nm),
        arrayName = 0 < u ? nm.slice(0, u) : nm,
        id = program.uniformIdCounter;
      for (
        program.uniformIdCounter += sz,
          uniformSizeAndIdsByName[arrayName] = [sz, id],
          j = 0;
        j < sz;
        ++j
      )
        (uniformLocsById[id] = j),
          (program.uniformArrayNamesById[id++] = arrayName);
    }
}
function _emscripten_glGetUniformLocation(program, name) {
  if (((name = UTF8ToString(name)), (program = GL.programs[program]))) {
    webglPrepareUniformLocationsBeforeFirstUse(program);
    var uniformLocsById = program.uniformLocsById,
      arrayIndex = 0,
      uniformBaseName = name,
      leftBrace = webglGetLeftBracePos(name),
      leftBrace =
        (0 < leftBrace &&
          ((arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0),
          (uniformBaseName = name.slice(0, leftBrace))),
        program.uniformSizeAndIdsByName[uniformBaseName]);
    if (
      leftBrace &&
      arrayIndex < leftBrace[0] &&
      (uniformLocsById[(arrayIndex += leftBrace[1])] =
        uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))
    )
      return arrayIndex;
  } else GL.recordError(1281);
  return -1;
}
function webglGetUniformLocation(location) {
  var webglLoc,
    p = GLctx.currentProgram;
  if (p)
    return (
      "number" == typeof (webglLoc = p.uniformLocsById[location]) &&
        (p.uniformLocsById[location] = webglLoc =
          GLctx.getUniformLocation(
            p,
            p.uniformArrayNamesById[location] +
              (0 < webglLoc ? "[" + webglLoc + "]" : "")
          )),
      webglLoc
    );
  GL.recordError(1282);
}
function emscriptenWebGLGetUniform(program, location, params, type) {
  if (params) {
    webglPrepareUniformLocationsBeforeFirstUse(
      (program = GL.programs[program])
    );
    var data = GLctx.getUniform(program, webglGetUniformLocation(location));
    if ("number" == typeof data || "boolean" == typeof data)
      switch (type) {
        case 0:
          HEAP32[params >> 2] = data;
          break;
        case 2:
          HEAPF32[params >> 2] = data;
      }
    else
      for (var i = 0; i < data.length; i++)
        switch (type) {
          case 0:
            HEAP32[(params + 4 * i) >> 2] = data[i];
            break;
          case 2:
            HEAPF32[(params + 4 * i) >> 2] = data[i];
        }
  } else GL.recordError(1281);
}
function _emscripten_glGetUniformfv(program, location, params) {
  emscriptenWebGLGetUniform(program, location, params, 2);
}
function _emscripten_glGetUniformiv(program, location, params) {
  emscriptenWebGLGetUniform(program, location, params, 0);
}
function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
  pointer
    ? (HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname))
    : GL.recordError(1281);
}
function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
  if (params) {
    var data = GLctx.getVertexAttrib(index, pname);
    if (34975 == pname) HEAP32[params >> 2] = data && data.name;
    else if ("number" == typeof data || "boolean" == typeof data)
      switch (type) {
        case 0:
          HEAP32[params >> 2] = data;
          break;
        case 2:
          HEAPF32[params >> 2] = data;
          break;
        case 5:
          HEAP32[params >> 2] = Math.fround(data);
      }
    else
      for (var i = 0; i < data.length; i++)
        switch (type) {
          case 0:
            HEAP32[(params + 4 * i) >> 2] = data[i];
            break;
          case 2:
            HEAPF32[(params + 4 * i) >> 2] = data[i];
            break;
          case 5:
            HEAP32[(params + 4 * i) >> 2] = Math.fround(data[i]);
        }
  } else GL.recordError(1281);
}
function _emscripten_glGetVertexAttribfv(index, pname, params) {
  emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
}
function _emscripten_glGetVertexAttribiv(index, pname, params) {
  emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
}
function _emscripten_glHint(x0, x1) {
  GLctx.hint(x0, x1);
}
function _emscripten_glIsBuffer(buffer) {
  buffer = GL.buffers[buffer];
  return buffer ? GLctx.isBuffer(buffer) : 0;
}
function _emscripten_glIsEnabled(x0) {
  return GLctx.isEnabled(x0);
}
function _emscripten_glIsFramebuffer(framebuffer) {
  framebuffer = GL.framebuffers[framebuffer];
  return framebuffer ? GLctx.isFramebuffer(framebuffer) : 0;
}
function _emscripten_glIsProgram(program) {
  return (program = GL.programs[program]) ? GLctx.isProgram(program) : 0;
}
function _emscripten_glIsQueryEXT(id) {
  id = GL.queries[id];
  return id ? GLctx.disjointTimerQueryExt.isQueryEXT(id) : 0;
}
function _emscripten_glIsRenderbuffer(renderbuffer) {
  renderbuffer = GL.renderbuffers[renderbuffer];
  return renderbuffer ? GLctx.isRenderbuffer(renderbuffer) : 0;
}
function _emscripten_glIsShader(shader) {
  shader = GL.shaders[shader];
  return shader ? GLctx.isShader(shader) : 0;
}
function _emscripten_glIsTexture(id) {
  id = GL.textures[id];
  return id ? GLctx.isTexture(id) : 0;
}
function _emscripten_glIsVertexArrayOES(array) {
  array = GL.vaos[array];
  return array ? GLctx.isVertexArray(array) : 0;
}
function _emscripten_glLineWidth(x0) {
  GLctx.lineWidth(x0);
}
function _emscripten_glLinkProgram(program) {
  (program = GL.programs[program]),
    GLctx.linkProgram(program),
    (program.uniformLocsById = 0),
    (program.uniformSizeAndIdsByName = {});
}
function _emscripten_glPixelStorei(pname, param) {
  3317 == pname && (GL.unpackAlignment = param),
    GLctx.pixelStorei(pname, param);
}
function _emscripten_glPolygonOffset(x0, x1) {
  GLctx.polygonOffset(x0, x1);
}
function _emscripten_glQueryCounterEXT(id, target) {
  GLctx.disjointTimerQueryExt.queryCounterEXT(GL.queries[id], target);
}
function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
  return height * ((width * sizePerPixel + alignment - 1) & -alignment);
}
function __colorChannelsInGlTextureFormat(format) {
  return { 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4 }[format - 6402] || 1;
}
function heapObjectForWebGLType(type) {
  return 1 == (type -= 5120)
    ? HEAPU8
    : 4 == type
    ? HEAP32
    : 6 == type
    ? HEAPF32
    : 5 == type || 28922 == type
    ? HEAPU32
    : HEAPU16;
}
function heapAccessShiftForWebGLHeap(heap) {
  return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
}
function emscriptenWebGLGetTexPixelData(
  type,
  format,
  width,
  height,
  pixels,
  internalFormat
) {
  var type = heapObjectForWebGLType(type),
    shift = heapAccessShiftForWebGLHeap(type),
    byteSize = 1 << shift,
    width = computeUnpackAlignedImageSize(
      width,
      height,
      __colorChannelsInGlTextureFormat(format) * byteSize,
      GL.unpackAlignment
    );
  return type.subarray(pixels >> shift, (pixels + width) >> shift);
}
function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
  pixels = emscriptenWebGLGetTexPixelData(
    type,
    format,
    width,
    height,
    pixels,
    format
  );
  pixels
    ? GLctx.readPixels(x, y, width, height, format, type, pixels)
    : GL.recordError(1280);
}
function _emscripten_glReleaseShaderCompiler() {}
function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
  GLctx.renderbufferStorage(x0, x1, x2, x3);
}
function _emscripten_glSampleCoverage(value, invert) {
  GLctx.sampleCoverage(value, !!invert);
}
function _emscripten_glScissor(x0, x1, x2, x3) {
  GLctx.scissor(x0, x1, x2, x3);
}
function _emscripten_glShaderBinary() {
  GL.recordError(1280);
}
function _emscripten_glShaderSource(shader, count, string, length) {
  count = GL.getSource(shader, count, string, length);
  GLctx.shaderSource(GL.shaders[shader], count);
}
function _emscripten_glStencilFunc(x0, x1, x2) {
  GLctx.stencilFunc(x0, x1, x2);
}
function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
  GLctx.stencilFuncSeparate(x0, x1, x2, x3);
}
function _emscripten_glStencilMask(x0) {
  GLctx.stencilMask(x0);
}
function _emscripten_glStencilMaskSeparate(x0, x1) {
  GLctx.stencilMaskSeparate(x0, x1);
}
function _emscripten_glStencilOp(x0, x1, x2) {
  GLctx.stencilOp(x0, x1, x2);
}
function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
  GLctx.stencilOpSeparate(x0, x1, x2, x3);
}
function _emscripten_glTexImage2D(
  target,
  level,
  internalFormat,
  width,
  height,
  border,
  format,
  type,
  pixels
) {
  GLctx.texImage2D(
    target,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    pixels
      ? emscriptenWebGLGetTexPixelData(
          type,
          format,
          width,
          height,
          pixels,
          internalFormat
        )
      : null
  );
}
function _emscripten_glTexParameterf(x0, x1, x2) {
  GLctx.texParameterf(x0, x1, x2);
}
function _emscripten_glTexParameterfv(target, pname, params) {
  params = HEAPF32[params >> 2];
  GLctx.texParameterf(target, pname, params);
}
function _emscripten_glTexParameteri(x0, x1, x2) {
  GLctx.texParameteri(x0, x1, x2);
}
function _emscripten_glTexParameteriv(target, pname, params) {
  params = HEAP32[params >> 2];
  GLctx.texParameteri(target, pname, params);
}
function _emscripten_glTexSubImage2D(
  target,
  level,
  xoffset,
  yoffset,
  width,
  height,
  format,
  type,
  pixels
) {
  var pixelData = null;
  pixels &&
    (pixelData = emscriptenWebGLGetTexPixelData(
      type,
      format,
      width,
      height,
      pixels,
      0
    )),
    GLctx.texSubImage2D(
      target,
      level,
      xoffset,
      yoffset,
      width,
      height,
      format,
      type,
      pixelData
    );
}
function _emscripten_glUniform1f(location, v0) {
  GLctx.uniform1f(webglGetUniformLocation(location), v0);
}
var miniTempWebGLFloatBuffers = [];
function _emscripten_glUniform1fv(location, count, value) {
  if (count <= 288)
    for (var view = miniTempWebGLFloatBuffers[count - 1], i = 0; i < count; ++i)
      view[i] = HEAPF32[(value + 4 * i) >> 2];
  else view = HEAPF32.subarray(value >> 2, (value + 4 * count) >> 2);
  GLctx.uniform1fv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform1i(location, v0) {
  GLctx.uniform1i(webglGetUniformLocation(location), v0);
}
var __miniTempWebGLIntBuffers = [];
function _emscripten_glUniform1iv(location, count, value) {
  if (count <= 288)
    for (var view = __miniTempWebGLIntBuffers[count - 1], i = 0; i < count; ++i)
      view[i] = HEAP32[(value + 4 * i) >> 2];
  else view = HEAP32.subarray(value >> 2, (value + 4 * count) >> 2);
  GLctx.uniform1iv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform2f(location, v0, v1) {
  GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
}
function _emscripten_glUniform2fv(location, count, value) {
  if (count <= 144)
    for (
      var view = miniTempWebGLFloatBuffers[2 * count - 1], i = 0;
      i < 2 * count;
      i += 2
    )
      (view[i] = HEAPF32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2]);
  else view = HEAPF32.subarray(value >> 2, (value + 8 * count) >> 2);
  GLctx.uniform2fv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform2i(location, v0, v1) {
  GLctx.uniform2i(webglGetUniformLocation(location), v0, v1);
}
function _emscripten_glUniform2iv(location, count, value) {
  if (count <= 144)
    for (
      var view = __miniTempWebGLIntBuffers[2 * count - 1], i = 0;
      i < 2 * count;
      i += 2
    )
      (view[i] = HEAP32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAP32[(value + (4 * i + 4)) >> 2]);
  else view = HEAP32.subarray(value >> 2, (value + 8 * count) >> 2);
  GLctx.uniform2iv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform3f(location, v0, v1, v2) {
  GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
}
function _emscripten_glUniform3fv(location, count, value) {
  if (count <= 96)
    for (
      var view = miniTempWebGLFloatBuffers[3 * count - 1], i = 0;
      i < 3 * count;
      i += 3
    )
      (view[i] = HEAPF32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2]),
        (view[i + 2] = HEAPF32[(value + (4 * i + 8)) >> 2]);
  else view = HEAPF32.subarray(value >> 2, (value + 12 * count) >> 2);
  GLctx.uniform3fv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform3i(location, v0, v1, v2) {
  GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2);
}
function _emscripten_glUniform3iv(location, count, value) {
  if (count <= 96)
    for (
      var view = __miniTempWebGLIntBuffers[3 * count - 1], i = 0;
      i < 3 * count;
      i += 3
    )
      (view[i] = HEAP32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAP32[(value + (4 * i + 4)) >> 2]),
        (view[i + 2] = HEAP32[(value + (4 * i + 8)) >> 2]);
  else view = HEAP32.subarray(value >> 2, (value + 12 * count) >> 2);
  GLctx.uniform3iv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
  GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
}
function _emscripten_glUniform4fv(location, count, value) {
  if (count <= 72) {
    var view = miniTempWebGLFloatBuffers[4 * count - 1],
      heap = HEAPF32;
    value >>= 2;
    for (var i = 0; i < 4 * count; i += 4) {
      var dst = value + i;
      (view[i] = heap[dst]),
        (view[i + 1] = heap[dst + 1]),
        (view[i + 2] = heap[dst + 2]),
        (view[i + 3] = heap[dst + 3]);
    }
  } else view = HEAPF32.subarray(value >> 2, (value + 16 * count) >> 2);
  GLctx.uniform4fv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
  GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3);
}
function _emscripten_glUniform4iv(location, count, value) {
  if (count <= 72)
    for (
      var view = __miniTempWebGLIntBuffers[4 * count - 1], i = 0;
      i < 4 * count;
      i += 4
    )
      (view[i] = HEAP32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAP32[(value + (4 * i + 4)) >> 2]),
        (view[i + 2] = HEAP32[(value + (4 * i + 8)) >> 2]),
        (view[i + 3] = HEAP32[(value + (4 * i + 12)) >> 2]);
  else view = HEAP32.subarray(value >> 2, (value + 16 * count) >> 2);
  GLctx.uniform4iv(webglGetUniformLocation(location), view);
}
function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
  if (count <= 72)
    for (
      var view = miniTempWebGLFloatBuffers[4 * count - 1], i = 0;
      i < 4 * count;
      i += 4
    )
      (view[i] = HEAPF32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2]),
        (view[i + 2] = HEAPF32[(value + (4 * i + 8)) >> 2]),
        (view[i + 3] = HEAPF32[(value + (4 * i + 12)) >> 2]);
  else view = HEAPF32.subarray(value >> 2, (value + 16 * count) >> 2);
  GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, view);
}
function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
  if (count <= 32)
    for (
      var view = miniTempWebGLFloatBuffers[9 * count - 1], i = 0;
      i < 9 * count;
      i += 9
    )
      (view[i] = HEAPF32[(value + 4 * i) >> 2]),
        (view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2]),
        (view[i + 2] = HEAPF32[(value + (4 * i + 8)) >> 2]),
        (view[i + 3] = HEAPF32[(value + (4 * i + 12)) >> 2]),
        (view[i + 4] = HEAPF32[(value + (4 * i + 16)) >> 2]),
        (view[i + 5] = HEAPF32[(value + (4 * i + 20)) >> 2]),
        (view[i + 6] = HEAPF32[(value + (4 * i + 24)) >> 2]),
        (view[i + 7] = HEAPF32[(value + (4 * i + 28)) >> 2]),
        (view[i + 8] = HEAPF32[(value + (4 * i + 32)) >> 2]);
  else view = HEAPF32.subarray(value >> 2, (value + 36 * count) >> 2);
  GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view);
}
function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
  if (count <= 18) {
    var view = miniTempWebGLFloatBuffers[16 * count - 1],
      heap = HEAPF32;
    value >>= 2;
    for (var i = 0; i < 16 * count; i += 16) {
      var dst = value + i;
      (view[i] = heap[dst]),
        (view[i + 1] = heap[dst + 1]),
        (view[i + 2] = heap[dst + 2]),
        (view[i + 3] = heap[dst + 3]),
        (view[i + 4] = heap[dst + 4]),
        (view[i + 5] = heap[dst + 5]),
        (view[i + 6] = heap[dst + 6]),
        (view[i + 7] = heap[dst + 7]),
        (view[i + 8] = heap[dst + 8]),
        (view[i + 9] = heap[dst + 9]),
        (view[i + 10] = heap[dst + 10]),
        (view[i + 11] = heap[dst + 11]),
        (view[i + 12] = heap[dst + 12]),
        (view[i + 13] = heap[dst + 13]),
        (view[i + 14] = heap[dst + 14]),
        (view[i + 15] = heap[dst + 15]);
    }
  } else view = HEAPF32.subarray(value >> 2, (value + 64 * count) >> 2);
  GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
}
function _emscripten_glUseProgram(program) {
  (program = GL.programs[program]),
    GLctx.useProgram(program),
    (GLctx.currentProgram = program);
}
function _emscripten_glValidateProgram(program) {
  GLctx.validateProgram(GL.programs[program]);
}
function _emscripten_glVertexAttrib1f(x0, x1) {
  GLctx.vertexAttrib1f(x0, x1);
}
function _emscripten_glVertexAttrib1fv(index, v) {
  GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
}
function _emscripten_glVertexAttrib2f(x0, x1, x2) {
  GLctx.vertexAttrib2f(x0, x1, x2);
}
function _emscripten_glVertexAttrib2fv(index, v) {
  GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[(v + 4) >> 2]);
}
function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
  GLctx.vertexAttrib3f(x0, x1, x2, x3);
}
function _emscripten_glVertexAttrib3fv(index, v) {
  GLctx.vertexAttrib3f(
    index,
    HEAPF32[v >> 2],
    HEAPF32[(v + 4) >> 2],
    HEAPF32[(v + 8) >> 2]
  );
}
function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
  GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
}
function _emscripten_glVertexAttrib4fv(index, v) {
  GLctx.vertexAttrib4f(
    index,
    HEAPF32[v >> 2],
    HEAPF32[(v + 4) >> 2],
    HEAPF32[(v + 8) >> 2],
    HEAPF32[(v + 12) >> 2]
  );
}
function _emscripten_glVertexAttribDivisorANGLE(index, divisor) {
  GLctx.vertexAttribDivisor(index, divisor);
}
function _emscripten_glVertexAttribPointer(
  index,
  size,
  type,
  normalized,
  stride,
  ptr
) {
  GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}
function _emscripten_glViewport(x0, x1, x2, x3) {
  GLctx.viewport(x0, x1, x2, x3);
}
function _emscripten_has_asyncify() {
  return !1;
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num);
}
function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
  return (target = findEventTarget(target))
    ? target.requestPointerLock || target.msRequestPointerLock
      ? JSEvents.canPerformEventHandlerRequests()
        ? requestPointerLock(target)
        : deferUntilInEventHandler
        ? (JSEvents.deferCall(requestPointerLock, 2, [target]), 1)
        : -2
      : -1
    : -4;
}
function abortOnCannotGrowMemory(requestedSize) {
  abort("OOM");
}
function _emscripten_resize_heap(requestedSize) {
  HEAPU8.length;
  abortOnCannotGrowMemory((requestedSize >>>= 0));
}
function _emscripten_sample_gamepad_data() {
  return (JSEvents.lastGamepadState = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads
    ? navigator.webkitGetGamepads()
    : null)
    ? 0
    : -1;
}
function registerBeforeUnloadEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString
) {
  target = {
    target: findEventTarget(target),
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        confirmationMessage = getWasmTableEntry(callbackfunc)(
          eventTypeId,
          0,
          userData
        );
      if (
        (confirmationMessage =
          confirmationMessage && UTF8ToString(confirmationMessage))
      )
        return ev.preventDefault(), (ev.returnValue = confirmationMessage);
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(target);
}
function _emscripten_set_beforeunload_callback_on_thread(
  userData,
  callbackfunc,
  targetThread
) {
  return "undefined" == typeof onbeforeunload
    ? -1
    : 1 !== targetThread
    ? -5
    : (registerBeforeUnloadEventCallback(
        2,
        userData,
        !0,
        callbackfunc,
        28,
        "beforeunload"
      ),
      0);
}
function registerFocusEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.focusEvent || (JSEvents.focusEvent = _malloc(256));
  target = {
    target: findEventTarget(target),
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        nodeName = JSEvents.getNodeNameForTarget(ev.target),
        id = ev.target.id || "",
        focusEvent = JSEvents.focusEvent;
      stringToUTF8(nodeName, focusEvent + 0, 128),
        stringToUTF8(id, focusEvent + 128, 128),
        getWasmTableEntry(callbackfunc)(eventTypeId, focusEvent, userData) &&
          ev.preventDefault();
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(target);
}
function _emscripten_set_blur_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerFocusEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      12,
      "blur",
      targetThread
    ),
    0
  );
}
function _emscripten_set_element_css_size(target, width, height) {
  return (target = findEventTarget(target))
    ? ((target.style.width = width + "px"),
      (target.style.height = height + "px"),
      0)
    : -4;
}
function _emscripten_set_focus_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerFocusEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      13,
      "focus",
      targetThread
    ),
    0
  );
}
function fillFullscreenChangeEventData(eventStruct) {
  var fullscreenElement =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement,
    isFullscreen = !!fullscreenElement,
    reportedElement =
      ((HEAP32[eventStruct >> 2] = isFullscreen),
      (HEAP32[(eventStruct + 4) >> 2] = JSEvents.fullscreenEnabled()),
      isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement),
    nodeName = JSEvents.getNodeNameForTarget(reportedElement),
    id = reportedElement && reportedElement.id ? reportedElement.id : "";
  stringToUTF8(nodeName, eventStruct + 8, 128),
    stringToUTF8(id, eventStruct + 136, 128),
    (HEAP32[(eventStruct + 264) >> 2] = reportedElement
      ? reportedElement.clientWidth
      : 0),
    (HEAP32[(eventStruct + 268) >> 2] = reportedElement
      ? reportedElement.clientHeight
      : 0),
    (HEAP32[(eventStruct + 272) >> 2] = screen.width),
    (HEAP32[(eventStruct + 276) >> 2] = screen.height),
    isFullscreen && (JSEvents.previousFullscreenElement = fullscreenElement);
}
function registerFullscreenChangeEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.fullscreenChangeEvent ||
    (JSEvents.fullscreenChangeEvent = _malloc(280));
  JSEvents.registerOrRemoveHandler({
    target: target,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
      fillFullscreenChangeEventData(fullscreenChangeEvent),
        getWasmTableEntry(callbackfunc)(
          eventTypeId,
          fullscreenChangeEvent,
          userData
        ) && ev.preventDefault();
    },
    useCapture: useCapture,
  });
}
function _emscripten_set_fullscreenchange_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return JSEvents.fullscreenEnabled()
    ? (target = findEventTarget(target))
      ? (registerFullscreenChangeEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          19,
          "fullscreenchange",
          targetThread
        ),
        registerFullscreenChangeEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          19,
          "webkitfullscreenchange",
          targetThread
        ),
        0)
      : -4
    : -1;
}
function registerGamepadEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.gamepadEvent || (JSEvents.gamepadEvent = _malloc(1432));
  target = {
    target: findEventTarget(target),
    allowsDeferredCalls: !0,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        gamepadEvent = JSEvents.gamepadEvent;
      fillGamepadEventData(gamepadEvent, ev.gamepad),
        getWasmTableEntry(callbackfunc)(eventTypeId, gamepadEvent, userData) &&
          ev.preventDefault();
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(target);
}
function _emscripten_set_gamepadconnected_callback_on_thread(
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return navigator.getGamepads || navigator.webkitGetGamepads
    ? (registerGamepadEventCallback(
        2,
        userData,
        useCapture,
        callbackfunc,
        26,
        "gamepadconnected",
        targetThread
      ),
      0)
    : -1;
}
function _emscripten_set_gamepaddisconnected_callback_on_thread(
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return navigator.getGamepads || navigator.webkitGetGamepads
    ? (registerGamepadEventCallback(
        2,
        userData,
        useCapture,
        callbackfunc,
        27,
        "gamepaddisconnected",
        targetThread
      ),
      0)
    : -1;
}
function registerKeyEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.keyEvent || (JSEvents.keyEvent = _malloc(176));
  target = {
    target: findEventTarget(target),
    allowsDeferredCalls: !0,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (e) {
      var keyEventData = JSEvents.keyEvent,
        idx = ((HEAPF64[keyEventData >> 3] = e.timeStamp), keyEventData >> 2);
      (HEAP32[2 + idx] = e.location),
        (HEAP32[3 + idx] = e.ctrlKey),
        (HEAP32[4 + idx] = e.shiftKey),
        (HEAP32[5 + idx] = e.altKey),
        (HEAP32[6 + idx] = e.metaKey),
        (HEAP32[7 + idx] = e.repeat),
        (HEAP32[8 + idx] = e.charCode),
        (HEAP32[9 + idx] = e.keyCode),
        (HEAP32[10 + idx] = e.which),
        stringToUTF8(e.key || "", keyEventData + 44, 32),
        stringToUTF8(e.code || "", keyEventData + 76, 32),
        stringToUTF8(e.char || "", keyEventData + 108, 32),
        stringToUTF8(e.locale || "", keyEventData + 140, 32),
        getWasmTableEntry(callbackfunc)(eventTypeId, keyEventData, userData) &&
          e.preventDefault();
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(target);
}
function _emscripten_set_keydown_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerKeyEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      2,
      "keydown",
      targetThread
    ),
    0
  );
}
function _emscripten_set_keypress_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerKeyEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      1,
      "keypress",
      targetThread
    ),
    0
  );
}
function _emscripten_set_keyup_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerKeyEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      3,
      "keyup",
      targetThread
    ),
    0
  );
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
  setMainLoop(getWasmTableEntry(func), fps, simulateInfiniteLoop);
}
function fillMouseEventData(eventStruct, e, target) {
  HEAPF64[eventStruct >> 3] = e.timeStamp;
  (eventStruct >>= 2),
    (HEAP32[2 + eventStruct] = e.screenX),
    (HEAP32[3 + eventStruct] = e.screenY),
    (HEAP32[4 + eventStruct] = e.clientX),
    (HEAP32[5 + eventStruct] = e.clientY),
    (HEAP32[6 + eventStruct] = e.ctrlKey),
    (HEAP32[7 + eventStruct] = e.shiftKey),
    (HEAP32[8 + eventStruct] = e.altKey),
    (HEAP32[9 + eventStruct] = e.metaKey),
    (HEAP16[2 * eventStruct + 20] = e.button),
    (HEAP16[2 * eventStruct + 21] = e.buttons),
    (HEAP32[11 + eventStruct] = e.movementX),
    (HEAP32[12 + eventStruct] = e.movementY),
    (target = getBoundingClientRect(target));
  (HEAP32[13 + eventStruct] = e.clientX - target.left),
    (HEAP32[14 + eventStruct] = e.clientY - target.top);
}
function registerMouseEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.mouseEvent || (JSEvents.mouseEvent = _malloc(72));
  eventTypeString = {
    target: (target = findEventTarget(target)),
    allowsDeferredCalls:
      "mousemove" != eventTypeString &&
      "mouseenter" != eventTypeString &&
      "mouseleave" != eventTypeString,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      ev = ev || window.event;
      fillMouseEventData(JSEvents.mouseEvent, ev, target),
        getWasmTableEntry(callbackfunc)(
          eventTypeId,
          JSEvents.mouseEvent,
          userData
        ) && ev.preventDefault();
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(eventTypeString);
}
function _emscripten_set_mousedown_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerMouseEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      5,
      "mousedown",
      targetThread
    ),
    0
  );
}
function _emscripten_set_mouseenter_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerMouseEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      33,
      "mouseenter",
      targetThread
    ),
    0
  );
}
function _emscripten_set_mouseleave_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerMouseEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      34,
      "mouseleave",
      targetThread
    ),
    0
  );
}
function _emscripten_set_mousemove_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerMouseEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      8,
      "mousemove",
      targetThread
    ),
    0
  );
}
function _emscripten_set_mouseup_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerMouseEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      6,
      "mouseup",
      targetThread
    ),
    0
  );
}
function fillPointerlockChangeEventData(eventStruct) {
  var pointerLockElement =
      document.pointerLockElement ||
      document.mozPointerLockElement ||
      document.webkitPointerLockElement ||
      document.msPointerLockElement,
    nodeName =
      ((HEAP32[eventStruct >> 2] = !!pointerLockElement),
      JSEvents.getNodeNameForTarget(pointerLockElement)),
    pointerLockElement =
      pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
  stringToUTF8(nodeName, eventStruct + 4, 128),
    stringToUTF8(pointerLockElement, eventStruct + 132, 128);
}
function registerPointerlockChangeEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.pointerlockChangeEvent ||
    (JSEvents.pointerlockChangeEvent = _malloc(260));
  JSEvents.registerOrRemoveHandler({
    target: target,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
      fillPointerlockChangeEventData(pointerlockChangeEvent),
        getWasmTableEntry(callbackfunc)(
          eventTypeId,
          pointerlockChangeEvent,
          userData
        ) && ev.preventDefault();
    },
    useCapture: useCapture,
  });
}
function _emscripten_set_pointerlockchange_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return document &&
    document.body &&
    (document.body.requestPointerLock ||
      document.body.mozRequestPointerLock ||
      document.body.webkitRequestPointerLock ||
      document.body.msRequestPointerLock)
    ? (target = findEventTarget(target))
      ? (registerPointerlockChangeEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          20,
          "pointerlockchange",
          targetThread
        ),
        registerPointerlockChangeEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          20,
          "mozpointerlockchange",
          targetThread
        ),
        registerPointerlockChangeEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          20,
          "webkitpointerlockchange",
          targetThread
        ),
        registerPointerlockChangeEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          20,
          "mspointerlockchange",
          targetThread
        ),
        0)
      : -4
    : -1;
}
function registerUiEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.uiEvent || (JSEvents.uiEvent = _malloc(36));
  eventTypeString = {
    target: (target = findEventTarget(target)),
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var b,
        uiEvent,
        ev = ev || window.event;
      ev.target == target &&
        (b = document.body) &&
        ((uiEvent = JSEvents.uiEvent),
        (HEAP32[uiEvent >> 2] = ev.detail),
        (HEAP32[(uiEvent + 4) >> 2] = b.clientWidth),
        (HEAP32[(uiEvent + 8) >> 2] = b.clientHeight),
        (HEAP32[(uiEvent + 12) >> 2] = window.innerWidth),
        (HEAP32[(uiEvent + 16) >> 2] = window.innerHeight),
        (HEAP32[(uiEvent + 20) >> 2] = window.outerWidth),
        (HEAP32[(uiEvent + 24) >> 2] = window.outerHeight),
        (HEAP32[(uiEvent + 28) >> 2] = window.pageXOffset),
        (HEAP32[(uiEvent + 32) >> 2] = window.pageYOffset),
        getWasmTableEntry(callbackfunc)(eventTypeId, uiEvent, userData) &&
          ev.preventDefault());
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(eventTypeString);
}
function _emscripten_set_resize_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerUiEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      10,
      "resize",
      targetThread
    ),
    0
  );
}
function registerTouchEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.touchEvent || (JSEvents.touchEvent = _malloc(1696));
  eventTypeString = {
    target: (target = findEventTarget(target)),
    allowsDeferredCalls:
      "touchstart" == eventTypeString || "touchend" == eventTypeString,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (e) {
      for (var t, touches = {}, et = e.touches, i = 0; i < et.length; ++i)
        ((t = et[i]).isChanged = t.onTarget = 0), (touches[t.identifier] = t);
      for (i = 0; i < e.changedTouches.length; ++i)
        ((t = e.changedTouches[i]).isChanged = 1), (touches[t.identifier] = t);
      for (i = 0; i < e.targetTouches.length; ++i)
        touches[e.targetTouches[i].identifier].onTarget = 1;
      var touchEvent = JSEvents.touchEvent,
        idx = ((HEAPF64[touchEvent >> 3] = e.timeStamp), touchEvent >> 2),
        targetRect =
          ((HEAP32[idx + 3] = e.ctrlKey),
          (HEAP32[idx + 4] = e.shiftKey),
          (HEAP32[idx + 5] = e.altKey),
          (HEAP32[idx + 6] = e.metaKey),
          (idx += 7),
          getBoundingClientRect(target)),
        numTouches = 0;
      for (i in touches)
        if (
          ((t = touches[i]),
          (HEAP32[idx + 0] = t.identifier),
          (HEAP32[idx + 1] = t.screenX),
          (HEAP32[idx + 2] = t.screenY),
          (HEAP32[idx + 3] = t.clientX),
          (HEAP32[idx + 4] = t.clientY),
          (HEAP32[idx + 5] = t.pageX),
          (HEAP32[idx + 6] = t.pageY),
          (HEAP32[idx + 7] = t.isChanged),
          (HEAP32[idx + 8] = t.onTarget),
          (HEAP32[idx + 9] = t.clientX - targetRect.left),
          (HEAP32[idx + 10] = t.clientY - targetRect.top),
          (idx += 13),
          31 < ++numTouches)
        )
          break;
      (HEAP32[(touchEvent + 8) >> 2] = numTouches),
        getWasmTableEntry(callbackfunc)(eventTypeId, touchEvent, userData) &&
          e.preventDefault();
    },
    useCapture: useCapture,
  };
  JSEvents.registerOrRemoveHandler(eventTypeString);
}
function _emscripten_set_touchcancel_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerTouchEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      25,
      "touchcancel",
      targetThread
    ),
    0
  );
}
function _emscripten_set_touchend_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerTouchEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      23,
      "touchend",
      targetThread
    ),
    0
  );
}
function _emscripten_set_touchmove_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerTouchEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      24,
      "touchmove",
      targetThread
    ),
    0
  );
}
function _emscripten_set_touchstart_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return (
    registerTouchEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      22,
      "touchstart",
      targetThread
    ),
    0
  );
}
function fillVisibilityChangeEventData(eventStruct) {
  var visibilityState = ["hidden", "visible", "prerender", "unloaded"].indexOf(
    document.visibilityState
  );
  (HEAP32[eventStruct >> 2] = document.hidden),
    (HEAP32[(eventStruct + 4) >> 2] = visibilityState);
}
function registerVisibilityChangeEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.visibilityChangeEvent ||
    (JSEvents.visibilityChangeEvent = _malloc(8));
  JSEvents.registerOrRemoveHandler({
    target: target,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        visibilityChangeEvent = JSEvents.visibilityChangeEvent;
      fillVisibilityChangeEventData(visibilityChangeEvent),
        getWasmTableEntry(callbackfunc)(
          eventTypeId,
          visibilityChangeEvent,
          userData
        ) && ev.preventDefault();
    },
    useCapture: useCapture,
  });
}
function _emscripten_set_visibilitychange_callback_on_thread(
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return specialHTMLTargets[1]
    ? (registerVisibilityChangeEventCallback(
        specialHTMLTargets[1],
        userData,
        useCapture,
        callbackfunc,
        21,
        "visibilitychange",
        targetThread
      ),
      0)
    : -4;
}
function registerWheelEventCallback(
  target,
  userData,
  useCapture,
  callbackfunc,
  eventTypeId,
  eventTypeString,
  targetThread
) {
  JSEvents.wheelEvent || (JSEvents.wheelEvent = _malloc(104));
  JSEvents.registerOrRemoveHandler({
    target: target,
    allowsDeferredCalls: !0,
    eventTypeString: eventTypeString,
    callbackfunc: callbackfunc,
    handlerFunc: function (ev) {
      var ev = ev || window.event,
        wheelEvent = JSEvents.wheelEvent;
      fillMouseEventData(wheelEvent, ev, target),
        (HEAPF64[(wheelEvent + 72) >> 3] = ev.deltaX),
        (HEAPF64[(wheelEvent + 80) >> 3] = ev.deltaY),
        (HEAPF64[(wheelEvent + 88) >> 3] = ev.deltaZ),
        (HEAP32[(wheelEvent + 96) >> 2] = ev.deltaMode),
        getWasmTableEntry(callbackfunc)(eventTypeId, wheelEvent, userData) &&
          ev.preventDefault();
    },
    useCapture: useCapture,
  });
}
function _emscripten_set_wheel_callback_on_thread(
  target,
  userData,
  useCapture,
  callbackfunc,
  targetThread
) {
  return void 0 !== (target = findEventTarget(target)).onwheel
    ? (registerWheelEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        9,
        "wheel",
        targetThread
      ),
      0)
    : -1;
}
function _emscripten_set_window_title(title) {
  setWindowTitle(UTF8ToString(title));
}
function _emscripten_sleep() {
  throw "Please compile your program with async support in order to use asynchronous operations like emscripten_sleep";
}
var ENV = {};
function getExecutableName() {
  return thisProgram || "./this.program";
}
function getEnvStrings() {
  if (!getEnvStrings.strings) {
    var env = {
      USER: "web_user",
      LOGNAME: "web_user",
      PATH: "/",
      PWD: "/",
      HOME: "/home/web_user",
      LANG:
        (
          ("object" == typeof navigator &&
            navigator.languages &&
            navigator.languages[0]) ||
          "C"
        ).replace("-", "_") + ".UTF-8",
      _: getExecutableName(),
    };
    for (x in ENV) void 0 === ENV[x] ? delete env[x] : (env[x] = ENV[x]);
    var x,
      strings = [];
    for (x in env) strings.push(x + "=" + env[x]);
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
}
function _environ_get(__environ, environ_buf) {
  var bufSize = 0;
  return (
    getEnvStrings().forEach(function (string, i) {
      var ptr = environ_buf + bufSize;
      writeAsciiToMemory(string, (HEAP32[(__environ + 4 * i) >> 2] = ptr)),
        (bufSize += string.length + 1);
    }),
    0
  );
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings(),
    bufSize = ((HEAP32[penviron_count >> 2] = strings.length), 0);
  return (
    strings.forEach(function (string) {
      bufSize += string.length + 1;
    }),
    (HEAP32[penviron_buf_size >> 2] = bufSize),
    0
  );
}
function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return FS.close(stream), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return e.errno;
    throw e;
  }
}
function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd),
      num = SYSCALLS.doReadv(stream, iov, iovcnt);
    return (HEAP32[pnum >> 2] = num), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return e.errno;
    throw e;
  }
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd),
      offset = 4294967296 * offset_high + (offset_low >>> 0);
    return offset <= -9007199254740992 || 9007199254740992 <= offset
      ? -61
      : (FS.llseek(stream, offset, whence),
        (tempI64 = [
          stream.position >>> 0,
          ((tempDouble = stream.position),
          1 <= +Math.abs(tempDouble)
            ? 0 < tempDouble
              ? (0 |
                  Math.min(
                    +Math.floor(tempDouble / 4294967296),
                    4294967295
                  )) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - (~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
        (HEAP32[newOffset >> 2] = tempI64[0]),
        (HEAP32[(newOffset + 4) >> 2] = tempI64[1]),
        stream.getdents &&
          0 == offset &&
          0 === whence &&
          (stream.getdents = null),
        0);
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return e.errno;
    throw e;
  }
}
function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd),
      num = SYSCALLS.doWritev(stream, iov, iovcnt);
    return (HEAP32[pnum >> 2] = num), 0;
  } catch (e) {
    if (void 0 !== FS && e instanceof FS.ErrnoError) return e.errno;
    throw e;
  }
}
function _getTempRet0() {
  return getTempRet0();
}
function _getentropy(buffer, size) {
  _getentropy.randomDevice || (_getentropy.randomDevice = getRandomDevice());
  for (var i = 0; i < size; i++)
    HEAP8[(buffer + i) >> 0] = _getentropy.randomDevice();
  return 0;
}
function _proc_exit(code) {
  procExit(code);
}
function _setTempRet0(val) {
  setTempRet0(val);
}
function __isLeapYear(year) {
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}
function __arraySum(array, index) {
  for (var sum = 0, i = 0; i <= index; sum += array[i++]);
  return sum;
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
  for (var newDate = new Date(date.getTime()); 0 < days; ) {
    var leap = __isLeapYear(newDate.getFullYear()),
      currentMonth = newDate.getMonth(),
      leap = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
    if (!(days > leap - newDate.getDate()))
      return newDate.setDate(newDate.getDate() + days), newDate;
    (days -= leap - newDate.getDate() + 1),
      newDate.setDate(1),
      currentMonth < 11
        ? newDate.setMonth(currentMonth + 1)
        : (newDate.setMonth(0), newDate.setFullYear(newDate.getFullYear() + 1));
  }
  return newDate;
}
function _strftime(s, maxsize, format, tm) {
  var tm_zone = HEAP32[(tm + 40) >> 2],
    date = {
      tm_sec: HEAP32[tm >> 2],
      tm_min: HEAP32[(tm + 4) >> 2],
      tm_hour: HEAP32[(tm + 8) >> 2],
      tm_mday: HEAP32[(tm + 12) >> 2],
      tm_mon: HEAP32[(tm + 16) >> 2],
      tm_year: HEAP32[(tm + 20) >> 2],
      tm_wday: HEAP32[(tm + 24) >> 2],
      tm_yday: HEAP32[(tm + 28) >> 2],
      tm_isdst: HEAP32[(tm + 32) >> 2],
      tm_gmtoff: HEAP32[(tm + 36) >> 2],
      tm_zone: tm_zone ? UTF8ToString(tm_zone) : "",
    },
    pattern = UTF8ToString(format),
    EXPANSION_RULES_1 = {
      "%c": "%a %b %d %H:%M:%S %Y",
      "%D": "%m/%d/%y",
      "%F": "%Y-%m-%d",
      "%h": "%b",
      "%r": "%I:%M:%S %p",
      "%R": "%H:%M",
      "%T": "%H:%M:%S",
      "%x": "%m/%d/%y",
      "%X": "%H:%M:%S",
      "%Ec": "%c",
      "%EC": "%C",
      "%Ex": "%m/%d/%y",
      "%EX": "%H:%M:%S",
      "%Ey": "%y",
      "%EY": "%Y",
      "%Od": "%d",
      "%Oe": "%e",
      "%OH": "%H",
      "%OI": "%I",
      "%Om": "%m",
      "%OM": "%M",
      "%OS": "%S",
      "%Ou": "%u",
      "%OU": "%U",
      "%OV": "%V",
      "%Ow": "%w",
      "%OW": "%W",
      "%Oy": "%y",
    };
  for (rule in EXPANSION_RULES_1)
    pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
  var WEEKDAYS = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  function leadingSomething(value, digits, character) {
    for (
      var str = "number" == typeof value ? value.toString() : value || "";
      str.length < digits;

    )
      str = character[0] + str;
    return str;
  }
  function leadingNulls(value, digits) {
    return leadingSomething(value, digits, "0");
  }
  function compareByDay(date1, date2) {
    function sgn(value) {
      return value < 0 ? -1 : 0 < value ? 1 : 0;
    }
    var compare;
    return (compare =
      0 === (compare = sgn(date1.getFullYear() - date2.getFullYear())) &&
      0 === (compare = sgn(date1.getMonth() - date2.getMonth()))
        ? sgn(date1.getDate() - date2.getDate())
        : compare);
  }
  function getFirstWeekStartDate(janFourth) {
    switch (janFourth.getDay()) {
      case 0:
        return new Date(janFourth.getFullYear() - 1, 11, 29);
      case 1:
        return janFourth;
      case 2:
        return new Date(janFourth.getFullYear(), 0, 3);
      case 3:
        return new Date(janFourth.getFullYear(), 0, 2);
      case 4:
        return new Date(janFourth.getFullYear(), 0, 1);
      case 5:
        return new Date(janFourth.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(janFourth.getFullYear() - 1, 11, 30);
    }
  }
  function getWeekBasedYear(date) {
    var date = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday),
      janFourthThisYear = new Date(date.getFullYear(), 0, 4),
      janFourthNextYear = new Date(date.getFullYear() + 1, 0, 4),
      janFourthThisYear = getFirstWeekStartDate(janFourthThisYear),
      janFourthNextYear = getFirstWeekStartDate(janFourthNextYear);
    return compareByDay(janFourthThisYear, date) <= 0
      ? compareByDay(janFourthNextYear, date) <= 0
        ? date.getFullYear() + 1
        : date.getFullYear()
      : date.getFullYear() - 1;
  }
  var rule,
    EXPANSION_RULES_2 = {
      "%a": function (date) {
        return WEEKDAYS[date.tm_wday].substring(0, 3);
      },
      "%A": function (date) {
        return WEEKDAYS[date.tm_wday];
      },
      "%b": function (date) {
        return MONTHS[date.tm_mon].substring(0, 3);
      },
      "%B": function (date) {
        return MONTHS[date.tm_mon];
      },
      "%C": function (date) {
        return leadingNulls(((date.tm_year + 1900) / 100) | 0, 2);
      },
      "%d": function (date) {
        return leadingNulls(date.tm_mday, 2);
      },
      "%e": function (date) {
        return leadingSomething(date.tm_mday, 2, " ");
      },
      "%g": function (date) {
        return getWeekBasedYear(date).toString().substring(2);
      },
      "%G": getWeekBasedYear,
      "%H": function (date) {
        return leadingNulls(date.tm_hour, 2);
      },
      "%I": function (date) {
        date = date.tm_hour;
        return (
          0 == date ? (date = 12) : 12 < date && (date -= 12),
          leadingNulls(date, 2)
        );
      },
      "%j": function (date) {
        return leadingNulls(
          date.tm_mday +
            __arraySum(
              __isLeapYear(date.tm_year + 1900)
                ? __MONTH_DAYS_LEAP
                : __MONTH_DAYS_REGULAR,
              date.tm_mon - 1
            ),
          3
        );
      },
      "%m": function (date) {
        return leadingNulls(date.tm_mon + 1, 2);
      },
      "%M": function (date) {
        return leadingNulls(date.tm_min, 2);
      },
      "%n": function () {
        return "\n";
      },
      "%p": function (date) {
        return 0 <= date.tm_hour && date.tm_hour < 12 ? "AM" : "PM";
      },
      "%S": function (date) {
        return leadingNulls(date.tm_sec, 2);
      },
      "%t": function () {
        return "\t";
      },
      "%u": function (date) {
        return date.tm_wday || 7;
      },
      "%U": function (date) {
        date = date.tm_yday + 7 - date.tm_wday;
        return leadingNulls(Math.floor(date / 7), 2);
      },
      "%V": function (date) {
        var jan1,
          val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
        return (
          (date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2 && val++,
          val
            ? 53 != val ||
              4 == (jan1 = (date.tm_wday + 371 - date.tm_yday) % 7) ||
              (3 == jan1 && __isLeapYear(date.tm_year)) ||
              (val = 1)
            : ((val = 52),
              (4 == (jan1 = (date.tm_wday + 7 - date.tm_yday - 1) % 7) ||
                (5 == jan1 && __isLeapYear((date.tm_year % 400) - 1))) &&
                val++),
          leadingNulls(val, 2)
        );
      },
      "%w": function (date) {
        return date.tm_wday;
      },
      "%W": function (date) {
        date = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
        return leadingNulls(Math.floor(date / 7), 2);
      },
      "%y": function (date) {
        return (date.tm_year + 1900).toString().substring(2);
      },
      "%Y": function (date) {
        return date.tm_year + 1900;
      },
      "%z": function (date) {
        var ahead = 0 <= (date = date.tm_gmtoff),
          date = Math.abs(date) / 60;
        return (
          (ahead ? "+" : "-") +
          String("0000" + ((date / 60) * 100 + (date % 60))).slice(-4)
        );
      },
      "%Z": function (date) {
        return date.tm_zone;
      },
      "%%": function () {
        return "%";
      },
    },
    pattern = pattern.replace(/%%/g, "\0\0");
  for (rule in EXPANSION_RULES_2)
    pattern.includes(rule) &&
      (pattern = pattern.replace(
        new RegExp(rule, "g"),
        EXPANSION_RULES_2[rule](date)
      ));
  tm = intArrayFromString((pattern = pattern.replace(/\0\0/g, "%")), !1);
  return tm.length > maxsize ? 0 : (writeArrayToMemory(tm, s), tm.length - 1);
}
function _strftime_l(s, maxsize, format, tm) {
  return _strftime(s, maxsize, format, tm);
}
var GLctx,
  ERRNO_CODES = {
    EPERM: 63,
    ENOENT: 44,
    ESRCH: 71,
    EINTR: 27,
    EIO: 29,
    ENXIO: 60,
    E2BIG: 1,
    ENOEXEC: 45,
    EBADF: 8,
    ECHILD: 12,
    EAGAIN: 6,
    EWOULDBLOCK: 6,
    ENOMEM: 48,
    EACCES: 2,
    EFAULT: 21,
    ENOTBLK: 105,
    EBUSY: 10,
    EEXIST: 20,
    EXDEV: 75,
    ENODEV: 43,
    ENOTDIR: 54,
    EISDIR: 31,
    EINVAL: 28,
    ENFILE: 41,
    EMFILE: 33,
    ENOTTY: 59,
    ETXTBSY: 74,
    EFBIG: 22,
    ENOSPC: 51,
    ESPIPE: 70,
    EROFS: 69,
    EMLINK: 34,
    EPIPE: 64,
    EDOM: 18,
    ERANGE: 68,
    ENOMSG: 49,
    EIDRM: 24,
    ECHRNG: 106,
    EL2NSYNC: 156,
    EL3HLT: 107,
    EL3RST: 108,
    ELNRNG: 109,
    EUNATCH: 110,
    ENOCSI: 111,
    EL2HLT: 112,
    EDEADLK: 16,
    ENOLCK: 46,
    EBADE: 113,
    EBADR: 114,
    EXFULL: 115,
    ENOANO: 104,
    EBADRQC: 103,
    EBADSLT: 102,
    EDEADLOCK: 16,
    EBFONT: 101,
    ENOSTR: 100,
    ENODATA: 116,
    ETIME: 117,
    ENOSR: 118,
    ENONET: 119,
    ENOPKG: 120,
    EREMOTE: 121,
    ENOLINK: 47,
    EADV: 122,
    ESRMNT: 123,
    ECOMM: 124,
    EPROTO: 65,
    EMULTIHOP: 36,
    EDOTDOT: 125,
    EBADMSG: 9,
    ENOTUNIQ: 126,
    EBADFD: 127,
    EREMCHG: 128,
    ELIBACC: 129,
    ELIBBAD: 130,
    ELIBSCN: 131,
    ELIBMAX: 132,
    ELIBEXEC: 133,
    ENOSYS: 52,
    ENOTEMPTY: 55,
    ENAMETOOLONG: 37,
    ELOOP: 32,
    EOPNOTSUPP: 138,
    EPFNOSUPPORT: 139,
    ECONNRESET: 15,
    ENOBUFS: 42,
    EAFNOSUPPORT: 5,
    EPROTOTYPE: 67,
    ENOTSOCK: 57,
    ENOPROTOOPT: 50,
    ESHUTDOWN: 140,
    ECONNREFUSED: 14,
    EADDRINUSE: 3,
    ECONNABORTED: 13,
    ENETUNREACH: 40,
    ENETDOWN: 38,
    ETIMEDOUT: 73,
    EHOSTDOWN: 142,
    EHOSTUNREACH: 23,
    EINPROGRESS: 26,
    EALREADY: 7,
    EDESTADDRREQ: 17,
    EMSGSIZE: 35,
    EPROTONOSUPPORT: 66,
    ESOCKTNOSUPPORT: 137,
    EADDRNOTAVAIL: 4,
    ENETRESET: 39,
    EISCONN: 30,
    ENOTCONN: 53,
    ETOOMANYREFS: 141,
    EUSERS: 136,
    EDQUOT: 19,
    ESTALE: 72,
    ENOTSUP: 138,
    ENOMEDIUM: 148,
    EILSEQ: 25,
    EOVERFLOW: 61,
    ECANCELED: 11,
    ENOTRECOVERABLE: 56,
    EOWNERDEAD: 62,
    ESTRPIPE: 135,
  },
  FSNode = function (parent, name, mode, rdev) {
    (this.parent = parent = parent || this),
      (this.mount = parent.mount),
      (this.mounted = null),
      (this.id = FS.nextInode++),
      (this.name = name),
      (this.mode = mode),
      (this.node_ops = {}),
      (this.stream_ops = {}),
      (this.rdev = rdev);
  },
  readMode = 365,
  writeMode = 146;
Object.defineProperties(FSNode.prototype, {
  read: {
    get: function () {
      return (this.mode & readMode) === readMode;
    },
    set: function (val) {
      val ? (this.mode |= readMode) : (this.mode &= ~readMode);
    },
  },
  write: {
    get: function () {
      return (this.mode & writeMode) === writeMode;
    },
    set: function (val) {
      val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
    },
  },
  isFolder: {
    get: function () {
      return FS.isDir(this.mode);
    },
  },
  isDevice: {
    get: function () {
      return FS.isChrdev(this.mode);
    },
  },
}),
  (FS.FSNode = FSNode),
  FS.staticInit(),
  (Module.requestFullscreen = function (lockPointer, resizeCanvas) {
    Browser.requestFullscreen(lockPointer, resizeCanvas);
  }),
  (Module.requestAnimationFrame = function (func) {
    Browser.requestAnimationFrame(func);
  }),
  (Module.setCanvasSize = function (width, height, noUpdates) {
    Browser.setCanvasSize(width, height, noUpdates);
  }),
  (Module.pauseMainLoop = function () {
    Browser.mainLoop.pause();
  }),
  (Module.resumeMainLoop = function () {
    Browser.mainLoop.resume();
  }),
  (Module.getUserMedia = function () {
    Browser.getUserMedia();
  }),
  (Module.createContext = function (
    canvas,
    useWebGL,
    setInModule,
    webGLContextAttributes
  ) {
    return Browser.createContext(
      canvas,
      useWebGL,
      setInModule,
      webGLContextAttributes
    );
  });
for (let i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));
var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
for (let i = 0; i < 288; ++i)
  miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(
    0,
    i + 1
  );
var __miniTempWebGLIntBuffersStorage = new Int32Array(288);
for (let i = 0; i < 288; ++i)
  __miniTempWebGLIntBuffers[i] = __miniTempWebGLIntBuffersStorage.subarray(
    0,
    i + 1
  );
function intArrayFromString(stringy, dontAddNull, length) {
  (length = 0 < length ? length : lengthBytesUTF8(stringy) + 1),
    (length = new Array(length)),
    (stringy = stringToUTF8Array(stringy, length, 0, length.length));
  return dontAddNull && (length.length = stringy), length;
}
var calledRun,
  asmLibraryArg = {
    gb: __emscripten_noop,
    Za: __emscripten_noop,
    Ya: __emscripten_noop,
    Xa: __emscripten_noop,
    tb: ___syscall_faccessat,
    b: ___syscall_fcntl64,
    pb: ___syscall_ftruncate64,
    ob: ___syscall_getcwd,
    kb: ___syscall_getdents64,
    Wa: __emscripten_noop,
    Va: __emscripten_noop,
    Ua: __emscripten_noop,
    O: ___syscall_ioctl,
    Ta: __emscripten_noop,
    lb: ___syscall_mkdir,
    P: ___syscall_openat,
    Sa: __emscripten_noop,
    jb: ___syscall_renameat,
    hb: ___syscall_rmdir,
    Ra: __emscripten_noop,
    L: __emscripten_noop,
    fb: ___syscall_stat64,
    eb: ___syscall_unlinkat,
    db: ___syscall_utimensat,
    Q: __emscripten_date_now,
    rb: __emscripten_get_now_is_monotonic,
    bb: __emscripten_throw_longjmp,
    M: __emscripten_exit_or_abort,
    nc: __emscripten_noop,
    cd: __emscripten_noop,
    Oa: __emscripten_noop,
    _a: __emscripten_noop,
    Qa: __emscripten_noop,
    ib: __emscripten_noop,
    nd: __emscripten_noop,
    R: __emscripten_noop,
    Na: __emscripten_noop,
    Ic: __emscripten_noop,
    qb: __emscripten_noop,
    Ma: __emscripten_noop,
    wb: __emscripten_noop,
    Hb: __emscripten_noop,
    Tc: __emscripten_noop,
    cc: __emscripten_noop,
    Sb: __emscripten_noop,
    a: _emscripten_asm_const_int,
    Ga: __emscripten_noop,
    Ka: __emscripten_noop,
    g: __emscripten_noop,
    c: __emscripten_noop,
    o: __emscripten_noop,
    k: _emscripten_get_now,
    va: __emscripten_noop,
    La: _emscripten_get_screen_size,
    la: __emscripten_noop,
    ka: __emscripten_noop,
    Ca: __emscripten_noop,
    ja: __emscripten_noop,
    ia: __emscripten_noop,
    ha: __emscripten_noop,
    ga: __emscripten_noop,
    fa: __emscripten_noop,
    ta: __emscripten_noop,
    ea: __emscripten_noop,
    da: __emscripten_noop,
    ca: __emscripten_noop,
    ba: __emscripten_noop,
    aa: __emscripten_noop,
    $: __emscripten_noop,
    _: __emscripten_noop,
    Z: __emscripten_noop,
    Y: __emscripten_noop,
    X: __emscripten_noop,
    W: __emscripten_noop,
    V: __emscripten_noop,
    U: __emscripten_noop,
    T: __emscripten_noop,
    Rd: __emscripten_noop,
    Qd: __emscripten_noop,
    Pd: __emscripten_noop,
    Od: __emscripten_noop,
    Nd: __emscripten_noop,
    Md: __emscripten_noop,
    Ld: __emscripten_noop,
    Kd: __emscripten_noop,
    Jd: __emscripten_noop,
    Id: __emscripten_noop,
    Ea: __emscripten_noop,
    Hd: __emscripten_noop,
    Gd: __emscripten_noop,
    Fd: __emscripten_noop,
    sa: __emscripten_noop,
    Ed: __emscripten_noop,
    Dd: __emscripten_noop,
    Cd: __emscripten_noop,
    Bd: __emscripten_noop,
    Ad: __emscripten_noop,
    zd: __emscripten_noop,
    yd: __emscripten_noop,
    oa: __emscripten_noop,
    pa: __emscripten_noop,
    xd: __emscripten_noop,
    na: __emscripten_noop,
    wd: __emscripten_noop,
    vd: __emscripten_noop,
    Ba: __emscripten_noop,
    ud: __emscripten_noop,
    td: __emscripten_noop,
    sd: __emscripten_noop,
    rd: __emscripten_noop,
    qd: __emscripten_noop,
    pd: __emscripten_noop,
    md: __emscripten_noop,
    Fa: __emscripten_noop,
    ld: __emscripten_noop,
    kd: __emscripten_noop,
    ra: __emscripten_noop,
    od: __emscripten_noop,
    jd: __emscripten_noop,
    id: __emscripten_noop,
    hd: __emscripten_noop,
    gd: __emscripten_noop,
    fd: __emscripten_noop,
    ed: __emscripten_noop,
    dd: __emscripten_noop,
    bd: __emscripten_noop,
    ad: __emscripten_noop,
    $c: __emscripten_noop,
    Zc: __emscripten_noop,
    _c: __emscripten_noop,
    wa: __emscripten_noop,
    ya: __emscripten_noop,
    ua: __emscripten_noop,
    xa: __emscripten_noop,
    za: __emscripten_noop,
    Yc: __emscripten_noop,
    Wc: __emscripten_noop,
    Vc: __emscripten_noop,
    Uc: __emscripten_noop,
    Xc: __emscripten_noop,
    Sc: __emscripten_noop,
    Rc: __emscripten_noop,
    Qc: __emscripten_noop,
    Nc: __emscripten_noop,
    Pc: __emscripten_noop,
    Oc: __emscripten_noop,
    Kc: __emscripten_noop,
    Mc: __emscripten_noop,
    Lc: __emscripten_noop,
    Jc: __emscripten_noop,
    Hc: __emscripten_noop,
    Gc: __emscripten_noop,
    Fc: __emscripten_noop,
    Ec: __emscripten_noop,
    Da: __emscripten_noop,
    Dc: __emscripten_noop,
    Cc: __emscripten_noop,
    Bc: __emscripten_noop,
    qa: __emscripten_noop,
    Ac: __emscripten_noop,
    zc: __emscripten_noop,
    yc: __emscripten_noop,
    xc: __emscripten_noop,
    Aa: __emscripten_noop,
    wc: __emscripten_noop,
    vc: __emscripten_noop,
    uc: __emscripten_noop,
    tc: __emscripten_noop,
    sc: __emscripten_noop,
    rc: __emscripten_noop,
    qc: __emscripten_noop,
    pc: __emscripten_noop,
    oc: __emscripten_noop,
    mc: __emscripten_noop,
    lc: __emscripten_noop,
    kc: __emscripten_noop,
    jc: __emscripten_noop,
    ic: __emscripten_noop,
    hc: __emscripten_noop,
    gc: __emscripten_noop,
    fc: __emscripten_noop,
    ec: __emscripten_noop,
    dc: __emscripten_noop,
    bc: __emscripten_noop,
    ac: __emscripten_noop,
    $b: __emscripten_noop,
    _b: __emscripten_noop,
    Zb: __emscripten_noop,
    Yb: __emscripten_noop,
    Xb: __emscripten_noop,
    Wb: __emscripten_noop,
    Vb: __emscripten_noop,
    Ub: __emscripten_noop,
    Rb: __emscripten_noop,
    Qb: __emscripten_noop,
    Pb: __emscripten_noop,
    Ob: __emscripten_noop,
    Nb: __emscripten_noop,
    Mb: __emscripten_noop,
    Lb: __emscripten_noop,
    Kb: __emscripten_noop,
    Jb: __emscripten_noop,
    Ib: __emscripten_noop,
    Gb: __emscripten_noop,
    Fb: __emscripten_noop,
    Eb: __emscripten_noop,
    Db: __emscripten_noop,
    Cb: __emscripten_noop,
    Bb: __emscripten_noop,
    Ab: __emscripten_noop,
    zb: __emscripten_noop,
    yb: __emscripten_noop,
    ma: __emscripten_noop,
    xb: __emscripten_noop,
    vb: __emscripten_noop,
    m: _emscripten_has_asyncify,
    sb: _emscripten_memcpy_big,
    Ha: __emscripten_noop,
    K: __emscripten_noop,
    cb: _emscripten_resize_heap,
    p: __emscripten_noop,
    q: __emscripten_noop,
    C: __emscripten_noop,
    e: __emscripten_noop,
    i: __emscripten_noop,
    D: __emscripten_noop,
    t: __emscripten_noop,
    n: __emscripten_noop,
    S: __emscripten_noop,
    w: __emscripten_noop,
    u: __emscripten_noop,
    v: __emscripten_noop,
    Sd: _emscripten_set_main_loop,
    I: __emscripten_noop,
    G: __emscripten_noop,
    F: __emscripten_noop,
    J: __emscripten_noop,
    H: __emscripten_noop,
    x: __emscripten_noop,
    s: __emscripten_noop,
    y: __emscripten_noop,
    A: __emscripten_noop,
    z: __emscripten_noop,
    B: __emscripten_noop,
    r: _emscripten_set_visibilitychange_callback_on_thread,
    E: _emscripten_set_wheel_callback_on_thread,
    Ia: __emscripten_noop,
    l: __emscripten_noop,
    mb: _environ_get,
    nb: _environ_sizes_get,
    f: _fd_close,
    N: _fd_read,
    Pa: _fd_seek,
    j: _fd_write,
    h: __emscripten_exit_or_abort,
    $a: _getentropy,
    Tb: invoke_ii,
    Ja: invoke_vi,
    ub: __emscripten_exit_or_abort,
    d: __emscripten_exit_or_abort,
    ab: _strftime_l,
  },
  asm = createWasm(),
  ___wasm_call_ctors = (Module.___wasm_call_ctors = function () {
    return (___wasm_call_ctors = Module.___wasm_call_ctors =
      Module.asm.Ud).apply(null, arguments);
  }),
  _main = (Module._main = function () {
    return (_main = Module._main = Module.asm.Wd).apply(null, arguments);
  }),
  ___errno_location = (Module.___errno_location = function () {
    return (___errno_location = Module.___errno_location = Module.asm.Xd).apply(
      null,
      arguments
    );
  }),
  _malloc = (Module._malloc = function () {
    return (_malloc = Module._malloc = Module.asm.Yd).apply(null, arguments);
  }),
  _htons = (Module._htons = function () {
    return (_htons = Module._htons = Module.asm.Zd).apply(null, arguments);
  }),
  _ntohs = (Module._ntohs = function () {
    return (_ntohs = Module._ntohs = Module.asm._d).apply(null, arguments);
  }),
  _setThrew = (Module._setThrew = function () {
    return (_setThrew = Module._setThrew = Module.asm.$d).apply(
      null,
      arguments
    );
  }),
  stackSave = (Module.stackSave = function () {
    return (stackSave = Module.stackSave = Module.asm.ae).apply(
      null,
      arguments
    );
  }),
  stackRestore = (Module.stackRestore = function () {
    return (stackRestore = Module.stackRestore = Module.asm.be).apply(
      null,
      arguments
    );
  }),
  stackAlloc = (Module.stackAlloc = function () {
    return (stackAlloc = Module.stackAlloc = Module.asm.ce).apply(
      null,
      arguments
    );
  }),
  dynCall_ji = (Module.dynCall_ji = function () {
    return (dynCall_ji = Module.dynCall_ji = Module.asm.de).apply(
      null,
      arguments
    );
  }),
  dynCall_iij = (Module.dynCall_iij = function () {
    return (dynCall_iij = Module.dynCall_iij = Module.asm.ee).apply(
      null,
      arguments
    );
  }),
  dynCall_jij = (Module.dynCall_jij = function () {
    return (dynCall_jij = Module.dynCall_jij = Module.asm.fe).apply(
      null,
      arguments
    );
  }),
  dynCall_iiiiiij = (Module.dynCall_iiiiiij = function () {
    return (dynCall_iiiiiij = Module.dynCall_iiiiiij = Module.asm.ge).apply(
      null,
      arguments
    );
  }),
  dynCall_iijiji = (Module.dynCall_iijiji = function () {
    return (dynCall_iijiji = Module.dynCall_iijiji = Module.asm.he).apply(
      null,
      arguments
    );
  }),
  dynCall_jiji = (Module.dynCall_jiji = function () {
    return (dynCall_jiji = Module.dynCall_jiji = Module.asm.ie).apply(
      null,
      arguments
    );
  }),
  dynCall_viijii = (Module.dynCall_viijii = function () {
    return (dynCall_viijii = Module.dynCall_viijii = Module.asm.je).apply(
      null,
      arguments
    );
  }),
  dynCall_iiiiij = (Module.dynCall_iiiiij = function () {
    return (dynCall_iiiiij = Module.dynCall_iiiiij = Module.asm.ke).apply(
      null,
      arguments
    );
  }),
  dynCall_iiiiijj = (Module.dynCall_iiiiijj = function () {
    return (dynCall_iiiiijj = Module.dynCall_iiiiijj = Module.asm.le).apply(
      null,
      arguments
    );
  }),
  dynCall_iiiiiijj = (Module.dynCall_iiiiiijj = function () {
    return (dynCall_iiiiiijj = Module.dynCall_iiiiiijj = Module.asm.me).apply(
      null,
      arguments
    );
  });
function invoke_ii(index, a1) {
  return getWasmTableEntry(index)(a1);
}
function invoke_vi(index, a1) {
  getWasmTableEntry(index)(a1);
}
function ExitStatus(status) {
  (this.name = "ExitStatus"),
    (this.message = "Program terminated with exit(" + status + ")"),
    (this.status = status);
}
(Module.addRunDependency = addRunDependency),
  (Module.removeRunDependency = removeRunDependency);
var calledMain = !1;
function callMain(args) {
  var entryFunction = Module._main,
    argc = (args = args || []).length + 1,
    argv = stackAlloc(4 * (argc + 1));
  HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
  for (var i = 1; i < argc; i++)
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  HEAP32[(argv >> 2) + argc] = 0;
  try {
    var ret = entryFunction(argc, argv);
    return exit(ret, !0), ret;
  } catch (e) {
    return handleException(e);
  } finally {
    calledMain = !0;
  }
}
function run(args) {
  function doRun() {
    calledRun ||
      ((calledRun = !0),
      (Module.calledRun = !0),
      ABORT ||
        (initRuntime(),
        preMain(),
        Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
        shouldRunNow && callMain(args),
        postRun()));
  }
  (args = args || arguments_),
    0 < runDependencies ||
      (preRun(),
      0 < runDependencies ||
        (Module.setStatus
          ? (Module.setStatus("Running..."),
            setTimeout(function () {
              setTimeout(function () {
                Module.setStatus("");
              }, 1),
                doRun();
            }, 1))
          : doRun()));
}
function exit(status, implicit) {
  procExit((EXITSTATUS = status));
}
function procExit(code) {
  (EXITSTATUS = code),
    keepRuntimeAlive() || (Module.onExit && Module.onExit(code), (ABORT = !0)),
    quit_(code, new ExitStatus(code));
}
if (
  ((dependenciesFulfilled = function runCaller() {
    calledRun || run(), calledRun || (dependenciesFulfilled = runCaller);
  }),
  (Module.run = run),
  Module.preInit)
)
  for (
    "function" == typeof Module.preInit && (Module.preInit = [Module.preInit]);
    0 < Module.preInit.length;

  )
    Module.preInit.pop()();
var shouldRunNow = !0;
Module.noInitialRun && (shouldRunNow = !1), run();

var sffw;
(function (sffw) {
    var api;
    (function (api) {
        var timer;
        (function (timer) {
            var Timer = /** @class */ (function () {
                function Timer(datacontext, args) {
                    this.onTickCallback = sffw.extractEventHandlerFromApiArgs(datacontext, args, 'OnTick');
                    this.autoRepeat = !!args.autoRepeat;
                    this.intervalInMs = args.interval;
                    this.autoStart = !!args.autoStart;
                    if (this.autoStart) {
                        this.start();
                    }
                }
                Timer.prototype.start = function () {
                    if (this.intervalInMs && !this.intervalActive && !this.timeoutActive) {
                        if (this.autoRepeat) {
                            this.intervalHandle = setInterval(this.onTickCallback, this.intervalInMs);
                            this.intervalActive = true;
                        }
                        else {
                            this.timeoutHandle = setTimeout(this.onTickCallback, this.intervalInMs);
                            this.timeoutActive = true;
                        }
                    }
                };
                Timer.prototype.stop = function () {
                    if (this.intervalActive) {
                        clearInterval(this.intervalHandle);
                        this.intervalActive = false;
                    }
                    if (this.timeoutActive) {
                        clearTimeout(this.timeoutHandle);
                        this.timeoutActive = false;
                    }
                };
                Timer.prototype.dispose = function () {
                    this.stop();
                    this.onTickCallback = null;
                };
                return Timer;
            }());
            timer.Timer = Timer;
        })(timer = api.timer || (api.timer = {}));
    })(api = sffw.api || (sffw.api = {}));
})(sffw || (sffw = {}));
if (typeof define !== 'undefined') {
    define([], function () {
        return sffw.api.timer.Timer;
    });
}
var sffw;
(function (sffw) {
    function extractEventHandlerFromApiArgs(datacontext, args, eventName) {
        if (args.$events && args.$events[eventName] && args.$events[eventName].Reference) {
            if (args.$events[eventName].ReferenceType === 'Global') {
                return datacontext.$globals.$actions[args.$events[eventName].Reference];
            }
            else {
                return datacontext.$actions[args.$events[eventName].Reference];
            }
        }
        return undefined;
    }
    sffw.extractEventHandlerFromApiArgs = extractEventHandlerFromApiArgs;
})(sffw || (sffw = {}));

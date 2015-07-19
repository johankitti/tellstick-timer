var tellstick = require('tellstick');
var schedule = require('node-schedule');
var fs = require('fs');
var config = require('../timersconfig.json');

/**
*var timer = {
*  lampId: lampId,
*  on: on,
*  off: off
*};
 */

/**
*var timerConfig = {
*  id: 1,
*  lampId: 1,
*  onMin: 0,
*  onHour: 14,
*  offMin: 0,
*  offHour: 15
*};
 */

/**
 * Return the tellstick-timer interface
 * Path specifies absolute path to tdtools for tellstick
 */
function timer(path){
  var td = tellstick(path);
  var lamps = [];
  var timers = [];
  /**
   * Remove timer
   * lampId: id of lamp
   * timerId: id of timer
   * cb: callback
   */
  function removeTimer(lampId, timerId, cb) {
    var exists = false;
    for (var i = 0; i < timers.length; i++) {
      if (timers[i].lampId == lampId && timers[i].id == timerId) {
        timers.splice(i, 1);
        exists = true;
        break;
      }
    }
    for (var i = 0; i < config.timers.length; i++) {
      if (config.timers[i].lampId == lampId && config.timers[i].id == timerId) {
        config.timers.splice(i, 1);
        break;
      }
    }
    if (exists) {
      writeToConfigFile(function(err) {
        cb(err, lampId, timerId);
      });
    } else {
      var err = 'No such timer.';
      cb(err);
    }
  };

  /**
   * Create timer object
   * lampId: id of lamp
   * timerId: id of timer
   * onMin: minute to turn on lamp
   * onHour: hour to turn on lamp
   * offMin: minute to turn off lamp
   * offHour: hour to turn off lamp
   */
  function createTimer(lampId, timerId, onMin, onHour, offMin, offHour) {
    var on = schedule.scheduleJob('0 ' + onMin + ' ' + onHour + ' * * *', function(){
      turnOn(lampId, function(err) {
        if (!err) console.log('Timer turning on lamp: ' + lampId);
        if (err) console.log(err);
      });
    });
    var off = schedule.scheduleJob('0 ' + offMin + ' ' + offHour + ' * * *', function(){
      turnOff(lampId, function(err) {
        if (!err) console.log('Timer turning off lamp: ' + lampId);
        if (err) console.log(err);
      });
    });
    var timer = {
      lampId: lampId,
      on: on,
      off: off
    };
    if (timerId) timer.id = timerId;
    return timer;
  };

  /**
   * Add a new timer
   * lampId: id of lamp
   * timerId: id of timer
   * onMin: minute to turn on lamp
   * onHour: hour to turn on lamp
   * offMin: minute to turn off lamp
   * offHour: hour to turn off lamp
   * cb: callback
   */
  function addNewTimer(lampId, timerId, onMin, onHour, offMin, offHour, cb) {
    var timer = createTimer(lampId, timerId, onMin, onHour, offMin, offHour);

    var timerConfig = {
      lampId: lampId,
      onMin: onMin,
      onHour: onHour,
      offMin: offMin,
      offHour: offHour
    };

    addTimer(timer, function(timerId) {
      timerConfig.id = timerId;
      saveTimerConfig(timerConfig, function(err) {
        cb(err, lampId, timerId);
      });
    });
  };

  /**
   * Adds the timer to timers array. If id exists, it will override.
   * timer: the timer to add
   * cb: callback
   */
  function addTimer(timer, cb) {
    if (!timer.id) {
      var timerId = 1;
      var setId = false;
      while (!setId) {
        var exists = false;
        for (var i = 0; i < timers.length; i++) {
          if (timers[i].lampId == timer.lampId && timers[i].id == timerId) {
            exists = true;
            break;
          }
        }
        if (exists) {
          timerId++;
        } else {
          setId = true;
        }
      }
      timer.id = timerId;
      timers.push(timer);
    } else {
      var inserted = false;
      for (var i = 0; i < timers.length; i++) {
        if (timers[i].lampId == timer.lampId && timers[i].id == timer.id) {
          timers[i] = timer;
          inserted = true;
          break;
        }
      }
      if (!inserted) timers.push(timer);
      timerId = timer.id;
    }
    cb(timerId);
  };

  /**
   * Save the timer config
   * timerConfig: the config to save
   * cb: callback
   */
  function saveTimerConfig(timerConfig, cb) {
    var exists = false;
    if (config.timers) {
      for (var i = 0; i < config.timers.length; i++) {
        if (config.timers[i].id == timerConfig.id
          && config.timers[i].lampId == timerConfig.lampId) {
          config.timers[i] = timerConfig;
          exists = true;
          break;
        }
      }
    } else {
      config.timers = [];
    }
    if (!exists) {
      config.timers.push(timerConfig);
    }
    writeToConfigFile(cb);
  };

  /**
   * Write config to file
   * cb: callback
   */
  function writeToConfigFile(cb) {
    var output = require('path').resolve(__dirname, '../timersconfig.json');
    fs.writeFile(output, JSON.stringify(config, null, 2), function(err) {
      if (err) {
        cb(err);
      } else {
        cb();
      }
    });
  };

  function startTimers(cb) {
    for (var i = 0; i < config.timers.length; i++) {
      var conf = config.timers[i];
      var timer = createTimer(conf.lampId, conf.id, conf.onMin,
        conf.onHour, conf.offMin, conf.offHour)
      addTimer(timer, function() {
        console.log('Timer ' + timer.id + ' loaded for lamp: ' + timer.lampId);
      });
    }
    cb();
  };

  /**
   * Load lamp info
   * cb: callback
   */
  function loadLamps(cb) {
    td.list(function(err, list){
      lamps = list;
      startTimers(function() {
        cb();
      });
    });
  };

  /**
   * Get lamp info
   * cb: callback
   */
  function getLamps(cb) {
    td.list(function(err, list){
      lamps = list;
      cb(lamps)
    });
  };

  /**
   * Get timer info
   * cb: callback
   */
  function getTimers(cb) {
    loadLamps(function() {
      cb(timers);
    });
  };

  /**
   * Turn on lamp
   * lampId: id of lamp
   * cb: callback
   */
  function turnOn(lampId, cb) {
    td.turnOn(lampId, function(err) {
      cb(err);
    });
  };

  /**
   * Turn off lamp
   * lampId: id of lamp
   * cb: callback
   */
  function turnOff(lampId, cb) {
    td.turnOff(lampId, function(err) {
      cb(err);
    });
  };

  /**
   * Initialization
   */
  function initialize() {
    loadLamps(function() {});
  };

  initialize();

  return {
    addNewTimer: addNewTimer,
    removeTimer: removeTimer,
    getLamps: getLamps,
    getTimers: getTimers,
    turnOn: turnOn,
    turnOff: turnOff
  };
}

module.exports = timer;

const config = require("../config/config.json");
const text = require(`../config/text_${config.lang}.json`).timer;
let current_timers = [];
const minutes_per_loop = 1;
let bday;

// -----------------------------------
// Start
// -----------------------------------
async function timer(message, channel, country_code) {
  const today = new Date();
  // start a timer for the next 10 years
  customTimer(
    message,
    channel,
    today.setFullYear(today.getFullYear() + 10),
    country_code
  );
}
async function customTimer(message, channel, time_format, title) {
  //title magic keys: %t time
  // -----------------------------------
  // Needed Variables
  // -----------------------------------
  let log = "";
  if (config.log) {
    log = await message.guild.channels.cache.get(config.log_channel);
    if (log === undefined) {
      config.log = false;
    }
  }
  let now = new Date();
  bday = new Date(time_format);

  if (isNaN(bday.getTime())) return message.reply("");

  let diff;
  let days;
  let hours;
  let mins;
  let out;
  // -----------------------------------

  // -----------------------------------
  // Rename Looper
  // -----------------------------------
  function loop() {
    now = new Date();
    bday = new Date(time_format);
    diff = (bday.getTime() - now.getTime()) / 1000;
    diff /= 60;
    diff = Math.round(diff);
    console.log("diff: " + diff);
    console.log("bday: " + bday);

    if (diff <= 0) {
      //clearInterval(timerID);
      //console.log("stop")
      if (diff <= -1) {
        let i = 1;
        while (bday < now) {
          bday = new Date(bday.setMonth(bday.getMonth() + i));
          i++;
          console.log("iteration " + bday);
        }
        diff = (bday.getTime() - now.getTime()) / 1000;
        diff /= 60;
        diff = Math.round(diff);
        out = text.join_in.replace("%d", d).replace("%s", title);
      } else {
        channel.setName(text.join_now.replace("%s", title));
      }
      //channel.updateOverwrite(channel.guild.roles.everyone, {CONNECT: true});
      //current_timers.slice(current_timers.indexOf(timerID), 1)
      //return message.reply(text.stopped);
    }

    days = Math.floor(diff / (60 * 24));
    hours = Math.floor((diff - days * 60 * 24) / 60);
    mins = diff % 60;

    d = format(days, hours, mins);
    s = formatShort(days, hours, mins);
    if (title == "Paris") {
      out = text.Paris.replace(
        "%d",
        now.toLocaleTimeString("en-US", {
          timeZone: "Europe/Paris",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (title == "Manila") {
      out = text.Manila.replace(
        "%d",
        now.toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (title.length > 0) {
      out = text.join_in.replace("%d", d).replace("%s", title);
    } else {
      out = text.join_now;
    }
    channel.setName(out).catch((e) => {
      clearInterval(timerID);
      return message.reply(text.error);
    });
    if (config.log) {
      log.send("Format: " + out).catch((e) => {
        config.log = false;
      });
    }
  }
  // -----------------------------------

  // -----------------------------------
  // Start Loop
  // -----------------------------------

  const timerID = setInterval(loop, minutes_per_loop * 60 * 1000);
  current_timers.push(timerID);
  console.log("start");
  message.reply(text.started + time_format);

  // -----------------------------------
  loop();
}
// -----------------------------------

// -----------------------------------
// Helper
// -----------------------------------
function format(days, hours, mins) {
  let out = "";
  if (days !== 0) {
    out += days + "d ";
  }
  if (hours !== 0) {
    out += hours + "h ";
  }
  if (mins !== 0) {
    out += mins + "min ";
  }

  return out.substr(0, out.length - 1);
}

function formatShort(days, hours, mins) {
  if (days !== 0) {
    return days + "d";
  }
  if (hours !== 0) {
    return hours + "h";
  }
  if (mins !== 0) {
    return mins + "min";
  }
  return "0 min";
}
// -----------------------------------

// -----------------------------------
// Stop
// -----------------------------------
function stop_all() {
  const num_of_timers = current_timers.length;
  for (const timerID of current_timers) {
    clearInterval(timerID);
  }
  current_timers = [];

  console.log("Timers Stopped (" + num_of_timers + ")");
  return num_of_timers;
}
// -----------------------------------

module.exports = { timer, stop_all, customTimer };

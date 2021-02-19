const monthNames = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const formatDate = (utcSeconds) => {
  let date = new Date(utcSeconds * 1000);
  let month = monthNames[date.getMonth()];
  let day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return month + " " + day + " " + hours + ":" + minutes + ampm;
};

export const getTimePlayed = (
  timePlayed,
  includeHours = true,
  includeMinutes = true,
  includeSeconds = false
) => {
  var text = "";
  var hours,
    minutes,
    seconds = 0;
  if (includeHours) {
    hours = Math.floor(timePlayed / 3600);
    if (hours > 0) {
      text += hours + "h ";
      timePlayed = timePlayed % 3600;
    }
  }
  if (includeMinutes) {
    minutes = Math.floor(timePlayed / 60);
    if (minutes > 0) {
      text += minutes + "m ";
      timePlayed = timePlayed % 60;
    }
  }
  if (includeSeconds) {
    seconds = timePlayed;
    if (seconds > 0) {
      text += seconds + "s";
    }
  }

  if (text === "") {
    if (includeSeconds) return "0s";
    if (includeMinutes) return "0m";
    if (includeHours) return "0h";
  }

  return text.trim();
};

export const gulagResult = (gulagKills, gulagDeaths) => {
  if (gulagKills > 0) return 1;
  if (gulagDeaths > 0) return -1;
  return 0;
};

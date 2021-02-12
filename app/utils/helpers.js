const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const formatDate = (utcSeconds) => {
    let date = new Date(utcSeconds * 1000);
    let month = monthNames[date.getMonth()];
    let day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return month + ' ' + day + ' ' + hours + ':' + minutes + ampm;
}

export const gulagResult = (gulagKills, gulagDeaths) => {
    if (gulagKills > 0) return 1;
    if (gulagDeaths > 0) return -1;
    return 0;
}

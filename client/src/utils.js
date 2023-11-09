export const getLocalTime = (timestamp) => {
    const utcISOTime = timestamp;
    const utcEpochTime = new Date(utcISOTime).getTime();
    const timeZoneOffsetLocalvsUTCInMin = new Date().getTimezoneOffset();
    const timeZoneOffsetLocalvsUTCInSec = timeZoneOffsetLocalvsUTCInMin * 1000;
    const localEpochTimeOfUTCcurrent = utcEpochTime + timeZoneOffsetLocalvsUTCInSec;
    const date = new Date(localEpochTimeOfUTCcurrent * 1000);
    return date.toISOString();
}
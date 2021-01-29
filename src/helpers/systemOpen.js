exports.systemOpen = (companyInfo) => {
  var date = new Date();
  date.toLocaleString([], { timeZone : "America/Sao_Paulo" });

  const openHour =
    date && companyInfo && companyInfo.timetable && companyInfo.timetable[date.getDay()] &&
      companyInfo.timetable[date.getDay()].beginHour ? companyInfo.timetable[date.getDay()].beginHour : "";

	const endHour =
    date && companyInfo && companyInfo.timetable && companyInfo.timetable[date.getDay()] &&
      companyInfo.timetable[date.getDay()].endHour ? companyInfo.timetable[date.getDay()].endHour : "";

	const current = new Date("2020-07-28 " + date.getHours() + ":" + date.getMinutes());
	const open = new Date("2020-07-28 " + openHour);
  const end = new Date("2020-07-28 " + endHour);
<<<<<<< HEAD

  // console.log("date: " + date);
  // console.log("current: " + current);
  // console.log("open: " + open);
  // console.log("end: " + end);
=======
>>>>>>> 4536fe70845bb47f860f9c9d2f80d665c3cf5424

	if(end.getTime() < open.getTime()) {
		if ((current.getTime() >= open.getTime()) || (current.getTime() <= end.getTime())) {
			return true;
		} else {
			return false;
		}
	} else if ((current.getTime() >= open.getTime()) && (current.getTime() <= end.getTime())) {
		return true;
	} else {
		return false;
	}
};
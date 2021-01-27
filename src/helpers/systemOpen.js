exports.systemOpen = (companyInfo) => {
	const data = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
	const openHour = data && companyInfo && companyInfo.timetable &&
									companyInfo.timetable[data.getDay()].beginHour ?
		companyInfo.timetable[data.getDay()].beginHour : "";

	const endHour = data && companyInfo && companyInfo.timetable &&
									companyInfo.timetable[data.getDay()].endHour ?
		companyInfo.timetable[data.getDay()].endHour : "";

	const current = new Date("2020-07-28 " + data.getHours() + ":" + data.getMinutes());
	const open = new Date("2020-07-28 " + openHour);
	const end = new Date("2020-07-28 " + endHour);

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
module.exports = (input) => {
	const date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

	const months = [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro"
	];
	const weekDay = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

	switch(input) {
		case "date":
			return date;
		case "day":
			return date.getDate().toString();
		case "month":
			return months[date.getMonth()];
		case "year":
			return date.getFullYear().toString();
		case "weekDay":
			return weekDay[date.getDay()];
		case "hours":
			return date.getHours() < 10 ? `0${date.getHours()}` : date.getHours().toString();
		case "minutes":
			return date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes().toString();
		default:
			return null;
	}
};

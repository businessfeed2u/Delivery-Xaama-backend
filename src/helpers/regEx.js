//	Defining regular expression to validations
module.exports = {
	price : new RegExp(/^[0-9]+(\.[0-9]+)*$/),
	prices : new RegExp(/^[0-9]+(\.[0-9]+)*(,\s?[0-9]+(\.?[0-9]+)*)*$/),
	email : new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/),
	password : new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
	phone : new RegExp(/^\(?[0-9]{2}\)?\s?[0-9]?\s?[0-9]{4}-?[0-9]{4}$/),
	seq : new RegExp(/^[^\s,]+(\s[^\s,]+)*(,\s?[^\s,]+(\s[^\s,]+)*)*$/),
  address : new RegExp(/^([^\s,]+(\s[^\s,]+)*),\s?([0-9]+),\s?([^\s,]+(\s[^\s,]+)*)(,\s?[^\s,]+(\s[^\s,]+)*)?$/),
  hour : new RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
};
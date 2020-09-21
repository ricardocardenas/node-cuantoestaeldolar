const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Express = require('express');

async function getData(url) {
	resp = await fetch(url);
	html = await resp.text();
	$ = cheerio.load(html);

	let cambistas = [];
	let compras = [];
	let ventas = [];
	
	tabla = $("div.clear-fix.block-change-o.list-p-d.mb-b.mt-20 > div");
	$("h3 a", tabla).each((i, elem) => cambistas.push($(elem).text()));
	$("div.tb_dollar_compra", tabla).each((i, elem) => {
	         val = $(elem).text().trim();
			 if (val != "Compra") {
				 compras.push(parseFloat(val));
				 };
			 });
	$("div.tb_dollar_venta", tabla).each((i, elem) => {
	         val = $(elem).text().trim();
			 if (val != "Venta") {
				 ventas.push(parseFloat(val));
				 };
			 });

	tabla = $("div.clear-fix.block-int-cal > div.block-left > div > div:last-child");
	$("img", tabla).each((i, elem) => cambistas.push($(elem).attr("alt")));
	$("div.tb_dollar_compra", tabla).slice(1).each((i, elem) => compras.push(parseFloat($(elem).text().replace(/\$/, ""))));
	$("div.tb_dollar_venta", tabla).slice(1).each((i, elem)  => ventas.push(parseFloat($(elem).text().replace(/S\/\./, ""))));

	resultados = cambistas.map( (elem, i) => {
		halfSpread = Math.round((ventas[i]-compras[i]) / 2 * 10000 + Number.EPSILON)/10000;
		return {"Cambista" : elem, "Compra" : compras[i], "Venta" : ventas[i], "HalfSpread" : halfSpread}
	});
	return resultados.sort((a,b) => a.HalfSpread - b.HalfSpread);
	// console.log(resultados);
}

const app = Express();

app.get("/", (req,res) => {
	p = getData("https://cuantoestaeldolar.pe/");
	p.then( resultados => res.json(resultados));
});

app.listen(5000, _ => console.log("listening..."));

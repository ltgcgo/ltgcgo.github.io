"use strict";

import {Alpine} from "../../libs/alpine@alpinejs/alpine.min.js";

/** @type {Map<string,Map<string,string>>} */
const sources = new Map();
/** @type {Map<string,string>|null} */
let matchedSource;
/** @param {string} text
* @returns {string} */
const getAdaptedUrl = function (text) {
	if (typeof text !== "string") {
		return text;
	};
	if (matchedSource) {
		let result = text;
		const segments = text.split("/");
		const matchers = [`//${segments[2]}/`, `${segments[0]}//${segments[2]}/`];
		for (const matcher of matchers) {
			const target = matchedSource.get(matcher);
			if (Number.isSafeInteger(target?.length)) {
				result = result.replace(matcher, target);
				break;
			};
		};
		return result;
	} else {
		return text;
	};
};

{
	const sourceNoop = new Map();
	sources.set("gh.ltgc.cc", sourceNoop);
	const sourceDev = new Map([["https://kb.ltgc.cc/","http://[::1]:3000/"]]);
	sources.set("localhost", sourceDev);
	sources.set("127.0.0.1", sourceDev);
	const sourceDerive = new Map([["https://kb.ltgc.cc/","./kb/"]]);
	sources.set("", sourceDerive);
	sources.set("onion", sourceDerive);
	sources.set("i2p", sourceDerive);
	const sourceOnion = new Map([["https://kb.ltgc.cc/","https://kb.ltgcgoeqceejmptl2z3j2ofj3osytr3h7xqje6mtvr3i5p3avi443eid.onion"]]);
	sources.set("ltgcgoeqceejmptl2z3j2ofj3osytr3h7xqje6mtvr3i5p3avi443eid.onion", sourceOnion);
	const sourceEepB32 = new Map([["https://kb.ltgc.cc/","https://kb.3rniool2rdvhlhv6sipgc2khzdemd53b5bvhgzfd432eych7lg7a.b32.i2p"]]);
	sources.set("3rniool2rdvhlhv6sipgc2khzdemd53b5bvhgzfd432eych7lg7a.b32.i2p", sourceEepB32);
	const sourceEepSite = new Map([["https://kb.ltgc.cc/","https://kb.ltgc.i2p"]]);
	sources.set("ltgc.i2p", sourceEepSite);
	const sourceYgg = new Map([["https://kb.ltgc.cc/","https://kb.ygg.ltgc.cc"]]);
	sources.set("ygg.ltgc.cc", sourceYgg);
};
{
	const segments = location.hostname.split(".");
	let matcher = "";
	for (let i = 0; i <= segments.length; i ++) {
		if (i > 0) {
			if (i > 1) {
				matcher = "." + matcher;
			};
			matcher = segments[segments.length - i] + matcher;
		};
		const matchTest = sources.get(matcher);
		if (matchTest) {
			matchedSource = matchTest;
		} else {
			break;
		};
	};
	console.debug(`Used replacement matcher for: "${matcher}".`);
};
(async () => {
	Alpine.store("catalogue", []);
	const catalogueEntry = Alpine.store("catalogue");
	for (const e of await (await fetch("./catalogue.json")).json()) {
		let show = !(e.onlyOn?.length > 0);
		if (e.onlyOn?.length > 0 && e.onlyOn.indexOf(location.hostname) > -1) {
			show = true;
		};
		if (show) {
			if (e.docs?.kb) e.docs.kb = getAdaptedUrl(e.docs.kb);
			catalogueEntry.push(e);
		};
	};
})();
(async () => {
	Alpine.start();
	for (const e of document.querySelectorAll("a.adaptive-link")) {
		e.href = getAdaptedUrl(e.href);
	};
})();
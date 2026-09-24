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
	sources.set("localhost", sourceNoop);
	sources.set("127.0.0.1", sourceNoop);
	const sourceDerive = new Map([["https://kb.ltgc.cc/","./kb/"]]);
	sources.set("", sourceDerive);
	sources.set("onion", sourceDerive);
	sources.set("i2p", sourceDerive);
	const sourceDefault = new Map([]);
	sources.set("gh.ltgc.cc", sourceDefault);
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
"use strict";

import {Alpine} from "../../libs/alpine@alpinejs/alpine.min.js";

(async () => {
	Alpine.store("catalogue", []);
	const catalogueEntry = Alpine.store("catalogue");
	for (const e of await (await fetch("./catalogue.json")).json()) {
		let show = !(e.onlyOn?.length > 0);
		if (e.onlyOn?.length > 0 && e.onlyOn.indexOf(location.hostname) > -1) {
			show = true;
		};
		if (show) {
			catalogueEntry.push(e);
		};
	};
})();

(async () => {
	Alpine.start();
})();
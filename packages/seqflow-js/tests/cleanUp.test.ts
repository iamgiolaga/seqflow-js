import { expect, test } from "vitest";
import { ComponentParam, start } from "../src/index";

test("test 1", async () => {
	async function app({ dom, event }: ComponentParam) {
		dom.render('<button type="button">increment</button><p id="result"></p>');

		const result = dom.querySelector<HTMLParagraphElement>("#result");

		let i = 0;
		const events = event.waitEvent(event.domEvent("click"));
		for await (const event of events) {
			result.textContent = `${++i}`;
		}
	}

	const c = start(document.body, app);
	expect(document.body.innerHTML).toBe(
		'<button type="button">increment</button><p id="result"></p>',
	);

	document.body.querySelector<HTMLButtonElement>("button")?.click();
	await new Promise((resolve) => setTimeout(resolve, 10));

	expect(document.body.innerHTML).toBe(
		'<button type="button">increment</button><p id="result">1</p>',
	);

	document.body.querySelector<HTMLButtonElement>("button")?.click();
	document.body.querySelector<HTMLButtonElement>("button")?.click();
	document.body.querySelector<HTMLButtonElement>("button")?.click();
	await new Promise((resolve) => setTimeout(resolve, 10));

	expect(document.body.innerHTML).toBe(
		'<button type="button">increment</button><p id="result">4</p>',
	);

	// This should unmount the whole application
	c.abort("test");
	await new Promise((resolve) => setTimeout(resolve, 100));

	const result = document.body.querySelector<HTMLParagraphElement>("#result");

	// The handler is not attached anymore
	document.body.querySelector<HTMLButtonElement>("button")?.click();
	await new Promise((resolve) => setTimeout(resolve, 10));

	expect(result?.innerHTML).toBe("4");

	async function app2({ dom, event }: ComponentParam) {
		dom.render(`
<button type="button" id="increment">increment</button>
<button type="button" id="decrement">decrement</button>
<p id="result"></p>
`);

		const result = dom.querySelector<HTMLParagraphElement>("#result");
		const increment = dom.querySelector<HTMLButtonElement>("#increment");
		const decrement = dom.querySelector<HTMLButtonElement>("#decrement");

		let i = 0;
		const events = event.waitEvent(event.domEvent("click"));
		for await (const event of events) {
			if (event.target === increment) {
				result.textContent = `${++i}`;
			} else if (event.target === decrement) {
				result.textContent = `${--i}`;
			} else {
				throw new Error("unknown event");
			}
		}
	}
	start(document.body, app2);

	expect(document.body.innerHTML).toBe(`
<button type="button" id="increment">increment</button>
<button type="button" id="decrement">decrement</button>
<p id="result"></p>
`);

	document.body.querySelector<HTMLButtonElement>("#increment")?.click();
	await new Promise((resolve) => setTimeout(resolve, 10));

	const result2 = document.body.querySelector<HTMLParagraphElement>("#result");
	expect(result2?.innerHTML).toBe("1");
});

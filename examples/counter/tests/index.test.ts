import { screen, waitFor } from "@testing-library/dom";
import { start } from "seqflow-js";
import { expect, test } from "vitest";
import { Main } from "../src/Main";

test("should increment and decrement the counter", async () => {
	start(document.body, Main, undefined, {});

	const incrementButton = await screen.findByText(/increment/i);
	const decrementButton = await screen.findByText(/decrement/i);
	const counterDiv = await screen.findByText(/0/i);

	expect(counterDiv?.textContent).toBe("0");

	incrementButton?.click();
	await waitFor(() => expect(counterDiv?.textContent).toBe("1"));
	incrementButton?.click();
	await waitFor(() => expect(counterDiv?.textContent).toBe("2"));
	decrementButton?.click();
	await waitFor(() => expect(counterDiv?.textContent).toBe("1"));
});

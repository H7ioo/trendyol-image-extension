import { receiveMessage } from "../utils";

async function selectVideoProducts({
  modelCodeArray,
  sleepDuration = 500,
  selectionType,
}: {
  modelCodeArray: string[];
  sleepDuration?: number;
  selectionType: "first" | "all";
}) {
  // TODO: Move to utils
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  type VueElement = Element & {
    __vue__: { params: { barcode: string; productMainId: string } };
  };
  const cleanup = () => {
    const _clearButton = document.querySelector(
      "#link-product-filter-clear-button"
    );
    if (!_clearButton) {
      console.error("Couldn't find clear button");
      return;
    }
    const clearButton = _clearButton.shadowRoot?.querySelector("button");
    if (clearButton) {
      const searchInputContainer = Array.from(
        document.querySelectorAll("*")
      ).find((e) => (e as VueElement).__vue__?.params?.barcode !== undefined);
      if (!searchInputContainer)
        return alert("Couldn't find the search input container!");
      (searchInputContainer as VueElement).__vue__.params.productMainId = "";
      clearButton.click();
    }
  };
  for (let modelCode of modelCodeArray) {
    const searchInputContainer = Array.from(
      document.querySelectorAll("*")
    ).find((e) => (e as VueElement).__vue__?.params?.barcode !== undefined);
    if (!searchInputContainer)
      return alert("Couldn't find the search input container!");
    (searchInputContainer as VueElement).__vue__.params.productMainId =
      modelCode;
    await sleep(sleepDuration); // NNCS
    const _searchInputSubmitButton = document.querySelector(
      "#link-product-filter-sumbit-button"
    );
    if (!_searchInputSubmitButton) {
      console.error("Couldn't find search button");
      return;
    }
    const searchInputSubmitButton =
      _searchInputSubmitButton.shadowRoot?.querySelector("button");
    if (!searchInputSubmitButton)
      return alert("Couldn't find the search input submit button!");
    searchInputSubmitButton.click();
    await sleep(sleepDuration); // NCS
    const table = document.querySelector("div.g-table > table");
    // Options
    // 1. Select First Element
    // 2. Select All Elements
    if (!table) {
      console.error("Couldn't find table!");
      return;
    }
    const firstElementCheckbox: HTMLInputElement | null = table.querySelector(
      "tbody > tr input[type='checkbox']"
    );
    const allElementsCheckbox: HTMLInputElement | null = table.querySelector(
      "thead input[type='checkbox']"
    );
    if (selectionType === "first") {
      if (!firstElementCheckbox)
        return alert("Couldn't find the firstElement!");
      firstElementCheckbox.click();
    } else if (selectionType === "all") {
      if (!allElementsCheckbox)
        return alert("Couldn't find the allelementsCheckbox!");
      allElementsCheckbox.click();
    }
    await sleep(sleepDuration); // NNCS
  }
  cleanup();
}
(() => {
  // TODO:
  // Check both yayindaki and stogu biten
  // Do by barcode
  // build a UI for first option and all for the naive way because in the complicated way there is no need for that. if the element doesn't exist you could console.error or show a toast which is probably better
  // TODO: I should have a pop up and do actions based on it
  // FIELDS:
  //  Select: First Element, All Elements
  //  Based on Specific Attr: Color (probably use title) try to access the element internal values
  //  Try to minuplite the API
  //  Voice message on Note-To-Self
  //  NOrmal use and detaild use
  //  - Upload sheet and query for color, barcode, tel model etc.
  // or type your color yourself ( should exist in title )

  receiveMessage({
    action: "START_VIDEO_SELECT",
    callback(payload) {
      selectVideoProducts({
        modelCodeArray: payload.barcodes,
        selectionType: "first",
      });
    },
  });
})();

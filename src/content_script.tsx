const mainButtonStyles: Partial<CSSStyleDeclaration> = {
  fontSize: "16px",
  backgroundColor: "#000",
  color: "white",
  fontWeight: "bold",
  paddingBlock: "10px",
  paddingInline: "15px",
  whiteSpace: "whiteSpace",
  border: "none",
  borderRadius: "5px",
  transition: "all",
  transitionDuration: "0.2s",
};
let styleSheetAdded = false;
const createButton = (
  textContent: string,
  styles: Partial<CSSStyleDeclaration>
) => {
  const className = "download-button-extension";

  const button = document.createElement("button");
  button.textContent = textContent;
  button.classList.add(className);

  Object.assign(button.style, {
    ...mainButtonStyles,
    ...styles,
  });

  if (!styleSheetAdded) {
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");

    const rgb = button.style.backgroundColor;
    const rgbValues = rgb.slice(rgb.indexOf("(") + 1, rgb.indexOf(")"));

    const css = `
      .${className}:hover {
        background-color: rgba(${rgbValues}, .9) !important;
      }
  `;

    // @ts-ignore
    if (style.styleSheet) {
      // IE
      // @ts-ignore
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
    styleSheetAdded = true;
  }

  return button;
};

function removeSourceSize(url: string) {
  return url.replace("image/resize,w_500,limit_0", "style/resized");
}

function updateButtonIsLoading(
  button: HTMLButtonElement,
  textContent: string,
  isDisabled: boolean
) {
  button.textContent = textContent;
  button.disabled = isDisabled;
}

function updateButtonUI(button: HTMLButtonElement, newText: string) {
  button.textContent = newText;
}

function showMessageButtonUI(
  button: HTMLButtonElement,
  message: string,
  ms = 1500
) {
  const prevTextContent = button.textContent;
  button.textContent = message;
  setTimeout(() => {
    button.textContent = prevTextContent;
  }, ms);
}

function inject(src: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(src);
  script.onload = function () {
    console.log("INJ");
    // @ts-ignore
    // this.remove();
  };
  const head = document.head || document.documentElement;
  head.appendChild(script);
}

function initiateCopyImageButton() {
  const EXCEL_HORIZONTAL_SPACE = "	";
  let urls: string[] = [];

  // Inject script to access Vue's internal state
  inject("/js/inject_script.js");

  // Listen for messages from inject_script.js
  window.addEventListener("message", function (e) {
    const { type, newValues } = e.data;
    if (type === "GALLERY_ITEM_CHANGE") {
      if (!newValues) throw new Error("Couldn't access the new values!");
      updateButtonUI(button, `${newValues.length} Fotoğraf Kopyala`);
      urls = newValues;
      console.log(newValues);
    }
    console.log(e);
  });

  const headerBox = document.querySelector(".box-header");
  if (!headerBox) throw new Error("Header box doesn't exist!");

  const button = createButton(`${urls.length} Fotoğraf Kopyala`, {
    fontSize: "12px",
    backgroundColor: "#f27a1a",
    color: "white",
    fontWeight: "bold",
    marginLeft: "15px",
  });

  button.addEventListener("click", () => {
    const pasteFormat = urls.join(EXCEL_HORIZONTAL_SPACE);
    try {
      // No URL
      if (!pasteFormat) {
        showMessageButtonUI(button, "Fotoğraf Seçilmedi!");
        return;
      }
      navigator.clipboard.writeText(pasteFormat);
      showMessageButtonUI(button, "Başarıyla Kopyalandı!");
    } catch (error) {
      alert(`Hata oluştu! ${error}`);
    }
  });

  headerBox.appendChild(button);
}

window.addEventListener("load", async function () {
  // TODO: Add clear button
  // TODO: Fix trendyol UI Issues like
  // - box header style
  // - Gorsel DND
  // - Enter doesn't trigger search
  // TODO: Add row copy and column copy
  initiateCopyImageButton();
});

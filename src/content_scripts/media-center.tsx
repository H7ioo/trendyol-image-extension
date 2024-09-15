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
  styles?: Partial<CSSStyleDeclaration>
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


function initiateCopyImageButton({
  buttonTextContent,
  spacing,
}: {
  buttonTextContent: string;
  spacing: string;
}) {
  // For proxy to work you shouldn't assign urls to anything because this will override the proxy. Use array methods instead.
  let _urls: string[] = [];
  let urls = new Proxy(_urls, {
    set: function(target, key, value) {
      if (key === "length") {
        button.disabled = value < 1;
        value < 1 ? button.style.opacity = ".65" : button.style.opacity = "1";
        updateButtonUI(button, textFormat(value))
      }
      // @ts-ignore
      target[key] = value;
      return true;

    }
  })

  const textFormat = (length: number) => `${buttonTextContent} (${length} adet)`;

  // Listen for messages from inject_script.js
  receiveMessage({
    action: "GALLERY_ITEM_CHANGE", callback: (payload) => {

      urls.splice(0, urls.length, ...payload.newValues);
    }
  })

  const headerBox = document.querySelector(".box-header .search-bar");
  if (!headerBox) { console.error("Header box doesn't exist!"); return }

  const button = createButton(textFormat(urls.length), {
    fontSize: "12px",
    backgroundColor: "#f27a1a",
    color: "white",
    fontWeight: "bold",
  });

  // Disabled on default
  button.disabled = true;
  button.style.opacity = ".65";

  button.addEventListener("click", () => {
    const pasteFormat = urls.join(spacing);
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

function fixDropzoneOverflow() {
  const dropzone: HTMLDivElement | null =
    document.querySelector("div.dropzone");
  if (!dropzone) { console.error("Dropzone not found!"); return }
  dropzone.style.overflowY = "auto";
}

const EXCEL_HORIZONTAL_SPACE = "	";
const EXCEL_VERTICAL_SPACE = `
`;

function fixSearchKeyPress() {
  const container = document.querySelector("div.search-container");
  const input = container?.querySelector("input");
  const button = container?.querySelector("button");
  if (!input || !button) { console.error("Couldn't find input or button!"); return }
  input.onkeyup = (e) => {
    if (e.key === "Enter") {
      button.click();
    }
  };
}

function fixSearchBarStyling(first = true) {
  const searchBar: HTMLDivElement | null =
    document.querySelector("div.search-bar");
  if (!searchBar) { console.error("Couldn't find search bar!"); return }
  const searchBarChildren = Array.from(searchBar.children) as (
    | HTMLDivElement
    | HTMLButtonElement
  )[];
  if (!searchBarChildren.length) { console.error("Couldn't find search bar children"); return }
  searchBar.style.display = "flex";
  searchBar.style.flexWrap = "wrap";
  searchBar.style.gap = "10px";

  searchBarChildren.forEach((c) => {
    c.style.setProperty("margin", "0", "important");
    if (c.classList.contains("search-container")) {
      c.style.setProperty("padding", "0", "important");
    }
  });

  if (!first) return;
  receiveMessage({
    action: "GALLERY_TAB_CHANGE", callback() {
      fixSearchBarStyling(false);
    },
  })
}

function moveSearchBarToTheEnd() {
  const searchBar = document.querySelector("div.search-container");
  if (!searchBar) {
    console.error("Container or Searchbar couldn't found!");
    return;
  }
  const parent = searchBar.parentElement;
  parent?.append(searchBar);
}

function clearSelectionButton() {
  const button = createButton("Seçilenleri Kaldır",
    {
      fontSize: "12px",
      backgroundColor: "#f27a1a",
      color: "white",
      fontWeight: "bold",
    });
  const headerBox = document.querySelector(".box-header .search-bar");
  if (!headerBox) { console.error("Header box doesn't exist!"); return }

  button.onclick = () => {
    // Send post meesage to inject_script to update vue state
    postMessage({ action: "GALLERY_ITEM_RESET", payload: {} })
  }

  headerBox.append(button)
}

import { inject, postMessage, receiveMessage } from "../utils";

window.addEventListener("load", async function() {

  inject("/js/inject_scripts/media-center.js");

  initiateCopyImageButton({
    spacing: EXCEL_VERTICAL_SPACE,
    buttonTextContent: "Dikey Fotoğraf Kop.",
  });

  initiateCopyImageButton({
    spacing: EXCEL_HORIZONTAL_SPACE,
    buttonTextContent: "Yatay Fotoğraf Kop.",
  });

  fixDropzoneOverflow();

  fixSearchKeyPress();

  fixSearchBarStyling();

  clearSelectionButton();

  moveSearchBarToTheEnd();

});

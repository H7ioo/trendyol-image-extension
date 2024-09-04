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

function inject(src: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(src);
  // script.onload = function () {
  // };
  const head = document.head || document.documentElement;
  head.appendChild(script);
}

function initiateCopyImageButton({
  buttonTextContent,
  spacing,
}: {
  buttonTextContent: string;
  spacing: string;
}) {
  let urls: string[] = [];

  // Inject script to access Vue's internal state
  inject("/js/inject_script.js");

  // Listen for messages from inject_script.js
  window.addEventListener("message", function(e) {
    const { type, newValues } = e.data;
    if (type === "GALLERY_ITEM_CHANGE") {
      if (!newValues) throw new Error("Couldn't access the new values!");
      updateButtonUI(button, `${newValues.length} ${buttonTextContent}`);
      urls = newValues;
    }
  });

  const headerBox = document.querySelector(".box-header .search-bar");
  if (!headerBox) throw new Error("Header box doesn't exist!");

  const button = createButton(`${urls.length} ${buttonTextContent}`, {
    fontSize: "12px",
    backgroundColor: "#f27a1a",
    color: "white",
    fontWeight: "bold",
  });

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
  if (!dropzone) throw new Error("Dropzone not found!");
  dropzone.style.overflowY = "auto";
}

const EXCEL_HORIZONTAL_SPACE = "	";
const EXCEL_VERTICAL_SPACE = `
`;

function fixSearchKeyPress() {
  const container = document.querySelector("div.search-container");
  const input = container?.querySelector("input");
  const button = container?.querySelector("button");
  if (!input || !button) throw new Error("Couldn't find input or button!");
  input.onkeyup = (e) => {
    if (e.key === "Enter") {
      button.click();
    }
  };
}

function fixSearchBarStyling() {
  const searchBar: HTMLDivElement | null =
    document.querySelector("div.search-bar");
  if (!searchBar) throw new Error("Couldn't find search bar!");
  const searchBarChildren = Array.from(searchBar.children) as (
    | HTMLDivElement
    | HTMLButtonElement
  )[];
  if (!searchBarChildren.length)
    throw new Error("Couldn't find search bar children");
  searchBar.style.display = "flex";
  searchBar.style.flexWrap = "wrap";
  searchBar.style.gap = "10px";
  console.log(searchBarChildren);
  searchBarChildren.forEach((c) => {
    c.style.setProperty("margin", "0", "important");
    if (c.classList.contains("search-container")) {
      c.style.setProperty("padding", "0", "important");
    }
  });
}

function clearSelectionButton() {
  const button = createButton("Seçilenleri Sıfırla",
    {
      fontSize: "12px",
      backgroundColor: "#f27a1a",
      color: "white",
      fontWeight: "bold",
    });
  const headerBox = document.querySelector(".box-header .search-bar");
  if (!headerBox) throw new Error("Header box doesn't exist!");

  button.onclick = (e) => {
    // Send post meesage to inject_script to update vue state
    window.postMessage(
      {
        type: "GALLERY_ITEM_RESET",
      },
      "*"
    );
  }

  headerBox.append(button)
}

window.addEventListener("load", async function() {
  // TODO: Add clear button
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

  // TODO: on tab change update count of copy button...
  // TODO: Apply fix searchBar styling on tab change
});

// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//   if (msg.color) {
//     console.log("Receive color = " + msg.color);
//     document.body.style.backgroundColor = msg.color;
//     sendResponse("Change color to " + msg.color);
//   } else {
//     sendResponse("Color message is none.");
//   }
// });

import { ChangeEvent } from "react";

// document.querySelectorAll(".galleries > li > .image-item");
// img
// .replace("image/resize,w_500,limit_0", "style/resized");

// If the image is in the array remove it, if it is not there add it.
//   document.querySelectorAll(".galleries > li > .image-item")[0].addEventListener("click", function (e) {
//     if (e.target) {
//         console.log(this.querySelector("img").src)
//     }
// });

window.addEventListener("load", async function () {
  const EXCEL_SPACE = "	";
  let urls: string[] = [];

  function fixImageUrl(url: string) {
    return url.replace("image/resize,w_500,limit_0", "style/resized");
  }

  function buttonSuccessUI(button: HTMLButtonElement, message: string) {
    button.textContent = `${message}`;
  }

  function updateButtonUI(button: HTMLButtonElement, count: number) {
    button.textContent = `${count} Fotoğraf Kopyala`;
  }

  const headerBox = this.document.querySelector(".box-header");
  const button = document.createElement("button");
  button.style.fontSize = "12px";
  button.style.backgroundColor = "#f27a1a";
  button.style.color = "white";
  button.style.fontWeight = "bold";
  button.style.paddingBlock = "5px";
  button.style.whiteSpace = "whiteSpace";
  button.style.border = "none";
  button.style.borderRadius = "3px";
  button.style.marginLeft = "15px";

  updateButtonUI(button, urls.length);
  headerBox?.appendChild(button);

  // function waitForElm(selector: string) {
  //   return new Promise((resolve) => {
  //     if (document.querySelector(selector)) {
  //       return resolve(document.querySelector(selector));
  //     }

  //     const observer = new MutationObserver((mutations) => {
  //       if (document.querySelector(selector)) {
  //         observer.disconnect();
  //         resolve(document.querySelector(selector));
  //       }
  //     });

  //     // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
  //     observer.observe(document.body, {
  //       childList: true,
  //       subtree: true,
  //     });
  //   });
  // }

  function imageClick(e: Event, image: Node) {
    const event = e as unknown as ChangeEvent;
    if (
      // event.target.className === "option-dots" ||
      event.target.className === "gallery-item"
    )
      return;
    const imageSrc = (image as Element).querySelector("img")?.src;
    if (imageSrc) {
      const url = fixImageUrl(imageSrc);
      if (urls.includes(url)) {
        urls.splice(urls.indexOf(url), 1);
      } else {
        urls.push(url);
      }
    }
    updateButtonUI(button, urls.length);
  }

  let observer = new MutationObserver((mutations) => {
    // this.alert("Fotoğraf seçmeye başlayabilirsiniz!");
    // Remove all the elements when the elements gets updated
    urls = [];
    updateButtonUI(button, urls.length);
    for (let mutation of mutations) {
      for (let image of mutation.addedNodes) {
        (image as HTMLLIElement).onclick = null;
        (image as HTMLLIElement).onclick = (e: Event) => imageClick(e, image);
      }
    }
  });

  observer.observe(document.querySelector(".galleries")!, {
    childList: true,
    subtree: true,
  });

  // Waits for element to exists in the DOM
  // await waitForElm(".galleries > li > .image-item");

  // const images = document.querySelectorAll(".galleries > li > .image-item");

  // On click add to / or remove from / the array of urls (IF CLICK ON SELECT OR 3 DOTS NOTHING WILL HAPPEN)
  // images.forEach((image) => {
  //   image.addEventListener("click", function (e) {
  //     const imageSrc = image.querySelector("img")?.src;
  //     if (imageSrc) {
  //       const url = fixImageUrl(imageSrc);
  //       if (urls.includes(url)) {
  //         urls.splice(urls.indexOf(url), 1);
  //       } else {
  //         urls.push(url);
  //       }
  //     }
  //   });
  // });

  button.addEventListener("click", () => {
    const pasteFormat = urls.join(EXCEL_SPACE);
    try {
      this.navigator.clipboard.writeText(pasteFormat);
      buttonSuccessUI(button, "Başarıyla Kopyalandı!");
      setTimeout(() => {
        updateButtonUI(button, urls.length);
      }, 1500);
    } catch (error) {
      this.alert(`Hata oluştu! ${error}`);
    }
  });

  // When popup copy is triggered create textarea copy the text and delete the textarea
  // chrome.runtime.onMessage.addListener(function (
  //   message,
  //   sender,
  //   sendResponse
  // ) {
  //   if (message.action == "copy") {
  //     if (!urls.length) {
  //       sendResponse({ message: "Fotoğraf seçilmedi!" });
  //       return true;
  //     }
  //     const pasteFormat = urls.join(EXCEL_SPACE);

  //     // Create a temporary textarea element
  //     var textarea = document.createElement("textarea");

  //     // Set its style to be offscreen
  //     textarea.style.cssText = "position:absolute; left:-99999px";

  //     // Set the value of the textarea to the text you want to copy
  //     textarea.value = pasteFormat;

  //     // Append the textarea to the document body
  //     document.body.appendChild(textarea);

  //     // Select the content of the textarea
  //     textarea.select();

  //     // Execute the copy command
  //     document.execCommand("copy");

  //     // Remove the textarea from the document
  //     document.body.removeChild(textarea);

  //     sendResponse({
  //       message: `Başarıyla ${urls.length} fotoğraf kopyalandı!`,
  //     });
  //   }
  //   return true;
  // });
});

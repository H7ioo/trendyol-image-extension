type Files = {
  createdAt: number;
  id: number;
  isChecked: boolean;
  name: string;
  resolution: string;
  type: "IMAGE";
  url: string;
}[];


function watchFilesState(_item: Element) {
  const item = _item as Element & {
    __vue__: {
      files: Files,
      $watch: (
        field: string,
        callback: (oldValue: Files, newValue: Files) => void,
        options: Partial<{
          deep: boolean;
          immediate: boolean;
          once: boolean;
        }>
      ) => void;
    };
  };
  // Post on the first init
  window.postMessage({
    type: "GALLERY_ITEM_CHANGE", newValues: item.__vue__.files.map(file => file.url)
  }, "*")
  item.__vue__.$watch(
    "files",
    function(newValue, oldValue) {
      window.postMessage(
        {
          type: "GALLERY_ITEM_CHANGE",
          newValues: newValue.map((file) => file.url),
        },
        "*"
      );
    },
    { deep: true }
  );
}

(() => {
  let observer = new MutationObserver((mutations) => {
    const isThereAddedNode = mutations.some(mutation => mutation.addedNodes.length);
    // There is no image at this page (".gallery-item")
    if (!isThereAddedNode) {
      window.postMessage({
        type: "GALLERY_ITEM_CHANGE",
        newValues: []
      }, "*")
    }
    for (let mutation of mutations) {
      // Add $watch only on the first element (first element doesn't have siblings)
      if (!(mutation.previousSibling === null)) return;
      for (let _image of mutation.addedNodes) {
        const _item = document.querySelector(".gallery-item");
        if (!_item) { console.error("Item not found!"); return }
        watchFilesState(_item);
      }
    }
  });

  const galleryItem = document.querySelector(".gallery-item");
  if (galleryItem) {
    watchFilesState(galleryItem)
  }

  observer.observe(document.querySelector(".galleries")!, {
    childList: true,
    subtree: true,
  });

  let tabObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type !== "attributes" && mutation.attributeName !== "class") return;
      window.postMessage({ type: "TAB_CHANGE" }, "*")
    }
  })
  tabObserver.observe(
    document.querySelector("ul.navbar-nav")!, { childList: true, subtree: true, attributes: true }
  )

  window.addEventListener("message", function(e) {
    const { type } = e.data;
    if (type === "GALLERY_ITEM_RESET") {
      const _galleryItem = document.querySelector(".gallery-item");
      if (!_galleryItem) { console.error("Couldn't find gallery item!"); return }
      const galleryItem = _galleryItem as
        Element
        & {
          __vue__: {
            files: [{ isChecked: boolean }]
          }
        }
      galleryItem.__vue__.files.forEach(f => f.isChecked = false);
    }
  });

})();

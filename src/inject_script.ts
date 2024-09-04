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
    for (let mutation of mutations) {
      // Add $watch only on the first element (first element doesn't have siblings)
      if (!(mutation.previousSibling === null)) return;
      for (let _image of mutation.addedNodes) {
        const _item = document.querySelector(".gallery-item");
        if (!_item) throw new Error("Item not found!");
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

  window.addEventListener("message", function(e) {
    const { type } = e.data;
    if (type === "GALLERY_ITEM_RESET") {
      const _galleryItem = document.querySelector(".gallery-item");
      if (!_galleryItem) throw new Error("Couldn't find gallery item!")
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

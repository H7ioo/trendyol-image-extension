type Files = {
  createdAt: number;
  id: number;
  isChecked: boolean;
  name: string;
  resolution: string;
  type: "IMAGE";
  url: string;
}[];

const GLOBAL_URLS: string[] = [];

function watchFilesState(_item: Element) {
  const item = _item as Element & {
    __vue__: {
      files: Files;
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

  // Reset on the first init (tab change)
  window.postMessage(
    {
      type: "GALLERY_ITEM_CHANGE",
      newValues: [],
    },
    "*"
  );

  // TODO: If you type the same word and search the files will reset but the count won't

  item.__vue__.$watch(
    "files",
    function (newValue, oldValue) {
      const oldValuesIds = oldValue.map((val) => val.id);
      const newValuesIds = newValue.map((val) => val.id);
      const newAddedValue = newValue.filter(
        (val) => !oldValuesIds.includes(val.id)
      );
      const newRemovedValue = oldValue.filter(
        (val) => !newValuesIds.includes(val.id)
      );
      // We use this array to have the order correctly
      // Reset required
      if (oldValue.length === 0) {
        GLOBAL_URLS.length = 0;
      }
      if (newAddedValue.length) {
        GLOBAL_URLS.push(newAddedValue[0]!.url);
      } else {
        const filteredArray = GLOBAL_URLS.filter(
          (url) => newRemovedValue[0]!.url !== url
        );
        GLOBAL_URLS.length = 0;
        GLOBAL_URLS.push(...filteredArray);
      }
      window.postMessage(
        {
          type: "GALLERY_ITEM_CHANGE",
          newValues: GLOBAL_URLS,
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
      console.log(mutation);
      // Add $watch only on the first element (first element doesn't have siblings)
      if (!(mutation.previousSibling === null)) continue;
      for (let _image of mutation.addedNodes) {
        console.log(_image);
        const _item = document.querySelector(".gallery-item");
        if (!_item) {
          console.error("Item not found!");
          continue;
        }
        watchFilesState(_item);
      }
    }
  });

  const galleryItem = document.querySelector(".gallery-item");
  if (galleryItem) {
    watchFilesState(galleryItem);
  }

  observer.observe(document.querySelector(".galleries")!, {
    childList: true,
    subtree: true,
  });

  let tabObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type !== "attributes" && mutation.attributeName !== "class")
        return;
      window.postMessage({ type: "TAB_CHANGE" }, "*");
      // Reset gallery on tab change
      window.postMessage(
        {
          type: "GALLERY_ITEM_CHANGE",
          newValues: [],
        },
        "*"
      );
    }
  });
  tabObserver.observe(document.querySelector("ul.navbar-nav")!, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  window.addEventListener("message", function (e) {
    const { type } = e.data;
    if (type === "GALLERY_ITEM_RESET") {
      const _galleryItem = document.querySelector(".gallery-item");
      if (!_galleryItem) {
        console.error("Couldn't find gallery item!");
        return;
      }
      const galleryItem = _galleryItem as Element & {
        __vue__: {
          files: [{ isChecked: boolean }];
        };
      };
      galleryItem.__vue__.files.forEach((f) => (f.isChecked = false));
      window.postMessage(
        {
          type: "GALLERY_ITEM_CHANGE",
          newValues: [],
        },
        "*"
      );
    }
  });
})();

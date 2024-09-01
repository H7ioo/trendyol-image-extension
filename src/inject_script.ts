type Files = {
  createdAt: number;
  id: number;
  isChecked: boolean;
  name: string;
  resolution: string;
  type: "IMAGE";
  url: string;
}[];

(() => {
  let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      // Add $watch only on the first element (first element doesn't have siblings)
      if (!(mutation.previousSibling === null)) return;
      for (let _image of mutation.addedNodes) {
        const _item = document.querySelector(".gallery-item");
        if (!_item) throw new Error("Item not found!");
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
          function (newValue, oldValue) {
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
    }
  });

  observer.observe(document.querySelector(".galleries")!, {
    childList: true,
    subtree: true,
  });
})();

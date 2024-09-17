export function inject(src: string) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(src);
  const head = document.head || document.documentElement;
  head.appendChild(script);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function waitForElm(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

type Actions = {
  "media-center": [
    {
      action: "GALLERY_ITEM_CHANGE";
      payload: { newValues: Array<string> | Set<string> };
    },
    { action: "GALLERY_TAB_CHANGE"; payload: {} },
    { action: "GALLERY_ITEM_RESET"; payload: {} }
  ];
  "video-center": [
    {
      action: "START_VIDEO_SELECT";
      payload: {
        barcodes: string[];
      };
    }
  ];
};

type GetPayload<CategoryT, ActionT> = CategoryT extends {
  action: ActionT;
  payload: infer P;
}
  ? P
  : never;

type MessageLocation = "window" | "chrome";

type PostMessage<
  CategoryT extends Actions[keyof Actions],
  ActionT extends CategoryT[number]["action"],
  PayloadT extends GetPayload<CategoryT[number], ActionT> = GetPayload<
    CategoryT[number],
    ActionT
  >
> = {
  action: ActionT;
  payload: PayloadT;
  location?: MessageLocation;
};

type ReceiveMessage<
  CategoryT extends Actions[keyof Actions] = Actions[keyof Actions],
  ActionT extends CategoryT[number]["action"] = CategoryT[number]["action"]
> = {
  action: ActionT;
  callback: (payload: GetPayload<CategoryT[number], ActionT>) => void;
  location?: MessageLocation;
};

export function postMessage<
  CategoryT extends Actions[keyof Actions],
  ActionT extends CategoryT[number]["action"],
  PayloadT extends GetPayload<CategoryT[number], ActionT> = GetPayload<
    CategoryT[number],
    ActionT
  >
>({
  action,
  payload,
  location = "window",
}: PostMessage<CategoryT, ActionT, PayloadT>) {
  if (location === "window") {
    window.postMessage({ action, payload }, "*");
  } else if (location === "chrome") {
    chrome.runtime.sendMessage({ message: { action, payload } });
  }
}

export function receiveMessage<
  CategoryT extends Actions[keyof Actions],
  ActionT extends CategoryT[number]["action"]
>({
  action,
  callback,
  location = "window",
}: ReceiveMessage<CategoryT, ActionT>) {
  if (location === "window") {
    window.addEventListener("message", function (e) {
      const { action: receivedAction, payload } = e.data;
      if (receivedAction === action) {
        callback(payload as GetPayload<CategoryT[number], ActionT>);
      }
    });
  } else if (location === "chrome") {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { action: receivedAction, payload } = message.message;
      if (receivedAction === action) {
        callback(payload as GetPayload<CategoryT[number], ActionT>);
      }
    });
  }
}
// TODO: ADD sendResponse to chrome API and try to implement it into the window

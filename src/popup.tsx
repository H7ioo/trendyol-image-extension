// import React from "react";
// import { createRoot } from "react-dom/client";

// const Popup = () => {
//   const copyUrl = () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       const tab = tabs[0];
//       if (tab.id) {
//         chrome.tabs.sendMessage(
//           tab.id,
//           {
//             action: "copy",
//           },
//           function (response: { message: string }) {
//             alert(response.message);
//           }
//         );
//       }
//     });
//   };

//   return (
//     <>
//       <button
//         style={{
//           backgroundColor: "#f27a1a",
//           color: "white",
//           fontWeight: "bold",
//           paddingBlock: "5px",
//           paddingInline: "20px",
//           whiteSpace: "nowrap",
//           border: "none",
//           borderRadius: "3px",
//         }}
//         onClick={copyUrl}
//       >
//         Bağlantıları Kopyala
//       </button>
//     </>
//   );
// };

// const root = createRoot(document.getElementById("root")!);

// root.render(
//   <React.StrictMode>
//     <Popup />
//   </React.StrictMode>
// );

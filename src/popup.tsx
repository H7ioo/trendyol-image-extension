import { Workbook } from "exceljs";
import React, { ChangeEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { postMessage } from "./utils";

const paths = { videoCenter: ["video-center/create/", "video-center/update/"] };

// TODO: what is the point if there is only 1 renk for example? there is no duplicates so it is useless
const Popup = () => {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const activeTab = tabs[0];
      setActiveTab(activeTab);
    });
  }, []);

  if (!activeTab) return <div>Bir hata oluştu!</div>;
  const contains = paths.videoCenter.some((path) =>
    activeTab.url?.includes(path)
  );
  if (contains) return <VideoCenter />;
  return <></>;
};

const VideoCenter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<{
    headers: string[];
    rows: string[][];
    activeRows: string[][];
  }>({ headers: [], rows: [], activeRows: [] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e?.target.files[0]);
  };

  useEffect(() => {
    if (!file) return;
    handleFileSubmit();
  }, [file]);

  const handleFileSubmit = async () => {
    if (!file) return;
    const workbook = new Workbook();

    await workbook.xlsx.load(await file.arrayBuffer());

    const worksheet = workbook.getWorksheet("Ürünlerinizi Burada Listeleyin");

    if (!worksheet) return;

    const headers: string[] = [];
    const rows: string[][] = [];

    // Parse headers and data
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        row.eachCell((cell, colIndex) => {
          headers.push(cell.text);
        });
      } else {
        const rowData: string[] = [];
        row.cellCount;
        row.eachCell({ includeEmpty: true }, (cell) => {
          rowData.push(cell.text);
        });
        rows.push(rowData);
      }
    });

    setFileData({ headers, rows, activeRows: rows });
  };

  const handleSubmit = () => {
    const barcodes = fileData.activeRows.map((row) => row[0]);
    postMessage({
      location: "chrome",
      action: "START_VIDEO_SELECT",
      payload: { barcodes },
    });
  };

  // Save selected options so to filter upon that, activeRows
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleOptionClick = ({
    e,
    header,
    row,
    index,
  }: {
    e: React.MouseEvent<HTMLOptionElement, MouseEvent>;
    header: string;
    row: string[];
    index: number;
  }) => {
    const eTarget = e.target as HTMLOptionElement;

    const isSelected = eTarget.selected;
    const values = isSelected
      ? [...selectedValues, eTarget.value]
      : selectedValues.filter((item) => item !== eTarget.value);

    if (isSelected) {
      setSelectedValues(values);
    } else {
      setSelectedValues(values);
    }

    setFileData((prev) => ({
      ...prev,
      activeRows: prev.rows.filter((row) => {
        if (values.length === 0) return true;
        return values.every((value) => {
          return row.includes(value);
        });
      }),
    }));
  };

  return (
    <>
      <div>
        <input
          onChange={handleChange}
          type="file"
          accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        <button onClick={handleSubmit}>Submit</button>
        {fileData.headers.map((header, index) => {
          const fieldHash: { [key: string]: boolean } = {};

          return (
            <div key={`${header}-${index}`}>
              <label style={{ display: "block" }} htmlFor={header}>
                {header}
              </label>
              <select
                style={{ minWidth: 250, maxWidth: 250, overflow: "auto" }}
                id={header}
                name={header}
                multiple
                unselectable="on"
              >
                {fileData.activeRows.map((row) => {
                  const item = row[index];
                  if (item.length === 0) return;
                  if (fieldHash[item]) return;
                  fieldHash[item] = true;

                  return (
                    <option
                      key={`${header}-${item}`}
                      onClick={(e) =>
                        handleOptionClick({ e, header, row, index })
                      }
                      value={row[index]}
                    >
                      {row[index]}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

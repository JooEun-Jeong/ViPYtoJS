import "./App.css";
import React from "react";
import Plot from "react-plotly.js";
// import "bootstrap/dist/css/bootstrap.min.css"; // bootstrap
// import { Grid, Card } from "@mui/material/"; // material ui
//컴포넌트
import Button from "./component/Button";
import Search from "./component/Search";
//함수
import { getInfo } from "./visualization/DataExtraction";
import { visualization } from "./visualization/visualization";
import { changeInfoDict } from "./visualization/edit";
import { moveIdxFront } from "./visualization/edit";
import { removeHtmlTag } from "./visualization/edit";
import { makeNewModel } from "./visualization/edit";
//state
import { useState, useEffect } from "react";
//아이콘
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { faGripLines, faPray } from "@fortawesome/free-solid-svg-icons";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
//img
import armLabel from "./img/label.png";
import LandingPage from "./component/LandingPage";

import axios from "axios";

function App() {
  const [infoDict, setInfoDict] = useState(
    require("./NCT_ID_database/NCT05488340.json")
  );
  const [changed, setChanged] = useState(false);

  // crossover : NCT04450953
  // 군 엄청 많아: NCT04844424
  // 약 엄청 많아: NCT02374567
  const dataProcessed = getInfo(infoDict);
  let visualizationInfo = visualization(dataProcessed);

  //data
  let vData = visualizationInfo.Gdata;

  //Layout
  let vLayout = visualizationInfo.Glayout;
  let vConfig = visualizationInfo.Gconfig;

  const [data, setData] = useState(vData);
  const [layout, setLayout] = useState(vLayout);
  const [frames, setFrames] = useState([]);
  const [config, setConfig] = useState(vConfig);
  const [mode, setMode] = useState("READ");

  const clikckBranch = (e) => {
    const newLayout = { ...layout };
    let selectedBranch = 0;
    //branch 투명도
    e.points[0].data.opacity = e.points[0].data.opacity === 1 ? 0.3 : 1;
    //화살표 촉 투명도
    for (let value of newLayout.shapes) {
      if (
        value.name &&
        value.name.shape === "arrow" &&
        value.name.idx === e.points[0].data.name.idx
      ) {
        value.opacity = value.opacity === 1 ? 0.3 : 1;
      }
    }
    for (let value of data) {
      //클릭된 개수 세기
      selectedBranch =
        value.opacity === 0.3 ? selectedBranch + 1 : selectedBranch;
    }
    if (selectedBranch >= 3) {
      //branch 투명도
      alert("두개 까지만 선택 가능합니다.");
      e.points[0].data.opacity = 1;
      //화살표 촉 투명도
      for (let value of newLayout.shapes) {
        if (
          value.name &&
          value.name[0] === "arrow" &&
          value.name[1] === e.points[0].data.name[1]
        ) {
          value.opacity = 1;
        }
      }
    }
    const newData = [...data];
    setData(newData);
    setLayout(newLayout);
  };

  let content = "";
  if (mode === "READ") {
    //READ 모드일때 edit버튼을 누르면
    content = (
      <Button
        mode="edit"
        icon={faPenToSquare}
        onChangeMode={() => {
          // editable하게 바꾸기
          const newConfig = { ...config };
          newConfig.edits.annotationText = true;
          setConfig(newConfig);

          // Layout값 바꾸기
          const newLayout = { ...layout };
          const annot = newLayout.annotations;
          //Html tag 제거
          removeHtmlTag(annot);

          // data 클릭 되게 바꾸기
          const newData = [...data];
          for (let value of newData) {
            if (value.name) value.hoverinfo = "none";
          }
          setData(newData);
          setLayout(newLayout);
          setMode("EDIT");
        }}
      ></Button>
    );
  } else if (mode === "EDIT") {
    content = (
      <>
        <Button
          mode="parallel"
          icon={faGripLines}
          onChangeMode={() => {
            // crossover -> parallel 로 바꾸기
            const newInfoDict = { ...infoDict };
            const clickedBranchIdx = []; // 선택된 branch idx 2개 담기
            for (let i = 0; i < data.length; i++) {
              if (data[i].opacity === 0.3) clickedBranchIdx.push(i);
            }
            const armGroupList = newInfoDict.DrugInformation.ArmGroupList;
            newInfoDict.DesignModel = makeNewModel(
              newInfoDict.DesignModel,
              armGroupList.length,
              "-"
            );

            const annot = layout.annotations;
            changeInfoDict(newInfoDict, annot);
            const newDataJson = getInfo(newInfoDict);
            const newVisualizationInfo = visualization(newDataJson);
            const newData = newVisualizationInfo.Gdata;
            const newLayout = newVisualizationInfo.Glayout;

            for (let value of newData) {
              if (value.name) value.hoverinfo = "none";
            }
            removeHtmlTag(newLayout.annotations);
            setInfoDict(newInfoDict);
            setData(newData);
            setLayout(newLayout);
          }}
        ></Button>

        <Button
          mode="cross"
          icon={faShuffle}
          onChangeMode={() => {
            // parallel -> cross over로 바꾸기
            const newInfoDict = { ...infoDict };
            let clickedBranchIdx = []; // 선택된 branchidx 2개 담기
            for (let i = 0; i < data.length; i++) {
              if (data[i].opacity === 0.3) clickedBranchIdx.push(i);
            }

            //branch가 붙어있지 않다면 붙어있도록 순서 변경
            let [smallIdx, bigIdx] =
              clickedBranchIdx[1] > clickedBranchIdx[0]
                ? clickedBranchIdx
                : [...clickedBranchIdx].reverse();
            const armGroupList = newInfoDict.DrugInformation.ArmGroupList;
            //cross-over로 꼬을 브랜치 맨 앞으로
            moveIdxFront(armGroupList, [smallIdx, bigIdx]);
            newInfoDict.DesignModel = makeNewModel(
              newInfoDict.DesignModel,
              armGroupList.length,
              "+"
            );

            const annot = layout.annotations;
            changeInfoDict(newInfoDict, annot);

            const newDataJson = getInfo(newInfoDict);
            const newVisualizationInfo = visualization(newDataJson);
            const newData = newVisualizationInfo.Gdata;
            const newLayout = newVisualizationInfo.Glayout;

            for (let value of newData) {
              if (value.name) value.hoverinfo = "none";
            }
            //Html tag 제거
            removeHtmlTag(newLayout.annotations);
            setInfoDict(newInfoDict);
            setLayout(newLayout);
            setData(newData);
          }}
        ></Button>

        <Button
          mode="save"
          icon={faFloppyDisk}
          onChangeMode={() => {
            // editable: false
            const newConfig = { ...config };
            newConfig.edits.annotationText = false;
            setConfig(newConfig);

            //편집 완료시 태그 다시 추가 및 박스 크기와 위치 조절
            const newInfoDict = { ...infoDict };
            const annot = layout.annotations;
            changeInfoDict(newInfoDict, annot);

            const newDataJson = getInfo(newInfoDict);
            const newVisualizationInfo = visualization(newDataJson);

            setLayout(newVisualizationInfo.Glayout);
            setData(newVisualizationInfo.Gdata);
            setInfoDict(newInfoDict);
            setMode("READ");
          }}
        ></Button>
      </>
    );
  }

  //axios를 위한 함수
  const myRequest = async (nctid) => {
    console.log(nctid);
    try {
      const retries = 2;
      let body = {
        url: nctid,
      };
      let req;
      for (let q = 0; q < retries; q++) {
        try {
          req = await axios.post(`http://localhost:5000/api`, body);
          if (req) {
            break;
          } else {
            console.log(req);
            console.log("cannot fetch data");
          }
        } catch (e) {
          console.log("cannot fetch error");
        }
      }
      console.log(req.data);
      setInfoDict(req.data);
      console.log("hello");
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <div className="container">
      <div>
        <LandingPage></LandingPage>
      </div>
      <div className="url">
        <Search
          onCreate={(nctId) => {
            // setNCTNum(nctId);
            try {
              // mongo DB에서 읽어도록 코드 작성해야됨
              setInfoDict(require(`./NCT_ID_database/${nctId}.json`));
              setChanged(true);
            } catch {
              try {
                myRequest(nctId);
                setChanged(true);
              } catch {
                console.log("error");
              }
            }
            // console.log(changed)
            if (changed) {
              let dataProcessed = getInfo(infoDict);
              visualizationInfo = visualization(dataProcessed);
              //data
              let vData = visualizationInfo.Gdata;
              //Layout
              let vLayout = visualizationInfo.Glayout;

              setData(vData);
              setLayout(vLayout);
              setMode("READ");
              setChanged(false);
            }
          }}
        ></Search>
      </div>
      <div className="plot">
        <Plot
          layout={layout}
          data={data}
          frames={frames}
          config={config}
          onClick={(e) => {
            clikckBranch(e);
          }}
          onHover={(e) => {
            console.log(1);
          }}
          // onInitialized={(figure) => useState(figure)}
          // onUpdate={(figure) => useState(figure)}
        ></Plot>
        <div className="buttonDiv">{content}</div>
        <div className="questionIcon">
          <FontAwesomeIcon icon={faCircleQuestion} />
          <img src={armLabel} alt="armlabel" />
        </div>
      </div>
    </div>
  );
}

export default App;

import "./App.css";
import React from "react";
import Plot from "react-plotly.js";
//컴포넌트
import Button from './component/Button'
import Search from './component/Search'
//함수
import { getInfo } from "./visualization/DataExtraction";
import { visualization } from "./visualization/visualization";
import { armGArrowW } from "./visualization/visualization";
import { armColorDict } from "./visualization/drawBranch";
//state
import { useState } from 'react';
//아이콘
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
// import {PythonShell} from 'python-shell';
import { faGripLines, faPray } from "@fortawesome/free-solid-svg-icons";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";


// import $ from "jquery";

function makeObvious(ary) {
  for (let value of ary) {
    value.opacity = 1;
  }
}


function App() {
  const dataJson = getInfo("put url in this area");


  let visualizationInfo = visualization(dataJson);
  //data
  let vData = visualizationInfo.Gdata;

  //Layout
  let vLayout = visualizationInfo.Glayout;
  let vConfig = visualizationInfo.Gconfig;

  const [data, setData] = useState(vData);
  const [layout, setLayout] = useState(vLayout);
  const [frames, setFrames] = useState([]);
  const [config, setConfig] = useState(vConfig);

  const [mode, setMode] = useState('READ');
  let content = '';
  if (mode === 'READ') { //READ 모드일때 edit버튼을 누르면
    content =
      <Button icon={faPenToSquare} className='edit' onChangeMode={() => {


        // editable하게 바꾸기
        const newConfig = { ...config };
        newConfig.edits.annotationText = true;
        setConfig(newConfig);

        // Layout값 바꾸기
        const newLayout = { ...layout };
        const annot = newLayout.annotations;

        const re1 = /<br>/g; //br태그 정규표현식
        const re2 = /<\/?b>/g; //b태그 정규표현식
        for (let i = 0; i < annot.length; i++) {
          if (annot[i].text === '') { // 빈 텍스트 값이면
            annot[i].text = 'write text';
            annot[i].bordercolor = '#c7c7c7';
          }
          else { // 빈 텍스트 값이 아니면
            annot[i].text = annot[i].text.replace(re1, ' ');
            annot[i].text = annot[i].text.replace(re2, '');
          }
        }
        // data 클릭 되게 바꾸기
        const newData = [...data];
        for (let value of newData) {
          if (value.name) value.hoverinfo = 'none';
        }
        setData(newData);
        setLayout(newLayout);
        setMode('EDIT');
      }} ></Button>;
  }

  else if (mode === 'EDIT') {//여기서는 datajson을 바꿔줘야함
    content = <>
      <Button icon={faFloppyDisk} className='edit' onChangeMode={() => {
        // editable: false
        const newConfig = { ...config };
        newConfig.edits.annotationText = false;
        setConfig(newConfig);

        //편집 완료시 태그 다시 추가 및 박스 크기와 위치 조절

        const annot = layout.annotations;
        let k = 0; //drugname세기
        let j = 0; //duration세기
        for (let i = 0; i < annot.length; i++) { // text 정제 작업
          if (annot[i].name[0] === 'population') { //population
            const idx = annot[i].text.indexOf(':');
            annot[i].text = annot[i].text.substring(idx + 2);
            dataJson.population[annot[i].name[1]] = annot[i].text;
          }
          else if (annot[i].name[0] === 'infoTrial') {
            const completeTimeIdx = annot[i].text.indexOf(' ');
            const idx = annot[i].text.indexOf(':');
            annot[i].text = annot[i].name[1] === 'completeTime' ? annot[i].text.substring(0, completeTimeIdx + 1) : annot[i].text.substring(idx + 2);
            dataJson.infoTrial[annot[i].name[1]] = annot[i].text;
          }
          // intervention
          else if (annot[i].name[0] === 'intervention') {
            if (annot[i].name[1] === 'masking') annot[i].text = annot[i].text.replace('M=', '');
            else if (annot[i].name[1] === 'enrollment') annot[i].text = annot[i].text.replace('N=', '');
            if (annot[i].text === 'write text') annot[i].text = '';// write text라 써져있으면 다시 지우기
            dataJson.intervention[annot[i].name[1]] = annot[i].text;
          }
          // armGroup
          else if (annot[i].name[0] === 'armGroup') {
            if (annot[i].text === 'write text') annot[i].text = ''; // write text라 써져있으면 지우기
            if (annot[i].name[1] === 'Duration') {
              dataJson.armGroup.interventionDescription[j++][0]['Duration'] = annot[i].text;
            }
            else if (annot[i].name[1] === 'DrugName') {
              if (dataJson.designModel === 'Crossover Assignment') {
                let t = 0;
                while (annot[i].text.includes('+')) {
                  let idx = annot[i].text.indexOf('+');
                  dataJson.armGroup.interventionDescription[k][t]['DrugName'] = annot[i].text.substring(0, idx);
                  t++
                  annot[i].text = annot[i].text.substring(idx + 1);
                }
                dataJson.armGroup.interventionDescription[k][t]['DrugName'] = annot[i].text;
                i++;
                k++;
              }
              else {
                let t = 0;
                while (annot[i].text.includes('+')) { // + 로 찾아
                  let idx = annot[i].text.indexOf('+');
                  dataJson.armGroup.interventionDescription[k][t]['DrugName'] = annot[i].text.substring(0, idx);//다시 약물 한개씩 쪼개서 집어 넣기
                  t++
                  annot[i].text = annot[i].text.substring(idx + 1); // 앞에 것 지우기
                }
                dataJson.armGroup.interventionDescription[k][t]['DrugName'] = annot[i].text; // 맨 마지막 것 추가
                k++;
              }
            }
          }

          const newVisualizationInfo = visualization(dataJson);
          for (let i = 3; i < layout.shapes.length; i++) {
            newVisualizationInfo.Glayout.shapes[i] = layout.shapes[i];
          }
          setLayout(newVisualizationInfo.Glayout);
          // data 클릭 안되게 바꾸기
          const newData = [...data];
          for (let value of newData) {
            if (value.name) value.hoverinfo = 'skip';
          }
          setData(newData);
          setMode('READ');
        }
      }}>
      </Button>

      <Button icon={faGripLines} className='parallel' onChangeMode={() => {
        // crossover -> parallel 로 바꾸기
        const newData = [...data];
        const newLayout = { ...layout };
        const clickedBranchIdx = []; // 선택된 branch 담기
        for (let i = 0; i < newData.length; i++) {
          if (newData[i].opacity === 0.3) clickedBranchIdx.push(i);
        }
        const startX = newData[0].x[1]; // 시작점
        const x = [newData[0].x[0], startX, startX + armGArrowW];
        const startY1 = newData[clickedBranchIdx[0]].y[1];
        const startY2 = newData[clickedBranchIdx[1]].y[1];
        const y1 = [newData[0].y[0], startY1, startY1];
        const y2 = [newData[0].y[0], startY2, startY2,];
        const y = [y1, y2];

        //좌표 설정
        for (let i = 0; i < clickedBranchIdx.length; i++) {
          newData[clickedBranchIdx[i]].x = x;
          newData[clickedBranchIdx[i]].y = y[i];
          newData[clickedBranchIdx[i]].opacity = 1;
        }

        //화살표촉 색깔 및 투명도 바꾸기
        for (let i = 0; i < 2; i++) {
          for (let value of newLayout.shapes) {
            if (value.name && value.name[0] === 'arrow' && value.name[1] === clickedBranchIdx[i]) {
              value.fillcolor = armColorDict[newData[clickedBranchIdx[i]].name[0]]; // 채우기 색깔
              value.line.color = armColorDict[newData[clickedBranchIdx[i]].name[0]]; // 테두리 색깔
              value.opacity = 1;
            }
          }
        }
        setData(newData);
        setLayout(newLayout);
      }}></Button>

      <Button icon={faShuffle} className='crossover' onChangeMode={() => {
        // parallel -> cross over로 바꾸기
        const newData = [...data];
        const newLayout = { ...layout };
        let clickedBranchIdx = []; // 선택된 branch 담기
        for (let i = 0; i < newData.length; i++) {
          if (newData[i].opacity === 0.3) clickedBranchIdx.push(i);
        }
        //branch가 붙어있지 않다면 붙어있도록 순서 변경
        if (clickedBranchIdx[1] - clickedBranchIdx[0] !== Math.abs(1)) {
          const [smallIdx, bigIdx] = clickedBranchIdx[1] > clickedBranchIdx[0] ? clickedBranchIdx : [...clickedBranchIdx].reverse();
          const movingBranchIdx = smallIdx + 1; // 모양이 바뀌지 않지만 순서가 교체당할 branch idx
          //bigIdx와 movingBranchIdx 위치 바꿔주기
          const bigIdxY = newData[bigIdx].y;
          const movingBranchIdxY = newData[movingBranchIdx].y;
          newData[bigIdx].y = movingBranchIdxY;
          newData[movingBranchIdx].y = bigIdxY;

          //bigIdx와 movingBranchIdx에 해당하는 intervention 위치안바꾸고 text값(drugname) 만 바꾸기 ##duration 어떻게 처리할지

          let bigIdxDrugNameIdx = 0;
          let movingBranchIdxDrugNameIdx = 0;
          for (let i = 0; i < newLayout.annotations.length; i++) {
            if (newLayout.annotations[i].name && newLayout.annotations[i].name[1] === 'DrugName') {
              if (newLayout.annotations[i].name[2] === bigIdx) {
                bigIdxDrugNameIdx = i;
              }
              if (newLayout.annotations[i].name[2] === movingBranchIdx) {
                movingBranchIdxDrugNameIdx = i;
              }
            }
          }
          const tempDrugName = newLayout.annotations[bigIdxDrugNameIdx].text;
          newLayout.annotations[bigIdxDrugNameIdx].text = newLayout.annotations[movingBranchIdxDrugNameIdx].text;
          newLayout.annotations[movingBranchIdxDrugNameIdx].text = tempDrugName;

          //data배열 내에서 idx값도 바꿔주기
          const tempIdx = newData[bigIdx];
          newData[bigIdx] = newData[movingBranchIdx];
          newData[movingBranchIdx] = tempIdx;

          //data배열 내에서 바뀐 idx값에 따라 화살표 촉 위치 안바꾸고 색깔만 바꾸기
          const ary = [movingBranchIdx, bigIdx];
          for (let i = 0; i < ary.length; i++) {
            for (let value of newLayout.shapes) {
              if (value.name && value.name[0] === 'arrow' && value.name[1] === ary[i]) {
                value.fillcolor = armColorDict[newData[ary[i]].name[0]]; // 채우기 색깔
                value.line.color = armColorDict[newData[ary[i]].name[0]]; // 테두리 색깔
              }
            }
          }
          //clickedBranchIdx 초기화
          clickedBranchIdx = [smallIdx, movingBranchIdx];
        }

        //branch 꼬기
        const startX = newData[0].x[1]; // 시작점
        const x = [newData[0].x[0], startX, startX + armGArrowW / 3, startX + armGArrowW / 3 * 2, startX + armGArrowW];
        const startY1 = newData[clickedBranchIdx[0]].y[1];
        const startY2 = newData[clickedBranchIdx[1]].y[1];
        const y1 = [newData[0].y[0], startY1, startY1, startY2, startY2];
        const y2 = [newData[0].y[0], startY2, startY2, startY1, startY1];
        const y = [y1, y2];

        //좌표 설정 및 opacity
        for (let i = 0; i < clickedBranchIdx.length; i++) {
          newData[clickedBranchIdx[i]].x = x;
          newData[clickedBranchIdx[i]].y = y[i];
          newData[clickedBranchIdx[i]].opacity = 1;
        }

        //화살표촉 색깔 바꾸기
        for (let i = 0; i < 2; i++) {
          for (let value of newLayout.shapes) {
            if (value.name && value.name[0] === 'arrow' && value.name[1] === clickedBranchIdx[i]) {
              value.fillcolor = armColorDict[newData[clickedBranchIdx[1 - i]].name[0]]; // 채우기 색깔
              value.line.color = armColorDict[newData[clickedBranchIdx[1 - i]].name[0]]; // 테두리 색깔
            }
          }
        }
        for (let value of newLayout.shapes) {
          if (value.name && value.name[0] === 'arrow') {
            value.opacity = 1;
          }
        }

        setData(newData);
        setLayout(newLayout);
      }}></Button>
    </>;
  }

  return (
    <div className="container">
      <div className="url">
        <Search className></Search>
      </div>
      <Plot
        className="plot"
        layout={layout}
        data={data}
        frames={frames}
        config={config}

        onClick={(e) => {

          const newLayout = { ...layout };
          let selectedBranch = 0;
          //branch 투명도
          e.points[0].data.opacity = e.points[0].data.opacity === 1 ? 0.3 : 1;
          //화살표 촉 투명도
          for (let value of newLayout.shapes) {
            if (value.name && value.name[0] === 'arrow' && value.name[1] === e.points[0].data.name[1]) {
              value.opacity = value.opacity === 1 ? 0.3 : 1;
            }
          }

          for (let value of data) { //클릭된 개수 세기
            selectedBranch = value.opacity === 0.3 ? selectedBranch + 1 : selectedBranch;
          }
          if (selectedBranch >= 3) {
            //branch 투명도
            alert('두개 까지만 선택 가능합니다.');
            e.points[0].data.opacity = 1;
            //화살표 촉 투명도
            for (let value of newLayout.shapes) {
              if (value.name && value.name[0] === 'arrow' && value.name[1] === e.points[0].data.name[1]) {
                value.opacity = 1;
              }
            }
          }
          const newData = [...data];
          setData(newData);
          setLayout(newLayout);

        }}
      // onInitialized={(figure) => useState(figure)}
      // onUpdate={(figure) => useState(figure)}
      />

      <div className="buttonDiv">
        {content}
      </div>
    </div>
  );
}

export default App;

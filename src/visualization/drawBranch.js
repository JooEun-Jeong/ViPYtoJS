
export const armColorDict = {
  Experimental: "rgba(205, 31, 72, 1)", //coral
  OtherS: "rgba(255, 210, 40, 1)", //gold
  "Active Comparator": "rgb(10, 138, 138)", //진한 에메랄드
  "Placebo Comparator": "rgba(70, 189, 123, 1)", //lime green
  "No Intervention": "rgba(0, 100, 0, 1)", // forest green
  Other: "rgb(102, 205, 170)", // 살짝 밝은 에메랄드
  "Sham Comparator": "rgba(70, 70, 205, 1)", //blue
  None: "rgba(148, 20, 148, 1)", // violet
};

export function drawBranch(
  armGLinePoint1,
  armGW,
  armGArrowW,
  startPoint,
  startH,
  legendPoint,
  intervention,
  designModel,
  armG
) {


  let setArmGroup = new Set(armG.armGroupType);
  let setArmGroupToLst = Array.from(setArmGroup);
  const numBranch = armG.interventionDescription.length;

  const widthTriangle = 0.01;
  const heightTriangle = 0.25;
  const lineWidth = 3.5;


  let lineList = [];
  let arrowList = [];
  let annotations = [];
  let washH;
  let arrowIdx = 0; //몇 번째 arrow인지 idx, data의 branch idx와 맞추기위함 
  let branchIdx = 0;
  //draw branch
  if ((designModel === "Crossover Assignment" && numBranch === 2)) {
    for (let i = 0; i < numBranch; i++) {
      let colorB = armColorDict[armG.armGroupType[i]];
      let arrowEndY = startPoint.y + i * (startH / (numBranch - 1));
      let arrowEndX = armGLinePoint1.x + armGW + armGArrowW;
      let lineLoc = {
        name: {
          armGroupType: armG.armGroupType[i],
          idx: branchIdx++
        },
        x: [
          armGLinePoint1.x,
          armGLinePoint1.x + armGW,
          armGLinePoint1.x + armGW + armGArrowW / 3,
          armGLinePoint1.x + armGW + (armGArrowW / 3) * 2,
          arrowEndX,
        ],
        y: [
          armGLinePoint1.y,
          startPoint.y + startH - i * (startH / (numBranch - 1)),
          startPoint.y + startH - i * (startH / (numBranch - 1)),
          arrowEndY,
          arrowEndY,
        ],
        mode: "lines",
        line: {
          color: colorB,
          width: lineWidth,
        },
        hoverinfo: "skip", // branch 라인 위에 마우스 올렸을 때 데이터 보이지 않도록 설정
        opacity: 1,
      };
      lineList.push(lineLoc);
      let lineArrow = {
        type: 'path',
        // 0.2는 삼각형 높이
        path: `M ${arrowEndX - heightTriangle} ${arrowEndY} V ${arrowEndY + widthTriangle} 
              L ${arrowEndX} ${arrowEndY} L ${arrowEndX - heightTriangle} ${arrowEndY - widthTriangle} Z`,
        fillcolor: colorB, // 채우기 색깔
        line: { color: colorB }, // 테두리 색깔
        name: {
          shape: 'arrow',
          idx: arrowIdx++,
        },
        opacity: 1,
      };
      arrowList.push(lineArrow);
    }

    // ##crossover 약 먹는 기간 화살표
    let bfWashPoint = armGLinePoint1.x + armGW + armGArrowW / 3;
    let afWashPoint = armGLinePoint1.x + armGW + (armGArrowW / 3) * 2;
    washH = startPoint.y - startH / 10;
    let timeLine = {
      x: [armGLinePoint1.x, armGLinePoint1.x + armGW + armGArrowW + 0.5],
      y: [washH, washH],
      mode: "lines",
      line: {
        color: "rgba(1,1,1,1)",
        width: 2,
      },
      showlegend: false,
      hoverinfo: "skip", // branch 라인 위에 마우스 올렸을 때 데이터 보이지 않도록 설정
    };
    lineList.push(timeLine);

    let mark = {
      x: [bfWashPoint, afWashPoint],
      y: [washH, washH],
      mode: "markers",
      marker: {
        size: [10, 10],
        color: "rgba(255, 120, 120, 1)",
      },
      showlegend: false,
      hoverinfo: "skip", // branch 라인 위에 마우스 올렸을 때 데이터 보이지 않도록 설정
    };
    lineList.push(mark);
  } else if (designModel[0] === 'c' && designModel[2] === 'p') {
    // limit number of branch
    const crossover = Number(designModel[1]);

    // draw Branch
    for (let i = 1; i < crossover; i += 2) {
      for (let j = 0; j < 2; j++) {
        let colorB = armColorDict[armG.armGroupType[j + i - 1]];
        let arrowEndY = startPoint.y + startH - startH / (numBranch - 1) * i + j * startH / (numBranch - 1);
        let arrowEndX = armGLinePoint1.x + armGW + armGArrowW
        let lineLoc = {
          name: {
            armGroupType: armG.armGroupType[j],
            idx: branchIdx++
          },
          x: [
            armGLinePoint1.x,
            armGLinePoint1.x + armGW,
            armGLinePoint1.x + armGW + armGArrowW / 3,
            armGLinePoint1.x + armGW + (armGArrowW / 3) * 2,
            arrowEndX,
          ],
          y: [
            armGLinePoint1.y,
            startPoint.y + startH - j * (startH / (numBranch - 1)) - (i - 1) * (startH / (numBranch - 1)),
            startPoint.y + startH - j * (startH / (numBranch - 1)) - (i - 1) * (startH / (numBranch - 1)),
            arrowEndY,
            arrowEndY,
          ],
          mode: "lines",
          line: {
            color: colorB,
            width: lineWidth,
          },
          hoverinfo: "skip", // 모식도 데이터 오버이벤트 없애기
          opacity: 1,

        };
        lineList.push(lineLoc);

        let lineArrow = {
          type: 'path',
          // 0.2는 삼각형 높이
          path: `M ${arrowEndX - heightTriangle} ${arrowEndY} V ${arrowEndY + widthTriangle} 
	              L ${arrowEndX} ${arrowEndY} L ${arrowEndX - heightTriangle} ${arrowEndY - widthTriangle} Z`,
          fillcolor: colorB, // 채우기 색깔
          line: { color: colorB }, // 테두리 색깔
          name: {
            shape: 'arrow',
            idx: arrowIdx++,
          },
          opacity: 1,
        };
        arrowList.push(lineArrow);
      }
    }
    for (let i = crossover; i < numBranch; i++) {
      let colorB = armColorDict[armG.armGroupType[i]];
      let arrowEndY = startPoint.y + startH - i * (startH / (numBranch - 1))
      let arrowEndX = armGLinePoint1.x + armGW + armGArrowW
      let lineLoc = {
        name: {
          armGroupType: armG.armGroupType[i],
          idx: branchIdx++
        },
        x: [
          armGLinePoint1.x,
          armGLinePoint1.x + armGW,
          arrowEndX,
        ],
        y: [
          armGLinePoint1.y,
          arrowEndY,
          arrowEndY,
        ],
        mode: "lines",
        line: {
          color: colorB,
          width: lineWidth,
        },
        hoverinfo: "skip", // 모식도 데이터 오버이벤트 없애기
        opacity: 1,

      };
      lineList.push(lineLoc);

      let lineArrow = {
        type: 'path',
        // 0.2는 삼각형 높이
        path: `M ${arrowEndX - heightTriangle} ${arrowEndY} V ${arrowEndY + widthTriangle} 
              L ${arrowEndX} ${arrowEndY} L ${arrowEndX - heightTriangle} ${arrowEndY - widthTriangle} Z`,
        fillcolor: colorB, // 채우기 색깔
        line: { color: colorB }, // 테두리 색깔
        name: {
          shape: 'arrow',
          idx: arrowIdx++,
        },
        opacity: 1,
      };
      arrowList.push(lineArrow);
    }
  } else if (designModel === "Parallel Assignment" || numBranch !== 1) {
    // limit number of branch
    let numBranchLimit = numBranch
    if (numBranch > 6) {
      numBranchLimit = 6
    }

    // draw Branch
    for (let i = 0; i < numBranchLimit; i++) {
      let colorB = armColorDict[armG.armGroupType[i]];
      let arrowEndY = startPoint.y + startH - i * (startH / (numBranchLimit - 1))
      let arrowEndX = armGLinePoint1.x + armGW + armGArrowW
      let lineLoc = {
        name: {
          armGroupType: armG.armGroupType[i],
          idx: branchIdx++
        },
        x: [
          armGLinePoint1.x,
          armGLinePoint1.x + armGW,
          arrowEndX,
        ],
        y: [
          armGLinePoint1.y,
          arrowEndY,
          arrowEndY,
        ],
        mode: "lines",
        line: {
          color: colorB,
          width: lineWidth,
        },
        hoverinfo: "skip", // 모식도 데이터 오버이벤트 없애기
        opacity: 1,

      };
      lineList.push(lineLoc);

      let lineArrow = {
        type: 'path',
        // 0.2는 삼각형 높이
        path: `M ${arrowEndX - heightTriangle} ${arrowEndY} V ${arrowEndY + widthTriangle} 
              L ${arrowEndX} ${arrowEndY} L ${arrowEndX - heightTriangle} ${arrowEndY - widthTriangle} Z`,
        fillcolor: colorB, // 채우기 색깔
        line: { color: colorB }, // 테두리 색깔
        name: {
          shape: 'arrow',
          idx: arrowIdx++,
        },
        opacity: 1,
      };
      arrowList.push(lineArrow);
    }
  } else if (designModel === "Single Group Assignment" || numBranch === 1) {
    let colorB = armColorDict[armG.armGroupType[0]];
    let arrowEndX = armGLinePoint1.x + armGW + armGArrowW;
    let arrowEndY = armGLinePoint1.y
    if (armG.armGroupType[0] === "Other") {
      colorB = armColorDict["OtherS"];
    }
    let lineLoc = {
      name: {
        armGroupType: armG.armGroupType[0],
        idx: branchIdx++
      },
      x: [armGLinePoint1.x, arrowEndX],
      y: [arrowEndY, arrowEndY],
      mode: "lines",
      line: {
        color: colorB,
        width: lineWidth,
      },
      opacity: 1,
    };
    lineList.push(lineLoc);
    let lineArrow = {
      type: 'path',
      // 0.2는 삼각형 높이
      path: `M ${arrowEndX - heightTriangle} ${arrowEndY} V ${arrowEndY + widthTriangle} 
            L ${arrowEndX} ${arrowEndY} L ${arrowEndX - heightTriangle} ${arrowEndY - widthTriangle} Z`,
      fillcolor: colorB, // 채우기 색깔
      line: { color: colorB }, // 테두리 색깔
      name: {
        shape: 'arrow',
        idx: arrowIdx++,
      },
      opacity: 1,
    };
    arrowList.push(lineArrow);
  } else {
    console.log(
      "we only consider single, parallel, crossover or may be sequential!"
    );
  }

  //draw&write legend
  const gapLegend = 10 // 숫자 커질 수록 간격 작아짐

  for (let i = 0; i < setArmGroupToLst.length; i++) {
    let colorB = armColorDict[setArmGroupToLst[i]];
    let legendLine = {
      x: [legendPoint.x, legendPoint.x + 1],
      y: [legendPoint.y - i * startH / gapLegend, legendPoint.y - i * startH / gapLegend],
      mode: 'lines',
      line: {
        color: colorB,
        width: lineWidth,
      },
      hoverinfo: "skip",
    }
    lineList.push(legendLine);

    let legendText = {
      x: legendPoint.x + 1 + 0.1,
      y: legendPoint.y - i * startH / gapLegend,
      xanchor: "left",
      // yanchor: "bottom",
      align: "left",
      text: setArmGroupToLst[i],
      font: {
        size: 8,
      },
      showarrow: false,
    };
    annotations.push(legendText);
  }

  return {
    data: {
      lineList,
    },
    layout: {
      arrowList,
      annotations
    },
    washHeight: { washH },
  };
}

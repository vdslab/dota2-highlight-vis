import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { request, youtubeRequest } from "./api";
import { NextUIProvider, Button, Text, Input, Grid, Card, Spacer, Link } from '@nextui-org/react';

const translate = ["戦闘時間", "初キル時間", "最大マルチキル数", "最大キルストリーク数", "勝率平均", "バイバック回数", "勝チームキル数", "負チームキル数"]
const attributes = ["durationSeconds", "firstBloodTime", "maxMultKillsCount", "maxKillStreakCount", "winRates", "buyBackCount", "winTeamKills", "loseTeamKills"];

export default function Home({ _nodesData, _linksData, _keyValues, }) {
  const [nodesData, setNodesData] = useState(_nodesData);
  const [linksData, setLinksData] = useState(_linksData);
  const [attributesValue, setAttributesValue] = useState(_keyValues);
  const [currentMenu, setCurrentMenu] = useState(0);
  const [clickedNode, setClickedNode] = useState(null);
  const [clickedAtr, setClickedAtr] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState(null);

  useEffect(() => {
    console.time('nodesData');
    setNodesData(
      _nodesData.filter((e) => {
        return attributesValue.every((f, i) => f[0] <= f[1] ? (f[0] <= e.properties[attributes[i]] && e.properties[attributes[i]] <= f[1]) : false);
      })
    )
    console.timeEnd('nodesData');

  }, [attributesValue])

  useEffect(() => {
    console.time('linksData');
    const ids = nodesData.map((e) => e.id);
    setLinksData(
      _linksData.filter((e) => {
        return ids.includes(e.source.id) && ids.includes(e.target.id);
      })
    )
    console.timeEnd('linksData');
  }, [nodesData])

  useEffect(() => {
    if (clickedNode != null) {
      setCurrentMenu(1);
      const findText = `${clickedNode.properties.winTeamName} VS ${clickedNode.properties.loseTeamName} ${clickedNode.properties.leagueName}`;
      console.log(findText);
      youtubeRequest(findText).then(r => setYoutubeLinks(r));
    }
  }, [clickedNode])

  return (
    <NextUIProvider>
      <Text h1 style={{ textAlign: "center" }}>Dota2</Text>
      <Grid.Container gap={2}>
        <Grid xs={"auto"} sm={4} direction="column" alignItems="center">
          <Grid.Container gap={1}>
            <MenuButton currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />
          </Grid.Container>
          <Grid.Container gap={2} wrap="wrap">
            <Grid xs={12} direction="column" alignItems="center">
              {currentMenu == 0 &&
                <>
                  <Button color="warning" onPress={() => { setAttributesValue(_keyValues) }}>入力リセット</Button>
                  {
                    attributes.map((e, i) => {
                      return (
                        <Attributes key={i} index={i}
                          attributesValue={attributesValue} setAttributesValue={setAttributesValue}
                          clickedAtr={clickedAtr} setClickedAtr={setClickedAtr} />
                      )
                    })
                  }
                </>
              }
              {currentMenu == 1 &&
                <Detail attributes={attributes} clickedNode={clickedNode} setClickedNode={setClickedNode} youtubeLinks={youtubeLinks} />
              }
            </Grid>
          </Grid.Container>
        </Grid>
        <Grid xs={"auto"} direction="column" alignItems="center">
          <Chart nodesData={nodesData} linksData={linksData} clickedNode={clickedNode} setClickedNode={setClickedNode} clickedAtr={clickedAtr != null ? attributes[clickedAtr] : null} />
        </Grid>
      </Grid.Container >
    </NextUIProvider >
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const newData = JSON.parse(fs.readFileSync("./public/out.json"));
  const _nodesData = [];
  const _linksData = [];
  newData.map((d, index) => {
    if (d.type == "node") {
      _nodesData[_nodesData.length] = {
        id: d.id,
        x: d.properties.x,
        y: d.properties.y,
        properties: d.properties,
      };
    } else if (d.type == "relationship") {
      _linksData[_linksData.length] = {
        id: d.id,
        source: { id: d.start.id, x: d.start.properties.x, y: d.start.properties.y },
        target: { id: d.end.id, x: d.end.properties.x, y: d.end.properties.y },
      };
    }
  });
  const _keyValues = attributes.map((e) => {
    return (d3.extent(_nodesData.map((f) => f["properties"][e])))
  })
  const leagueName = [...new Set(_nodesData.map(e => e.properties.leagueName))];
  console.log(leagueName);
  return {
    props: { _nodesData, _linksData, _keyValues },
  };
}


function MenuButton({ currentMenu, setCurrentMenu }) {
  const menu = ["フィルター", "詳細"];
  return (
    menu.map((e, i) => {
      return (
        <Grid key={i} xs={6} direction="column" alignItems="stretch">
          <Button size={"xs"} color={i == currentMenu ? "primary" : ""} iconRight={<MyIcon type={e} fill="currentColor" filled />}
            onPress={(e) => { setCurrentMenu(i) }}>
            {e}
          </Button>
        </Grid>
      )
    })
  )
}

function MyIcon({ type, fill, filled }) {
  const Icon = () => {
    switch (type) {
      case "詳細":
        return <path stroke={fill} d="M7.3304 2.0004H16.6694C20.0704 2.0004 21.9904 3.9294 22.0004 7.3304V16.6704C22.0004 20.0704 20.0704 22.0004 16.6694 22.0004H7.3304C3.9294 22.0004 2.0004 20.0704 2.0004 16.6704V7.3304C2.0004 3.9294 3.9294 2.0004 7.3304 2.0004ZM12.0494 17.8604C12.4804 17.8604 12.8394 17.5404 12.8794 17.1104V6.9204C12.9194 6.6104 12.7704 6.2994 12.5004 6.1304C12.2194 5.9604 11.8794 5.9604 11.6104 6.1304C11.3394 6.2994 11.1904 6.6104 11.2194 6.9204V17.1104C11.2704 17.5404 11.6294 17.8604 12.0494 17.8604ZM16.6504 17.8604C17.0704 17.8604 17.4294 17.5404 17.4804 17.1104V13.8304C17.5094 13.5094 17.3604 13.2104 17.0894 13.0404C16.8204 12.8704 16.4804 12.8704 16.2004 13.0404C15.9294 13.2104 15.7804 13.5094 15.8204 13.8304V17.1104C15.8604 17.5404 16.2194 17.8604 16.6504 17.8604ZM8.2194 17.1104C8.1794 17.5404 7.8204 17.8604 7.3894 17.8604C6.9594 17.8604 6.5994 17.5404 6.5604 17.1104V10.2004C6.5304 9.8894 6.6794 9.5804 6.9504 9.4104C7.2194 9.2404 7.5604 9.2404 7.8304 9.4104C8.0994 9.5804 8.2504 9.8894 8.2194 10.2004V17.1104Z" />
      case "フィルター":
        return <path stroke={fill} d="M4.12819 2H19.8718C21.0476 2 22 2.98105 22 4.19225V5.72376C22 6.31133 21.7704 6.87557 21.3627 7.28708L14.8577 13.867C14.7454 13.9816 14.5931 14.0452 14.4355 14.0441L8.98893 14.0272C8.82317 14.0272 8.66564 13.9561 8.55238 13.832L2.57452 7.25738C2.20489 6.85117 2 6.31451 2 5.7577V4.19332C2 2.98211 2.95238 2 4.12819 2ZM9.2801 15.8241L14.1347 15.839C14.4374 15.8401 14.6824 16.0935 14.6824 16.4043V19.1353C14.6824 19.4471 14.5053 19.7293 14.2294 19.8597L9.8227 21.9289C9.71974 21.9767 9.61061 22 9.50147 22C9.35629 22 9.21112 21.9576 9.08448 21.8738C8.86311 21.7274 8.72927 21.475 8.72927 21.2046V16.3894C8.72927 16.0766 8.97637 15.8231 9.2801 15.8241Z" />
    }
  }
  return (
    <svg width="24" height="24" viewBox="0 0 18 24" fill={filled ? fill : 'none'} xmlns="http://www.w3.org/2000/svg">
      <Icon />
    </svg>
  )
}

function Attributes({ attributesValue, setAttributesValue, clickedAtr, setClickedAtr, index }) {
  const clicked = clickedAtr == index;
  return (
    <div>
      <Grid.Container gap={1}>
        <Grid xs={4} direction="row" alignItems="center">
          <Text h6 color={clicked ? "primary" : ""} style={{ cursor: "pointer" }}
            onClick={() => { setClickedAtr(clicked ? null : index) }}>{translate[index]}</Text>
        </Grid>
        <Grid xs={4} direction="column" alignItems="center">
          <Input label="最小値" type="number" value={attributesValue[index][0]} onChange={(e) => {
            setAttributesValue(attributesValue.map((f, i) => {
              return (i == index) ? [e.target.value, f[1]] : f
            }))
          }}></Input>
        </Grid>
        <Grid xs={4} direction="column" alignItems="center">
          <Input label="最大値" type="number" value={attributesValue[index][1]} onChange={(e) => {
            setAttributesValue(attributesValue.map((f, i) => {
              return (i == index) ? [f[0], e.target.value] : f
            }))
          }}></Input>
        </Grid>
      </Grid.Container>
    </div>
  )
}

function Detail({ attributes, clickedNode, setClickedNode, youtubeLinks }) {
  console.log(clickedNode);
  return (
    <>
      <Button color="warning" onPress={() => { setClickedNode(null) }}>選択解除</Button>
      <Spacer y={1} />
      {clickedNode != null &&
        <>
          {attributes.map((e, i) => {
            return (
              <DetailCard key={i} label={translate[i]} value={clickedNode.properties[e]} />
            )
          })}
          <Card>
            <Card.Body>
              <Link href={`https://stratz.com/matches/${clickedNode.properties.matchId}`} target="_blank" underline isExternal>
                STRATZで見る
              </Link>
            </Card.Body>
          </Card>
          <Spacer y={0.5} />
          {youtubeLinks != null && youtubeLinks.items.map((e, i) => {
            console.log(e);
            return (
              <div key={i}>
                <Card>
                  <Card.Body>
                    <Link href={`https://www.youtube.com/watch?v=${e.id.videoId}`} target="_blank" underline isExternal>
                      {e.snippet.title}
                    </Link>
                  </Card.Body>
                </Card>
                <Spacer y={0.5} />
              </div>
            )
          })}
        </>
      }
    </>
  )
}

function DetailCard({ label, value }) {
  return (
    <>
      <Card key={label}>
        <Card.Body>
          <Text>{label} : {value}</Text>
        </Card.Body>
      </Card>
      <Spacer y={0.5} />
    </>
  )
}

function Chart({ nodesData, linksData, clickedNode, setClickedNode, clickedAtr }) {
  const width = 1000;
  const height = 800;
  const margin = 0;
  const zoomX = 8 / 10;
  const zoomY = 9 / 10;
  const xScale = clickedNode != null ?
    d3.scaleLinear().domain([clickedNode.x - zoomX, clickedNode.x + zoomX]).range([margin, width - margin]).nice() :
    d3.scaleLinear().domain(d3.extent(nodesData.map(e => e.x))).range([margin, width - margin]).nice();
  const yScale = clickedNode != null ?
    d3.scaleLinear().domain([clickedNode.y - zoomY, clickedNode.y + zoomY]).range([margin, height - margin]).nice() :
    d3.scaleLinear().domain(d3.extent(nodesData.map(e => e.y))).range([margin, height - margin]).nice();
  const colorScale =
    d3.scaleLinear().domain(d3.extent(nodesData.map(e => e.properties[clickedAtr]))).range(['white', 'red']).nice();
  const col = { NONE: "#fff", COMEBACK: "#007bff", STOMPED: "#28a745" }
  const r = nodesData.length < 200 || clickedNode != null ? 6 : 3;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: "#ddd" }}>
      {linksData.map((e) => {
        const highlight = clickedNode != null && (e.source.id == clickedNode.id || e.target.id == clickedNode.id);
        return (
          <g key={e.id}>
            <line x1={xScale(e.source.x)} y1={yScale(e.source.y)} x2={xScale(e.target.x)} y2={yScale(e.target.y)} stroke={highlight ? "#ff69b4" : "#000"} strokeWidth={highlight ? 3 : 0.1}
              style={highlight ? { cursor: "pointer" } : {}}
              onClick={() => {
                if (highlight) {
                  const nodeId = e.source.id == clickedNode.id ? e.target.id : e.source.id;
                  setClickedNode(nodesData.find(f => f.id == nodeId));
                }
              }}
            />
          </g>
        )
      })}
      {nodesData.map((e) => {
        const highlight = clickedNode != null && e.id == clickedNode.id;
        return (
          <g key={e.id}>
            <circle cx={xScale(e.x)} cy={yScale(e.y)} r={highlight ? r * 1.5 : r} stroke={highlight ? "#ff69b4" : "none"}
              fill={
                clickedAtr == null ?
                  col[e.properties.analysisOutcome] :
                  colorScale(e.properties[clickedAtr])
              }
              style={{ transition: "all 1s 0s", cursor: "pointer" }}
              onClick={() => {
                setClickedNode(e);
              }} />
          </g>
        )
      })}
    </svg>
  )
}

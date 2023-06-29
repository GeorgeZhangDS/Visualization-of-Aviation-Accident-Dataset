function FinalProject() {
  var filePath = "AviationDataset.csv";
  projectPlot1(filePath);
  projectPlot2(filePath);
  projectPlot3(filePath);
  projectPlot4(filePath);
  projectPlot5(filePath);
  projectPlot6(filePath);
}

var projectPlot1 = function (filePath) {
  d3.csv(filePath).then(function (data) {
    /*
        🐋数据清理
      */
    // 过滤数据 (Number.of.Engines & Total.Fatal.Injuries, 限美国)
    let timeParser = d3.timeParse("%Y-%m-%d");
    let newDataFilter = data.filter(
      (d) =>
        d["Number.of.Engines"] != "unknown" &&
        d["Total.Fatal.Injuries"] != "unknown" &&
        d["Country"] == "united states" &&
        // Time Scale
        d["Event.Date"] != "unknown" &&
        d3.timeFormat("%Y")(timeParser(d["Event.Date"])) >= 2000
    );
    // console.log(newDataFilter);

    // 转换数据格式 & 保留需求数据
    // (Number.of.Engines & Total.Fatal.Injuries)
    let newData = [];
    newDataFilter.forEach(function (d) {
      newData.push({
        "Number.of.Engines": +d["Number.of.Engines"],
        "Total.Fatal.Injuries": +d["Total.Fatal.Injuries"],
      });
    });
    // console.log(newData);

    // 根据飞行器发动机数量排序
    newData.sort((a, b) =>
      d3.ascending(a["Number.of.Engines"], b["Number.of.Engines"])
    );
    // console.log(newData);

    let keys = Array.from(
      d3.group(newData, (d) => d["Number.of.Engines"]),
      ([v]) => v
    );
    // console.log(keys);

    // Plot 1 SVG----------------------------------------------------------------------------------------------------------------- //
    // Self Define Variable //
    let svgwidth = 500;
    let svgheight = 500;
    let padding = 50;
    let radiusCircle = 5;
    // Self Define Variable //

    let svg1 = d3
      .select("body")
      .select("#q1_plot")
      .append("svg")
      .attr("width", svgwidth)
      .attr("height", svgheight);

    //// ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels ※ ////
    // Scale
    let xScale = d3
      .scaleLinear()
      .domain(d3.extent(newData, (d) => d["Number.of.Engines"]))
      .range([padding, svgwidth - padding]);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(newData, (d) => d["Total.Fatal.Injuries"])])
      .range([svgheight - padding, padding])
      .nice();

    let colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeAccent);
    // Scale

    // Axis
    svg1
      .append("g")
      .attr("class", "x")
      .attr(
        "transform",
        "translate(" + 0 + "," + (svgheight - padding + 10) + ")"
      )
      .call(d3.axisBottom(xScale).tickSize(0))
      .select(".domain")
      .remove();

    svg1
      .append("g")
      .attr("class", "y")
      .attr("transform", "translate(" + 25 + "," + 0 + ")")
      .call(d3.axisLeft(yScale))
      .select(".domain")
      .remove();
    // Axis

    // Plot Title
    svg1
      .append("text")
      .attr("class", "plot-title")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", padding / 2 / 2)
      .text("Relationship between Number of Engines and Fatal Injuries")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    // Plot Title

    // Axis Title
    svg1
      .append("text")
      .attr("class", "xAxis-label")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", svgheight - padding / 2 / 2)
      .text("Number of Engines")
      .style("font-size", "10px");

    svg1
      .append("text")
      .attr("class", "yAxis-label")
      .attr("x", 0)
      .attr("y", padding / 2)
      .text("Fatal Injuries")
      .style("font-size", "10px");
    // Axis Title

    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels ※ //

    let scatter = svg1
      .selectAll("circle")
      .data(newData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d["Number.of.Engines"]))
      .attr("cy", (d) => yScale(d["Total.Fatal.Injuries"]))
      .attr("r", radiusCircle)
      .style("fill", (d) => colorScale(d["Number.of.Engines"]))
      .attr("stroke", "black");

    let zoomimg = d3
      .zoom()
      .scaleExtent([1, svgheight / padding])
      .on("zoom", zoomFunction);

    svg1.call(zoomimg);
    function zoomFunction(event) {
      const transform = event.transform;
      scatter.attr("transform", transform);
      // X axis
      svg1
        .select(".x")
        .call(d3.axisBottom(transform.rescaleX(xScale)).tickSize(0))
        .select(".domain")
        .remove();
      // Y axis
      svg1
        .select(".y")
        .call(d3.axisLeft(transform.rescaleY(yScale)))
        .select(".domain")
        .remove();
    }
  });
};

var projectPlot2 = function (filePath) {
  d3.csv(filePath).then(function (data) {
    /*
          🐋数据清理
      */
    // 过滤数据 (Make & Total.Fatal.Injuries)
    let timeParser = d3.timeParse("%Y-%m-%d");
    let newDataFilter = data.filter(
      (d) =>
        d["Make"] != "unknown" &&
        d["Total.Fatal.Injuries"] != "unknown" &&
        d["Country"] == "united states" &&
        // Time Scale
        d["Event.Date"] != "unknown" &&
        d3.timeFormat("%Y")(timeParser(d["Event.Date"])) >= 2000
    );
    // console.log(newDataFilter);

    // 转换数据格式 & 保留需求数据
    // (Make & Total.Fatal.Injuries)
    let newDataA = [];
    newDataFilter.forEach(function (d) {
      newDataA.push({
        Make: d["Make"],
        "Total.Fatal.Injuries": +d["Total.Fatal.Injuries"],
      });
    });
    // console.log(newDataA);

    // Rollup数据 By Make (品牌)
    let newDataDict = d3.rollup(
      newDataA,
      (v) => d3.sum(v, (d) => d["Total.Fatal.Injuries"]),
      (d) => d["Make"]
    );

    // 根据飞行器发动机数量排序
    let newDatas = Array.from(newDataDict, ([Make, Total_Fatal_Injuries]) => ({
      Make,
      Total_Fatal_Injuries,
    }));
    newDatas.sort((a, b) =>
      d3.descending(a.Total_Fatal_Injuries, b.Total_Fatal_Injuries)
    );

    let newData = newDatas.slice(0, 10);
    // console.log(newData);
    let keys = Array.from(
      d3.group(newData, (d) => d["Make"]),
      ([v]) => v
    );
    // Plot 2 SVG----------------------------------------------------------------------------------------------------------------- //
    // Self Define Variable //
    let svgwidth = 500;
    let svgheight = 500;
    let padding = 50;
    // Self Define Variable //

    let svg2 = d3
      .select("body")
      .select("#q2_plot")
      .append("svg")
      .attr("width", svgwidth)
      .attr("height", svgheight);
    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels ※ //

    // Scale
    let xScale = d3
      .scaleBand()
      .domain(newData.map((d) => d.Make))
      .range([padding, svgwidth - padding])
      .padding(0.1);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(newData, (d) => d.Total_Fatal_Injuries)])
      .range([svgheight - padding, padding])
      .nice();

    let colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeAccent);
    // Scale

    // Axis
    svg2
      .append("g")
      .attr("transform", "translate(" + 0 + "," + (svgheight - padding) + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-18), translate(-15, 5)");
    svg2
      .append("g")
      .attr("transform", "translate(" + padding + "," + 0 + ")")
      .call(d3.axisLeft(yScale).ticks());
    // Axis

    // Plot Title
    svg2
      .append("text")
      .attr("class", "plot-title")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", padding / 2 / 2)
      .text("Top 10 Aircraft Makes with the Highest Total Fatal Injuries")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    // Plot Title

    // Axis Title
    svg2
      .append("text")
      .attr("class", "xAxis-label")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", svgheight)
      .text("Aircraft Makes")
      .style("font-size", "10px");

    svg2
      .append("text")
      .attr("class", "yAxis-label")
      .attr("x", 0)
      .attr("y", padding / 2)
      .text("Fatal Injuries")
      .style("font-size", "10px");
    // Axis Title
    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels ※ //
    svg2
      .selectAll("rect")
      .data(newData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.Make))
      .attr("y", (d) => yScale(0))
      .attr("height", (d) => svgheight - yScale(0) - padding)
      .attr("width", (d) => xScale.bandwidth(d.Make))
      .style("fill", (d) => colorScale(d["Make"]))
      .on("mouseover", function (event, d) {
        d3.select(this)
          .style("fill", "DarkSlateBlue")
          .style("stroke", "cadetblue")
          .style("stroke-width", 2);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .style("fill", (d) => colorScale(d["Make"]))
          .style("stroke", "none");
      });

    // Animation
    svg2
      .selectAll("rect")
      .transition()
      .duration(svgwidth + svgheight * (svgheight / padding))
      .attr("y", (d) => yScale(d.Total_Fatal_Injuries))
      .attr(
        "height",
        (d) => svgheight - yScale(d.Total_Fatal_Injuries) - padding
      )
      .delay((d, i) => i * padding);
  });
};

var projectPlot3 = function (filePath) {
  d3.csv(filePath).then(function (data) {
    /*
          🐋数据清理
      */
    // 过滤数据 (Event.Date)
    let timeParser = d3.timeParse("%Y-%m-%d");
    let newDataFilter = data.filter(
      (d) =>
        d["Country"] == "united states" &&
        // Time Scale
        d["Event.Date"] != "unknown" &&
        d3.timeFormat("%Y")(timeParser(d["Event.Date"])) >= 2000
    );

    // 转换数据格式 & 保留需求数据
    // (Event.Date & Event.Id)

    /// 目的（按月份顺序取出Key）///
    let newDataPre_TEMP = [];
    newDataFilter.forEach(function (d) {
      newDataPre_TEMP.push({
        "Event.Id": d["Event.Id"],
        Year: d3.timeFormat("%Y")(timeParser(d["Event.Date"])),
        Month: d3.timeFormat("%B")(timeParser(d["Event.Date"])),
        MonthNumeric: d3.timeFormat("%m")(timeParser(d["Event.Date"])),
      });
    });

    // 十二个月月份装在keys
    newDataPre_TEMP.sort((a, b) =>
      d3.ascending(a.MonthNumeric, b.MonthNumeric)
    );
    let keys = Array.from(
      d3.group(newDataPre_TEMP, (d) => d.Month),
      ([v]) => v
    );

    /// 目的（按月份顺序取出Key）///

    let newDataPre = [];
    newDataPre_TEMP.forEach(function (d) {
      newDataPre.push({
        "Event.Id": d["Event.Id"],
        Year: d["Year"],
        Month: d["Month"],
      });
    });

    // 重新构建数据框架, 按照年份月份 计数事故次数
    let newDataMap = d3.rollup(
      newDataPre,
      (v) => v.length,
      (d) => d["Year"],
      (d) => d["Month"]
    );
    // console.log(newDataMap);

    // 将字典转为Array
    let newDataArray = Array.from(newDataMap, ([key, value]) => ({
      key,
      value,
    }));
    //console.log(newDataArray);

    // 过滤数据 (Year >= 2000) InternMap
    let newDataArray21 = newDataArray.filter((d) => +d.key >= 2000);
    newDataArray21.sort((a, b) => d3.ascending(a.key, b.key));
    // console.log(newDataArray21);

    // newDataA 中的每一行每一年 (2000 to 2023 exclude) 每个月的飞行器事故数
    let newDataA = [];
    newDataArray21.forEach((d) =>
      Array.from(d.value, ([key, value]) => ({ key, value })).forEach((v) =>
        newDataA.push({
          Year: d.key,
          Month: v.key,
          AccidentNumbers: +v.value,
        })
      )
    );
    // DictKey 为 2000 to 2023 exclude年份
    let dictionaryKey = Array.from(
      d3.group(newDataArray21, (d) => d["key"]),
      ([v]) => v
    );
    // console.log(dictionaryKey);

    // newDataB 为一个数组, 每一行为字典, 字典的键为年份, 值为当年飞行事故数量by month
    let dictionarytValue = Object.fromEntries(keys.map((key) => [key, 0]));
    newDataB = [];
    dictionaryKey.forEach((d) =>
      newDataB.push({
        key: d,
        value: dictionarytValue,
      })
    );
    // console.log(newDataB);

    // 往newDataB中添加数据
    newData = [];
    newDataB.forEach((b) => {
      newDataC = { Year: b.key };
      keys.forEach((month) => {
        let values =
          newDataA.filter((a) => a.Year == b.key && a.Month == month)[0] !==
          undefined
            ? newDataA.filter((a) => a.Year == b.key && a.Month == month)[0]
                .AccidentNumbers
            : 0;
        newDataC[month] = values;
      });
      newData.push(newDataC);
    });
    // console.log(newData);
    // Plot 3 SVG----------------------------------------------------------------------------------------------------------------- //
    // Self Define Variable //
    let svgwidth = 1000;
    let svgheight = 700;
    let padding = 100;
    // Self Define Variable //

    let svg3 = d3
      .select("body")
      .select("#q3_plot")
      .append("svg")
      .attr("width", svgwidth)
      .attr("height", svgheight);

    // 数据栈 Stack
    let colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeAccent);
    let stacked = d3.stack().keys(keys)(newData);

    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels, Legend※ //
    // Scale
    let xScale = d3
      .scaleBand()
      .domain(newData.map((d) => d.Year))
      .range([padding, svgwidth - padding])
      .padding(0.1);

    let yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(newData, function (d) {
          return (
            d.April +
            d.August +
            d.December +
            d.February +
            d.January +
            d.July +
            d.June +
            d.March +
            d.May +
            d.November +
            d.October +
            d.September
          );
        }),
      ])
      .range([svgheight - padding, padding])
      .nice();

    // Scale

    // Axis
    svg3
      .append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(" + 0 + "," + (svgheight - padding) + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "translate(0, 10)");
    svg3
      .append("g")
      .attr("class", "y_axis")
      .attr("transform", "translate(" + padding + "," + 0 + ")")
      .call(d3.axisLeft(yScale).ticks());
    // Axis

    // Plot Title
    svg3
      .append("text")
      .attr("class", "plot-title")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", padding / 2 / 4)
      .text(
        "Monthly Aviation Accidents and Incidents between 2000 and 2023 (Excluding)"
      )
      .style("font-weight", "bold");
    // Plot Title

    // Axis Title
    svg3
      .append("text")
      .attr("class", "xAxis-label")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", svgheight - padding / 2)
      .text("Years");

    svg3
      .append("text")
      .attr("class", "yAxis-label")
      .attr("x", padding / 2)
      .attr("y", padding / 2)
      .text("Counts");
    // Axis Title

    // Legend For The Plot
    svg3
      .selectAll("plot-legend-dot")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", svgwidth - 65)
      .attr("cy", (d, i) => padding + i * 15)
      .attr("r", 4)
      .style("fill", (d) => colorScale(d));

    svg3
      .selectAll("plot-legend-key")
      .data(keys)
      .enter()
      .append("text")
      .style("alignment-baseline", "middle")
      .attr("x", svgwidth - 55)
      .attr("y", (d, i) => padding + i * 15)
      .text((d) => d)
      .style("font-size", "12px");
    // Legend For The Plot

    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels, Legend※ //

    svg3
      .selectAll(".gbars")
      .data(stacked)
      .enter()
      .append("g")
      .attr("class", "gbars")
      .style("fill", (d) => colorScale(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.data.Year))
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Interactivity Buttons
    d3.select("#q3_plot")
      .append("button")
      .attr("type", "button")
      .attr("id", "sort_button")
      .text("Sort By Counts")
      .style("display", "block")
      .style("margin", "auto")
      .style("background-color", "#B57EDC")
      .style("color", "white");

    let isDescending = true;
    d3.select("#sort_button").on("click", function () {
      // 重组数据 ※
      newData.forEach((d) => {
        d.TotalAccidentNumbers = d3.sum(
          Object.values(d).filter((v) => typeof v === "number")
        );
      });
      newData.sort((a, b) =>
        d3.descending(a.TotalAccidentNumbers, b.TotalAccidentNumbers)
      );
      newData.sort((a, b) =>
        !isDescending
          ? d3.ascending(a.TotalAccidentNumbers, b.TotalAccidentNumbers)
          : d3.descending(a.TotalAccidentNumbers, b.TotalAccidentNumbers)
      );
      newData.forEach((d) => delete d.TotalAccidentNumbers);
      // console.log(newData);
      // console.log(isDescending);

      isDescending = !isDescending;
      // 数据栈 Stack (Update)
      let new_stacked = d3.stack().keys(keys)(newData);
      // console.log(new_stacked);

      let xScale = d3
        .scaleBand()
        .domain(newData.map((d) => d.Year))
        .range([padding, svgwidth - padding])
        .padding(0.1);

      let x_axis = d3.axisBottom(xScale);
      d3.selectAll("g.x_axis").transition().call(x_axis);
      svg3
        .selectAll(".gbars")
        .data(new_stacked)
        .selectAll("rect")
        .data((d) => d)
        .transition()
        .duration(svgwidth)
        .attr("x", (d) => xScale(d.data.Year))
        .attr("y", (d) => yScale(d[1]))
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]));
    });
  });
};

var projectPlot4 = function (filePath) {
  d3.csv(filePath).then(function (data) {
    // console.log(data);
    // State Symbol dictionary for conversion of names and symbols.
    let stateSym = {
      AZ: "Arizona",
      AL: "Alabama",
      AK: "Alaska",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DC: "District of Columbia",
      DE: "Delaware",
      FL: "Florida",
      GA: "Georgia",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming",
    };
    /*
        🐋数据清理
      */
    // 美国州名
    let stateListLower = Object.keys(stateSym).map((x) => x.toLowerCase());
    //console.log(stateListLower);

    // 过滤数据 (限美国, Event.Id不为Null, 仅限美国州名)
    let timeParser = d3.timeParse("%Y-%m-%d");
    let newDataFilter = data.filter(
      (d) =>
        d["Event.Id"] != "unknown" &&
        d["Country"] == "united states" &&
        stateListLower.includes(d["Location"].trimRight().slice(-2)) &&
        // Time Scale
        d["Event.Date"] != "unknown" &&
        d3.timeFormat("%Y")(timeParser(d["Event.Date"])) >= 2000
    );
    // console.log(newDataFilter);

    // 转换数据格式 & 保留需求数据
    let newDataA = [];
    newDataFilter.forEach(function (d) {
      newDataA.push({
        State: d.Location.trimRight().slice(-2).toUpperCase(),
        "Event.Id": d["Event.Id"],
      });
    });
    // console.log(newDataA);

    // Rollup by State
    let newDataMap = d3.rollup(
      newDataA,
      (v) => v.length,
      (d) => d["State"]
    );
    let newData = Array.from(newDataMap, ([State, AccidentNumbers]) => ({
      State,
      AccidentNumbers,
    }));
    newData.sort((a, b) => d3.ascending(a.State, b.State));
    // console.log(newData);
    // Plot 4 SVG----------------------------------------------------------------------------------------------------------------- //
    // Self Define Variable //
    let svgwidth = 1000;
    let svgheight = 600;
    let padding = 20;
    let strokeWidth = 5;
    // Self Define Variable //
    let svg4 = d3
      .select("body")
      .select("#q4_plot")
      .append("svg")
      .attr("width", svgwidth)
      .attr("height", svgheight);
    let American = d3.json("us-states.json");
    let projection = d3
      .geoAlbersUsa()
      .scale(svgwidth, svgheight)
      .translate([svgwidth / 2, svgheight / 2]);
    let pathgeo = d3.geoPath().projection(projection);
    // ※ Scale, Plot Title, Legend※ //

    // Scale
    let logZero = 1;
    let colorScale = d3
      .scaleSequential(d3.interpolatePurples)
      .domain([logZero, d3.max(newData, (d) => d.AccidentNumbers)]);
    // Scale

    // Plot Title
    svg4
      .append("text")
      .attr("class", "plot-title")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", padding)
      .text("Accident and Incident Frequency by State")
      .style("font-weight", "bold");

    // Legend

    let legendPlot = d3
      .legendColor()
      .shapeWidth(padding / 2)
      .cells(5)
      .scale(colorScale);

    svg4
      .append("g")
      .attr("class", "legendPlot")
      .attr("transform", "translate(" + padding + ",0)");

    svg4.select(".legendPlot").call(legendPlot);
    // Legend

    // Tooltips
    // create a tooltip
    let Tooltip = d3
      .select("#q4_plot")
      .append("div")
      .attr("class", "tooltip")
      .raise();

    // CSS
    d3.selectAll("div.tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("text-align", "center")
      .style("width", "fit-content")
      .style("height", "fit-content")
      .style("background-color", "white")
      .style("border", "solid")
      .style("padding", "+" + 5 + "px");
    // Tooltips
    // ※ Scale, Plot Title, Legend※ //
    American.then(function (map) {
      svg4
        .selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("d", pathgeo)
        .style("stroke", "black")
        .style("fill", function (d) {
          // console.log(d);
          // console.log(newData);
          let stateName = d.properties.name;
          let stateAccidents = newData.filter((d) => d.State == stateName);
          return colorScale(stateAccidents[0].AccidentNumbers);
        })
        .on("mouseover", function (event, d) {
          Tooltip.transition().duration(padding).style("opacity", 1);
          // Tooltip
          d3.select(this)
            .style("stroke", "cadetblue")
            .style("stroke-width", strokeWidth);
        })
        .on("mousemove", function (event, d) {
          let AccidentNumbersByStates = newData.filter(
            (i) => i.State == d.properties.name
          );
          // console.log(AccidentNumbersByStates);
          Tooltip.html(
            "<p>State: " +
              AccidentNumbersByStates[0].State +
              "<br>" +
              "Counts: " +
              AccidentNumbersByStates[0].AccidentNumbers +
              " </p>"
          )
            // Tooltip
            .style("left", (d) => event.pageX + padding)
            .style("top", (d) => event.pageY - padding);
        })
        .on("mouseout", function (event, d) {
          Tooltip.transition().style("opacity", 0);
          // Tooltip
          d3.select(this).style("stroke", "black").style("stroke-width", 1);
        });
    });
  });
};

var projectPlot5 = function (filePath) {
  d3.csv(filePath).then(function (data) {
    /*
          🐋数据清理
      */
    // 过滤数据 (去掉不完整数据)
    let timeParser = d3.timeParse("%Y-%m-%d");
    let newDataFilter = data.filter(
      (d) =>
        d["Country"] == "united states" &&
        d["Aircraft.damage"] != "unknown" &&
        d["Total.Serious.Injuries"] != "unknown" &&
        d["Total.Fatal.Injuries"] != "unknown" &&
        // Time Scale
        d["Event.Date"] != "unknown" &&
        d3.timeFormat("%Y")(timeParser(d["Event.Date"])) >= 2000
    );
    // console.log(newDataFilter);

    // 转换数据格式 & 保留需求数据
    let newDataA = [];
    newDataFilter.forEach(function (d) {
      newDataA.push({
        damageType: d["Aircraft.damage"],
        injuries:
          (+d["Total.Fatal.Injuries"] !== undefined
            ? +d["Total.Fatal.Injuries"]
            : 0) +
          (+d["Total.Serious.Injuries"] !== undefined
            ? +d["Total.Serious.Injuries"]
            : 0),
      });
    });
    // console.log(newDataA);

    // 按照毁坏类型分组
    let newDataPre = d3.group(newDataA, (d) => d.damageType);

    // 每种损坏类型的Top50死伤人数
    let newDataPreTOP = new Map();
    newDataPre.forEach((values, key) => {
      newDataPreTOP.set(
        key,
        values.sort((a, b) => b.injuries - a.injuries).slice(0, 50)
      );
    });

    let newData = Array.from(newDataPreTOP, ([key, values]) => {
      let numberInjuries = values.map((d) => d.injuries).sort(d3.ascending);
      // console.log(numberInjuries);
      return {
        key,
        value: {
          q1: d3.quantile(numberInjuries, 0.25),
          q2: d3.quantile(numberInjuries, 0.5),
          q3: d3.quantile(numberInjuries, 0.75),
          IQR:
            d3.quantile(numberInjuries, 0.75) -
            d3.quantile(numberInjuries, 0.25),
          lowerFence: d3.max([
            0,
            d3.quantile(numberInjuries, 0.25) -
              1.5 *
                (d3.quantile(numberInjuries, 0.75) -
                  d3.quantile(numberInjuries, 0.25)),
          ]),
          upperFence:
            d3.quantile(numberInjuries, 0.75) +
            1.5 *
              (d3.quantile(numberInjuries, 0.75) -
                d3.quantile(numberInjuries, 0.25)),
        },
      };
    });

    let keys = Array.from(
      d3.group(newData, (d) => d.key),
      ([v]) => v
    );
    // Plot 5 SVG----------------------------------------------------------------------------------------------------------------- //
    let svgwidth = 600;
    let svgheight = 800;
    let padding = 40;

    let svg5 = d3
      .select("body")
      .select("#q5_plot")
      .append("svg")
      .attr("width", svgwidth)
      .attr("height", svgheight);
    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels ※ //

    // Scale
    let xScale = d3
      .scaleBand()
      .domain(newData.map((d) => d.key))
      .range([padding, svgwidth - padding])
      .padding(1);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(newDataA, (d) => d.injuries)])
      .range([svgheight - padding, padding])
      .nice();
    let colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeAccent);
    // Scale

    // Axis
    svg5
      .append("g")
      .attr("transform", "translate(" + 0 + "," + (svgheight - padding) + ")")
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text");

    svg5
      .append("g")
      .attr("transform", "translate(" + padding + "," + 0 + ")")
      .call(d3.axisLeft(yScale).ticks());
    // Axis

    // Plot Title
    svg5
      .append("text")
      .attr("class", "plot-title")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", padding / 2 / 2)
      .text("Distribution of Fatal and Serious Injuries by Damage Type")
      .style("font-weight", "bold")
      .style("font-size", "12px");
    // Plot Title

    // Axis Title
    svg5
      .append("text")
      .attr("class", "xAxis-label")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", svgheight)
      .text("Damage Types")
      .style("font-size", "12px");

    svg5
      .append("text")
      .attr("class", "yAxis-label")
      .attr("x", 0)
      .attr("y", padding / 2)
      .text("Fatal & Serious Injuries")
      .style("font-size", "12px");
    // Axis Title
    // ※ Scale, Axis,  Plot Title, Axis Title, Axis Tick Labels ※ //

    // Boxplot
    mainGraph = svg5.selectAll(".boxPlot");
    // Lower & Upper Fence
    mainGraph
      .data(newData)
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d.key))
      .attr("y1", (d) => yScale(d.value.lowerFence))
      .attr("x2", (d) => xScale(d.key))
      .attr("y2", (d) => yScale(d.value.upperFence))
      .attr("stroke", "black");

    // Q1, Q3
    mainGraph
      .data(newData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.key) - padding)
      .attr("y", (d) => yScale(d.value.q3))
      .attr("height", (d) => yScale(d.value.q1) - yScale(d.value.q3))
      .attr("width", padding * 2)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .style("fill", (d) => colorScale(d.key));

    // Q2
    mainGraph
      .data(newData)
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d.key) - padding)
      .attr("y1", (d) => yScale(d.value.q2))
      .attr("x2", (d) => xScale(d.key) + padding)
      .attr("y2", (d) => yScale(d.value.q2))
      .attr("stroke", "black");

    // Data Points
    // Box Plot Point Data //
    let boxPlotPoints = [];
    newDataPreTOP.forEach((d) =>
      d.forEach((i) =>
        boxPlotPoints.push({
          damageType: i.damageType,
          injuries: i.injuries,
        })
      )
    );
    // console.log(boxPlotPoints);

    // Box Plot Point Data //
    mainGraph
      .data(boxPlotPoints)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.damageType))
      .attr("cy", (d) => yScale(d.injuries))
      .attr("r", 2 * 2)
      .style("fill", "white")
      .attr("stroke", "purple");
  });
};

var projectPlot6 = function (filePath) {
  d3.csv(filePath).then(function (data) {
    // Self_define Variables //
    let svgwidth = 500;
    let svgheight = 500;
    let padding = 100;
    let paddingInner2 = 2;
    // Self_define Variables //
    /*
        🐋数据清理
      */

    // 过滤数据 (去掉不完整数据)

    let timeParser = d3.timeParse("%Y-%m-%d");
    let newDataFilter = data.filter(
      (d) =>
        d["Weather.Condition"] != "unknown" &&
        d["Country"] == "united states" &&
        // Time Scale
        d["Event.Date"] != "unknown" &&
        d3.timeFormat("%Y")(timeParser(d["Event.Date"])) >= 2000
    );
    let keys = Array.from(
      d3.group(newDataFilter, (d) => d["Weather.Condition"]),
      ([v]) => v
    );
    // 计算不同天气下的事故发生数
    let newDataPre = d3.rollup(
      newDataFilter,
      (v) => v.length,
      (d) => d["Weather.Condition"]
    );
    let newDataArray = Array.from(newDataPre, ([Weather, AccidentNumbers]) => ({
      Weather,
      AccidentNumbers,
    }));

    let newData = d3.pie().value((d) => d.AccidentNumbers)(newDataArray);
    // console.log(newData);
    // Plot 6 SVG----------------------------------------------------------------------------------------------------------------- //

    let svg6 = d3
      .select("body")
      .select("#q6_plot")
      .append("svg")
      .attr("width", svgwidth)
      .attr("height", svgheight);

    // ※ Scale, Plot Title, Legend※ //

    // Scale
    let colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeAccent);
    // Scale

    // Plot Title
    svg6
      .append("text")
      .attr("class", "plot-title")
      .attr("text-anchor", "middle")
      .attr("x", svgwidth / 2)
      .attr("y", padding)
      .text("Accident and Incident Frequency by Weather Condition")
      .style("font-weight", "bold");
    // Plot Title

    // Legend For The Plot
    svg6
      .selectAll("plot-legend-dot")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", svgwidth - padding - 10)
      .attr("cy", (d, i) => 2 * padding + i * 25)
      .attr("r", 6)
      .style("fill", (d) => colorScale(d));

    svg6
      .selectAll("plot-legend-key")
      .data(keys)
      .enter()
      .append("text")
      .style("alignment-baseline", "middle")
      .attr("x", svgwidth - padding + 5)
      .attr("y", (d, i) => 2 * padding + i * 25)
      .text((d) => d)
      .style("font-size", "13px")
      .style("font-weight", "bold");
    // Legend For The Plot
    // ※ Scale, Plot Title, Legend※ //

    svg6
      .selectAll("path")
      .data(newData)
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(padding / paddingInner2)
          .outerRadius(padding)
      )
      .attr("fill", (d) => colorScale(d.data.Weather))
      .attr("stroke", "black")
      .attr(
        "transform",
        "translate(" +
          svgwidth / paddingInner2 +
          "," +
          svgheight / paddingInner2 +
          ")"
      );
  });
};

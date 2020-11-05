let margin = { left: 100, right: 20, top: 40, bottom: 50 };
let chartDims = {
    width: 560 - margin.left - margin.right,
    height: 400 - margin.top - margin.bottom,
};

let themeColor = "rgb(0, 178, 191)";

const svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", chartDims.width + margin.left + margin.right)
    .attr("height", chartDims.height + margin.top + margin.bottom);

const chart = svg
    .append("g")
    .attr("width", chartDims.width)
    .attr("height", chartDims.height)
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime().range([0, chartDims.width]);
const y = d3.scaleLinear().range([chartDims.height, 0]);

const xAxisGroup = chart
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartDims.height})`);

const yAxisGroup = chart.append("g").attr("class", "y-axis");

// hover line
const lineGroup = chart
    .append("g")
    .attr("class", "dotted-line")
    .style("opacity", 0)
    .style("opacity", 0);

const xLine = lineGroup
    .append("line")
    .attr("stroke", "#fff")
    .attr("stroke-dasharray", "5");
const yLine = lineGroup
    .append("line")
    .attr("stroke", "#fff")
    .attr("stroke-dasharray", "5");

const lineGen = d3
    .line()
    .x(function (d) {
        return x(new Date(d.date));
    })
    .y(function (d) {
        return y(d.distance);
    });

const path = chart.append("path");

function observeData(collection, updateChart) {
    db.collection(collection).onSnapshot((response) => {
        response.docChanges().forEach((change) => {
            let doc = { ...change.doc.data(), id: change.doc.id };
            switch (change.type) {
                case "added":
                    data.push(doc);
                    break;
                case "modified":
                    let index = data.findIndex((d) => d.id === doc.id);
                    data[index] = doc;
                    break;
                case "removed":
                    data = data.filter((d) => d.id !== doc.id);
                    break;
                default:
                    break;
            }
        });

        updateChart(data);
    });
}

function updateChart(data) {
    data = data
        .filter((d) => d.activity === state.activity)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    x.domain(d3.extent(data, (d) => new Date(d.date)));
    y.domain([0, d3.max(data, (d) => d.distance)]);

    const xAxis = d3.axisBottom(x).ticks(8);
    // .tickFormat(d3.timeFormat("%b %d"));

    const yAxis = d3
        .axisLeft(y)
        .ticks(8)
        .tickFormat((d) => d + "m");

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("text-anchor", "end");

    path.data([data])
        .attr("d", lineGen)
        .attr("stroke", themeColor)
        .attr("fill", "none");
    //  update circles
    const circles = chart.selectAll("circle").data(data);

    // delete circles
    circles.exit().remove();

    // add circles
    circles
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", themeColor)
        .merge(circles)
        .attr("cx", (d) => x(new Date(d.date)))
        .attr("cy", (d) => y(d.distance));

    chart
        .selectAll("circle")
        .on("mouseover", (d, i, n) => {
            let dote = d3.select(n[i]);

            dote.transition().duration(200).attr("r", 8).attr("fill", "#fff");
            xLine
                .attr("x1", 0)
                .attr("y1", dote.attr("cy"))
                .attr("x2", dote.attr("cx"))
                .attr("y2", dote.attr("cy"));

            yLine
                .attr("x1", dote.attr("cx"))
                .attr("y1", chartDims.height)
                .attr("x2", dote.attr("cx"))
                .attr("y2", dote.attr("cy"))

                lineGroup.style("opacity", 1);
        })
        .on("mouseleave", (d, i, n) => {
            d3.select(n[i])
                .transition()
                .duration(200)
                .attr("r", 5)
                .attr("fill", themeColor);
            xLine.attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0);

            yLine
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0)

                lineGroup.style("opacity", 0);
        });

    console.log(data);
}

observeData("fitness", updateChart);

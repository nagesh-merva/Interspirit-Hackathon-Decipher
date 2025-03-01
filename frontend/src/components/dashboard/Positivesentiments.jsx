import PieChartdiv from "./PieChartData"

const positive = [
    {
        count: 780,
        rise: " negative",
        percent: 10,
        chartData: [
            { sentiment: "Positive", count: 780, fill: "#4285F4" },
            { sentiment: "remaining", count: 1780, fill: "#4285F4" },
        ]
    }
]
function Positivesentiments() {
    return (
        <div className="flex h-auto w-1/3 border-2 border-black mx-4">
            <div className="my-2 ml-3">
                <h1>Positive Sentiments</h1>
                <p>{positive.count}</p>
            </div>
            <PieChartdiv chartData={positive.chartData} />
        </div>
    )
}
export default Positivesentiments
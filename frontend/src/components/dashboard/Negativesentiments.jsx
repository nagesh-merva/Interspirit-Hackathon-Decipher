import PieChartdiv from "./PieChartData"

const negative = [
    {
        count: 780,
        rise: " positive",
        percent: 10,
        chartData: [
            { sentiment: "negative", count: 780, fill: "#4285F4" },
            { sentiment: "remaining", count: 1780, fill: "#4285F4" },
        ]
    }
]
function Negativesentiments() {
    return (
        <div className="flex h-auto w-1/3 border-2 border-black mx-4">
            <div className="my-2 ml-3">
                <h1>Negative Sentiments</h1>
                <p>{negative.count}</p>
            </div>
            <PieChartdiv chartData={negative.chartData} />
        </div>
    )
}
export default Negativesentiments
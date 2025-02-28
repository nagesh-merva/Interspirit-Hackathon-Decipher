import Positivesentiments from "./Positivesentiments"

function Sentiment() {
    return (
        <div className="mx-8">
            <h1 className="text-3xl font-bold mb-4">Sentiment Trends and Graph</h1>
            <div className="flex gap-4">
                <Positivesentiments />
            </div>
        </div>
    )
}
export default Sentiment
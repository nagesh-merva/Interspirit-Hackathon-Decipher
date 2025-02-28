import React, { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { PieChart, Pie, Label, Tooltip } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card"  // Make sure the path is correct


const PieChartdiv = ({ chartData }) => {
    // const totalVisitors = useMemo(() => {
    //     return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
    // }, [])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Pie Chart - Donut with Text</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            {/* <CardContent className="flex-1 pb-0">
                <div className="mx-auto aspect-square max-h-[250px]">
                    <PieChart width={300} height={300}>
                        <Tooltip cursor={false} />
                        <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5} fill="#8884d8">
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && viewBox.cx && viewBox.cy) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {totalVisitors.toLocaleString()}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={viewBox.cy + 24} className="fill-muted-foreground">
                                                    Visitors
                                                </tspan>
                                            </text>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </Pie>
                    </PieChart>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter> */}
        </Card>
    )
}

export default PieChartdiv

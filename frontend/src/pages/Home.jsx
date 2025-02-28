import React from 'react';
import { useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-blue-50 ">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="ml-2 text-xl font-bold text-gray-800">BrandSense AI</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/register')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Register
                            </button>
                            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:flex lg:items-center lg:justify-between">
                    <div className="lg:w-1/2">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Real-Time Sentiment Analysis
                        </h1>
                        <p className="mt-5 text-xl text-gray-600">
                            Monitor and analyze social media sentiment in real-time. Stay ahead of trends and respond quickly to customer feedback.
                        </p>
                        <div className="mt-8 flex space-x-4">
                            <button onClick={() => navigate('/register')} className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Get Started
                            </button>
                            <button className="px-6 py-3 text-base font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LandingPage;

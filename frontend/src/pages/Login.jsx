import { useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        brandname: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.status === 200) {
                alert(data.message)
                navigate("/dashboard");
            }
            else {
                alert(data.error)
            }
        }
        catch {
            alert("An error was caused", response.error)
        }
        console.log("Response:", data);
    };

    return (
        <div className="md:flex justify-center items-center h-full w-full my-2">
            <img src="./image.png" className="absolute w-full" />
            <div className="h-full w-full md:w-2/5 bg-white shadow-lg rounded-lg p-20 z-10 ">
                <div className="flex justify-center">
                    <h1 className="text-4xl font-bold">Create Account</h1>
                </div>
                <div className="flex justify-center p-1">
                    <h1>Enter your brand information to get started</h1>
                </div>
                <form className="mt-10" onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brandname">
                            Brandname
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="brandname"
                            type="text"
                            placeholder="Enter your Brandname"
                            value={formData.brandname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Start Monitoring
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;

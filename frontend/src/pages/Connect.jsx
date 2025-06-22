

function ConnectPage() {
    const BACKEND_URL = 'http://localhost:5000';
    const brand = localStorage.getItem("brand_name").trim();
    return (
        <>
            <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                <h2>Connect your accounts</h2>
                <div className="space-y-4">
                    <button
                        onClick={() => window.location.href = `${BACKEND_URL}/auth/twitter?brand_name=${brand}`}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1DA1F2',
                            color: 'white',
                            borderRadius: '5px',
                            marginRight: '10px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Connect Twitter
                    </button>

                    <button
                        onClick={() => window.location.href = `${BACKEND_URL}/auth/instagram`}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#E1306C',
                            color: 'white',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Connect Instagram
                    </button>
                </div>
            </div>
        </>
    );
}

export default ConnectPage

import React from "react";

const N64: React.FC = () => {
    return (
        <><div className="h-screen w-screen bg-black">
            <iframe
                src="https://nes64js.vercel.app/index.html"
                style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>

        </div>
        </>

    )
}
export default N64
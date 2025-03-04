import Earth from "./assets/Earth";
import Save from "./assets/Save";
import userImage from "./assets/user.jpg";

const Navbar = () => {
    return (
        <nav className="bg-white w-full shadow-sm">
            <div className="flex justify-between items-center p-[15px]">
                <div className="flex items-center gap-[8px]">
                    <Earth color="#3662e3" size={40} />
                    <h1 className="text-2xl font-bold">TravelAI</h1>
                </div>
                <div className="flex items-center gap-[8px]">
                    <Save color="#666" size={40} className="cursor-not-allowed" />
                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden cursor-not-allowed">
                        <img src={userImage} alt="user" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
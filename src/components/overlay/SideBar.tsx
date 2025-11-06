import { Link } from "react-router-dom";
import { Button } from "../ui/button";


export default function SideBar() {
    return (
    <aside className="w-60 bg-[#d3dae5] p-6 flex flex-col gap-10 justify-start align-middle ">
        <div className="text-xl font-semibold mb-6 text-black">SpiderTube Player</div>

        <Link to={"/"}>
            <Button variant="link" className="bg-[#c7b1ef]">Home</Button>
        </Link>

        <Link to={"/search"}>
            <Button variant="link">Search</Button>
        </Link>
        <Link to={"/profile"}>
            <Button variant="link">Profile</Button>
        </Link>
      </aside>
    );
}
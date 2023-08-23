import Navbar from "./sub-components/Navbar";
import Finder from "./pages/Finder";
import Quesser from "./pages/Quesser";
import Toolbox from "./pages/Toolbox";
import { Route, Routes } from "react-router-dom";
import checkAuth from "./utils/accessSpotify";
import { fetchProfile } from "./utils/fetchInfo";

await checkAuth();
const profile = await fetchProfile();
localStorage.setItem("userID", profile.id);
if (profile.images[0] != undefined) {
  localStorage.setItem("profileImage", profile.images[0].url);
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Toolbox />} />
          <Route path="/Toolbox" element={<Toolbox />} />
          <Route path="/Finder" element={<Finder />} />
          <Route path="/Quesser" element={<Quesser />} />
          <Route path="*" element={<Toolbox />} />
        </Routes>
      </div>
    </>
  );
}

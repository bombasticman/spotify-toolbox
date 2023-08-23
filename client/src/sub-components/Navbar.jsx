export default function Navbar() {
    return <nav className="nav">
        <div className="profile">
            <img src={localStorage.getItem("profileImage")} className="profile-image"/>
            <p className="profile-name">{localStorage.getItem("userID")}</p>
        </div>
        <div>
            <ul>
                <li>
                    <a href="/Toolbox">Toolbox</a>
                </li>
                <li>
                    <a href="/Finder">Finder</a>
                </li>
                <li>
                    <a href="/Quesser">Quesser</a>
                </li>
            </ul>
        </div>
    </nav>
}
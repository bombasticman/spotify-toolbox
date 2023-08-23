import * as reset from "../utils/reset.js"
import albumImage from "../assets/albums.jpg"
import artistImage from "../assets/artists.webp"
import trackImage from "../assets/tracks.jpg"
import mapImage from "../assets/map.webp"
import quessImage from "../assets/quess.jpg"

export default function Toolbox() {
    return (
        <>
            <h1>🧰Spotify Toolbox🧰</h1>
            <div className="cards-section">
                <div className="cards">
                    <img src={trackImage} />
                    <div>
                        <h2>🧹🎙️Reset Tracks🎙️🧹</h2>
                        <p>Reset your liked tracks from spotify.</p>
                    </div>
                    <button onClick={async () => await reset.resetTracks()}>RESET</button>
                </div>
                <div className="cards">
                    <img src={artistImage} />
                    <div>
                        <h2>🧹🧑‍🎤Reset Artists🧑‍🎤🧹</h2>
                        <p>Reset your liked artists from spotify.</p>
                    </div>
                    <button onClick={async () => await reset.resetArtists()}>RESET</button>
                </div>
                <div className="cards">
                    <img src={albumImage} />
                    <div>
                        <h2>🧹📀Reset Albums📀🧹</h2>
                        <p>Reset your liked albums from spotify.</p>
                    </div>
                    <button onClick={async () => await reset.resetAlbums()}>RESET</button>
                </div>
                <div className="cards">
                    <img src={mapImage} />
                    <div>
                        <h2>🗺️Finder🗺️</h2>
                        <p>Find people with similar taste close-by.</p>
                    </div>
                    <button><a href="/Finder">GO</a></button>
                </div>
                <div className="cards">
                    <img src={quessImage} />
                    <div>
                        <h2>🔎Quess the Artists🔎</h2>
                        <p>Who this artist might be?</p>
                    </div>
                    <button><a href="/Quesser">GO</a></button>
                </div>
            </div>
        </>
    )
}
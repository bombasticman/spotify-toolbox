import { useEffect, useState } from "react";
import { getTopItems } from "../utils/fetchInfo";

export default function Quesser() {
  // State variables
  const [topItemsArray, setTopItems] = useState([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [searchValue, setSearchValue] = useState('');
  const [audioSource, setAudioSource] = useState('');

  // Fetch top items and set up initial state
  useEffect(() => {
    async function fetchTopItems() {
      try {
        const topItems = await getTopItems()
        const randomIndex = Math.floor(Math.random() * topItems.length)
        setCurrentItemIndex(randomIndex)
        setTopItems(topItems)
        setAudioSource(topItems[randomIndex].preview_url)
      } catch (error) {
        console.error("Error fetching top items:", error);
      }
    }
    fetchTopItems()
  }, []); // The empty dependency array ensures this effect runs only once.

  // Update the search value when the user types in the input
  function handleSearchChange(event) {
    const currentSearchValue = event.target.value
    setSearchValue(currentSearchValue);
  }

  // Handle the user's submission and check if the answer is correct
  function handleSubmit() {
    if(topItemsArray[currentItemIndex].name === searchValue){
      // Correct answer
      alert("Well done!")
      const newTopItemsArray = topItemsArray.filter((_, index) => index !== currentItemIndex);
      setTopItems(newTopItemsArray);
      const randomIndex = Math.floor(Math.random() * newTopItemsArray.length);
      setCurrentItemIndex(randomIndex);
      setAudioSource(newTopItemsArray[randomIndex].preview_url)
    } else {
      // Incorrect answer
      alert(`Though luck the song name was: ${topItemsArray[currentItemIndex].name}`)
      let randomIndex = currentItemIndex
      while(randomIndex === currentItemIndex){
        randomIndex = Math.floor(Math.random() * topItemsArray.length);
      }
      setCurrentItemIndex(randomIndex)
      setAudioSource(topItemsArray[randomIndex].preview_url)
    }
  }

  return (
    <>
      <h1>Press play to start listening to a song and try to guess it!</h1>
      {topItemsArray.length !== 0 && (
        <div className="container">
          <div>
            <audio className="preview-player" controls src={audioSource} type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
          </div>
          <div>
            <input
              type="text"
              className="user-answer"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <button className="submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
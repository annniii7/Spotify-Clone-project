let currsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the songs in playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
         <li>
         <img class="invert" src="music.svg" alt="">
         <div class="info">
             <div>${song}</div>
             <div>Anirudh</div>
         </div>
         <div class="playnow">
             <span>Play Now</span>
             <img class="invert"  src="playbtn.svg" alt="">
         </div>
        </li>`;
    }
    //attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    });
    return songs;


}

const playMusic = (track, pause = false) => {
    currsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currsong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/Songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div);
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let arr = Array.from(anchors);
    console.log(arr);
    for (let index = 1; index < arr.length; index++) {
        const e = arr[index];
        if (e.href.includes("/Songs/")) {
            let folder=e.href.split("/Songs/").slice(-1)[0];

           // get the meta data of the folder
            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
             cardContainer.innerHTML= cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
             <div class="play">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                     <!-- Circular background -->
                     <circle cx="12" cy="12" r="12" fill="#4CAF50" />
                     <!-- Play button icon -->
                     <path
                         d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                         fill="#000000" />
                 </svg>


             </div>
             <img src="/Songs/${folder}/cover.jpg" alt="">
             <h2>${response.title}</h2>
             <p>${response.description}p>
         </div>`

        }

    }
        // load the playlist whenever the card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })

    })



}
async function main() {
    //get list of all the songs
    await getsongs("/songs/ncs");
    playMusic(songs[0], true);
    displayAlbums();


    //add event listener to song buttons

    play.addEventListener("click", element => {
        if (currsong.paused) {
            currsong.play();
            play.src = "pause.svg"
        }
        else {
            currsong.pause();
            play.src = "playbtn.svg";

        }
    })
    // listen for time update events

    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currsong.currentTime)}/${secondsToMinutesSeconds(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";

    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = ((currsong.duration) * percent) / 100;
    })

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listener to close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Adding event listeners to previous 
    prev.addEventListener("click", () => {
        // console.log('previous clicked');
        console.log(currsong.src.split("/").slice("-1"[0]));
        let index = songs.indexOf(currsong.src.split("/").slice("-1")[0]);
        console.log(songs, index);
        if (index + 1 <= 0) {
            playMusic(songs[index - 1])

        }
    })
    //Adding event listener for next button
    next.addEventListener("click", () => {
        // console.log('previous clicked');
        // console.log(currsong.src.split("/").slice("-1"[0]));
        let index = songs.indexOf(currsong.src.split("/").slice("-1")[0]);
        console.log(songs, index);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])

        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to:", e.target.value);
        currsong.volume = parseInt(e.target.value) / 100;

    })

    //add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0     
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currsong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0.1


        }
        

    })

   

}
main()

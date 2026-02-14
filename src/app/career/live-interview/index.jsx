// import React, { useEffect, useRef, useState } from "react"
// import io from "socket.io-client"
// import VideoChat from "./video-chat"

// const socket = io.connect('/', { transports : ['websocket'] })

// export default function LiveInterviewComponents(){

// 	const [userName, setUserName] = useState("");
// 	const [userId, setUserId] = useState("");
// 	const [isReady, setIsReady] = useState(false);
// 	const [errMsg, setErrMsg] = useState("");

// 	useEffect(() => {
// 		socket.on("userId", (id) => {
// 		  	setUserId(id);
// 		});
	
// 		return () => {
// 		  	socket.off("user");
// 		}
// 	}, []);
	
// 	const openVideChat = () => {
// 		socket.emit("addUser", { name: userName, id: userId }, (err, msg) => {
// 			if (err) return setErrMsg(msg);
// 			setErrMsg("");
// 			setIsReady(true);
// 		});
// 	}

// 	return (

// 		<section className="w-full h-full">
// 			{

// 				userId &&
// 				(

// 					<div className="flex flex-col gap-6 items-center justify-center w-full h-full">
// 						{ !isReady && ( <h4 className="text-4xl text-center font-sora font-semibold">Live Interview</h4> ) }
// 						{

// 							!isReady ?
// 							(

// 								<div className="flex flex-col gap-6 items-center justify-center p-6 bg-white rounded-lg shadow-md">
// 									{ errMsg && ( <p className="text-center text-red my-4">{ errMsg }</p> ) }
// 									<input className="px-4 py-2 rounded-lg w-full border-2 border-neutral-200" placeholder="Name" label="Name" value={ userName } onChange={ (e) => setUserName( e.target.value ) } />
// 									<button disabled={ userName === "" } className="bg-green-500 px-6 py-3 rounded-full text-white font-medium" onClick={ () => openVideChat() }>Begin Interview</button>
// 								</div>

// 							) : (

// 								<VideoChat userName={ userName } userId={ userId } setUserId={ setUserId } socket={ socket } />

// 							)

// 						}
// 					</div>

// 				)

// 			}
// 		</section>

// 	)

// }

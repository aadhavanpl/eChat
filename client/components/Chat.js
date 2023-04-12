import React, { useEffect, useState } from 'react'
import styles from './chat.module.css'
import ScrollToBottom from 'react-scroll-to-bottom'
// import { useRouter } from 'next/router'

export default function Chat({ socket, userName, room, setLoggedIn }) {
	const [currentMessage, setCurrentMessage] = useState('')
	const [messageList, setMessageList] = useState([])
	const [userList, setUserList] = useState([])

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			sendMessage()
		}
	}

	const sendMessage = async () => {
		if (currentMessage !== '') {
			const messageData = {
				room: room,
				userName: userName,
				message: currentMessage,
				avatar: `https://source.boringavatars.com/beam/120/${userName}?colors=D9DC50,D1BAC4,CB9A4C,B15357,902876`,
				time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes(),
			}
			await socket.emit('sendMessage', messageData)
			setCurrentMessage('')
		}
	}

	useEffect(() => {
		socket.on('recieveMessage', (data) => {
			setMessageList((list) => [...list, data])
		})
		socket.on('userList', (data) => {
			setUserList(data)
			console.log(data)
		})
	}, [socket])

	function handleLogout() {
		const logoutData = {
			room: room,
			userName: userName,
		}
		socket.emit('logout', logoutData)
		setLoggedIn(false)
	}

	return (
		<div className={styles['container']}>
			<div className={styles['participants-container']}>
				<div className={styles['participants-wrapper']}>
					<h3>Participants ({userList.length}):</h3>
					<div className={styles['participants-content']}>
						{userList.length > 0 ? (
							userList.map((item, index) => (
								<div key={index} className={styles['participants-user-wrapper']}>
									<img src={item.avatar} />
									<span>{item.userName}</span>
								</div>
							))
						) : (
							<></>
						)}
					</div>
				</div>
				<img src='/logout.svg' className={styles['participants-logout']} onClick={handleLogout} />
			</div>
			<div className={styles['wrapper']}>
				<div className={styles['room-wrapper']}>
					Room: {room}
					<img
						src='/share.svg'
						onClick={() => {
							navigator.clipboard.writeText(`http://localhost:3000/${room}`)
						}}
					/>
				</div>
				{/* <div className={styles['chat']}> */}
				<div className={styles['chat-container']}>
					<div className={styles['chat-wrapper']}>
						<ScrollToBottom className={styles['scroller']}>
							{messageList.map((item, index) => (
								<div key={index} className={styles['spacing']}>
									{item.userName === userName ? (
										<div className={styles['right-container']}>
											<div className={styles['right-wrapper']}>
												<div className={styles['right']}>
													<div className={styles['message-box']}>{item.message}</div>
													<img src={item.avatar} />
												</div>
												<span>
													{item.userName}&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{item.time}
												</span>
											</div>
										</div>
									) : (
										<div className={styles['left-wrapper']}>
											<div className={styles['left']}>
												<img src={item.avatar} />
												<div className={styles['message-box']}>{item.message}</div>
											</div>
											<span>
												{item.userName}&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{item.time}
											</span>
										</div>
									)}
								</div>
							))}
						</ScrollToBottom>
					</div>
					<div className={styles['send-wrapper']}>
						<input
							placeholder='Type message here'
							value={currentMessage}
							onChange={(e) => setCurrentMessage(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<img src='/send.svg' onClick={sendMessage} />
					</div>
				</div>
				{/* </div>	 */}
			</div>
		</div>
	)
}

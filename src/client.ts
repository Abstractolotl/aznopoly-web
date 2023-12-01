const BASE_URL = "aznopoly.abstractolotl.de/server";

let socket: WebSocket | null;
let attempts = 0;

export function joinRoom(roomId: string, handler: (packet: string) => void) {
    socket = new WebSocket("ws://" + BASE_URL + "/room/" + roomId)

    socket.addEventListener("message", (event) => {
        handler(event.data);
    })

    socket.addEventListener("close", () => {
        if(attempts < 3) {
            attempts += 1
            setTimeout(() => {
                joinRoom(roomId, handler)
            }, 1500)
        } else {
            // TODO do something
        }
    })
}

export function checkState(state: number) {
    return socket?.readyState == state
}

export function sendPacket(packet: string) {
    socket?.send(packet)
}